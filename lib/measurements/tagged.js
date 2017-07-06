var utils = require('../utils');
var fields = {
    average: require('./fields/average'),
    counter: require('./fields/counter'),
    gauge: require('./fields/gauge')
};

function TaggedMeasurement(name) {
    this.name = name;
    this.data = {};
}

TaggedMeasurement.prototype.register = function(type, code, name) {
    var Field = fields[type];
    if (!Field) {
        throw new Error('invalid field type');
    }
    return (id, tags, ...params) => {
        let record = this.data[id];
        if (!record) {
            record = {
                field: new Field(code, name),
                influxTags: utils.parseTagsInflux(tags)
            };
            this.data[id] = record;
        }
        return record.field.update(...params);
    };
};

TaggedMeasurement.prototype.influx = function(deltaTime, tags, suffix) {
    var externalTags = utils.parseTagsInflux(tags);
    var record;
    var fields;
    return Object.keys(this.data).map((id) => {
        record = this.data[id];
        fields = `${record.field.code}=${record.field.flush(deltaTime)}`;
        return `${this.name}${record.influxTags}${externalTags} ${fields}${suffix}`;
    }).join('/n');
};

TaggedMeasurement.prototype.statsD = function(deltaTime) {
    // to do
};

module.exports = TaggedMeasurement;
