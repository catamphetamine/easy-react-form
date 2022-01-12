import React, { Component } from 'react'
import PropTypes from 'prop-types'
import createContext from 'create-react-context'

import OnAbandonPlugin from './plugins/OnAbandonPlugin'
import ListPlugin from './plugins/ListPlugin'
import { getPassThroughProps, getValues, getValue, getNext, NOT_FOUND } from './utility'

import {
	setFormSubmitting,
	setFieldValue,
	setFieldError,
	registerField,
	unregisterField,
	removeField
} from './actions'

export const Context = createContext()

export default class Form extends Component {
	static propTypes = {
		onSubmit: PropTypes.func.isRequired,
		onBeforeSubmit: PropTypes.func,
		onAfterSubmit: PropTypes.func,
		onAbandon: PropTypes.func,
		values: PropTypes.object,
		autoFocus: PropTypes.bool.isRequired,
		trim: PropTypes.bool.isRequired,
		requiredMessage: PropTypes.string.isRequired,
		wait: PropTypes.bool.isRequired,
		onError: PropTypes.func.isRequired,
		scrollDuration: PropTypes.number.isRequired,
		plugins: PropTypes.arrayOf(PropTypes.func).isRequired,
		children: PropTypes.oneOfType([
			PropTypes.func,
			PropTypes.node
		]).isRequired
	}

	static defaultProps = {
		autoFocus: false,
		trim: true,
		requiredMessage: 'Required',
		wait: false,
		onError: (error) => false,
		scrollDuration: 300,
		plugins: [
			OnAbandonPlugin,
			ListPlugin
		]
	}

	// Stores fields' `validate()` functions which are used
	// when calling `set(field, value)` and `clear(field)`.
	// Also stores fields' `scroll()` and `focus()` functions.
	fields = {}

	constructor(props) {
		super(props)
		const { values, requiredMessage, plugins, wait } = this.props
		this.state = {
			resetCounter: 0,
			...generateInitialFormState(values, { submitting: wait }),
			dispatch: this.dispatch,
			onRegisterField: this.onRegisterField,
			onUnregisterField: this.onUnregisterField,
			getRequiredMessage: () => requiredMessage,
			// These're used by `<List/>`.
			focus: this.focus,
			getValues: this.values,
			getInitialValue: this.getInitialValue
		}
		this.plugins = plugins.map(Plugin => new Plugin(() => this.props, () => this.state))
		for (const plugin of this.plugins) {
			if (plugin.initContext) {
				plugin.initContext(this.state)
			}
		}
	}

	componentDidMount() {
		const { autoFocus } = this.props

		this.mounted = true

		// First `form.constructor` is called,
		// then `form.componentWillMount` is called,
		// then `field.constructor` is called,
		// then `field.componentWillMount` is called,
		// then `field.componentDidMount` is called,
		// then `form.componentDidMount` is called.

		for (const plugin of this.plugins) {
			if (plugin.onMount) {
				plugin.onMount()
			}
		}

		// Autofocus the form when it's mounted and all of its fields are initialized.
		if (autoFocus) {
			this.focus()
		}
	}

	componentDidUpdate(prevProps) {
		const { wait } = this.props
		if (wait !== prevProps.wait) {
			this.setFormSubmitting(wait)
		}
		this.cleanUpRemovedFields()
	}

	componentWillUnmount() {
		for (const plugin of this.plugins) {
			if (plugin.onUnmount) {
				plugin.onUnmount()
			}
		}
		this.mounted = false
	}

	// `value` is initial field value
	// (which is restored on form reset)
	onRegisterField = (field, { initialValue, onChange, validate, scroll, focus }) => {
		// The stored field info is used to `validate()` field `value`s
		// and set the corresponding `error`s
		// when calling `set(field, value)` and `clear(field)`.
		//
		// If a field happens to register the second time
		// (e.g. as a result of React "reconciliation" because of the order change)
		// then the methods for the field will be updated.
		//
		this.fields[field] = {
			initialValue,
			validate,
			scroll,
			focus,
			onChange
		}
		// This is used for the `autofocus` feature.
		if (!this.firstField) {
			this.firstField = field
		}
		this.dispatch(registerField(
			field,
			initialValue,
			validate
		))
	}

	onUnregisterField = (field) => {
		this.dispatch(unregisterField(field))
		// Rerender the form so that the field is
		// removed if it's no longer mounted.
		this.forceUpdate()
	}

	/**
	 * `callback` is currently only used when calling
	 * `context.dispatch(setFormSubmitting(false))`.
	 * @param  {function}   action — A function of `state`.
	 * @param  {function} callback
	 */
	dispatch = (action, callback) => {
		action(this.state)

		// A `React.Component` always re-renders on `this.setState()`,
		// even if the `state` hasn't changed.
		// The re-rendering of the `<Form/>` is used to re-render
		// the `<Field/`>s with the updated `value`s.
		// This could potentially result in slower performance
		// on `<Form/>`s with a lots of `<Field/>`s
		// (maybe hundreds or something like that?)
		// but on regular `<Form/>`s I didn't notice any lag.
		// A possible performance optimization could be
		// not calling `this.setState()` for `<Form/>` re-rendering
		// and instead calling something like `this.forceUpdate()`
		// on the `<Field/>` that called `context.dispatch()`.
		//
		// `this.setState()` is called on `this.state`
		// rather than creating a new `state` because `this.state`
		// is used as the `context` property for `React.Context`
		// meaning that `state` reference shouldn't change.
		//
		this.setState(this.state, callback)

		// const { onStateChange } = this.props
		// if (onStateChange) {
		// 	onStateChange(this.state)
		// }
	}

	getInitialValue = (name) => {
		const { initialValues } = this.state
		for (const plugin of this.plugins) {
			if (plugin.getValue) {
				const value = plugin.getValue(initialValues, name)
				if (value !== NOT_FOUND) {
					return value
				}
			}
		}
		return getValue(initialValues, name)
	}

	// Public API
	values = (customValues) => {
		const { values, fields } = this.state
		let _values = getValues(customValues || values, fields)
		for (const plugin of this.plugins) {
			if (plugin.getValues) {
				_values = plugin.getValues(_values)
			}
		}
		return _values
	}

	// Public API
	reset = (field) => {
		// `<Form/>` `.reset()` instance method no longer accepts `fieldName: string` argument.
		// It still works the old way, but the `fieldName: string` arugment is considered deprecated.
		// It worked in a weird way: reset the field to its initial value rather than `undefined`.
		// To reset a field, use `.clear(fieldName)` instance method instead.
		if (typeof field === 'string') {
			return this.resetField(field)
		}

		const { autoFocus, plugins, wait } = this.props
		const { fields, initialValues, resetCounter } = this.state

		for (const plugin of this.plugins) {
			if (plugin.onReset) {
				plugin.onReset()
			}
		}

		// `this.setState()` is called on `this.state`
		// rather than creating a new `state` because `this.state`
		// is used as the `context` property for `React.Context`
		// meaning that `state` reference shouldn't change.

		// Changing `resetCounter` results in a complete re-mounting of the `<form/>`,
		// including all of the `<Field/>`s.
		this.state.resetCounter = getNext(resetCounter)

		// All `<Field/>`s will be re-mounted and re-registered.
		const initialFormState = generateInitialFormState(initialValues, { submitting: wait })
		for (const key of Object.keys(initialFormState)) {
			this.state[key] = initialFormState[key]
		}

		// `generateInitialFormState()` produces a state with zero `fields` counters.
		// But, subsequently, the change to `resetCounter` results in  a complete
		// re-mounting of the `<form/>`, including all of the `<Field/>`s, which
		// decrements all `fields` counters.
		// If the current `fields` counters weren't preserved, then the counters
		// would first be decremented to `-1` on unmount, and then incremented to `0`
		// on re-mount, and the form would think that no fields are mounted.
		// Preserving the current non-zero `fields` counters fixes that.
		this.state.fields = fields

		// Reset first focusable field since the form is gonna be reset.
		this.firstField = undefined

		this.setState(this.state, () => {
			if (!this.mounted) {
				return
			}
			// Autofocus the form (if not configured otherwise)
			if (autoFocus) {
				// If `reset()` was called inside `onSubmit()`, then
				// don't focus on a field here because it might be `disabled`.
				// Instead, schedule the autofocus for later, when the fields
				// are no longer disabled.
				if (this.state.submitting) {
					this.focusableBeforeSubmit = this.getFocusable()
				} else {
					this.focus()
				}
			}
			// Trigger each `<Field/>`'s `onChange()` handler.
			for (const field of Object.keys(fields)) {
				// If the field is still mounted.
				if (this.fields[field]) {
					const { onChange, initialValue } = this.fields[field]
					if (onChange) {
						onChange(initialValue)
					}
				}
			}
		})
	}

	// Not tested.
	resetField = (name) => {
		for (const plugin of this.plugins) {
			if (plugin.onResetField) {
				if (plugin.onResetField(name, this)) {
					return
				}
			}
		}
		const initialValue = !this.fields[name] || this.fields[name].initialValue === undefined ? this.getInitialValue(name) : this.fields[name].initialValue
		this.dispatch(setFieldValue(name, initialValue))
		// A default value isn't supposed to generate an error.
		this.dispatch(setFieldError(name, undefined))
		// Trigger the `<Field/>`'s `onChange()` handler.
		// If the field is still mounted.
		if (this.fields[name]) {
			const { onChange, initialValue } = this.fields[name]
			if (onChange) {
				onChange(initialValue)
			}
		}
	}

	removeField = (field) => {
		this.dispatch(removeField(field))
		delete this.fields[field]
	}

	cleanUpRemovedFields = () => {
		const { fields } = this.state
		for (const field of Object.keys(fields)) {
			// Remove unmounted `<Field/>`s.
			if (fields[field] === 0) {
				this.removeField(field)
			}
		}
	}

	// Is called when the form has been submitted.
	onAfterSubmit = () => {
		const { onAfterSubmit } = this.props
		for (const plugin of this.plugins) {
			if (plugin.onAfterSubmit) {
				plugin.onAfterSubmit()
			}
		}
		if (onAfterSubmit) {
			onAfterSubmit()
		}
	}

	searchForInvalidField() {
		const { fields, values, errors } = this.state

		// Re-run `validate()` for each field.
		// Because `validate()` function takes two arguments:
		// the current field value and all form field values,
		// and at the same time it's only called in field's `onChange`,
		// therefore other form field values could change since then
		// and that particular `validate()` wouldn't get called
		// without this explicit "revalidate all fields before submit".
		for (const field of Object.keys(fields)) {
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

	validate() {
		const { scrollDuration } = this.props
		const { fields, values } = this.state

		// Are there any invalid fields.
		// Returns the first one.
		const field = this.searchForInvalidField()

		if (!field) {
			return true
		}

		// Re-validate all fields to highlight
		// all required ones which are not filled.
		for (const field of Object.keys(fields)) {
			// Trigger `validate()` on the field
			// so that `errors` is updated inside form state.
			// (if the field is still mounted)
			if (fields[field]) {
				this.set(field, values[field])
			}
		}

		// Scroll to the invalid field.
		this.scroll(field, { duration: scrollDuration })

		// Focus the invalid field after it has been scrolled to.
		setTimeout(() => {
			if (this.mounted) {
				// Focus the invalid field.
				this.focus(field)
			}
		}, scrollDuration)

		// The form is invalid.
		return false
	}

	/**
	 * Trims strings. Converts empty strings to `undefined`.
	 * @return {object} `values`
	 */
	collectFieldValues() {
		const { trim } = this.props
		const { fields, values } = this.state
		// Pass only registered fields to form submit action
		// (because if a field is unregistered that means that
		//  its React element was removed in the process,
		//  and therefore it's not needed anymore)
		return Object.keys(fields).reduce((allValues, field) => {
			let value = values[field]
			if (trim && typeof value === 'string') {
				value = value.trim()
				// Convert empty strings to `null`.
				// Using `undefined` instead of `null` wouldn't work because the browser
				// wouldn't send such fields to the server because `JSON.stringify()` skips
				// `undefined` properties when converting a JSON object to a string.
				if (!value) {
					value = null
				}
			}
			allValues[field] = value
			return allValues
		}, {})
	}

	// Calls `<form/>`'s `onSubmit` action.
	executeFormAction(action, values) {
		const { onError } = this.props
		let result
		try {
			result = action(this.values(values))
		} catch (error) {
			if (onError(error) === false) {
				throw error
			}
		}
		// If the form submit action returned a `Promise`
		// then track this `Promise`'s progress.
		if (result && typeof result.then === 'function') {
			this.onSubmitPromise(result).then(this.onAfterSubmit)
		} else {
			this.onAfterSubmit()
		}
	}

	snapshotFocus() {
		// On Mac, elements that aren't text input elements
		// tend not to get focus assigned to them.
		// Therefore, if the submit button was clicked to submit the form
		// then `document.activeElement` will still be `<body/>`.
		this.focusableBeforeSubmit = document.activeElement
		if (!document.activeElement || document.activeElement === document.body) {
			this.focusableBeforeSubmit = this.getSubmitButtonNode()
		}
	}

	restoreFocus(force) {
		if (force ||
			!document.activeElement ||
			document.activeElement === document.body) {
			// The `<input/>` field might have been remounted right after form submit,
			// for example, if the developer calls `form.reset()` in `onSubmit()`.
			if (this.focusableBeforeSubmit instanceof Element &&
				!document.body.contains(this.focusableBeforeSubmit)) {
				this.focusableBeforeSubmit = undefined
			}
			if (this.focusableBeforeSubmit) {
				this.focusableBeforeSubmit.focus()
				this.focusableBeforeSubmit = undefined
			}
		}
	}

	setFormSubmitting(submitting, callback, forceRestoreFocus) {
		this.dispatch(setFormSubmitting(submitting), () => {
			if (!submitting) {
				this.restoreFocus(forceRestoreFocus)
			}
			if (callback) {
				callback()
			}
		})
	}

	resetFormSubmittingState(forceRestoreFocus) {
		return new Promise((resolve) => {
			if (this.mounted) {
				const { wait } = this.props
				this.setFormSubmitting(wait, resolve, forceRestoreFocus)
			} else {
				resolve()
			}
		})
	}

	// Is called when `<form/>` `onSubmit` returns a `Promise`.
	onSubmitPromise(promise) {
		// When `submitting` flag is set to `true`
		// all fields and the submit button will become disabled.
		// This results in focus being lost.
		// To preserve focus, the currently focused DOM node is noted
		// and after the form is submitted the focus is restored.
		// The focus must be restored after the form re-renders
		// with `submitting: false`, hence the `.setState()` `Promise`.
		this.snapshotFocus()
		this.setFormSubmitting(true)
		return promise.then(
			() => this.resetFormSubmittingState(),
			(error) => this.resetFormSubmittingState(true).then(() => {
				const { onError } = this.props
				if (onError(error) === false) {
					throw error
				}
			})
		)
	}

	onSubmit = (event) => {
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
	focus = (field) => {
		if (field) {
			return this.fields[field].focus()
		}
		this.getFocusable().focus()
	}

	/**
	 * Returns a "focusable".
	 * @return {(object|Element)} Returns either a `field` object having `.focus()` method or the submit button `Element`.
	 */
	getFocusable() {
		if (this.firstField) {
			return this.fields[this.firstField]
		}
		return this.getSubmitButtonNode()
	}

	// Scrolls to a form field (is used internally + public API).
	scroll = (field, options) => this.fields[field].scroll(options)

	// Clears field value (public API).
	// If this field hasn't been "registered" yet then ignore.
	clear = (field) => this.set(field, undefined)

	// Gets field value (public API).
	get = (field) => this.state.values[field]

	// Sets field value (public API).
	set = (field, value) => {
		this.dispatch(setFieldValue(field, value))
		// If the field is still mounted.
		if (this.fields[field]) {
			// Validate field value.
			this.dispatch(setFieldError(field, this.fields[field].validate(value)))
			// Trigger the `<Field/>`'s `onChange()` handler.
			const { onChange, initialValue } = this.fields[field]
			if (onChange) {
				onChange(value)
			}
		}
	}

	setFormNode = (node) => this.form = node
	getSubmitButtonNode = () => this.form.querySelector('button[type="submit"]')

	render() {
		const { children } = this.props
		const { resetCounter, submitting } = this.state
		return (
			<form
				key={resetCounter}
				ref={this.setFormNode}
				{...getPassThroughProps(this.props, Form.propTypes)}
				onSubmit={this.onSubmit}>
				<Context.Provider value={this.state}>
					{typeof children === 'function' ?
						<Children values={this.values()} submitting={submitting}>
							{children}
						</Children> :
						children
					}
				</Context.Provider>
			</form>
		)
	}
}

class Children extends React.Component {
	componentDidMount() {
		this._isMounted = true
	}
	render() {
		const { values, submitting, children } = this.props
		return children({
			values: this._isMounted ? values : undefined,
			submitting
		})
	}
}

Children.propTypes = {
	values: PropTypes.object.isRequired,
	submitting: PropTypes.bool,
	children: PropTypes.func.isRequired
}

function generateInitialFormState(initialValues = {}, { submitting = false } = {}) {
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
		submitting
	}
}

export const contextPropType = PropTypes.shape({
	fields: PropTypes.object.isRequired,
	values: PropTypes.object.isRequired,
	initialValues: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired,
	showErrors: PropTypes.object.isRequired,
	submitting: PropTypes.bool.isRequired,
	onRegisterField: PropTypes.func.isRequired,
	onUnregisterField: PropTypes.func.isRequired,
	onRegisterList: PropTypes.func.isRequired,
	focus: PropTypes.func.isRequired,
	dispatch: PropTypes.func.isRequired,
	getRequiredMessage: PropTypes.func.isRequired,
	getValues: PropTypes.func.isRequired,
	getInitialValue: PropTypes.func.isRequired
})