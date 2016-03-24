var hrtime = require('browser-process-hrtime');

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
    gauge: function(code, time, counter) {
        return code + '=' + counter;
    },
    counter: function(code, time, counter) {
        return code + '=' + (time ? counter / time : 0);
    },
    average: function(code, time, counter, denominator) {
        return code + '=' + (counter / denominator);
    }
};

var influx = {
    gauge: function(code, time, counter) {
        return code + '=' + counter;
    },
    counter: function(code, time, counter, counterDelta) {
        return code + '=' + (time ? counterDelta / time : 0);
    },
    average: function(code, time, counter, counterDelta, denominator, denominatorDelta) {
        return code + '=' + (denominatorDelta ? (counterDelta / denominatorDelta) : 0);
    }
};

module.exports = function(Parent) {
    function PerformancePort() {
        Parent && Parent.call(this);
        this.config = {
            id: null,
            logLevel: '',
            type: 'performance'
        };
        this.influxTime = [];
        this.statsTime = [];
    }

    if (Parent) {
        var util = require('util');
        util.inherits(PerformancePort, Parent);
    }

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

    PerformancePort.prototype.influx = function influx(tags) {
        var oldTime = this.influxTime;
        this.influxTime = hrtime();
        var deltaTime = (this.influxTime[0] - oldTime[0]) + (this.influxTime[0] - oldTime[0]) / 1000000000;

        return Object.keys(namespaces).map(function(namespace) {
            var metrics = namespaces[namespace];
            var codes = metrics.codes;
            var counters = metrics.counters;
            var countersDelta = metrics.countersDelta;
            var denominatorsDelta = metrics.denominatorsDelta;
            var denominators = metrics.denominators;
            var tagsString = (tags && Object.keys(tags).reduce(function(prev, cur) {
                prev += ',' + cur + '=' + tags[cur];
                return prev;
            }, '')) || '';
            return namespace + tagsString + ' ' + metrics.dump.influx.reduce(function(prev, current, index) {
                var value = current(codes[index], deltaTime, counters[index], countersDelta[index], denominators[index], denominatorsDelta[index]);
                countersDelta[index] = 0;
                denominatorsDelta[index] = 0;
                return prev + (index ? ',' : '') + value;
            }, '') + ' ' + Date.now() + '000000';
        });
    };

    PerformancePort.prototype.stats = function stats() {
        var oldTime = this.statsTime;
        this.statsTime = hrtime();
        var deltaTime = (this.statsTime[0] - oldTime[0]) + (this.statsTime[0] - oldTime[0]) / 1000000000;

        return Object.keys(namespaces).map(function(namespace) {
            var metrics = namespaces[namespace];
            var codes = metrics.codes;
            var counters = metrics.counters;
            var countersDelta = metrics.countersDelta;
            var denominatorsDelta = metrics.denominatorsDelta;
            var denominators = metrics.denominators;
            return metrics.dump.stats.reduce(function(prev, current, index) {
                var value = current(codes[index], deltaTime, counters[index], countersDelta[index], denominators[index], denominatorsDelta[index]);
                countersDelta[index] = 0;
                denominatorsDelta[index] = 0;
                return prev + (index ? '' : '\n') + namespace + '.' + value;
            }, '');
        });
    };

    var interval;
    var client;

    PerformancePort.prototype.start = function start() {
        var dgram = require('dgram');
        client = dgram.createSocket('udp4');
        Parent && Parent.prototype.start.apply(this, arguments);
        this.statsTime = this.influxTime = hrtime();
        if (this.config && this.config.influx && this.config.influx.port && this.config.influx.host && !this.config.test) { // @TODO: discuss better way to identify if mode is test
            interval = setInterval(function() {
                this.write();
            }.bind(this), this.config.influx.interval || 5000);
        }
    };

    PerformancePort.prototype.stop = function stop() {
        clearInterval(interval);
        client && client.close() && client.unref();
        client = null;
    };

    PerformancePort.prototype.write = function write(tags) {
        var message = this.influx(tags).join('\n');
        client.send(message, 0, message.length, this.config.influx.port, this.config.influx.host, function(err) {
            this.log && this.log.error && this.log.error(err);
        }.bind(this));
    };

    return PerformancePort;
};
