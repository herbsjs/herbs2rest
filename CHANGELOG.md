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
