import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import scrollIntoView from 'scroll-into-view-if-needed'
import createRef from 'react-create-ref'

import { Context } from './form'
import { getPassThroughProps } from './utility'

import
{
	registerField,
	unregisterField,
	setFieldValue,
	setFieldError,
	fieldFocused
}
from './actions'

export default function Field(props)
{
	return (
		<Context.Consumer>
			{context => <FormField {...props} context={context}/>}
		</Context.Consumer>
	)
}

class FormField extends Component
{
	static propTypes =
	{
		name      : PropTypes.string.isRequired,
		component : PropTypes.oneOfType([ PropTypes.func, PropTypes.string ]).isRequired,
		required  : PropTypes.oneOfType([ PropTypes.bool, PropTypes.string ]),

		value    : PropTypes.any,
		error    : PropTypes.string,
		validate : PropTypes.func,

		context : PropTypes.object.isRequired
	}

	field = createRef()

	componentDidMount()
	{
		const { context, name, value, error } = this.props

		this.mounted = true

		// "Register" the field and initialize it with the default value.
		//
		// React will reuse and reshuffle existing `<Fields/>`
		// when hiding/showing new fields, so a field might get
		// "registered"/"unregistered" several times in those cases.
		//
		context.onRegisterField(name, this.validate, this.scroll, this.focus)
		context.dispatch(registerField(name, value, this.validate, error))
	}

	componentWillUnmount()
	{
		const { context, name } = this.props

		// "Unregister" field.
		context.dispatch(unregisterField(name))

		this.mounted = false
	}

	componentDidUpdate(prevProps)
	{
		const { context, name, value, error } = this.props

		// If React reused one `<Field/>` element for another form field
		// then handle this type of situation correctly.
		if (name !== prevProps.name)
		{
			// Unregister old field.
			context.dispatch(unregisterField(prevProps.name))

			// Register new field.
			context.onRegisterField(name, this.validate, this.scroll, this.focus)
			context.dispatch(registerField(name, value, this.validate, error))
		}
		// Else, if it's still the same field.
		else
		{
			// If the default value changed for this `<Field/>`
			// and the field hasn't been edited yet
			// then apply this new default value.
			if (value !== prevProps.value && !this.hasBeenEdited)
			{
				context.dispatch(setFieldValue(name, value))
			}

			// If an externally set `error` property is updated,
			// then update invalid indication for this field accordingly.
			// If the same error happened once again,
			// then it should have been reset
			// before sending form data to the server,
			// and in that case it will be shown once again.
			if (prevProps.error !== error) {
				this.showOrHideExternallySetError(error)
			}
		}
	}

	showOrHideExternallySetError(error)
	{
		const { context, name } = this.props

		const value = context.values[name]
		const indicateInvalid = context.indicateInvalid[name]

		// If the `error` is set then indicate this field as being invalid.
		if (error && !indicateInvalid)
		{
			context.dispatch(setFieldError(name, error))

			// Scroll to field and focus after React rerenders the component.
			//
			// Because `this.setState({ submitting: false })`
			// will be called after this code,
			// `submitting` is still `true` at this time,
			// which means `busy` is `true`,
			// which in turn means that all `<Field/>`s are `disabled`,
			// and `disabled` `<input/>`s can't receive focus.
			//
			// Therefore set focus on the `<Field/>` in a timeout
			// so that this "request set focus" action happens after
			// `this.setState({ submitting: false })` is called in `form.js`.
			// This way focus will be set after the `<input/>` is enabled
			// and therefore will be able to receive focus.
			//
			setTimeout(() =>
			{
				this.scroll()
				this.focus()
			},
			0)
		}
		// If the `error` is reset and the field is valid
		// then reset invalid indication.
		// `!this.validate(value)` means "the value is valid".
		else if (!error && indicateInvalid && !this.validate(value))
		{
			context.dispatch(setFieldError(name, undefined))
		}
	}

	onChange = (event) =>
	{
		const { context, name, onChange } = this.props

		let value = event

		if (event && typeof event.preventDefault === 'function')
		{
			value = event.target.value
		}

		// Once a user enters/erases a value in this field
		// the default `value` property no longer applies.
		this.hasBeenEdited = true

		context.dispatch(setFieldValue(name, value))
		context.dispatch(setFieldError(name, undefined))

		if (onChange) {
			onChange(event)
		}
	}

	onFocus = (event) =>
	{
		const { context, name, onFocus } = this.props

		context.dispatch(fieldFocused(name))

		if (onFocus) {
			onFocus(event)
		}
	}

	onBlur = (event) =>
	{
		const { context, name, onBlur } = this.props

		const error = this.validate(context.values[name])

		if (error) {
			context.dispatch(setFieldError(name, error))
		}

		if (onBlur) {
			onBlur(event)
		}
	}

	// Focuses on a field (can be called externally through a ref).
	focus = () =>
	{
		if (!this.mounted) {
			return
		}

		if (!this.field.current) {
			return
		}

		if (typeof this.field.current.focus === 'function') {
			return this.field.current.focus()
		}

		// Generic DOM focusing.
		ReactDOM.findDOMNode(this.field.current).focus()
	}

	scroll = () =>
	{
		if (!this.mounted) {
			return
		}

		// https://github.com/stipsan/scroll-into-view-if-needed/issues/359
		// scrollIntoView(ReactDOM.findDOMNode(this.field.current), false, { duration: 300 })

		scrollIntoView(ReactDOM.findDOMNode(this.field.current),
		{
			scrollMode : 'if-needed',
			behavior   : 'smooth',
			block      : 'nearest',
			inline     : 'nearest'
		})
	}

	validate = (value) =>
	{
		const { context, name, validate, required } = this.props

		if (required && isValueEmpty(value))
		{
			return typeof required === 'string' ? required : context.getRequiredMessage()
		}

		if (validate) {
			return validate(value, context.values)
		}
	}

	render()
	{
		const
		{
			context,
			name,
			required,
			disabled,
			component
		}
		= this.props

		const value = context.values[name]
		const error = context.errors[name]
		const indicateInvalid = context.indicateInvalid[name]

		return React.createElement(component,
		{
			...getPassThroughProps(this.props, FormField.propTypes),
			ref      : isStateless(component) ? undefined : this.field,
			onChange : this.onChange,
			onFocus  : this.onFocus,
			onBlur   : this.onBlur,
			disabled : disabled || context.submitting,
			value,
			error    : indicateInvalid ? error : undefined,
			required : required && isValueEmpty(value) ? true : false
		})
	}
}

export function isValueEmpty(_)
{
	return _ === undefined || _ === null ||
		(typeof _ === 'string' && _.trim() === '')
}

function isStateless(Component)
{
	return typeof Component !== 'string' && !Component.prototype.render
}