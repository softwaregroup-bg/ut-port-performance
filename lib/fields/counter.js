function CounterField(code, name) {
    this.code = code;
    this.name = name;
    this.counterDelta = 0;
}

CounterField.prototype.set = function(value) {
    this.counterDelta += value;
};

CounterField.prototype.get = function(deltaTime) {
    var value = deltaTime ? this.counterDelta / deltaTime : 0;
    this.counterDelta = 0;
    return value;
};

module.exports = CounterField;
