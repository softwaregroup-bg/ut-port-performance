function CounterMetric(code, name) {
    this.code = code;
    this.name = name;
    this.counter = 0;
    this.counterDelta = 0;
}

CounterMetric.prototype.handler = function(value) {
    this.counter += value;
    this.counterDelta += value;
};

CounterMetric.prototype.getValue = function(deltaTime) {
    var value = deltaTime ? this.counterDelta / deltaTime : 0;
    this.counterDelta = 0;
    return value;
};

module.exports = CounterMetric;
