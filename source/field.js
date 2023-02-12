import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Context, contextPropType } from './form.js'
import { ListContext, listContextPropType } from './list.js'
import { getPassThroughProps, scrollTo } from './utility.js'

import {
	setFieldValue,
	setFieldError,
	// showFieldError,
	fieldFocused
} from './actions.js'

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

const itemType = PropTypes.number

class FormField extends Component {
	static propTypes = {
		name      : PropTypes.string.isRequired,
		component : PropTypes.elementType.isRequired,
		required  : PropTypes.oneOfType([ PropTypes.bool, PropTypes.string ]),

		value    : PropTypes.any,
		validate : PropTypes.func,

		// This property is currently not used.
		// Validation is currently only performed on `blur` event
		// and any validation errors are cleared while the user is typing.
		// Perhaps that results in a slightly less unneeded CPU load or something like that.
		validateOnChange: PropTypes.bool,

		// This property is currently not used.
		// "Required" validation is currently only performed after a user has attempted
		// to submit the form. The reason is that otherwise there'd be unnecessarily-shown
		// "Required" error messages when the form has `autoFocus` feature enabled
		// and the user clicks away (for example, on a "Close Form Modal" button).
		// Or, for example, showing the "Required" error message on blur could result in
		// a shift of content when the user attempts to click the "Submit" button
		// resulting in the user clicking another button or empty space.
		validateRequiredBeforeSubmit: PropTypes.bool,

		onChange: PropTypes.func,

		// `onErrorChange()` property wasn't added because it would be called
		// at the time when the error has changed in form state but that form state
		// hasn't already been rendered.
		// onErrorChange: PropTypes.func,

		context: contextPropType.isRequired,
		listContext: listContextPropType,
		item: itemType
	}

	field = React.createRef()

	constructor(props) {
		super(props)

		// The field could register itself inside `componentDidMount`
		// but in that case initial `value` wouldn't yet be applied at mount time.
		this.register()
	}

	getName(props = this.props) {
		const { listContext, item, name } = props
		if (listContext) {
			return listContext.getFieldNameInsideList(item, name)
		}
		return name
	}

	register() {
		const {
			context,
			listContext,
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
			onError: this.onError,
			validate: this.validate,
			scroll: this.scroll,
			focus: this.focus
		})

		if (listContext) {
			listContext.onRegisterFieldInsideList(name)
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
		const { context } = this.props
		if (!context.isUnmounting()) {
			// "Unregister" field.
			this.unregister()
		}

		this.mounted = false
	}

	componentDidUpdate(prevProps) {
		const { context, value } = this.props

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
			if (value !== prevProps.value && !this.hasBeenEdited) {
				const error = this.validate(value)
				this.onError(error)
				context.dispatch(setFieldValue(this.getName(), value))
				context.dispatch(setFieldError(this.getName(), error))
			}
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

		const { context, validateOnChange, onChange } = this.props

		// The `validateOnChange` feature is currently not used.
		// Validation is currently only performed on `blur` event
		// and any validation errors are cleared while the user is typing.
		// Perhaps that results in a slightly less unneeded CPU load or something like that.
		const error = validateOnChange ? this.validate(value) : undefined;

		if (onChange) {
			onChange(value)
		}

		this.onError(error)

		context.dispatch(setFieldValue(this.getName(), value))
		context.dispatch(setFieldError(this.getName(), error))
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
		const error = this.validate(context.state.values[this.getName()])
		// The `error` was `undefined` while the field was focused.
		if (error) {
			this.onError(error)
			context.dispatch(setFieldError(this.getName(), error))
		}
		if (onBlur) {
			onBlur(event)
		}
	}

	onError(error) {}

	// onError(newError) {
	// 	const { context, onErrorChange } = this.props
	// 	if (onErrorChange) {
	// 		const error = context.state.errors[this.getName()]
	// 		// If validation error is being reset then show no error.
	// 		// Otherwise, show the new validation error, if it has changed.
	// 		if (newError !== error) {
	// 			onErrorChange(newError)
	// 		}
	// 	}
	// }

	getNode() {
		return this.field.current
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

	shouldValidateRequired() {
		const { context, validateRequiredBeforeSubmit } = this.props
		if (validateRequiredBeforeSubmit) {
			return true
		}
		// If the user has attempted to submit the form
		// then start showing "required" errors.
		return context.state.submitAttempted
	}

	validate = (value) => {
		const { context, validate, required } = this.props
		value = context.transformValueForSubmit(value)
		if (required && isValueEmpty(value)) {
			if (this.shouldValidateRequired()) {
				return typeof required === 'string' ? required : context.getRequiredMessage()
			}
			return
		}
		if (!isValueEmpty(value)) {
			if (validate) {
				// `context.state.values` could be replaced with
				// something else, like `context.getValues()`
				// because `<List/>` values are prefixed in `context.state.values`.
				// But running RegExps and re-creating the object
				// on each `validate()` call seems like a not-the-best architecture.
				// Instead `values` could be replaced with something like
				// `context.getValues()` but that would be a "breaking change" in the API.
				// On a modern CPU a single `context.getValues()` run is about 0.005 ms.
				// So I guess it's acceptable, since the API already exists.
				return validate(value, context.getValues())
			}
		}
	}

	render() {
		const {
			context,
			required,
			component
		} = this.props

		const value = context.state.values[this.getName()]
		const error = context.state.errors[this.getName()]
		const showError = context.state.showErrors[this.getName()]

		return React.createElement(component, {
			...getPassThroughProps(this.props, FormField.propTypes),
			ref      : this.field,
			onChange : this.onChange,
			onFocus  : this.onFocus,
			onBlur   : this.onBlur,
			wait     : context.state.submitting,
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