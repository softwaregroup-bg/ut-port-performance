const utils = require('../utils');
const fields = {
    average: require('./fields/average'),
    counter: require('./fields/counter'),
    gauge: require('./fields/gauge')
};

function StandardMeasurement(name, tags, {influx, prometheus}) {
    this.name = name;
    this.prometheusName = name.replace('.', '_') + '_S'; // _S means standard
    this._influx = influx && {
        fields: new Set(),
        tags: utils.parseTagsInflux(tags)
    };
    this._prometheus = prometheus && {
        fields: new Set(),
        tags: utils.parseTagsPrometheus(tags)
    };
    this.data = new Map();
}

StandardMeasurement.prototype.register = function(type, code, name, interval) {
    const Field = fields[type];
    let addPrometheus = true;
    if (!Field) {
        throw new Error('invalid field type');
    }
    let record = this.data.get(code);
    if (!record) {
        record = {
            influx: this._influx && new Field(code, name, interval),
            prometheus: this._prometheus && new Field(code, name, interval)
        };
        this.data.set(code, record);
    }
    return (...params) => {
        params.length && this._influx && this._influx.fields.add(record.influx);
        if (params.length && addPrometheus && this._prometheus) {
            addPrometheus = false;
            this._prometheus.fields.add(record.prometheus);
        }
        let result;
        if (params.length) {
            if (record.influx) result = record.influx.update(...params);
            if (record.prometheus) result = record.prometheus.update(...params);
        } else {
            result = (record.prometheus || record.influx);
            result = result && result.update(...params);
        }
        return result;
    };
};

StandardMeasurement.prototype.influx = function(deltaTime, tags, suffix, send) {
    const fields = Array.from(this._influx.fields.values(), field => {
        let result = '';
        if (field.min != null) {
            result = `${field.code}min=${field.min},`;
        }
        if (field.max != null) {
            result += `${field.code}max=${field.max},`;
        }
        return result + `${field.code}=${field.flush(deltaTime)}`;
    }).join(',');
    this._influx.fields.clear();
    send(fields ? `${this.name}${this._influx.tags}${utils.parseTagsInflux(tags)} ${fields}${suffix}` : fields);
};

StandardMeasurement.prototype.prometheus = function(deltaTime, suffix) {
    return Array.from(this._prometheus.fields.values(), field => {
        const first = field.first;
        const name = first && field.name.replace('\\', '\\\\').replace('\n', '\\n');
        let result = '';
        if (field.min != null) {
            if (first) {
                result += `# HELP ${this.prometheusName}_${field.code}_min ${name} (min)\n` +
                `# TYPE ${this.prometheusName}_${field.code}_min ${first}\n`;
            }
            result += `${this.prometheusName}_${field.code}_min${this._prometheus.tags} ${field.min}${suffix}\n`;
        }
        if (field.max != null) {
            if (first) {
                result += `# HELP ${this.prometheusName}_${field.code}_max ${name} (max)\n` +
                `# TYPE ${this.prometheusName}_${field.code}_max ${first}\n`;
            }
            result += `${this.prometheusName}_${field.code}_max${this._prometheus.tags} ${field.max}${suffix}\n`;
        }
        if (first) {
            result += `# HELP ${this.prometheusName}_${field.code} ${name}\n` +
            `# TYPE ${this.prometheusName}_${field.code} ${first}\n`;
        }
        return result + `${this.prometheusName}_${field.code}${this._prometheus.tags} ${field.flush(deltaTime)}${suffix}`;
    }).join('\n');
};

StandardMeasurement.prototype.statsD = function(deltaTime) {
    // to do
};

module.exports = StandardMeasurement;
