import React, { Component } from 'react'
import PropTypes from 'prop-types'

import getInitialState from './getInitialState.js'

import OnAbandonPlugin from './plugins/OnAbandonPlugin.js'
import ListPlugin from './plugins/ListPlugin.js'
import { getPassThroughProps, getValues, getValue, getNext, NOT_FOUND } from './utility.js'

import {
	setFormSubmitAttempted,
	setFormSubmitting,
	setFieldValue,
	setFieldError,
	registerField,
	unregisterField,
	removeField
} from './actions.js'

export const Context = React.createContext()

const EMPTY_VALUE = null

export default class Form extends Component {
	static propTypes = {
		onSubmit: PropTypes.func.isRequired,
		onBeforeSubmit: PropTypes.func,
		onAfterSubmit: PropTypes.func,
		onStateDidChange: PropTypes.func,
		onAbandon: PropTypes.func,
		initialState: PropTypes.object,
		values: PropTypes.object,
		autoFocus: PropTypes.bool.isRequired,
		trim: PropTypes.bool.isRequired,
		requiredMessage: PropTypes.string.isRequired,
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

	watchedFields = {}
	watchedFieldsList = []

	// The `unmounting` flag is checked in `<Field/>`s so that
	// they don't unregister themseles on form unmount: there'd be
	// no point in unregistering those fields if the form is going to be
	// unmounted anyway.
	unmounting = false

	constructor(props) {
		super(props)

		const { plugins } = this.props
		this.plugins = plugins.map((Plugin) => new Plugin(
			() => this.props,
			() => this.getState()
		))

		this.state = this.getInitialContext()
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
		this.cleanUpRemovedFields()

		for (const plugin of this.plugins) {
			if (plugin.onUpdate) {
				plugin.onUpdate({
					getState: this.getState,
					dispatch: this.dispatch
				})
			}
		}
	}

	componentWillUnmount() {
		for (const plugin of this.plugins) {
			if (plugin.onUnmount) {
				plugin.onUnmount()
			}
		}

		this.unmounting = true

		this.mounted = false
	}

	getInitialState() {
		let initialState = this._getInitialState()
		for (const plugin of this.plugins) {
			if (plugin.getInitialState) {
				initialState = plugin.getInitialState(initialState)
			}
		}
		return initialState
	}

	_getInitialState() {
		const { values } = this.props
		return getInitialState(
			this.state ? this.getState().initialValues : values
		)
	}

	getInitialContext() {
		const initialContext = this._getInitialContext()

		// Add `context` functions by plugins.
		for (const plugin of this.plugins) {
			if (plugin.getContextFunctions) {
				const contextFunctions = plugin.getContextFunctions()
				for (const name of Object.keys(contextFunctions)) {
					initialContext[name] = contextFunctions[name]({
						updateState: initialContext.updateState
					})
				}
			}
		}

		return initialContext
	}

	_getInitialContext() {
		const { requiredMessage, initialState } = this.props
		return {
			state: initialState || this.getInitialState(),
			// initialState,
			isUnmounting: () => this.unmounting,
			resetCounter: 0,
			dispatch: this.dispatch,
			updateState: this.updateState,
			onRegisterField: this.onRegisterField,
			onUnregisterField: this.onUnregisterField,
			transformValueForSubmit: this.transformValueForSubmit,
			getRequiredMessage: () => requiredMessage,
			// These're used by `<List/>`.
			focus: this.focus,
			getValues: this.values,
			watch: this.watch
		}
	}

	applyStateChanges(newState, callback, { resetForm } = {}) {
		// Currently, `prevState` is always equal to `newState`
		// because state changes mutate the state object itself.
		const prevContext = this.getContext()
		const prevState = prevContext.state

		// Run any field value watchers:
		//
		// See if any fields are watched.
		// If they are, see if their values have changed.
		// If they have, re-render the form after updating state.
		//
		// This piece of code currently doesn't do anything
		// because `prevState` is always equal to `newState`.
		// Maybe it could be used in some future if new state objects would be created
		// instead of mutating the existing state object.
		//
		let shouldReRenderForm = false
		for (const field of this.watchedFieldsList) {
			if (newState.values[field] !== prevState.values[field]) {
				// Re-render the form after updating state.
				shouldReRenderForm = true
				break
			}
		}

		// Update state.
		//
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
		// on just the exact `<Field/>` that called `context.dispatch(action)`.
		//
		// `this.setState()` is called on `this.state` rather than creating
		// a new `state`, because `this.state` is used as the `context` property
		// for `React.Context`, so if `state` reference changes, the whole form
		// gets re-rendered, and that's not something that should be done
		// unless any "field value watchers" have been triggered due to a changed field value.
		//
		const newContext = shouldReRenderForm ? { ...prevContext } : prevContext
		newContext.state = newState
		if (resetForm) {
			// Changing the `resetCounter` property results in a complete re-mounting
			// of the `<form/>`, including all of the `<Field/>`s.
			newContext.resetCounter = getNext(newContext.resetCounter)
		}
		this.setState(newContext, () => {
			// Call `onStateDidChange()` listener.
			const { onStateDidChange } = this.props
			if (onStateDidChange) {
				onStateDidChange(this.getState())
			}
			if (callback) {
				callback()
			}
		})
	}

	// `value` parameter is an initial field value.
	// It is used later in case of a form or field reset.
	onRegisterField = (field, {
		// `value` and `defaultValue` are basically the same thing.
		// The only subtle difference between them is that:
		// * `<Field value/>` overrides `<Form values/>`
		// * `<Field defaultValue/>` gets overridden by `<Form values/>`
		value,
		defaultValue,
		onChange,
		validate,
		scroll,
		focus
	}) => {
		if (value === undefined) {
			value = this.getInitialValue(field)
			if (value === undefined) {
				value = defaultValue
			}
		}

		// React doesn't know how to properly handle `value === undefined`.
		// https://stackoverflow.com/a/74229877/970769
		if (value === undefined) {
			value = EMPTY_VALUE
		}

		// The stored field info is used to `validate()` field `value`s
		// and set the corresponding `error`s
		// when calling `set(field, value)` and `clear(field)`.
		//
		// If a field happens to register the second time
		// (e.g. as a result of React "reconciliation" because of the order change)
		// then the methods for the field will be updated.
		//
		this.fields[field] = {
			initialValue: value,
			validate,
			scroll,
			focus,
			onChange
		}
		// This is used for the `autofocus` feature.
		if (!this.firstField) {
			this.firstField = field
		}
		this.dispatch(registerField({
			field,
			value,
			validate
		}))
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
		// const newState = action(this.getState())
		// this.applyStateChanges(newState, callback)

		// See the comments in `actions.js` for the rationale
		// on why the original `state` gets mutated instead of
		// creating a new `state` object.
		action(this.getState())
		this.applyStateChanges(this.getState(), callback)
	}

	// This function is called by plugins.
	// They access it from the `context`.
	updateState = (stateUpdater) => {
		// const newState = stateUpdater(this.state)
		// this.applyStateChanges(newState)

		// See the comments in `actions.js` for the rationale
		// on why the original `state` gets mutated instead of
		// creating a new `state` object.
		stateUpdater(this.getState())
		this.applyStateChanges(this.getState())
	}

	transformValueForSubmit = (value) => {
		const { trim } = this.props
		if (trim && typeof value === 'string') {
			value = value.trim()
		}
		// Convert empty strings to `null`.
		//
		// Using `undefined` instead of `null` wouldn't work because the browser
		// wouldn't send such fields to the server because `JSON.stringify()` skips
		// `undefined` properties when converting a JSON object to a string.
		//
		// Sending a `null` field value rather than omitting it entirely from an HTTP request
		// is used in order to be able to "clear" the form field value on the server side.
		//
		if (value === '') {
			value = null
		}
		return value
	}

	getInitialValue = (name) => {
		const { initialValues } = this.getState()
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
	/**
	 * Returns form field values.
	 * @return {object}
	 */
	values = () => {
		const { values, fields } = this.getState()
		return this.applyPluginValueTransforms(getValues(values, fields))
	}

	/**
	 * Applies plugins' transformations to form field values.
	 * @param  {object} values
	 * @return {object}
	 */
	applyPluginValueTransforms(values) {
		for (const plugin of this.plugins) {
			if (plugin.getValues) {
				values = plugin.getValues(values)
			}
		}
		return values
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

		const { plugins } = this.props

		for (const plugin of this.plugins) {
			if (plugin.onReset) {
				plugin.onReset()
			}
		}

		// `this.setState()` is called on `this.state`
		// rather than creating a new `state` because `this.state`
		// is used as the `context` property for `React.Context`
		// meaning that `state` reference shouldn't change.

		// All `<Field/>`s will be re-mounted and re-registered.
		const newState = this.getInitialState()

		// `this.getInitialState()` produces a state with zero `fields` counters.
		// But, subsequently, the change to `resetCounter` results in  a complete
		// re-mounting of the `<form/>`, including all of the `<Field/>`s, which
		// decrements all `fields` counters.
		// If the current `fields` counters weren't preserved, then the counters
		// would first be decremented to `-1` on unmount, and then incremented to `0`
		// on re-mount, and the form would think that no fields are mounted.
		// Preserving the current non-zero `fields` counters fixes that.
		newState.fields = this.getState().fields

		// Reset the first focusable field since the form is gonna be reset.
		this.firstField = undefined

		this.applyStateChanges(newState, () => {
			if (!this.mounted) {
				return
			}
			// Autofocus the form (if not configured otherwise)
			const { autoFocus } = this.props
			if (autoFocus) {
				// If `reset()` was called inside `onSubmit()`, then
				// don't focus on a field here because it might be `disabled`.
				// Instead, schedule the autofocus for later, when the fields
				// are no longer disabled.
				if (this.getState().submitting) {
					this.focusableBeforeSubmit = this.getFocusable()
				} else {
					this.focus()
				}
			}
			// Trigger each `<Field/>`'s `onChange()` handler.
			for (const field of Object.keys(this.getState().fields)) {
				// If the field is still mounted.
				if (this.fields[field]) {
					const { onChange, initialValue } = this.fields[field]
					if (onChange) {
						onChange(initialValue)
					}
				}
			}
		}, {
			resetForm: true
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
		// If the field is still registered (mounted), then validate the value.
		// Otherwise, assume the value is valid because there's no validation function available.
		const error = this.fields[name] ? this.fields[name].validate(initialValue) : undefined
		this.dispatch(setFieldValue(name, initialValue))
		this.dispatch(setFieldError(name, error))
		// Trigger the `<Field/>`'s `onChange()` handler.
		// If the field is still mounted.
		if (this.fields[name]) {
			const { onChange, onError, initialValue } = this.fields[name]
			if (onChange) {
				onChange(initialValue)
			}
			if (onError) {
				onError(error)
			}
		}
	}

	removeField = (field) => {
		this.dispatch(removeField(field))
		delete this.fields[field]
	}

	cleanUpRemovedFields = () => {
		const { fields } = this.getState()
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
		const {
			fields,
			values
		} = this.getState()

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
			// If the field's `value` is not valid,
			// `validate(value)` returns a validation error message (or `true`).
			if (this.fields[field].validate(values[field])) {
				return field
			}
		}
	}

	validate() {
		const { scrollDuration } = this.props
		const { fields, values } = this.getState()

		// Are there any invalid fields.
		// Returns the first one.
		const field = this.searchForInvalidField()

		if (!field) {
			return true
		}

		// Re-validate all fields to highlight all required ones that're empty.
		// Otherwise, it'd just stop at the first not-valid field
		// and the user would just see that single field highlighted
		// as "Required", and then they'd have to re-submit the form
		// just to find out that some other field is "Required" too,
		// so it's better "user experience" to just highlight all
		// required fields right away.
		for (const field of Object.keys(fields)) {
			// Trigger `validate()` on the field
			// so that `errors` is updated inside form state.
			// (if the field is still mounted)
			if (fields[field]) {
				this._set(field, values[field], { changed: false })
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
	 * Collects the currently "registered" fields' values.
	 * @return {object} `values`
	 */
	getValuesForSubmit() {
		const { fields, values } = this.getState()
		// Get only "registered" (non-removed) field values.
		const fieldValues = getValues(values, fields)
		for (const key of Object.keys(fieldValues)) {
			// Trim strings (if `trim` option is set to `true`, which is the default setting).
			// Convert empty strings to `null`s.
			fieldValues[key] = this.transformValueForSubmit(fieldValues[key])
		}
		// Apply plugins' value transformations.
		return this.applyPluginValueTransforms(fieldValues)
	}

	// Calls `<form/>`'s `onSubmit` action.
	executeFormAction(action, values) {
		const { onError } = this.props
		let result
		try {
			result = action(values)
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
			this.setFormSubmitting(false)
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
				this.setFormSubmitting(false, resolve, forceRestoreFocus)
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
		const { submitAttempted } = this.getState()

		this.dispatch(setFormSubmitAttempted(true))

		// If it's an event handler then `.preventDefault()` it
		// (which is the case for the intended
		//  `<form onSubmit={ submit(...) }/>` use case)
		if (event && typeof event.preventDefault === 'function') {
			event.preventDefault()
		}

		// Do nothing if the form is submitting
		// (i.e. submit is in progress)
		if (this.getState().submitting) {
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
			this.executeFormAction(onSubmit, this.getValuesForSubmit())
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
	clear = (field) => this.set(field, EMPTY_VALUE)

	// Gets field value (public API).
	get = (field) => this.getState().values[field]

	// Sets field value (public API).
	set = (field, value) => this._set(field, value, {})

	// Sets field value.
	_set = (field, value, { changed }) => {
		this.dispatch(setFieldValue(field, value))
		// If the field is still mounted.
		if (this.fields[field]) {
			// Validate field value.
			const error = this.fields[field].validate(value)
			this.dispatch(setFieldError(field, error))
			// Trigger the `<Field/>`'s `onChange()` handler.
			if (changed !== false) {
				const { onChange, onError } = this.fields[field]
				if (onChange) {
					onChange(value)
				}
				if (onError) {
					onError(error)
				}
			}
		}
	}

	watch = (field) => {
		if (!this.watchedFields[field]) {
			this.watchedFields[field] = true
			this.watchedFieldsList.push(field)
		}
		return this.get(field)
	}

	getContext() {
		return this.state
	}

	getState = () => {
		return this.state.state
	}

	setFormNode = (node) => this.form = node
	getSubmitButtonNode = () => this.form.querySelector('button[type="submit"]')

	render() {
		const { children } = this.props
		const { resetCounter } = this.getContext
		const { submitting } = this.getState()
		return (
			<form
				key={resetCounter}
				ref={this.setFormNode}
				{...getPassThroughProps(this.props, Form.propTypes)}
				onSubmit={this.onSubmit}>
				<Context.Provider value={this.getContext()}>
					{typeof children === 'function' ?
						<Children
							values={this.mounted ? this.values() : undefined}
							reset={this.reset}
							set={this.set}
							clear={this.clear}
							scroll={this.scroll}
							focus={this.focus}
							watch={this.watch}
							submitting={submitting}>
							{children}
						</Children> :
						children
					}
				</Context.Provider>
			</form>
		)
	}
}

// Added a functional `Children` component to work around a React warning:
// "Invalid hook call. Hooks can only be called inside of the body of a function component".
function Children({
	values,
	reset,
	set,
	clear,
	scroll,
	focus,
	watch,
	submitting,
	children
}) {
	return children({
		values,
		reset,
		set,
		clear,
		scroll,
		focus,
		watch,
		submitting
	})
}

Children.propTypes = {
	values: PropTypes.object,
	reset: PropTypes.func.isRequired,
	set: PropTypes.func.isRequired,
	clear: PropTypes.func.isRequired,
	scroll: PropTypes.func.isRequired,
	focus: PropTypes.func.isRequired,
	watch: PropTypes.func.isRequired,
	submitting: PropTypes.bool.isRequired,
	children: PropTypes.func.isRequired
}

export const contextPropType = PropTypes.shape({
	state: PropTypes.shape({
		// An object containing field "counters" (integers).
		// When a field is no longer rendered in a form, its counter becomes `0`.
		// Until a field is mounted for the first time, its counter value is `undefined`.
		fields: PropTypes.object.isRequired,
		// An object containing field values.
		values: PropTypes.object.isRequired,
		// An object containing field initial values.
		initialValues: PropTypes.object.isRequired,
		// An object containing field error messages.
		errors: PropTypes.object.isRequired,
		// The `name` of the latest focused field.
		latestFocusedField: PropTypes.string,
		submitting: PropTypes.bool.isRequired,
		submitAttempted: PropTypes.bool.isRequired
	}).isRequired,
	updateState: PropTypes.func.isRequired,
	isUnmounting: PropTypes.func.isRequired,
	onRegisterField: PropTypes.func.isRequired,
	onUnregisterField: PropTypes.func.isRequired,
	transformValueForSubmit: PropTypes.func.isRequired,
	focus: PropTypes.func.isRequired,
	watch: PropTypes.func.isRequired,
	dispatch: PropTypes.func.isRequired,
	getRequiredMessage: PropTypes.func.isRequired,
	getValues: PropTypes.func.isRequired,

	// These get added by `ListPlugin`.
	onRegisterList: PropTypes.func.isRequired,
	onListStateChange: PropTypes.func.isRequired
})