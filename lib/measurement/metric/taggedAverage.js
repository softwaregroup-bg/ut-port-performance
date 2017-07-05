var util = require('util');
var AbstractMetric = require('./abstract');

// options: code, name
function TaggedAverageMetric(options) {
    AbstractMetric.call(this, options);
    this.tags = {};
}

util.inherits(TaggedAverageMetric, AbstractMetric);

TaggedAverageMetric.prototype.handler = function(tag, value, count) {
    if (!this.tags[tag]) {
        this.tags[tag] = {
            counter: 0,
            counterDelta: 0,
            denominator: 0,
            denominatorDelta: 0
        };
    }
    this.tags[tag].counter += value;
    this.tags[tag].counterDelta += value;
    this.tags[tag].denominator += count;
    this.tags[tag].denominatorDelta += count;
};

TaggedAverageMetric.prototype.influxDump = function(deltaTime) {
    return Object.keys(this.tags).map((tag) => {
        var value = this.code + '=' + (this.tags[tag].denominatorDelta ? this.tags[tag].counterDelta / this.tags[tag].denominatorDelta : 0);
        this.tags[tag].countersDelta = 0;
        this.tags[tag].denominatorsDelt = 0;
        return value;
    }).join('');
};

TaggedAverageMetric.prototype.statsDump = function(deltaTime) {
    return Object.keys(this.tags).map((tag) => {
        return this.code + '=' + (this.counter / this.tags[tag].denominator);
    }).join('');
};

module.exports = TaggedAverageMetric;
