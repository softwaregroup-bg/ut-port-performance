var util = require('util');
var AbstractMetric = require('./abstract');

function TaggedMetric(options) {
    AbstractMetric.call(this, options);
    this.tags = {};
}

util.inherits(TaggedMetric, AbstractMetric);

TaggedMetric.prototype.dispose = function() {
    // to do - implement dispose method if needed
};

module.exports = TaggedMetric;
