import { Component, createElement, PropTypes } from 'react'

import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

import { context_prop_type } from '../form/context'
import redux_state_connector from './connect'
import Connectable_field from './connectable'

// <Field
// 	name="password"
// 	component={ TextInput }
// 	value={...}
// 	validate={...}
// 	error={...}/>
//
// React will optimize form rerendering,
// and in case of adding or removing form fields
// it will reuse and reshuffle `<Field/>` components for all form fields.
// And it did have messy side-effects.
// Therefore the need to "register" and "unregister" form fields
// while preserving all thier values in Redux state
// (to retain those values between rerenders).
// Alternatively, a developer could specify React `key`s
// for all `<Field/>`s but that would be verbose
// and also prone to "forgot to ket a key" bugs.
//
export default class Field extends Component
{
	state = {}

	static propTypes =
	{
		name      : PropTypes.string.isRequired,
		component : PropTypes.oneOfType([ PropTypes.func, PropTypes.string ]).isRequired,

		value    : PropTypes.any,
		error    : PropTypes.string,
		validate : PropTypes.func,

		children : PropTypes.node
	}

	static defaultProps =
	{
		validate : () => {}
	}

	static contextTypes =
	{
		simpler_redux_form : context_prop_type
	}

	constructor(props, context)
	{
		super(props, context)

		const { name, value } = props

		// This underlying field component
		// will update itself when its value changes
		// (or when its invalid indication flag changes)
		this.Connected_field = this.create_connected_field_component(name, context)

		// Binding
		this.on_change = this.on_change.bind(this)
		this.focus     = this.focus.bind(this)
		this.scroll    = this.scroll.bind(this)
		this.focused   = this.focused.bind(this)
		this.scrolled  = this.scrolled.bind(this)
	}

	// Creates an underlying field component
	// `@connect()`ing it to Redux state.
	// Therefore it will rerender itself when the field value changes.
	// (or when its invalid indication flag changes)
	create_connected_field_component(name, context)
	{
		return redux_state_connector(name, context)(Connectable_field)
	}

	// Setting up the form field.
	componentWillMount()
	{
		const { name, value, validate, error } = this.props

		// "Register" field.
		//
		// Initializes this field with the default value,
		// if it hasn't been edited before (i.e. if it's really new).
		//
		// (because React will reuse and reshuffle all `<Fields/>` and it could get messy)
		//
		// (by this time the field could already exist (in the form))
		//
		// `value` is the initial value for this field.
		// If the field didn't exist in the form before,
		// then its value will be set to this initial value.
		// Otherwise, this "register" call does nothing.
		//
		// If `value` was not set
		// but `values` on the decorated form component were set,
		// then the initial value is taken from that
		// `values` setting in the reducer
		// (because it already holds those initial `values` by this time).
		// Therefore just passing `value` here,
		// not `value || initial_value`.
		//
		this.context.simpler_redux_form.register_field(name, value, validate, error)
	}

	componentWillUnmount()
	{
		const { name } = this.props

		// "Unregister" field
		//
		// ("registering" and "unregistering" fields because
		//  React will reuse and reshuffle all `<Fields/>` and it could get messy)
		//
		this.context.simpler_redux_form.unregister_field(name)
	}

	componentWillReceiveProps(new_props)
	{
		// In case React reused one `<Field/>` element for another form field
		// (an alternative solution to specifying `key`s on each `<Field/>`)
		if (this.props.name !== new_props.name)
		{
			const { name, value, validate, error } = new_props

			// This field will update itself when its value changes
			// (or when it's invalid indication flag changes)
			this.Connected_field = this.create_connected_field_component(name, this.context)

			// Unregister old field
			this.context.simpler_redux_form.unregister_field(this.props.name)

			// Register new field
			//
			// Initialize this field with the default value,
			// if it hasn't been edited before (i.e. if it's really new).
			//
			this.context.simpler_redux_form.register_field(name, value, validate, error)
		}
		// Else, if it's the same field
		else
		{
			// If an externally set `error` property is updated,
			// then set `indicate_invalid` to `true` for this field.
			this.show_or_hide_externally_set_error(this.props, new_props, this.context)
		}
	}

	// If an externally set `error` property is updated to another error,
	// and the field is not already being indicated as invalid,
	// then set `state.form[form].indicate_invalid[field]` to `true`.
	//
	// If an externally set `error` property is unset,
	// and the field has no validation error,
	// then set `state.form[form].indicate_invalid[field]` to `false`.
	//
	show_or_hide_externally_set_error(props, new_props, context)
	{
		// If the error didn't change then don't show it.
		// If the same error happened once again,
		// then it should have been reset
		// before sending form data to the server,
		// and in that case it will be shown once again
		// (see the readme for more info on this case:
		//  https://github.com/halt-hammerzeit/simpler-redux-form#field-errors)
		if (props.error === new_props.error)
		{
			return
		}

		const { name, error, value, validate, indicate_invalid } = new_props

		if (error && !indicate_invalid)
		{
			context.simpler_redux_form.indicate_invalid_field(name)

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
				context.simpler_redux_form.scroll_to_field(name)
				context.simpler_redux_form.focus_field(name)
			},
			0)
		}
		else if (props.error && !error && indicate_invalid && !validate(value))
		{
			// So that `indicate_invalid === true` always means that
			// there is a non-empty `error`.
			// And if there's no error then `indicate_invalid` is always `false`.
			context.simpler_redux_form.reset_invalid_indication(name)
		}

		// The rest (imaginary) case is when the `error` is cleared
		// but the validation doesn't pass,
		// and it's uncertain whether to
		// indicate this field as invalid or not.
	}

	// `onChange` field value handler
	on_change(value)
	{
		// If it's an event then extract the input value from it
		if (value && typeof value.preventDefault === 'function')
		{
			// The `value` is trimmed by now which is handy
			value = value.target.value
		}

		const { name, validate } = this.props

		this.context.simpler_redux_form.update_field_value(name, value, validate(value))
	}

	// Focuses on a field (can be called externally through a ref)
	focus()
	{
		this.refs.field.getWrappedInstance().focus()
		this.focused()
	}

	// Focus on a field was requested and performed
	focused()
	{
		const { name } = this.props

		this.context.simpler_redux_form.focused_field(name)
	}

	scroll()
	{
		this.refs.field.getWrappedInstance().scroll()
		this.scrolled()
	}

	scrolled()
	{
		const { name } = this.props

		this.context.simpler_redux_form.scrolled_to_field(name)
	}

	render()
	{
		const { disabled } = this.props

		// The underlying field component will rerender itself
		// on value changes (or other things like invalid status, focus, scroll),
		// therefore it's computationally efficient
		// because neither the whole form get rerendered
		// nor the `<Field/>` component:
		// just this `@connect()`ed underlying field component.
		return createElement(this.Connected_field,
		{
			...this.props,
			ref      : 'field',
			onChange : this.on_change,
			focused  : this.focused,
			scrolled : this.scrolled,
			disabled : disabled || this.context.simpler_redux_form.is_submitting()
		})
	}
}