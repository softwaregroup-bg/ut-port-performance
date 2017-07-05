function AverageMetric(code, name) {
    this.code = code;
    this.name = name;
    this.counter = 0;
    this.counterDelta = 0;
    this.denominator = 0;
    this.denominatorDelta = 0;
}

AverageMetric.prototype.handler = function(value, count) {
    this.counter += value;
    this.counterDelta += value;
    this.denominator += count;
    this.denominatorDelta += count;
};

AverageMetric.prototype.getValue = function(deltaTime) {
    var value = this.denominatorDelta ? this.counterDelta / this.denominatorDelta : 0;
    this.counterDelta = 0;
    this.denominatorDelta = 0;
    return value;
};

module.exports = AverageMetric;
