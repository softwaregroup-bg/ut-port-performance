var hrtime = require('browser-process-hrtime');
var metrics = {
    average: require('./lib/metrics/average'),
    counter: require('./lib/metrics/counter'),
    gauge: require('./lib/metrics/gauge'),
    taggedAverage: require('./lib/metrics/taggedAverage'),
    taggedCounter: require('./lib/metrics/taggedCounter'),
    taggedGauge: require('./lib/metrics/taggedGauge')
};
function getMetric(type) {
    var Constructor = metrics[type];
    if (!Constructor) {
        throw new Error('unknown metric provider');
    }
    return function(options) {
        return new Constructor(options);
    };
}
var namespaces = {};

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
        var metric = namespaces[namespace];
        if (!metric) {
            metric = getMetric(type)({code, name});
            namespaces[namespace] = metric;
        }
        return metric.getHandler();
    };

    PerformancePort.prototype.influx = function influx(tags) {
        var oldTime = this.influxTime;
        this.influxTime = hrtime();
        var deltaTime = (this.influxTime[0] - oldTime[0]) + (this.influxTime[0] - oldTime[0]) / 1000000000;

        return Object.keys(namespaces).map(function(namespace) {
            var tagsString = (tags && Object.keys(tags).reduce(function(prev, cur) {
                prev += ',' + cur + '=' + (typeof tags[cur] === 'string' ? tags[cur].replace(/ /g, '\\ ') : tags[cur]);
                return prev;
            }, '')) || '';
            return namespace + tagsString + ' ' + namespaces[namespace].influxDump(deltaTime) + ' ' + Date.now() + '000000';
        });
    };

    PerformancePort.prototype.stats = function stats() {
        var oldTime = this.statsTime;
        this.statsTime = hrtime();
        var deltaTime = (this.statsTime[0] - oldTime[0]) + (this.statsTime[0] - oldTime[0]) / 1000000000;

        return Object.keys(namespaces).map(function(namespace) {
            return namespaces[namespace].statsDump(namespace, deltaTime);
        });
    };

    PerformancePort.prototype.start = function start() {
        var dgram = require('dgram');
        this.client = dgram.createSocket('udp4');
        Parent && Parent.prototype.start.apply(this, arguments);
        this.statsTime = this.influxTime = hrtime();
        if (this.config && this.config.influx && this.config.influx.port && this.config.influx.host && !this.config.test) {
            this.interval = setInterval(function() {
                this.write();
            }.bind(this), this.config.influx.interval || 5000);
        }
    };

    PerformancePort.prototype.stop = function stop() {
        clearInterval(this.interval);
        if (this.client) {
            return new Promise((resolve) => {
                this.client.close(function() {
                    resolve(true);
                });
                this.client.unref();
                this.client = null;
            });
        };
    };

    PerformancePort.prototype.write = function write(tags) {
        var message = this.influx(tags).join('\n');
        this.client.send(message, 0, message.length, this.config.influx.port, this.config.influx.host, function(err) {
            err && this.log && this.log.error && this.log.error(err);
        }.bind(this));
    };

    return PerformancePort;
};
