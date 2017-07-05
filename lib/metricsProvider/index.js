var metrics = {
    average: require('./metrics/average'),
    counter: require('./metrics/counter'),
    gauge: require('./metrics/gauge'),
    taggedAverage: require('./metrics/taggedAverage'),
    taggedCounter: require('./metrics/taggedCounter'),
    taggedGauge: require('./metrics/taggedGauge')
};

function MetricsProvider(namespace) {
    this.namespace = namespace;
    this.metrics = [];
}

MetricsProvider.prototype.register = function(type, code, name) {
    var Constructor = metrics[type];
    if (!Constructor) {
        throw new Error('invalid metric type');
    }
    var metric = new Constructor({code, name});
    this.metrics.push(metric);
    return metric.handler.bind(metric);
}

MetricsProvider.prototype.influxDump = function(deltaTime) {
    return this.metrics.map((metric) => metric.influxDump()).join(',');
}

MetricsProvider.prototype.statsDump = function(deltaTime) {
    return this.metrics.map((metric) => (this.namespace + '.' + metric.statsDump())).join('\n');
}

MetricsProvider.prototype.dispose = function() {
    this.metrics.forEach((metric) => metric.dispose());
}

module.exports = MetricsProvider;
