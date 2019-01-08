import React, { Component } from 'react'
import PropTypes from 'prop-types'
import createContext from 'create-react-context'

import OnAbandonPlugin from './plugins/onAbandon'
import { getPassThroughProps } from './utility'

import
{
	setFormSubmitting,
	setFieldValue,
	setFieldError
}
from './actions'

export const Context = createContext()

export default class Form extends Component
{
	static propTypes =
	{
		onSubmit : PropTypes.func.isRequired,
		onBeforeSubmit : PropTypes.func,
		onAfterSubmit : PropTypes.func,
		onAbandon : PropTypes.func,
		values : PropTypes.object,
		autoFocus : PropTypes.bool.isRequired,
		trim : PropTypes.bool.isRequired,
		requiredMessage : PropTypes.string.isRequired,
		onError : PropTypes.func.isRequired,
		plugins : PropTypes.arrayOf(PropTypes.func).isRequired
	}

	static defaultProps =
	{
		autoFocus : false,
		trim : true,
		requiredMessage : 'Required',
		onError : (error) => false,
		plugins : [ OnAbandonPlugin ]
	}

	// Stores fields' `validate()` functions which are used
	// when calling `set(field, value)` and `clear(field)`.
	// Also stores fields' `scroll()` and `focus()` functions.
	fields = {}

	constructor(props)
	{
		super(props)

		this.state =
		{
			...generateInitialFormState(this.props.values),
			dispatch : this.dispatch,
			onRegisterField : this.onRegisterField,
			getRequiredMessage : () => this.props.requiredMessage
		}
	}

	componentDidMount()
	{
		const { plugins, autoFocus } = this.props

		this.mounted = true

		// First `form.constructor` is called,
		// then `form.componentWillMount` is called,
		// then `field.constructor` is called,
		// then `field.componentWillMount` is called,
		// then `field.componentDidMount` is called,
		// then `form.componentDidMount` is called.

		this.plugins = plugins.map(Plugin => new Plugin(() => this.props, () => this.state))

		for (const plugin of this.plugins)
		{
			if (plugin.onMount) {
				plugin.onMount()
			}
		}

		// Autofocus the form when it's mounted and all of its fields are initialized.
		if (autoFocus) {
			this.focus()
		}
	}

	componentWillUnmount()
	{
		for (const plugin of this.plugins)
		{
			if (plugin.onUnmount) {
				plugin.onUnmount()
			}
		}

		this.mounted = false
	}

	// `value` is initial field value
	// (which is restored on form reset)
	onRegisterField = (field, validate, scroll, focus) =>
	{
		// The stored field info is used to `validate()` field `value`s
		// and set the corresponding `error`s
		// when calling `set(field, value)` and `clear(field)`.
		// It also holds initial field values for form `reset()`.
		//
		// If a field happens to register the second time
		// (e.g. due to React "reconciliation" due to order change)
		// then no need to update its info.
		// This also prevents loosing the initial value of the field.
		//
		if (!this.fields[field])
		{
			this.fields[field] =
			{
				validate,
				scroll,
				focus
			}
		}

		// This is used for the `autofocus` feature.
		if (!this.firstField) {
			this.firstField = field
		}
	}

	dispatch = (action) =>
	{
		action(this.state)
		this.setState(this.state)
		// const { onStateChange } = this.props
		// if (onStateChange) {
		// 	onStateChange(this.state)
		// }
	}

	// Public API
	values = () => this.state.values

	// Public API
	reset = () =>
	{
		const { autoFocus } = this.props
		const { fields, initialValues } = this.state

		this.setState
		({
			...generateInitialFormState(),
			fields,
			values : { ...initialValues }
		})

		// Autofocus the form (if not configured otherwise)
		if (autoFocus) {
			this.focus()
		}
	}

	// Is called when the form has been submitted.
	onAfterSubmit = () =>
	{
		const { onAfterSubmit } = this.props

		for (const plugin of this.plugins)
		{
			if (plugin.onAfterSubmit) {
				plugin.onAfterSubmit()
			}
		}

		if (onAfterSubmit) {
			onAfterSubmit(this.props)
		}
	}

	searchForInvalidField()
	{
		const { fields, values, errors } = this.state

		// Re-run `validate()` for each field.
		// Because `validate()` function takes two arguments:
		// the current field value and all form field values,
		// and at the same time it's only called in field's `onChange`,
		// therefore other form field values could change since then
		// and that particular `validate()` wouldn't get called
		// without this explicit "revalidate all fields before submit".
		for (const field of Object.keys(fields))
		{
			// If the field is not mounted then ignore it.
			if (!fields[field]) {
				continue
			}

			// Check for an externally set `error`.
			if (errors[field] !== undefined) {
				return field
			}

			// `if (validate(value))` means "if the value is invalid".
			if (this.fields[field].validate(values[field])) {
				return field
			}
		}
	}

	validate()
	{
		const { fields, values } = this.state

		// Are there any invalid fields.
		// Returns the first one.
		const field = this.searchForInvalidField()

		if (!field) {
			return true
		}

		// Re-validate all fields to highlight
		// all required ones which are not filled.
		for (const field of Object.keys(fields))
		{
			// Trigger `validate()` on the field
			// so that `errors` is updated inside form state.
			// (if the field is still mounted)
			if (fields[field])
			{
				this.set(field, values[field])
			}
		}

		// Scroll to the invalid field.
		this.scroll(field)

		// Focus the invalid field.
		this.focus(field)

		// The form is invalid.
		return false
	}

	collectFieldValues()
	{
		const { trim } = this.props
		const { fields, values } = this.state

		// Pass only registered fields to form submit action
		// (because if a field is unregistered that means that
		//  its React element was removed in the process,
		//  and therefore it's not needed anymore)
		return Object.keys(fields).reduce((allValues, field) =>
		{
			let value = values[field]

			if (trim && typeof value === 'string')
			{
				value = value.trim()
				// Convert empty strings to `undefined`.
				if (!value) {
					value = undefined
				}
			}

			allValues[field] = value
			return allValues
		},
		{})
	}

	// Calls `<form/>`'s `onSubmit` action.
	executeFormAction(action, values)
	{
		const { onError } = this.props

		let result

		try {
			result = action(values)
		}
		catch (error)
		{
			if (onError(error) === false) {
				throw error
			}
		}

		// If the form submit action returned a `Promise`
		// then track this `Promise`'s progress.
		if (result && typeof result.then === 'function') {
			this.onSubmitPromise(result)
		} else {
			this.onAfterSubmit()
		}
	}

	// Is called when `<form/>` `onSubmit` returns a `Promise`.
	onSubmitPromise(promise)
	{
		const { onError } = this.props

		this.dispatch(setFormSubmitting(true))

		let throwError
		promise.then(this.onAfterSubmit, (error) =>
		{
			if (onError(error) === false) {
				throwError = error
			}
		})
		.then(() =>
		{
			if (this.mounted) {
				this.dispatch(setFormSubmitting(false))
			}

			if (throwError) {
				throw throwError
			}
		})
	}

	onSubmit = (event) =>
	{
		const { onSubmit, onBeforeSubmit } = this.props

		// If it's an event handler then `.preventDefault()` it
		// (which is the case for the intended
		//  `<form onSubmit={ submit(...) }/>` use case)
		if (event && typeof event.preventDefault === 'function') {
			event.preventDefault()
		}

		// Do nothing if the form is submitting
		// (i.e. submit is in progress)
		if (this.state.submitting) {
			return
		}

		// Can be used, for example, to reset
		// custom error messages.
		// (not <Field/> `error`s)
		// E.g. it could be used to reset
		// overall form errors like "Form submission failed".
		if (onBeforeSubmit) {
			onBeforeSubmit()
		}

		// Submit the form if it's valid.
		// Otherwise highlight invalid fields.
		if (this.validate()) {
			this.executeFormAction(onSubmit, this.collectFieldValues())
		}
	}

	// Focuses on a given form field (is used internally + public API).
	focus = (field) => this.fields[field || this.firstField].focus()

	// Scrolls to a form field (is used internally + public API).
	scroll = (field) => this.fields[field || this.firstField].scroll()

	// Clears field value (public API).
	// If this field hasn't been "registered" yet then ignore.
	clear = (field) => this.set(field, undefined)

	// Gets field value (public API).
	get = (field) => this.state.values[field]

	// Sets field value (public API).
	set = (field, value) =>
	{
		this.dispatch(setFieldValue(field, value))
		this.dispatch(setFieldError(field, this.fields[field].validate(value)))
	}

	render()
	{
		const { children } = this.props

		return (
			<form {...getPassThroughProps(this.props, Form.propTypes)} onSubmit={this.onSubmit}>
				<Context.Provider value={this.state}>
					{children}
				</Context.Provider>
			</form>
		)
	}
}

function generateInitialFormState(initialValues = {})
{
	return {
		// `mounted`/`unmounted` counters for each form field.
		fields : {},

		// Current form field values.
		values : {},

		// Initial form field values.
		initialValues,

		// `validate()` results for current form field values.
		errors : {},

		// Whether should show field errors.
		showErrors : {},

		// Is used for tracking abandoned forms for Google Analytics.
		latestFocusedField : undefined,

		// If `onSubmit` returns a `Promise` (or is `async/await`)
		// then `submitting` will be `true` until `onSubmit` finishes.
		submitting : false
	}
}