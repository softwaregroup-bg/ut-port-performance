function AverageField(code, name) {
    this.code = code;
    this.name = name;
    this.counterDelta = 0;
    this.denominatorDelta = 0;
}

AverageField.prototype.set = function(value, count) {
    this.counterDelta += value;
    this.denominatorDelta += count;
};

AverageField.prototype.get = function(deltaTime) {
    var value = this.denominatorDelta ? this.counterDelta / this.denominatorDelta : 0;
    this.counterDelta = 0;
    this.denominatorDelta = 0;
    return value;
};

module.exports = AverageField;
