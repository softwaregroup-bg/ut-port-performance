var util = require('util');
var AbstractMetric = require('./abstract');

function DynamicMetric(options) {
    AbstractMetric.call(this, options);
    this.tags = {};
}

util.inherits(DynamicMetric, AbstractMetric);

DynamicMetric.prototype.getHandler = function() {
    var self = this;
    return function() {
        var tag = arguments[0];
        if (!self.tags[tag]) {
            self.tags[tag] = {
                counters: [],
                countersDelta: [],
                denominators: [],
                denominatorsDelta: []
            };
        }
        Object.keys(self.tags[tag]).forEach((key) => {
            self.tags[tag][key].push(0);
        });
        return self.handler.apply(self, [self.tags[tag].counters.length - 1].concat(Array.prototype.slice.call(arguments)));
    };
};

DynamicMetric.prototype.stop = function() {
    // to do - implement stop method
};

module.exports = DynamicMetric;
