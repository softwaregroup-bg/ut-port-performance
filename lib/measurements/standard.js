var utils = require('../utils');
var fields = {
    average: require('./fields/average'),
    counter: require('./fields/counter'),
    gauge: require('./fields/gauge')
};

function StandardMeasurement(name) {
    this.name = name;
    this.fields = [];
}

StandardMeasurement.prototype.register = function(type, code, name) {
    var Field = fields[type];
    if (!Field) {
        throw new Error('invalid field type');
    }
    var field = new Field(code, name);
    this.fields.push(field);
    return (...params) => (field.update(...params));
};

StandardMeasurement.prototype.influx = function(deltaTime, tags, suffix) {
    var fields = this.fields.map(field => {
        return `${field.code}=${field.flush(deltaTime)}`;
    }).join(',');
    return `${this.name}${utils.parseTagsInflux(tags)} ${fields}${suffix}`;
};

StandardMeasurement.prototype.statsD = function(deltaTime) {
    // to do
};

module.exports = StandardMeasurement;
