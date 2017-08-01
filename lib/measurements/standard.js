var utils = require('../utils');
var fields = {
    average: require('./fields/average'),
    counter: require('./fields/counter'),
    gauge: require('./fields/gauge')
};

function StandardMeasurement(name) {
    this.name = name;
    this.fields = new Set();
}

StandardMeasurement.prototype.register = function(type, code, name) {
    var Field = fields[type];
    if (!Field) {
        throw new Error('invalid field type');
    }
    var field = new Field(code, name);
    return (...params) => {
        this.fields.add(field);
        field.update(...params);
    };
};

StandardMeasurement.prototype.influx = function(deltaTime, tags, suffix) {
    var fields = Array.from(this.fields.values(), (field) => {
        return `${field.code}=${field.flush(deltaTime)}`;
    }).join(',');
    this.fields.clear();
    return fields ? `${this.name}${utils.parseTagsInflux(tags)} ${fields}${suffix}` : fields;
};

StandardMeasurement.prototype.statsD = function(deltaTime) {
    // to do
};

module.exports = StandardMeasurement;
