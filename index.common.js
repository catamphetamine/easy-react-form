'use strict'

var Form = require('./build/form/form').default

exports = module.exports = Form

exports.Form = require('./build/form/form').decorator_with_options
exports.Field = require('./build/field/field').default
exports.Submit = require('./build/submit').default
exports.reducer = require('./build/reducer').default
exports.configure = require('./build/configuration').configure

exports['default'] = Form