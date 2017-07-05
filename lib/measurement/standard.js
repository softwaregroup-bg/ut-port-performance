var utils = require('../utils');
var metrics = {
    average: require('./metric/average'),
    counter: require('./metric/counter'),
    gauge: require('./metric/gauge')
};

function Measurement(name) {
    this.name = name;
    this.metrics = [];
}

Measurement.prototype.register = function(type, code, name) {
    var Constructor = metrics[type];
    if (!Constructor) {
        throw new Error('invalid metric type');
    }
    var metric = new Constructor(code, name);
    this.metrics.push(metric);
    return metric.handler.bind(metric);
};

Measurement.prototype.influxDump = function(deltaTime, tags, suffix) {
    var fields = this.metrics.map(metric => {
        return `${metric.code}=${metric.getValue(deltaTime)}`;
    }).join(',');
    return `${this.name}${utils.parseInfluxTags(tags)} ${this.name},${fields}`;
};

Measurement.prototype.statsDump = function(deltaTime) {
    // to do
};

Measurement.prototype.dispose = function() {
    // to do - implement dispose method if needed for memory release
};

module.exports = Measurement;
