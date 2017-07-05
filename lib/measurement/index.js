var metrics = {
    average: require('./metric/average'),
    counter: require('./metric/counter'),
    gauge: require('./metric/gauge'),
    taggedAverage: require('./metric/taggedAverage'),
    taggedCounter: require('./metric/taggedCounter'),
    taggedGauge: require('./metric/taggedGauge')
};

function Measurement(namespace) {
    this.namespace = namespace;
    this.metrics = {};
}

Measurement.prototype.register = function(type, code, name) {
    var Constructor = metrics[type];
    if (!Constructor) {
        throw new Error('invalid metric type');
    }
    this.metrics[code] = new Constructor({code, name});
    return this.get(code);
};

Measurement.prototype.get = function(code) {
    return this.metrics[code];
};

Measurement.prototype.influxDump = function(deltaTime) {
    return Object.keys(this.metrics).map((metric) => {
        return this.metrics[metric].influxDump();
    }).join(',');
};

Measurement.prototype.statsDump = function(deltaTime) {
    return Object.keys(this.metrics).map((metric) => {
        return this.metrics[metric].statsDump();
    }).join('\n');
};

Measurement.prototype.dispose = function() {
    // to do - implement dispose method if needed for memory release
};

module.exports = Measurement;
