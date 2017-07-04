var util = require('util');
var AbstractMetric = require('./abstract');

function StandardMetric(options) {
    AbstractMetric.call(this, options);
    this.data = {
        counters: [],
        countersDelta: [],
        denominators: [],
        denominatorsDelta: []
    };
}

util.inherits(StandardMetric, AbstractMetric);

StandardMetric.prototype.getHandler = function() {
    Object.keys(this.data).forEach((key) => {
        this.data[key].push(0);
    });
    return this.handler.bind(this, this.data.counters.length - 1);
};

StandardMetric.prototype.stop = function() {
    // to do - implement stop method
};

module.exports = StandardMetric;
