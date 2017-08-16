var utils = require('../utils');
var fields = {
    average: require('./fields/average'),
    counter: require('./fields/counter'),
    gauge: require('./fields/gauge')
};

function TaggedMeasurement(name) {
    this.name = name;
    this.data = new Map();
    this.updatedFields = new Set();
}

TaggedMeasurement.prototype.register = function(type, code, name) {
    var Field = fields[type];
    if (!Field) {
        throw new Error('invalid field type');
    }
    return (id, tags, ...params) => {
        let record = this.data.get(id);
        if (!record) {
            record = {
                field: new Field(code, name),
                influxTags: utils.parseTagsInflux(tags)
            };
            this.data.set(id, record);
        }
        this.updatedFields.add(id);
        record.field.update(...params);
    };
};

TaggedMeasurement.prototype.influx = function(deltaTime, tags, suffix) {
    var externalTags = utils.parseTagsInflux(tags);
    var record;
    var fields;
    var response = Array.from(this.updatedFields.values(), (id) => {
        record = this.data.get(id);
        if (record.field.getAvgCount) {
            fields = `cnt=${record.field.getAvgCount(deltaTime)},`;
        } else {
            fields = '';
        }
        if (record.field.max) {
            fields += `max=${record.field.max},`;
        }
        fields += `${record.field.code}=${record.field.flush(deltaTime)}`;
        return `${this.name}${record.influxTags}${externalTags} ${fields}${suffix}`;
    }).join('\n');
    this.updatedFields.clear();
    return response;
};

TaggedMeasurement.prototype.statsD = function(deltaTime) {
    // to do
};

module.exports = TaggedMeasurement;
