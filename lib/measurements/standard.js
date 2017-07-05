var utils = require('../utils');
var fields = {
    average: require('../fields/average'),
    counter: require('../fields/counter'),
    gauge: require('../fields/gauge')
};

function Measurement(name) {
    this.name = name;
    this.fields = [];
}

Measurement.prototype.register = function(type, code, name) {
    var Field = fields[type];
    if (!Field) {
        throw new Error('invalid field type');
    }
    var field = new Field(code, name);
    this.fields.push(field);
    return field.set.bind(field);
};

Measurement.prototype.influxDump = function(deltaTime, tags, suffix) {
    var fields = this.fields.map(field => {
        return `${field.code}=${field.get(deltaTime)}`;
    }).join(',');
    return `${this.name}${utils.parseTagsInflux(tags)} ${this.name},${fields} ${suffix}`;
};

Measurement.prototype.statsDump = function(deltaTime) {
    // to do
};

Measurement.prototype.dispose = function() {
    // to do - implement dispose method if needed for memory release
};

module.exports = Measurement;
