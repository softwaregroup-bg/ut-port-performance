function GaugeField(code, name) {
    this.code = code;
    this.name = name;
    this.counter = null;
    this.min = null;
    this.max = null;
}

GaugeField.prototype.update = function(value) {
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
    return this.counter;
};

module.exports = GaugeField;
