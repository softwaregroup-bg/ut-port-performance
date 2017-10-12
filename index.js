var hrtime = require('browser-process-hrtime');
var measurementConstructor = {
    standard: require('./lib/measurements/standard'),
    tagged: require('./lib/measurements/tagged')
};

module.exports = function(Parent) {
    function PerformancePort(params) {
        Parent && Parent.apply(this, arguments);
        this.config = Object.assign({
            id: null,
            logLevel: '',
            type: 'performance'
        }, params && params.config);
        this.influxTime = [];
        this.statsTime = [];
        this.measurements = {};
        if (params && params.bus) {
            params.bus.performance = this;
        }
    }

    if (Parent) {
        var util = require('util');
        util.inherits(PerformancePort, Parent);
    }

    PerformancePort.prototype.register = function performancePortRegister(measurementName, fieldType, fieldCode, fieldName, measurementType, tags, interval) {
        var measurementInstance = this.measurements[measurementName];
        if (!measurementInstance) {
            var Measurement = measurementConstructor[measurementType || 'standard'];
            if (!Measurement) {
                throw new Error('invalid measurement type');
            }
            measurementInstance = new Measurement(measurementName, tags);
            measurementInstance.unregister = () => delete this.measurements[measurementName];
            this.measurements[measurementName] = measurementInstance;
        }
        return measurementInstance.register(fieldType, fieldCode, fieldName, interval);
    };

    PerformancePort.prototype.influx = function influx(tags) {
        var oldTime = this.influxTime;
        this.influxTime = hrtime();
        var deltaTime = (this.influxTime[0] - oldTime[0]) + (this.influxTime[0] - oldTime[0]) / 1000000000;
        var suffix = ' ' + Date.now() + '000000';
        return Object.keys(this.measurements).map((measurement) => {
            return this.measurements[measurement].influx(deltaTime, tags, suffix);
        }).filter(x => x);
    };

    PerformancePort.prototype.stats = function stats(tags) {
        var oldTime = this.statsTime;
        this.statsTime = hrtime();
        var deltaTime = (this.statsTime[0] - oldTime[0]) + (this.statsTime[0] - oldTime[0]) / 1000000000;
        var suffix = ' ' + Date.now() + '000000';
        return Object.keys(this.measurements).map((measurement) => {
            return this.measurements[measurement].statsD(deltaTime, tags, suffix);
        }).filter(x => x);
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
        if (message) {
            this.client.send(message, 0, message.length, this.config.influx.port, this.config.influx.host, (err) => {
                err && this.log && this.log.error && this.log.error(err);
            });
        }
    };

    return PerformancePort;
};
