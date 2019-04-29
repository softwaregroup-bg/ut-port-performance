## [7.0.2](https://github.com/softwaregroup-bg/ut-port-performance/compare/v7.0.1...v7.0.2) (2019-04-29)


### Bug Fixes

* resolve connected ([297c401](https://github.com/softwaregroup-bg/ut-port-performance/commit/297c401))



## [7.0.1](https://github.com/softwaregroup-bg/ut-port-performance/compare/v7.0.0...v7.0.1) (2019-03-22)



# [7.0.0](https://github.com/softwaregroup-bg/ut-port-performance/compare/v6.0.0...v7.0.0) (2019-02-02)


### Bug Fixes

* do not handle any namespace ([43872ce](https://github.com/softwaregroup-bg/ut-port-performance/commit/43872ce))
* refactor as class ([#13](https://github.com/softwaregroup-bg/ut-port-performance/issues/13)) ([5a23fe0](https://github.com/softwaregroup-bg/ut-port-performance/commit/5a23fe0))
* upgrade dependencies ([0c9464b](https://github.com/softwaregroup-bg/ut-port-performance/commit/0c9464b))
* upgrade ut-tools ([ee17159](https://github.com/softwaregroup-bg/ut-port-performance/commit/ee17159))


### BREAKING CHANGES

* requires upgrade of ut-port and ut-run



<a name="6.0.0"></a>
# [6.0.0](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.9.0...v6.0.0) (2017-12-06)


### Features

* mtu handling, sliding window, min/max gauge ([b9cdee0](https://github.com/softwaregroup-bg/ut-port-performance/commit/b9cdee0))



<a name="5.9.0"></a>
# [5.9.0](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.8.0...v5.9.0) (2017-10-25)


### Bug Fixes

* min/max handling ([74f644d](https://github.com/softwaregroup-bg/ut-port-performance/commit/74f644d))



<a name="5.7.0"></a>
# [5.7.0](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.6.0...v5.7.0) (2017-08-25)


### Features

* improve min/max fields ([0aaeac7](https://github.com/softwaregroup-bg/ut-port-performance/commit/0aaeac7))



<a name="5.6.0"></a>
# [5.6.0](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.5.4...v5.6.0) (2017-08-18)


### Features

* common tags for measurements ([f7e71cd](https://github.com/softwaregroup-bg/ut-port-performance/commit/f7e71cd))



<a name="5.5.4"></a>
## [5.5.4](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.5.3...v5.5.4) (2017-08-16)


### Bug Fixes

* add max field to average counter ([#6](https://github.com/softwaregroup-bg/ut-port-performance/issues/6)) ([2302aa4](https://github.com/softwaregroup-bg/ut-port-performance/commit/2302aa4))



<a name="5.5.3"></a>
## [5.5.3](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.5.2...v5.5.3) (2017-08-16)


### Bug Fixes

* prevent creating duplicate fields ([75260e7](https://github.com/softwaregroup-bg/ut-port-performance/commit/75260e7))



<a name="5.5.2"></a>
## [5.5.2](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.5.1...v5.5.2) (2017-08-15)


### Bug Fixes

* typo ([2a8ee98](https://github.com/softwaregroup-bg/ut-port-performance/commit/2a8ee98))



<a name="5.5.1"></a>
## [5.5.1](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.5.0...v5.5.1) (2017-08-15)


### Bug Fixes

* fix average field ([#4](https://github.com/softwaregroup-bg/ut-port-performance/issues/4)) ([3e8389b](https://github.com/softwaregroup-bg/ut-port-performance/commit/3e8389b))



<a name="5.5.0"></a>
# [5.5.0](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.17...v5.5.0) (2017-08-01)


### Bug Fixes

* don't send the packed if there are nothing to be sent ([39e18d7](https://github.com/softwaregroup-bg/ut-port-performance/commit/39e18d7))
* improvements ([22036a8](https://github.com/softwaregroup-bg/ut-port-performance/commit/22036a8))
* refactor ([f7661de](https://github.com/softwaregroup-bg/ut-port-performance/commit/f7661de))
* refactor abstract metric ([d1472a2](https://github.com/softwaregroup-bg/ut-port-performance/commit/d1472a2))
* refactoring ([4193888](https://github.com/softwaregroup-bg/ut-port-performance/commit/4193888))
* refactoring ([0b49ff4](https://github.com/softwaregroup-bg/ut-port-performance/commit/0b49ff4))
* refactoring ([071a0ff](https://github.com/softwaregroup-bg/ut-port-performance/commit/071a0ff))
* remove metricsProvider folder ([1ce8387](https://github.com/softwaregroup-bg/ut-port-performance/commit/1ce8387))
* remove space ([401be8b](https://github.com/softwaregroup-bg/ut-port-performance/commit/401be8b))
* rename metric to tag ([87cc944](https://github.com/softwaregroup-bg/ut-port-performance/commit/87cc944))
* rename super constructor function names ([2184826](https://github.com/softwaregroup-bg/ut-port-performance/commit/2184826))
* rename superconstructors ([ef80acc](https://github.com/softwaregroup-bg/ut-port-performance/commit/ef80acc))
* restructuring ([53aff41](https://github.com/softwaregroup-bg/ut-port-performance/commit/53aff41))
* set proper names to measurement constructors ([8e2755b](https://github.com/softwaregroup-bg/ut-port-performance/commit/8e2755b))
* start code reorganization ([8555225](https://github.com/softwaregroup-bg/ut-port-performance/commit/8555225))
* typo - tag should actually be field ([f4fa9c1](https://github.com/softwaregroup-bg/ut-port-performance/commit/f4fa9c1))


### Features

* refactoring plus dynamic counters implementation ([cc2a470](https://github.com/softwaregroup-bg/ut-port-performance/commit/cc2a470))
* send only measurements that have been updated ([13f3b40](https://github.com/softwaregroup-bg/ut-port-performance/commit/13f3b40))



<a name="5.4.17"></a>
## [5.4.17](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.16...v5.4.17) (2017-05-22)



<a name="5.4.16"></a>
## [5.4.16](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.15...v5.4.16) (2017-05-22)



<a name="5.4.15"></a>
## [5.4.15](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.14...v5.4.15) (2017-05-22)



<a name="5.4.14"></a>
## [5.4.14](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.13...v5.4.14) (2017-05-22)



<a name="5.4.13"></a>
## [5.4.13](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.12...v5.4.13) (2017-05-22)



<a name="5.4.12"></a>
## [5.4.12](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.11...v5.4.12) (2017-05-22)



<a name="5.4.11"></a>
## [5.4.11](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.10...v5.4.11) (2017-05-22)



<a name="5.4.10"></a>
## [5.4.10](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.9...v5.4.10) (2017-04-24)



<a name="5.4.9"></a>
## [5.4.9](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.8...v5.4.9) (2017-04-13)


### Bug Fixes

* only log errors ([11bf111](https://github.com/softwaregroup-bg/ut-port-performance/commit/11bf111))



<a name="5.4.8"></a>
## [5.4.8](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.7...v5.4.8) (2017-03-08)


### Bug Fixes

* dependencies ([4b094ef](https://github.com/softwaregroup-bg/ut-port-performance/commit/4b094ef))



<a name="5.4.7"></a>
## [5.4.7](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.6...v5.4.7) (2016-11-02)



<a name="5.4.6"></a>
## [5.4.6](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.5...v5.4.6) (2016-09-20)



<a name="5.4.5"></a>
## [5.4.5](https://github.com/softwaregroup-bg/ut-port-performance/compare/v5.4.4...v5.4.5) (2016-08-12)


### Bug Fixes

* publish to npm ([13ed337](https://github.com/softwaregroup-bg/ut-port-performance/commit/13ed337))



<a name="5.4.4"></a>
## [5.4.4](https://git.softwaregroup.com/ut5/ut-port-performance/compare/v5.4.3...v5.4.4) (2016-08-02)



<a name="5.4.3"></a>
## [5.4.3](https://git.softwaregroup.com/ut5/ut-port-performance/compare/v5.4.2...v5.4.3) (2016-07-27)


### Bug Fixes

* remove closures for interval and client ([92ff8ba](https://git.softwaregroup.com/ut5/ut-port-performance/commit/92ff8ba))



<a name="5.4.2"></a>
## [5.4.2](https://git.softwaregroup.com/ut5/ut-port-performance/compare/v5.4.1...v5.4.2) (2016-07-22)



<a name="5.4.1"></a>
## [5.4.1](https://git.softwaregroup.com/ut5/ut-port-performance/compare/v5.3.11...v5.4.1) (2016-07-11)


### Features

* upgrade dependencies ([b0e7c50](https://git.softwaregroup.com/ut5/ut-port-performance/commit/b0e7c50))



<a name="5.3.11"></a>
## [5.3.11](https://git.softwaregroup.com/ut5/ut-port-performance/compare/v5.3.10...v5.3.11) (2016-04-15)


### Features

* add Gitlab-ci and Jenkins scripts ([626ae8e](https://git.softwaregroup.com/ut5/ut-port-performance/commit/626ae8e))



<a name="5.3.10"></a>
## [5.3.10](https://git.softwaregroup.com/ut5/ut-port-performance/compare/v5.3.8...v5.3.10) (2016-03-30)


### Bug Fixes

* switch to nexus ([efb1a04](https://git.softwaregroup.com/ut5/ut-port-performance/commit/efb1a04))

### Features

* ut-tools upgrade ([3e8d3ca](https://git.softwaregroup.com/ut5/ut-port-performance/commit/3e8d3ca))



