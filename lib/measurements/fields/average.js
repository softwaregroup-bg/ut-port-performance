var SlidingWindow = require('./window');

function AverageField(code, name, interval) {
    this.code = code;
    this.name = name;
    this.counterDelta = 0;
    this.denominatorDelta = 0;
    this.max = null;
    this.min = null;
    this.interval = interval;
    if (interval) {
        this.samples = new SlidingWindow(100, 2);
    }
}

AverageField.prototype.update = function(value, count) {
    if (this.interval && value == null) {
        let sum = this.samples.sum(this.interval);
        sum[0] += this.counterDelta;
        sum[1] += this.denominatorDelta;
        return sum;
    }
    this.counterDelta += value;
    this.denominatorDelta += count;
    if (count > 1) {
        value = value / count;
    }
    if (count >= 1) {
        if (this.max === null || value > this.max) {
            this.max = value;
        }
        if (this.min === null || value < this.min) {
            this.min = value;
        }
    }
};

AverageField.prototype.getAvgCount = function(deltaTime) {
    return deltaTime ? this.denominatorDelta / deltaTime : 0;
};

AverageField.prototype.flush = function(deltaTime) {
    var value = this.denominatorDelta ? this.counterDelta / this.denominatorDelta : 0;
    this.interval && this.samples.push([this.counterDelta, this.denominatorDelta]);
    this.counterDelta = 0;
    this.denominatorDelta = 0;
    this.max = null;
    this.min = null;
    return value;
};

module.exports = AverageField;
