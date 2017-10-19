var SlidingWindow = require('./window');

function GaugeField(code, name, interval) {
    this.code = code;
    this.name = name;
    this.counter = null;
    this.min = null;
    this.max = null;
    this.interval = interval;
    if (interval) {
        this.samples = new SlidingWindow(100, 1);
    }
}

GaugeField.prototype.update = function(value) {
    if (this.interval && value == null) {
        let sum = this.samples.sum(this.interval);
        sum[0] += this.counter;
        sum[1] += 1;
        return sum[1] === 0 ? 0 : sum[0] / sum[1];
    }
    if (this.counter === null) {
        this.min = this.max = value;
    } else if (value > this.max) {
        this.max = value;
    } else if (value < this.min) {
        this.min = value;
    }
    this.counter = value;
};

GaugeField.prototype.flush = function(/* deltaTime */) {
    this.min = this.max = this.counter;
    this.interval && this.samples.push([this.counter]);
    return this.counter;
};

module.exports = GaugeField;
