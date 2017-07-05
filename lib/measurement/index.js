var metrics = {
    average: require('./metric/average'),
    counter: require('./metric/counter'),
    gauge: require('./metric/gauge'),
    taggedAverage: require('./metric/taggedAverage'),
    taggedCounter: require('./metric/taggedCounter'),
    taggedGauge: require('./metric/taggedGauge')
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
    var metric = new Constructor({code, name});
    this.metrics.push(metric);
    return metric.handler.bind(metric);
};

Measurement.prototype.influxDump = function(deltaTime) {
    var aggregated = ' ' + this.name;
    return this.metrics.reduce((all, metric) => {
        let dump = metric.influxDump(deltaTime);
        if (Array.isArray(dump)) {
            dump.forEach((record) => {
                all.push(',' + record.tags + ' ' + record.value);
            });
        } else {
            aggregated += ',' + dump;
        }
        return all;
    }, []).concat(aggregated);
};

Measurement.prototype.statsDump = function(deltaTime) {
    return this.metrics.map((metric) => metric.statsDump(deltaTime));
};

Measurement.prototype.dispose = function() {
    // to do - implement dispose method if needed for memory release
};

module.exports = Measurement;
