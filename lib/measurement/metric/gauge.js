function GaugeMetric(code, name) {
    this.code = code;
    this.name = name;
    this.counter = 0;
}

GaugeMetric.prototype.handler = function(value) {
    this.counter = value;
};

GaugeMetric.prototype.getValue = function(deltaTime) {
    return this.counter;
};

module.exports = GaugeMetric;
