var util = require('util');
var AbstractMetric = require('./abstract');

function StandardMetric(options) {
    AbstractMetric.call(this, options);
    this.counter = 0;
    this.counterDelta = 0;
    this.denominator = 0;
    this.denominatorDelta = 0;
}

util.inherits(StandardMetric, AbstractMetric);

StandardMetric.prototype.dispose = function() {
    // to do - implement dispose method if needed
};

module.exports = StandardMetric;
