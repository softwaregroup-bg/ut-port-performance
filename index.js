const hrtime = require('browser-process-hrtime');
const measurementConstructor = {
    standard: require('./lib/measurements/standard'),
    tagged: require('./lib/measurements/tagged')
};

module.exports = ({utPort}) => class PerformancePort extends utPort {
    constructor({utBus}) {
        super(...arguments);
        this.influxTime = [];
        this.statsTime = [];
        this.prometheusTime = [];
        this.measurements = {};
        if (utBus) {
            utBus.performance = this;
        }
    }
    get defaults() {
        return {
            type: 'performance',
            mtu: 1400
        };
    }
    register(measurementName, fieldType, fieldCode, fieldName, measurementType, tags, interval, fieldCodeExt) {
        let measurementId = (tags && tags.port) ? tags.port + measurementName : measurementName;
        let measurementInstance = this.measurements[measurementId];
        if (!measurementInstance) {
            const Measurement = measurementConstructor[measurementType || 'standard'];
            if (!Measurement) {
                throw new Error('invalid measurement type');
            }
            measurementInstance = new Measurement(measurementName, tags, {
                influx: !!this.config.influx,
                prometheus: !!this.config.prometheus
            });
            measurementInstance.unregister = () => delete this.measurements[measurementId];
            this.measurements[measurementId] = measurementInstance;
        }
        return measurementInstance.register(fieldType, fieldCodeExt || fieldCode, fieldName, interval);
    }
    influx(tags, send) {
        if (!this.config.influx) return;
        const oldTime = this.influxTime;
        this.influxTime = hrtime();
        const deltaTime = (this.influxTime[0] - oldTime[0]) + (this.influxTime[0] - oldTime[0]) / 1000000000;
        const suffix = ' ' + Date.now() + '000000';
        return Object.keys(this.measurements).map((measurement) => {
            return this.measurements[measurement].influx(deltaTime, tags, suffix, send);
        }).filter(x => x);
    }
    stats(tags) {
        const oldTime = this.statsTime;
        this.statsTime = hrtime();
        const deltaTime = (this.statsTime[0] - oldTime[0]) + (this.statsTime[0] - oldTime[0]) / 1000000000;
        const suffix = ' ' + Date.now() + '000000';
        return Object.keys(this.measurements).map((measurement) => {
            return this.measurements[measurement].statsD(deltaTime, tags, suffix);
        }).filter(x => x);
    }
    prometheus() {
        if (!this.config.prometheus) return '# Prometheus metrics not enabled';
        const oldTime = this.prometheusTime;
        this.prometheusTime = hrtime();
        const deltaTime = (this.prometheusTime[0] - oldTime[0]) + (this.prometheusTime[0] - oldTime[0]) / 1000000000;
        const suffix = ' ' + Date.now();
        return Object.keys(this.measurements).map((measurement) => {
            return this.measurements[measurement].prometheus(deltaTime, suffix);
        }).filter(x => x).join('\n');
    }
    start() {
        super.start(...arguments);
        this.statsTime = this.influxTime = this.prometheusTime = hrtime();
        if (this.config && this.config.influx && this.config.influx.port && this.config.influx.host) {
            const dgram = require('dgram');
            this.client = dgram.createSocket('udp4');
            if (!this.config.test) {
                this.interval = setInterval(function() {
                    this.write();
                }.bind(this), this.config.influx.interval || 5000);
            }
        }
        if (this.config && this.config.prometheus && this.config.prometheus.port) {
            const http = require('http');
            this.server = http.createServer((req, res) => {
                if (req.url === '/metrics') {
                    let result;
                    try {
                        result = this.prometheus();
                    } catch (error) {
                        this.error(error);
                        res.writeHead(500, 'Internal server error');
                        res.end(result);
                        return;
                    }
                    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
                    res.end(result);
                } else {
                    res.writeHead(404, 'Not found');
                    res.end();
                }
            });
            return new Promise((resolve, reject) => {
                this.server.on('error', error => {
                    this.error(error);
                    this.resolveConnected(false);
                    reject(error);
                });
                this.server.listen({
                    host: this.config.prometheus.host,
                    port: this.config.prometheus.port
                }, () => {
                    this.resolveConnected(true);
                    resolve();
                });
            });
        }
        this.resolveConnected(true);
    }
    stop() {
        try {
            if (this.interval) clearInterval(this.interval);
        } finally {
            this.interval = null;
        }
        const result = [];
        if (this.client) {
            result.push(new Promise((resolve) => {
                try {
                    this.client.close(function() {
                        resolve(true);
                    });
                } finally {
                    this.client.unref();
                    this.client = null;
                }
            }));
        }
        if (this.server) {
            result.push(new Promise((resolve) => {
                try {
                    this.server.close(function() {
                        resolve(true);
                    });
                } finally {
                    this.server.unref();
                    this.server = null;
                }
            }));
        }
        return Promise.all(result);
    }
    write(tags) {
        let packet = '';
        let flush = () => packet.length && this.client.send(packet, 0, packet.length, this.config.influx.port, this.config.influx.host, (err) => {
            err && this.log && this.log.error && this.log.error(err);
        });
        let buffer = counter => {
            if (packet.length + counter.length >= this.config.mtu) {
                flush();
                packet = counter;
            } else if (counter) {
                packet = packet + (packet.length ? '\n' : '') + counter;
            }
        };
        this.influx(tags, buffer);
        flush();
    }
};
