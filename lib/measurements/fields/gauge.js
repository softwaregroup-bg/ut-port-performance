function GaugeField(code, name) {
    this.code = code;
    this.name = name;
    this.counter = 0;
}

GaugeField.prototype.update = function(value) {
    this.counter = value;
};

GaugeField.prototype.flush = function(deltaTime) {
    return this.counter;
};

module.exports = GaugeField;
