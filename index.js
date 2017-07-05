var hrtime = require('browser-process-hrtime');
var measurement = {
    standard: require('./lib/measurements/standard'),
    tagged: require('./lib/measurements/tagged')
};
var measurements = {};

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

    PerformancePort.prototype.register = function performancePortRegister(measurementName, fieldType, fieldCode, fieldName, measurementType) {
        var measurementInstance = measurements[measurementName];
        if (!measurementInstance) {
            var Measurement = measurement[measurementType || 'standard'];
            if (!Measurement) {
                throw new Error('invalid measurement type');
            }
            measurementInstance = new Measurement(measurementName);
            measurements[measurementName] = measurementInstance;
        }
        return measurementInstance.register(fieldType, fieldCode, fieldName);
    };

    PerformancePort.prototype.influx = function influx(tags) {
        var oldTime = this.influxTime;
        this.influxTime = hrtime();
        var deltaTime = (this.influxTime[0] - oldTime[0]) + (this.influxTime[0] - oldTime[0]) / 1000000000;
        var suffix = ' ' + Date.now() + '000000';
        return Object.keys(measurements).map(function(measurement) {
            return measurements[measurement].influxDump(deltaTime, tags, suffix);
        });
    };

    PerformancePort.prototype.stats = function stats(tags) {
        var oldTime = this.statsTime;
        this.statsTime = hrtime();
        var deltaTime = (this.statsTime[0] - oldTime[0]) + (this.statsTime[0] - oldTime[0]) / 1000000000;
        var suffix = ' ' + Date.now() + '000000';
        return Object.keys(measurements).map(function(measurement) {
            return measurements[measurement].statsDump(deltaTime, tags, suffix);
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
            })
            .then(() => {
                return Promise.all(Object.keys(measurements).map((measurement) => {
                    return measurements[measurement].dispose();
                }));
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
