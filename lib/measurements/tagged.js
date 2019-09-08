const utils = require('../utils');
const fields = {
    average: require('./fields/average'),
    counter: require('./fields/counter'),
    gauge: require('./fields/gauge')
};

function TaggedMeasurement(name, tags, {influx, prometheus}) {
    this.name = name;
    this.prometheusName = name.replace('.', '_');
    this.data = new Map();
    this.tags = tags;
    this._influx = influx && {
        fields: new Set(),
        tags: utils.parseTagsInflux(tags)
    };
    this._prometheus = prometheus && {
        fields: new Set()
    };
}

TaggedMeasurement.prototype.register = function(type, code, name, interval) {
    const Field = fields[type];
    if (!Field) {
        throw new Error('invalid field type');
    }
    return (id, tags, ...params) => {
        let record = this.data.get(id);
        if (!record) {
            record = {
                influx: this._influx && {
                    field: new Field(code, name, interval),
                    tags: utils.parseTagsInflux(tags)
                },
                prometheus: this._prometheus && {
                    field: new Field(code, name, interval),
                    tags: utils.parseTagsPrometheus({...this.tags, ...tags})
                }
            };
            this.data.set(id, record);
        }
        params.length && this._influx && this._influx.fields.add(record.influx);
        params.length && this._prometheus && this._prometheus.fields.add(record.prometheus);
        let result;
        if (params.length) {
            if (record.influx) result = record.influx.field.update(...params);
            if (record.prometheus) result = record.prometheus.field.update(...params);
        } else {
            result = (record.prometheus || record.influx);
            result = result && result.update(...params);
        }
        return result;
    };
};

TaggedMeasurement.prototype.influx = function(deltaTime, tags, suffix, send) {
    const externalTags = utils.parseTagsInflux(tags);
    this._influx.fields.forEach(record => {
        let fields;
        let add = (name, value) => {
            if (value != null) {
                if (fields) {
                    fields += `,${name}=${value}`;
                } else {
                    fields = `${name}=${value}`;
                }
            }
        };
        record.field.getAvgCount && add('cnt', record.field.getAvgCount(deltaTime));
        if (record.field.single) {
            add(record.field.code + 'l', record.field.min);
            add(record.field.code + 'h', record.field.max);
            add(record.field.code, record.field.flush(deltaTime));
        } else {
            let data = record.field.flush(deltaTime);
            record.field.code.forEach((cur, index) => {
                add(cur, data.value[index]);
                add(cur + 'l', data.min[index]);
                add(cur + 'h', data.max[index]);
            });
        }
        send(`${this.name}${this._influx.tags}${record.tags}${externalTags} ${fields}${suffix}`);
    });
    this._influx.fields.clear();
};

TaggedMeasurement.prototype.prometheus = function(deltaTime, suffix) {
    const result = Array.from(this._prometheus.fields.values(), record => {
        let fields;
        const first = record.field.first;
        let add = (name, tags, value, help = '') => {
            if (value != null) {
                if (first) {
                    let header =
                        `# HELP ${this.prometheusName}_${name} ${record.field.name.replace('\\', '\\\\').replace('\n', '\\n')}${help}\n` +
                        `# TYPE ${this.prometheusName}_${name} ${first}`;
                    fields = fields ? fields + '\n' + header : header;
                }
                let measurement = `${this.prometheusName}_${name}${tags} ${value}${suffix}`;
                fields = fields ? fields + '\n' + measurement : measurement;
            }
        };
        record.field.getAvgCount && add('cnt', record.tags, record.field.getAvgCount(deltaTime), ' (avg count)');
        if (record.field.single) {
            add(record.field.code + 'l', record.tags, record.field.min, ' (min)');
            add(record.field.code + 'h', record.tags, record.field.max, ' (max)');
            add(record.field.code, record.tags, record.field.flush(deltaTime));
        } else {
            let data = record.field.flush(deltaTime);
            record.field.code.forEach((cur, index) => {
                const {code, help} = typeof cur === 'string' ? {code: cur, help: cur} : cur;
                add(code, record.tags, data.value[index], ' ' + help);
                add(code + 'l', record.tags, data.min[index], ' ' + help + ' (min)');
                add(code + 'h', record.tags, data.max[index], ' ' + help + ' (max)');
            });
        }
        return fields;
    }).filter(x => x).join('\n');
    this._prometheus.fields.clear();
    return result;
};

TaggedMeasurement.prototype.statsD = function(deltaTime) {
    // to do
};

module.exports = TaggedMeasurement;
