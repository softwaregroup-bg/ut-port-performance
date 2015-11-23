# Performance port

This port allows collecting of performance metrics and sending them to different backends.
Currently [InfluxDB](https://influxdb.com/) is the only supported backend, but also there is a plan for supporting [StatsD](https://github.com/etsy/statsd).

The following configuration (as part of the environment configuration file) allows reporting of metrics to InfluxDB, using UDP packets:

```js
{
  "performance": {
    "influx":{
      "host":"influxdb",
      "port":4444,
      "interval": 1000
    }
  }
}
```

This port exposes one significant method: register(namespace, type, code, name).
The parameters have the following meaning:
  
  - **namespace**: the name of the InfluxDB measurement measurement
  - **type**: the type of measurement: 'gauge', 'counter', 'average'
  - **code**: a short, unique identifier of the metric within the measurement
  - **name**: the user friendly name of the metric
  
The types of measurements have the following intended usage:
  
  - **gauge**: measuring a direct value, which will be averaged over the count of observations: sum(cnt)/count. Useful for monitoring resource usage like memory, connection counts, etc.
  - **counter**: measuring the average rate of change of a value over the reported interval: diff(cnt)/diff(time). Useful for monitoring amounts like I/O count/volume, operations count, etc.
  - **average**: measuring the average rate of change of a value over the change of another value value: diff(cnt)/diff(base). Useful for monitoring resources spent per operation.

The register method returns a function, which needs to be called when the corresponding registered metric changed its value. 
Depending on metric type, the function needs to be invoked with the following arguments:

  - **gauge(value)** - value is the observed metric
  - **counter(value)** - value indicates much to add to the observed metric
  - **average(value, base)** - value and base indicate how much to add to the observed value and denominator base.
