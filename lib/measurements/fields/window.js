var hrtime = require('browser-process-hrtime');

function SlidingWindow(samples, counters) {
    this.history = new Array(samples).fill([]);
    this.history.forEach((v, i, a) => { a[i] = new Float64Array(counters + 2); });
    this.current = 0;
}

SlidingWindow.prototype.push = function(values) {
    this.history[this.current].set(values.concat(hrtime()));
    this.current = (this.current + 1) % this.history.length;
};

// sum all values up to interval seconds back in time
SlidingWindow.prototype.sum = function(interval) {
    let result = new Float64Array(this.history[0].length - 1);
    let sampleCount = this.history.length;
    let index = (this.current + sampleCount - 1) % sampleCount;
    let limit = hrtime();
    limit[0] -= interval;
    let sampleIterator;
    for (sampleIterator = 0; sampleIterator < sampleCount; sampleIterator++) { // iterate back in time
        let sampletime = this.history[index].slice(-2);
        let diff = sampletime[0] - limit[0];
        if (diff < 0 || (diff === 0 && sampletime[1] <= limit[1])) {
            break;
        }
        for (let measurementIndex = 0; measurementIndex < result.length - 1; measurementIndex++) {
            result[measurementIndex] += this.history[index][measurementIndex];
        }
        if (--index < 0) {
            index = sampleCount - 1;
        }
    }
    result[result.length - 1] = sampleIterator;
    return result;
};

module.exports = SlidingWindow;
