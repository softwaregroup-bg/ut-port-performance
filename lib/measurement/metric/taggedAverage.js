var util = require('util');
var AbstractMetric = require('./abstract');

// options: code, name
function TaggedAverageMetric(options) {
    AbstractMetric.call(this, options);
    this.data = {};
}

util.inherits(TaggedAverageMetric, AbstractMetric);

TaggedAverageMetric.prototype.handler = function(id, tags, value, count) {
    if (!this.data[id]) {
        this.data[id] = {
            counter: 0,
            counterDelta: 0,
            denominator: 0,
            denominatorDelta: 0,
            influxTags: Object.keys(tags).map((key) => (key + '=' + tags[key])).join(',')
        };
    }
    this.data[id].counter += value;
    this.data[id].counterDelta += value;
    this.data[id].denominator += count;
    this.data[id].denominatorDelta += count;
};

TaggedAverageMetric.prototype.influxDump = function(deltaTime) {
    return Object.keys(this.data).map((id) => {
        var value = this.data[id].denominatorDelta ? this.data[id].counterDelta / this.data[id].denominatorDelta : 0;
        this.data[id].countersDelta = 0;
        this.data[id].denominatorsDelt = 0;
        return {
            tags: this.data[id].influxTags,
            value: this.code + '=' + value
        };
    });
};

TaggedAverageMetric.prototype.statsDump = function(deltaTime) {
    return Object.keys(this.data).map((id) => {
        return {
            value: this.code + '=' + (this.counter / this.data[id].denominator)
        };
    });
};

module.exports = TaggedAverageMetric;
