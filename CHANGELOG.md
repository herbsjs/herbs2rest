# [4.1.0-beta.11](https://github.com/herbsjs/herbs2rest/compare/v4.1.0-beta.10...v4.1.0-beta.11) (2023-07-19)


### Features

* **authhandler:** now is possible to infor change authhandler for all endpoints at once ([a7e0e9c](https://github.com/herbsjs/herbs2rest/commit/a7e0e9c964a9624f36b4815772ca56fdc51b528a))

# [4.1.0-beta.10](https://github.com/herbsjs/herbs2rest/compare/v4.1.0-beta.9...v4.1.0-beta.10) (2023-05-19)


### Bug Fixes

* **populatemetadata:** fix bug with entities with methods ([32ef5ba](https://github.com/herbsjs/herbs2rest/commit/32ef5ba5f917cc8069fad8776e8732d67a7f890a))

# [4.1.0-beta.9](https://github.com/herbsjs/herbs2rest/compare/v4.1.0-beta.8...v4.1.0-beta.9) (2023-05-19)


### Bug Fixes

* **populatemetadata:** fix bug with entities with methods ([f5474d3](https://github.com/herbsjs/herbs2rest/commit/f5474d389bcd48a683c8bcf40698e053d8306b55))

# [4.1.0-beta.8](https://github.com/herbsjs/herbs2rest/compare/v4.1.0-beta.7...v4.1.0-beta.8) (2023-05-11)


### Bug Fixes

* **params:** fix uc request to params - Entities and [Entities] ([0a20e33](https://github.com/herbsjs/herbs2rest/commit/0a20e339140a285884dc824f04f0618a192a1fa5))

# [4.1.0-beta.7](https://github.com/herbsjs/herbs2rest/compare/v4.1.0-beta.6...v4.1.0-beta.7) (2023-04-28)


### Bug Fixes

* **populatemetadata:** fix parametersCast for undefined values on array types ([50ee481](https://github.com/herbsjs/herbs2rest/commit/50ee4819d107b31a49099e8a4b0fcf238b343f6e))

# [4.1.0-beta.6](https://github.com/herbsjs/herbs2rest/compare/v4.1.0-beta.5...v4.1.0-beta.6) (2023-04-26)


### Features

* **generateendpoint:** support more HTTP methods ([f1257dc](https://github.com/herbsjs/herbs2rest/commit/f1257dc3568a23c90f01362863a132b8b8cc0956))

# [4.1.0-beta.5](https://github.com/herbsjs/herbs2rest/compare/v4.1.0-beta.4...v4.1.0-beta.5) (2023-04-23)


### Features

* allow the controller handlers to be asynchronous ([549826f](https://github.com/herbsjs/herbs2rest/commit/549826f5442bbb944d89fe17dba3c388c0339a74))

# [4.1.0-beta.4](https://github.com/herbsjs/herbs2rest/compare/v4.1.0-beta.3...v4.1.0-beta.4) (2023-04-14)


### Bug Fixes

* **core:** change the way to expose the conventions ([e776cde](https://github.com/herbsjs/herbs2rest/commit/e776cdec05316b783435581c4b4d597a84c9c114))

# [4.1.0-beta.3](https://github.com/herbsjs/herbs2rest/compare/v4.1.0-beta.2...v4.1.0-beta.3) (2023-04-14)


### Features

* **core:** multiple calls of populateMetadata with different versions creates multiple endpoints ([e105d05](https://github.com/herbsjs/herbs2rest/commit/e105d056143de680f5f66f4ad74961c49c06f6e7))

# [4.1.0-beta.2](https://github.com/herbsjs/herbs2rest/compare/v4.1.0-beta.1...v4.1.0-beta.2) (2023-04-13)


### Features

* **core:** multiples Endpoint for a Use Case ([ce94a56](https://github.com/herbsjs/herbs2rest/commit/ce94a5657eeeef6ca7293d4e585a067d2ca46ed2))
* **populatemetadata:** versioning API - Now it is possible to have the version number on the path ([b9a1c36](https://github.com/herbsjs/herbs2rest/commit/b9a1c365a4b30fbe2a7f3f404beb1e89b8f63eeb))

# [4.1.0-beta.1](https://github.com/herbsjs/herbs2rest/compare/v4.0.0...v4.1.0-beta.1) (2023-03-30)


### Features

* **v2:** new herbs2rest - generate metadata on herbarium, new architecture, etc ([054bbf4](https://github.com/herbsjs/herbs2rest/commit/054bbf4d3a55d8204d39ffe67426711688cc964c))


### Reverts

* **node:** back to 16.x ([4c70681](https://github.com/herbsjs/herbs2rest/commit/4c70681ccb6855244e7cb68d15efdee8cc346ad4))
* **semantic release:** go back to version 19.0.3 ([dd35628](https://github.com/herbsjs/herbs2rest/commit/dd35628d3c0063c4f82e7c0dc6f893440dee6a5e))

# [4.0.0](https://github.com/herbsjs/herbs2rest/compare/v3.2.4...v4.0.0) (2023-03-07)


### Documentation

* update docs ([4d2e0f2](https://github.com/herbsjs/herbs2rest/commit/4d2e0f2af3ad9cbb7ad781ba8e8090e15e08288a))


### BREAKING CHANGES

* upgrade buchu to 2.0

## [3.2.4](https://github.com/herbsjs/herbs2rest/compare/v3.2.3...v3.2.4) (2023-03-06)


### Bug Fixes

* **package.json:** up herbs in peerDependencies ([8fc22f0](https://github.com/herbsjs/herbs2rest/commit/8fc22f05d76a7b92cbafe67438acb5e591e566c9))

## [3.2.3](https://github.com/herbsjs/herbs2rest/compare/v3.2.2...v3.2.3) (2023-03-06)


### Bug Fixes

* **package.json:** up herbs version ([a3403aa](https://github.com/herbsjs/herbs2rest/commit/a3403aa5ea67eb3517fd7a1f4d32f75a27bcc37d))

## [3.2.2](https://github.com/herbsjs/herbs2rest/compare/v3.2.1...v3.2.2) (2022-10-11)


### Bug Fixes

* remove from controller list if a type of usecase is not registered inside herbarium ([d58ef7f](https://github.com/herbsjs/herbs2rest/commit/d58ef7fec98f2ee3092e628e6aa890739ed558e2)), closes [#45](https://github.com/herbsjs/herbs2rest/issues/45)

## [3.2.1](https://github.com/herbsjs/herbs2rest/compare/v3.2.0...v3.2.1) (2022-09-21)


### Bug Fixes

* 🐛 fixing the findUsecases function ([c335e8b](https://github.com/herbsjs/herbs2rest/commit/c335e8bb919e7045c8e2d564b26a00477a4b7bf3))

# [3.2.0](https://github.com/herbsjs/herbs2rest/compare/v3.1.1...v3.2.0) (2022-09-07)


### Bug Fixes

* **package-lock.json:** sync with package.json ([6492c1a](https://github.com/herbsjs/herbs2rest/commit/6492c1aaaf7546f604fa8aa488898497f144fe17))


### Features

* **controller:** evolve herbs2rest for new cli project structure ([a6fdfb6](https://github.com/herbsjs/herbs2rest/commit/a6fdfb64befe9186223aaa89ff098e83e7bcb075))

## [3.1.1](https://github.com/herbsjs/herbs2rest/compare/v3.1.0...v3.1.1) (2022-08-21)


### Bug Fixes

* fix generation route without entity or entity without id ([a4de657](https://github.com/herbsjs/herbs2rest/commit/a4de6577bfcaacfb6c8c489a4eb3bb0ca8a83066))

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
