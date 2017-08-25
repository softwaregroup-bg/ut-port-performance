function AverageField(code, name) {
    this.code = code;
    this.name = name;
    this.counterDelta = 0;
    this.denominatorDelta = 0;
    this.max = 0;
    this.min = 0;
}

AverageField.prototype.update = function(value, count) {
    this.counterDelta += value;
    this.denominatorDelta += count;
    if (count > 1) {
        value = value / count;
    }
    if (count >= 1) {
        if (!this.max || value > this.max) {
            this.max = value;
        }
        if (!this.min || value < this.min) {
            this.min = value;
        }
    }
};

AverageField.prototype.getAvgCount = function(deltaTime) {
    return deltaTime ? this.denominatorDelta / deltaTime : 0;
};

AverageField.prototype.flush = function(deltaTime) {
    var value = this.denominatorDelta ? this.counterDelta / this.denominatorDelta : 0;
    this.counterDelta = 0;
    this.denominatorDelta = 0;
    this.max = 0;
    this.min = 0;
    return value;
};

module.exports = AverageField;
