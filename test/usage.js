/* eslint no-console:0 */
const Perf = require('../index')();
const perf = new Perf();

perf.config.id = 'test';
perf.config.influx = {
    host: 'influxdb',
    port: 4444,
    interval: 2000
};

const speed = perf.register('port1', 'counter', 'spd', 'Operations count per second');
const delay = perf.register('port1', 'average', 'dly', 'Time per operation(ms)');

// perf.start(); // start sending metrics to influx

const log = setInterval(function() { // log metrics to console on each second
    console.log(perf.influx().join());
}, 1000);

const work = function(start, i) {
    speed(1); // metrics of type 'counter' expose a function with single argument - the count to be added
    delay(Date.now() - start, 1); // metrics of type 'average' expose a function with 2 arguments - which are usually the time spent and operations completed
    if (i > 1) {
        const t = Date.now();
        setTimeout(function() {
            work(t, i - 1);
        }, 1 + Math.random() * 10);
    } else {
        clearInterval(log);
        console.log(perf.influx().join());
    }
};

work(Date.now(), 1000);
