const SlidingWindow = require('./window');

function CounterField(code, name, interval) {
    this.first = 'gauge';
    this.changed = false;
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
        const sum = this.samples.sum(this.interval);
        return sum[0] + this.counterDelta;
    }
    this.changed = true;
    this.counterDelta += value;
};

CounterField.prototype.flush = function(deltaTime) {
    this.first = false;
    this.changed = false;
    const value = deltaTime ? this.counterDelta / deltaTime : 0;
    this.interval && this.samples.push([this.counterDelta]);
    this.counterDelta = 0;
    return value;
};

module.exports = CounterField;
