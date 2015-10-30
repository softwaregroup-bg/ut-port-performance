var namespaces = {};

var types = {
    gauge: function(index, counters) {
        return function gauge(value) {
            counters[index] = value;
        };
    },
    counter: function(index, counters, countersDelta) {
        return function count(value) {
            counters[index] += value;
            countersDelta[index] += value;
        };
    },
    average: function(index, counters, countersDelta, denominators, denominatorsDelta) {
        return function average(value, count) {
            counters[index] += value;
            countersDelta[index] += value;
            denominators[index] += count;
            denominatorsDelta[index] += count;
        };
    }
};

var stats = {
    gauge: function(code, counter) {
        return code + '=' + counter;
    },
    counter: function(code, counter) {
        return code + '=' + counter;
    },
    average: function(code, counter, denominator) {
        return code + '=' + (counter / denominator);
    }
};

var influx = {
    gauge: function(code, counter) {
        return code + '=' + counter;
    },
    counter: function(code, counter, counterDelta) {
        return code + '=' + counterDelta;
    },
    average: function(code, counter, counterDelta, denominator, denominatorDelta) {
        return code + '=' + (denominatorDelta ? (counterDelta / denominatorDelta) : 0);
    }
};

var Port = require('ut-bus/port');
var util = require('util');

function PerformancePort() {
    Port.call(this);
    this.config = {
        id: null,
        logLevel: '',
        type: 'performance'
    };
}

util.inherits(PerformancePort, Port);

PerformancePort.prototype.register = function performancePortRegister(namespace, type, code, name) {
    var metrics = namespaces[namespace];
    if (!metrics) {
        metrics = {
            counters: [0],
            countersDelta: [0],
            denominators: [0],
            denominatorsDelta: [0],
            names: [name],
            codes: [code],
            dump: {
                stats: [stats[type]],
                influx: [influx[type]]
            }
        };
        namespaces[namespace] = metrics;
    } else {
        metrics.counters.push(0);
        metrics.countersDelta.push(0);
        metrics.denominators.push(0);
        metrics.denominatorsDelta.push(0);
        metrics.dump.stats.push(stats[type]);
        metrics.dump.influx.push(influx[type]);
        metrics.names.push(name);
        metrics.codes.push(code);
    }
    return types[type](metrics.counters.length - 1, metrics.counters, metrics.countersDelta, metrics.denominators, metrics.denominatorsDelta);
};

PerformancePort.prototype.influx = function influx() {
    return Object.keys(namespaces).map(function(namespace) {
        var metrics = namespaces[namespace];
        var codes = metrics.codes;
        var counters = metrics.counters;
        var countersDelta = metrics.countersDelta;
        var denominatorsDelta = metrics.denominatorsDelta;
        var denominators = metrics.denominators;
        return namespace + ' ' + metrics.dump.influx.reduce(function(prev, current, index) {
                var value = current(codes[index], counters[index], countersDelta[index], denominators[index], denominatorsDelta[index]);
                countersDelta[index] = 0;
                denominatorsDelta[index] = 0;
                return prev + (index ? ',' : '') + value;
            }, '') + ' ' + Date.now() + '000000';
    });
};

PerformancePort.prototype.stats = function stats() {
    return Object.keys(namespaces).map(function(namespace) {
        var metrics = namespaces[namespace];
        var codes = metrics.codes;
        var counters = metrics.counters;
        var countersDelta = metrics.countersDelta;
        var denominatorsDelta = metrics.denominatorsDelta;
        var denominators = metrics.denominators;
        return metrics.dump.stats.reduce(function(prev, current, index) {
            var value = current(codes[index], counters[index], countersDelta[index], denominators[index], denominatorsDelta[index]);
            countersDelta[index] = 0;
            denominatorsDelta[index] = 0;
            return prev + (index ? '' : '\n') + namespace + '.' + value;
        }, '');
    });
};

var dgram = require('dgram');
var client = dgram.createSocket('udp4');

PerformancePort.prototype.start = function start() {
    Port.prototype.start.apply(this, arguments);
    if (this.config && this.config.influx && this.config.influx.port && this.config.influx.host) {
        setInterval(function() {
            var message = this.influx().join('\n');
            client.send(message, 0, message.length, this.config.influx.port, this.config.influx.host, function(err) {
                this.log.error && this.log.error(err);
            }.bind(this));
            //console.log(message);
        }.bind(this), this.config.influx.interval || 1000);
    }
};

module.exports = PerformancePort;
