var utils = require('../utils');
var fields = {
    average: require('./fields/average'),
    counter: require('./fields/counter'),
    gauge: require('./fields/gauge')
};

function StandardMeasurement(name, tags) {
    this.name = name;
    this.updatedFields = new Set();
    this.fields = {};
    this.influxTags = utils.parseTagsInflux(tags);
}

StandardMeasurement.prototype.register = function(type, code, name) {
    var Field = fields[type];
    if (!Field) {
        throw new Error('invalid field type');
    }
    var field = this.fields[code];
    if (!field) {
        field = new Field(code, name);
        this.fields[code] = field;
    }
    return (...params) => {
        this.updatedFields.add(field);
        field.update(...params);
    };
};

StandardMeasurement.prototype.influx = function(deltaTime, tags, suffix) {
    var fields = Array.from(this.updatedFields.values(), (field) => {
        var result = '';
        if (field.min) {
            result = `${field.code}min=${field.min},`;
        }
        if (field.max) {
            result += `${field.code}max=${field.max},`;
        }
        return result + `${field.code}=${field.flush(deltaTime)}`;
    }).join(',');
    this.updatedFields.clear();
    return fields ? `${this.name}${this.influxTags}${utils.parseTagsInflux(tags)} ${fields}${suffix}` : fields;
};

StandardMeasurement.prototype.statsD = function(deltaTime) {
    // to do
};

module.exports = StandardMeasurement;
