var utils = require('../utils');
var fields = {
    average: require('./fields/average'),
    counter: require('./fields/counter'),
    gauge: require('./fields/gauge')
};

function TaggedMeasurement(name, tags) {
    this.name = name;
    this.data = new Map();
    this.updatedFields = new Set();
    this.influxTags = utils.parseTagsInflux(tags);
}

TaggedMeasurement.prototype.register = function(type, code, name, interval) {
    var Field = fields[type];
    if (!Field) {
        throw new Error('invalid field type');
    }
    return (id, tags, ...params) => {
        let record = this.data.get(id);
        if (!record) {
            record = {
                field: new Field(code, name, interval),
                influxTags: utils.parseTagsInflux(tags)
            };
            this.data.set(id, record);
        }
        params.length && this.updatedFields.add(record);
        return record.field.update(...params);
    };
};

TaggedMeasurement.prototype.influx = function(deltaTime, tags, suffix, send) {
    var externalTags = utils.parseTagsInflux(tags);
    this.updatedFields.forEach(record => {
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
        send(`${this.name}${this.influxTags}${record.influxTags}${externalTags} ${fields}${suffix}`);
    });
    this.updatedFields.clear();
};

TaggedMeasurement.prototype.statsD = function(deltaTime) {
    // to do
};

module.exports = TaggedMeasurement;
