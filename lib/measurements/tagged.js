const utils = require('../utils');
const fields = {
    average: require('./fields/average'),
    counter: require('./fields/counter'),
    gauge: require('./fields/gauge')
};

function TaggedMeasurement(name, tags, {influx, prometheus}) {
    this.name = name;
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
                    tags: utils.parseTagsPrometheus({...this.tags, ...tags}),
                    name: this.tags && this.tags.name ? this.tags.name + '/' + tags.m : ''
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
        const add = (name, value) => {
            if (value != null) {
                if (fields) {
                    fields += `,${name}=${value}`;
                } else {
                    fields = `${name}=${value}`;
                }
            }
        };
        record.field.getAvgCount && add('rate', record.field.getAvgCount(deltaTime));
        record.field.getAvgCount && add('count', record.field.getAvgCount(1));
        if (record.field.single) {
            add(record.field.code + 'l', record.field.min);
            add(record.field.code + 'h', record.field.max);
            add(record.field.code, record.field.flush(deltaTime));
        } else {
            const data = record.field.flush(deltaTime);
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
        const changed = record.field.changed;
        if (!changed) this._prometheus.fields.delete(record);
        const add = (name, tags, value, help = '') => {
            if (value != null) {
                if (first) {
                    const header =
                        `# HELP ${this.name}_${name} ${record.field.name.replace('\\', '\\\\').replace('\n', '\\n')}${help}\n` +
                        `# TYPE ${this.name}_${name} ${first}`;
                    fields = fields ? fields + '\n' + header : header;
                }
                const measurement = `${this.name}_${name}${tags} ${value}${suffix}`;
                fields = fields ? fields + '\n' + measurement : measurement;
            }
        };
        record.field.getAvgCount && add('rate', record.tags, record.field.getAvgCount(deltaTime), ' (rate)');
        record.field.getAvgCount && add('count', record.tags, record.field.getAvgCount(1), ' (count)');
        if (record.field.single) {
            add(record.field.code + '_min', record.tags, changed ? record.field.min : 0, ' (min)');
            add(record.field.code + '_max', record.tags, changed ? record.field.max : 0, ' (max)');
            add(record.field.code, record.tags, changed ? record.field.flush(deltaTime) : 0);
        } else {
            const data = changed && record.field.flush(deltaTime);
            record.field.code.forEach((cur, index) => {
                const {code, help} = typeof cur === 'string' ? {code: cur, help: cur} : cur;
                add(code, record.tags, changed ? data.value[index] : 0, ' ' + help);
                add(code + '_min', record.tags, changed ? data.min[index] : 0, ' ' + help + ' (min)');
                add(code + '_max', record.tags, changed ? data.max[index] : 0, ' ' + help + ' (max)');
            });
        }
        return fields;
    }).filter(x => x).join('\n');
    return result;
};

TaggedMeasurement.prototype.counter = function(deltaTime, suffix) {
    const result = Array.from(this._prometheus.fields.values(), record => {
        if (!record.name) return;
        let fields;
        const changed = record.field.changed;
        if (!changed) this._prometheus.fields.delete(record);
        const add = (name, tags, value) => {
            if (value != null) {
                const measurement = `${tags}/${this.name}_${name} ${value}${suffix}`;
                fields = fields ? fields + '\n' + measurement : measurement;
            }
        };
        record.field.getAvgCount && add('count', record.name, record.field.getAvgCount(1), ' (count)');
        if (record.field.single) {
            add(record.field.code + '_min', record.name, changed ? record.field.min : 0, ' (min)');
            add(record.field.code + '_max', record.name, changed ? record.field.max : 0, ' (max)');
            add(record.field.code, record.name, changed ? record.field.flush(deltaTime) : 0);
        } else {
            const data = changed && record.field.flush(deltaTime);
            add('amount', record.name, typeof data === 'number' ? data : data.total.reduce((prev, value) => prev + value, 0));
        }
        return fields;
    }).filter(x => x).join('\n');
    return result;
};

TaggedMeasurement.prototype.statsD = function() {
    // to do
};

module.exports = TaggedMeasurement;
