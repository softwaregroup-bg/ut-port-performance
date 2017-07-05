var utils = require('../utils');
var metrics = {
    average: require('./metric/average'),
    counter: require('./metric/counter'),
    gauge: require('./metric/gauge')
};

function Measurement(name) {
    this.name = name;
    this.metrics = {};
}

Measurement.prototype.register = function(type, code, name) {
    var Constructor = metrics[type];
    if (!Constructor) {
        throw new Error('invalid metric type');
    }
    return function handler() {
        var args = Array.prototype.slice.call(arguments);
        var id = args.shift();
        var tags = args.shift();
        var metric;
        if (!this.metrics[id]) {
            metric = new Constructor(code, name);
            this.metrics[id] = {
                metric: metric,
                influxTags: utils.parseInfluxTags(tags)
            };
        } else {
            metric = this.metrics[id].metric;
        }
        return metric.apply(metric, args);
    }.bind(this);
};

Measurement.prototype.influxDump = function(deltaTime, tags, suffix) {
    var extraTags = utils.parseInfluxTags(tags);
    return Object.keys(this.metrics).map((id) => {
        let field = `${this.metrics[id].metric.code}=${this.metrics[id].metric.getValue(deltaTime)}`;
        return `${this.name}${this.metrics[id].influxTags}${extraTags} ${this.name},${field}`;
    }).join('/n');
};

Measurement.prototype.statsDump = function(deltaTime) {
    // to do
};

Measurement.prototype.dispose = function() {
    // to do - implement dispose method if needed for memory release
};

module.exports = Measurement;
