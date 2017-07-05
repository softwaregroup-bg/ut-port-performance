var utils = require('../utils');
var fields = {
    average: require('../fields/average'),
    counter: require('../fields/counter'),
    gauge: require('../fields/gauge')
};

function Measurement(name) {
    this.name = name;
    this.fields = {};
}

Measurement.prototype.register = function(type, code, name) {
    var Field = fields[type];
    if (!Field) {
        throw new Error('invalid field type');
    }
    return function() {
        var id = arguments[0];
        var tags = arguments[1];
        var field;
        if (!this.fields[id]) {
            field = new Field(code, name);
            this.fields[id] = {
                field: field,
                influxTags: utils.parseTagsInflux(tags)
            };
        } else {
            field = this.fields[id].field;
        }
        return field.set.apply(field, Array.prototype.slice.call(arguments, 2));
    }.bind(this);
};

Measurement.prototype.influxDump = function(deltaTime, tags, suffix) {
    var extraTags = utils.parseTagsInflux(tags);
    var record;
    var fields;
    return Object.keys(this.fields).map((id) => {
        record = this.fields[id];
        fields = `${record.field.code}=${record.field.get(deltaTime)}`;
        return `${this.name}${record.influxTags}${extraTags} ${this.name},${fields} ${suffix}`;
    }).join('/n');
};

Measurement.prototype.statsDump = function(deltaTime) {
    // to do
};

Measurement.prototype.dispose = function() {
    // to do - implement dispose method if needed for memory release
};

module.exports = Measurement;
