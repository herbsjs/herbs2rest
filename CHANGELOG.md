# [3.1.0](https://github.com/herbsjs/herbs2rest/compare/v3.0.2...v3.1.0) (2022-08-16)


### Bug Fixes

* **herbs:** update herbarium version ([f31373c](https://github.com/herbsjs/herbs2rest/commit/f31373c40778b0950c746b430acb52f5eb9660b5))


### Features

* **herbs2rest:** using Herbarium to create REST endpoints ([c97fa52](https://github.com/herbsjs/herbs2rest/commit/c97fa52a1728078a8175e75b17fa91d912606183)), closes [#22](https://github.com/herbsjs/herbs2rest/issues/22)

## [3.0.2](https://github.com/herbsjs/herbs2rest/compare/v3.0.1...v3.0.2) (2022-07-11)


### Bug Fixes

* **req2request:** fix cast for Boolean and Date ([c4d0388](https://github.com/herbsjs/herbs2rest/commit/c4d0388b839bf05741b528a760ca2f5b149d184e))

## [3.0.1](https://github.com/herbsjs/herbs2rest/compare/v3.0.0...v3.0.1) (2022-06-29)


### Bug Fixes

* **route:** fix generate route based on a entity ([19b3fce](https://github.com/herbsjs/herbs2rest/commit/19b3fce876b2621f4154dd85c4eee51ccc3b568a))

# [3.0.0](https://github.com/herbsjs/herbs2rest/compare/v2.0.2...v3.0.0) (2022-06-27)


### Features

* **generateroutes.js (test):** update generate routes test ([ea44229](https://github.com/herbsjs/herbs2rest/commit/ea4422901efcdd074e4bc9cdec7ad60825052cef))
* **generateroutes.js:** generate route param name dinamically with entity's id field name ([8f35fa4](https://github.com/herbsjs/herbs2rest/commit/8f35fa4124299b5a60df6408972886ecd867c3f3))


### BREAKING CHANGES

* **generateroutes.js:** We need a route's property entity to be passed as a parameter

## [2.0.2](https://github.com/herbsjs/herbs2rest/compare/v2.0.1...v2.0.2) (2022-06-08)


### Bug Fixes

* add peerDependencies and update dependencies ([2cfcda9](https://github.com/herbsjs/herbs2rest/commit/2cfcda998766765ed284b9fc7a3b45ec566498af))

## [2.0.1](https://github.com/herbsjs/herbs2rest/compare/v2.0.0...v2.0.1) (2022-01-15)


### Bug Fixes

* update herbs dependencie ([fa75a88](https://github.com/herbsjs/herbs2rest/commit/fa75a88f1953570d7b0d0227d95bff8caa43f92b))

# [2.0.0](https://github.com/herbsjs/herbs2rest/compare/v1.0.0...v2.0.0) (2021-12-04)


### Bug Fixes

* **default controller:** lint fix ([e14beb8](https://github.com/herbsjs/herbs2rest/commit/e14beb875627f3721becab379c4cbd0357cc1822))


### Features

* **default controller:** better HTTP Status Code using Herbs Known Errors ([d87d59b](https://github.com/herbsjs/herbs2rest/commit/d87d59b331170a8f1da3e0bc1f4edfb0f35c25ea)), closes [#17](https://github.com/herbsjs/herbs2rest/issues/17)


### BREAKING CHANGES

* **default controller:** Step code using generic Err should work just fine. However, steps core that are
already returning Known Errors will change the behavior of the default controller and should expect
to see a different HTTP status returned.

# 1.0.0 (2021-06-23)


### Features

* change library to herbs organization ([f185c26](https://github.com/herbsjs/herbs2rest/commit/f185c2660e7ff7be0f1b0b88a0c280a391c32448))
