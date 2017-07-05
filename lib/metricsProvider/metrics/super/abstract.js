function AbstractMetric(options) {
    if (!options) {
        throw new Error('options is required');
    } else if (typeof options !== 'object') {
        throw new Error('options must be an object');
    } else if (!options.code) {
        throw new Error('options.code is required');
    } else if (!options.name) {
        throw new Error('options.name is required');
    }
    this.code = options.code;
    this.name = options.name;
}

AbstractMetric.prototype.statsDump = function() {
    throw new Error('statsDump method not implemented');
};

AbstractMetric.prototype.influxDump = function() {
    throw new Error('influxDump method not implemented');
};

AbstractMetric.prototype.handler = function() {
    throw new Error('handler method not implemented');
};

AbstractMetric.prototype.dispose = function() {
    throw new Error('dispose method not implemented');
};

module.exports = AbstractMetric;
