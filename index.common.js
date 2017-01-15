'use strict'

var Form = require('./build/form/form').default

exports = module.exports = Form

exports.Field = require('./build/field/field').default
exports.Submit = require('./build/submit').default
exports.reducer = require('./build/reducer').default

exports['default'] = Form