function GaugeField(code, name) {
    this.code = code;
    this.name = name;
    this.counter = 0;
}

GaugeField.prototype.set = function(value) {
    this.counter = value;
};

GaugeField.prototype.get = function(deltaTime) {
    return this.counter;
};

module.exports = GaugeField;
