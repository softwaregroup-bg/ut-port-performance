const utils = require('../utils');
const fields = {
    average: require('./fields/average'),
    counter: require('./fields/counter'),
    gauge: require('./fields/gauge')
};

function StandardMeasurement(name, tags, {influx, prometheus}) {
    this.name = name;
    this._influx = influx && {
        fields: new Set(),
        tags: utils.parseTagsInflux(tags)
    };
    this._prometheus = prometheus && {
        fields: new Set(),
        tags: utils.parseTagsPrometheus(tags),
        name: tags && tags.name ? tags.name + '/' : ''
    };
    this.data = new Map();
}

StandardMeasurement.prototype.register = function(type, code, name, interval) {
    const Field = fields[type];
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
        params.length && this._prometheus && this._prometheus.fields.add(record.prometheus);
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
    const result = Array.from(this._prometheus.fields.values(), field => {
        const first = field.first;
        const changed = field.changed;
        const name = first && field.name.replace('\\', '\\\\').replace('\n', '\\n');
        let result = '';
        if (first) {
            if (field.min != null) {
                result +=
                    `# HELP ${this.name}_${field.code}_min ${name} (min)\n` +
                    `# TYPE ${this.name}_${field.code}_min ${first}\n`;
            }
            if (field.max != null) {
                result +=
                    `# HELP ${this.name}_${field.code}_max ${name} (max)\n` +
                    `# TYPE ${this.name}_${field.code}_max ${first}\n`;
            }
            result +=
                `# HELP ${this.name}_${field.code} ${name}\n` +
                `# TYPE ${this.name}_${field.code} ${first}\n`;
        }
        if (field.min != null) result += `${this.name}_${field.code}_min${this._prometheus.tags} ${changed ? field.min : 0}${suffix}\n`;
        if (field.max != null) result += `${this.name}_${field.code}_max${this._prometheus.tags} ${changed ? field.max : 0}${suffix}\n`;
        return result + `${this.name}_${field.code}${this._prometheus.tags} ${changed ? field.flush(deltaTime) : 0}${suffix}`;
    }).join('\n');
    return result;
};

StandardMeasurement.prototype.counter = function(deltaTime, suffix) {
    const result = Array.from(this._prometheus.fields.values(), field => {
        const changed = field.changed;
        let result = '';
        if (field.max != null) {
            result = `${this._prometheus.name}${this.name}_${field.code}_max ${changed ? field.max : 0}${suffix}`;
            field.flush(deltaTime);
        } else result = `${this._prometheus.name}${this.name}_${field.code} ${changed ? field.flush(deltaTime) : 0}${suffix}`;
        return result;
    }).join('\n');
    return result;
};

StandardMeasurement.prototype.statsD = function() {
    // to do
};

module.exports = StandardMeasurement;
