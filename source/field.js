import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import createRef from 'react-create-ref'

import { Context, contextPropType } from './form'
import { ListContext, listContextPropType } from './list'
import { getPassThroughProps, scrollTo } from './utility'

import {
	setFieldValue,
	setFieldError,
	setFieldValidationError,
	// showFieldError,
	fieldFocused
} from './actions'

export default function Field(props) {
	return (
		<Context.Consumer>
			{context => (
				<ListContext.Consumer>
					{listContext => (
						<FormField
							{...props}
							context={context}
							listContext={listContext}/>
					)}
				</ListContext.Consumer>
			)}
		</Context.Consumer>
	)
}

class FormField extends Component {
	static propTypes = {
		name      : PropTypes.string.isRequired,
		component : PropTypes.elementType.isRequired,
		required  : PropTypes.oneOfType([ PropTypes.bool, PropTypes.string ]),

		value    : PropTypes.any,
		error    : PropTypes.string,
		validate : PropTypes.func,

		context: contextPropType.isRequired,
		listContext: listContextPropType,
		i: PropTypes.number
	}

	field = createRef()

	constructor(props) {
		super(props)
		// The field could register itself inside `componentDidMount`
		// but in that case initial `value` wouldn't yet be applied at mount time.
		this.register()
	}

	getName(props = this.props) {
		const { listContext, i, name } = props
		if (listContext) {
			return listContext.getFieldName(i, name)
		}
		return name
	}

	register() {
		const {
			context,
			listContext,
			error,
			name,
			value,
			onChange
		} = this.props

		// "Register" the field and initialize it with the default value.
		//
		// React will reuse and reshuffle existing `<Fields/>`
		// when hiding/showing new fields, so a field might get
		// "registered"/"unregistered" several times in those cases.
		//
		context.onRegisterField(this.getName(), {
			value,
			onChange,
			error,
			validate: this.validate,
			scroll: this.scroll,
			focus: this.focus
		})

		if (listContext) {
			listContext.onRegisterField(name)
		}
	}

	unregister(prevProps) {
		const { context } = this.props
		context.onUnregisterField(this.getName(prevProps))
	}

	componentDidMount() {
		this.mounted = true
	}

	componentWillUnmount() {
		// "Unregister" field.
		this.unregister()
		this.mounted = false
	}

	componentDidUpdate(prevProps) {
		const { context, value, error } = this.props

		// If React reused one `<Field/>` element for another form field
		// then handle this type of situation correctly.
		if (this.getName() !== this.getName(prevProps)) {
			// Unregister old field.
			this.unregister(prevProps)
			// Register new field.
			this.register()
		}
		// Else, if it's still the same field.
		else {
			// If the default value changed for this `<Field/>`
			// and the field hasn't been edited yet
			// then apply this new default value.
			// A default value isn't supposed to generate an error.
			if (value !== prevProps.value && !this.hasBeenEdited) {
				context.dispatch(setFieldValue(this.getName(), value))
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

	showOrHideExternallySetError(error) {
		const { context } = this.props

		const value = context.values[this.getName()]
		const showError = context.showErrors[this.getName()]

		// If the `error` is set then indicate this field as being invalid.
		if (error) {
			context.dispatch(setFieldError(this.getName(), error))
			// `setFieldError()` action also automatically sets `showErrors[field]` property.
			// context.dispatch(showFieldError(this.getName()))
			this.scroll()
			this.focus()
		}
		// If the `error` is reset and the field is valid
		// then reset invalid indication.
		// `!this.validate(value)` means "the value is valid".
		else if (!error && !this.validate(value)) {
			context.dispatch(setFieldError(this.getName(), undefined))
		}
	}

	onChange = (...args) => {
		const [event] = args
		let value = event
		if (event && typeof event.preventDefault === 'function') {
			value = event.target.value
		}

		// Once a user enters/erases a value in this field
		// the default `value` property no longer applies.
		// This flag won't work with `form.reset()`.
		this.hasBeenEdited = true

		const { context, onChange } = this.props

		context.dispatch(setFieldValue(this.getName(), value))
		context.dispatch(setFieldValidationError(this.getName(), undefined))

		if (onChange) {
			onChange(...args)
		}
	}

	onFocus = (event) => {
		const { context, onFocus } = this.props
		context.dispatch(fieldFocused(this.getName()))
		if (onFocus) {
			onFocus(event)
		}
	}

	onBlur = (event) => {
		const { context, onBlur } = this.props
		const error = this.validate(context.values[this.getName()])
		if (error) {
			context.dispatch(setFieldValidationError(this.getName(), error))
		}
		if (onBlur) {
			onBlur(event)
		}
	}

	getNode() {
		if (this.field.current) {
			// Using `ReactDOM.findDOMNode` instead of `this.field.current`
			// to supports non-functional components that don't use `React.forwardRef()`.
			// For example, `<DropFileUpload/>` from `react-responsive-ui`.
			//
			// Using `useImperativeHandle()` would throw an error here:
			// "Argument appears to not be a ReactComponent. Keys: focus".
			//
			try {
				return ReactDOM.findDOMNode(this.field.current)
			} catch (error) {
				// A workaround for components that use `useImperativeHandle()`
				// for adding `ref` suport.
				if (this.field.current.getDOMNode) {
					return this.field.current.getDOMNode()
				}
				console.warn(error)
			}
		}
	}

	// Focuses on a field (can be called externally through a ref).
	focus = () => {
		// `.focus()` could theoretically maybe potentially be called in a timeout,
		// so check if the component is still mounted.
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
		const node = this.getNode()
		if (node) {
			node.focus()
		} else {
			console.error(`Couldn't focus on field "${this.getName()}": DOM Node not found. ${STATELESS_COMPONENT_HINT}`)
		}
	}

	scroll = (options) => {
		// `.scroll()` could theoretically maybe potentially be called in a timeout,
		// so check if the component is still mounted.
		if (!this.mounted) {
			return
		}
		const node = this.getNode()
		if (node) {
			scrollTo(node, options)
		} else {
			console.error(`Couldn't scroll to field "${this.getName()}": DOM Node not found. ${STATELESS_COMPONENT_HINT}`)
		}
	}

	validate = (value) => {
		const { context, validate, required } = this.props
		value = context.getSubmittedValue(value)
		if (required && isValueEmpty(value)) {
			return typeof required === 'string' ? required : context.getRequiredMessage()
		}
		if (validate) {
			// `context.values` could be replaced with
			// something else, like `context.getValues()`
			// because `<List/>` values are prefixed in `context.values`.
			// But running RegExps and re-creating the object
			// on each `validate()` call seems like a not-the-best architecture.
			// Instead `values` could be replaced with something like
			// `context.getValues()` but that would be a "breaking change" in the API.
			// On a modern CPU a single `context.getValues()` run is about 0.005 ms.
			// So I guess it's acceptable, since the API already exists.
			return validate(value, context.getValues())
		}
	}

	render() {
		const {
			context,
			required,
			disabled,
			component
		} = this.props

		const value = context.values[this.getName()]
		const error = context.validationErrors[this.getName()] || context.errors[this.getName()]
		const showError = context.showErrors[this.getName()]

		return React.createElement(component, {
			...getPassThroughProps(this.props, FormField.propTypes),
			ref      : this.field,
			onChange : this.onChange,
			onFocus  : this.onFocus,
			onBlur   : this.onBlur,
			disabled : disabled || context.submitting,
			error    : showError ? error : undefined,
			required : required ? true : false,
			value
		})
	}
}

function isValueEmpty(_)
{
	return _ === undefined || _ === null ||
		(Array.isArray(_) && _.length === 0)
}

const STATELESS_COMPONENT_HINT = 'For example, if it\'s a "stateless" component then rewrite it as a "React.Component" having a ".focus()" method.'