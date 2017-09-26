var SlidingWindow = require('./window');

function CounterField(code, name, interval) {
    this.code = code;
    this.name = name;
    this.counterDelta = 0;
    this.interval = interval;
    if (interval) {
        this.samples = new SlidingWindow(100, 1);
    }
}

CounterField.prototype.update = function(value) {
    if (this.interval && value == null) {
        let sum = this.samples.sum(this.interval);
        return sum[0] + this.counterDelta;
    }
    this.counterDelta += value;
};

CounterField.prototype.flush = function(deltaTime) {
    var value = deltaTime ? this.counterDelta / deltaTime : 0;
    this.interval && this.samples.push([this.counterDelta]);
    this.counterDelta = 0;
    return value;
};

module.exports = CounterField;
