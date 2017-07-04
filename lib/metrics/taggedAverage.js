var util = require('util');
var TaggedMetric = require('./super/tagged');

// options: code, name
function TaggedAverageMetric(options) {
    TaggedMetric.call(this, options);
}

util.inherits(TaggedAverageMetric, TaggedMetric);

TaggedAverageMetric.prototype.handler = function(index, tag, value, count) {
    this.tags[tag].counters[index] += value;
    this.tags[tag].countersDelta[index] += value;
    this.tags[tag].denominators[index] += count;
    this.tags[tag].denominatorsDelta[index] += count;
};

TaggedAverageMetric.prototype.influxDump = function(deltaTime) {
    return Object.keys(this.tags).map((tag) => {
        return this.tags[tag].counters.map((counter, index) => {
            var value = this.code + '=' + (this.tags[tag].denominatorDelta[index] ? this.tags[tag].countersDelta[index] / this.tags[tag].denominatorDelta[index] : 0);
            this.tags[tag].countersDelta[index] = 0;
            this.tags[tag].denominatorsDelta[index] = 0;
            return value;
        }).join(',');
    }).join('');
};

TaggedAverageMetric.prototype.statsDump = function(namespace, deltaTime) {
    return Object.keys(this.tags).map((tag) => {
        return this.tags[tag].counters.map((counter, index) => {
            var value = this.code + '=' + (counter / this.tags[tag].denominator[index]);
            return namespace + '.' + value;
        }).join('\n');
    }).join('');
};

module.exports = TaggedAverageMetric;
