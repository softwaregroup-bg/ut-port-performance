var SlidingWindow = require('./window');

function AverageField(code, name, interval) {
    this.code = code;
    this.name = name;
    this.interval = interval;
    this.single = !Array.isArray(code);
    this.totalCount = 0;
    if (Array.isArray(code)) {
        this.counterDelta = new Array(code.length).fill(null);
        this.denominatorDelta = new Array(code.length).fill(null);
        this.max = new Array(code.length).fill(null);
        this.min = new Array(code.length).fill(null);
    } else {
        this.counterDelta = 0;
        this.denominatorDelta = 0;
        this.max = null;
        this.min = null;
    }
    if (interval) {
        this.samples = new SlidingWindow(100, 2);
    }
}

AverageField.prototype.update = function(values, count) {
    if (this.interval && values == null) {
        let sum = this.samples.sum(this.interval);
        sum[0] += this.counterDelta;
        sum[1] += this.denominatorDelta;
        return sum;
    }
    this.totalCount += count;
    if (this.single) {
        this.counterDelta += values;
        this.denominatorDelta += count;
        if (count > 1) {
            values = values / count;
        }
        if (count >= 1 && (values > this.max || this.max == null)) {
            this.max = values;
        }
        if (count >= 1 && (values < this.min || this.min == null)) {
            this.min = values;
        }
    } else {
        values.forEach((value, index) => {
            if (value != null) {
                this.counterDelta[index] += value;
                this.denominatorDelta[index] += count;
                if (count > 1) {
                    value = value / count;
                }
                if (count >= 1 && (value > this.max[index] || this.max[index] == null)) {
                    this.max[index] = value;
                }
                if (count >= 1 && (value < this.min[index] || this.min[index] == null)) {
                    this.min[index] = value;
                }
            }
        });
    }
};

AverageField.prototype.getAvgCount = function(deltaTime) {
    if (this.single) {
        return deltaTime ? this.denominatorDelta / deltaTime : 0;
    } else {
        return deltaTime ? this.totalCount / deltaTime : 0;
    }
};

AverageField.prototype.flush = function(deltaTime) {
    var value;
    if (this.single) {
        value = this.denominatorDelta ? this.counterDelta / this.denominatorDelta : 0;
    } else {
        value = {
            value: this.counterDelta.map((counter, index) => {
                var delta = this.denominatorDelta[index];
                if (counter == null) {
                    return null;
                } else {
                    return delta ? counter / delta : 0;
                }
            }).slice(),
            min: this.min.slice(),
            max: this.max.slice()
        };
    }
    this.interval && this.samples.push([this.counterDelta, this.denominatorDelta]);
    this.totalCount = 0;
    if (this.single) {
        this.counterDelta = 0;
        this.denominatorDelta = 0;
        this.max = null;
        this.min = null;
    } else {
        this.counterDelta.fill(null);
        this.denominatorDelta.fill(null);
        this.max.fill(null);
        this.min.fill(null);
    }
    return value;
};

module.exports = AverageField;
