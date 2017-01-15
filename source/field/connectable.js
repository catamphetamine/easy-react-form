import { Component, createElement, PropTypes } from 'react'
import ReactDOM from 'react-dom'

// This component will be `@connect()`ed to Redux state
// and therefore will update itself when its value changes.
// (or when its invalid indication changes)
// Also watches `focus` flag for changes
// and updates its focus accordingly.
// Also watches `scroll_to` flag for changes
// and scrolls to this field upon request.
export default class Connectable_field extends Component
{
	static propTypes =
	{
		name     : PropTypes.string,
		disabled : PropTypes.bool,

		initial_value          : PropTypes.any,
		value                  : PropTypes.any,
		indicate_invalid       : PropTypes.bool,
		_focus                 : PropTypes.bool,
		_scroll_to             : PropTypes.bool,
		form_validation_failed : PropTypes.bool,

		validate : PropTypes.func,
		error    : PropTypes.string,

		on_change : PropTypes.func.isRequired,
		focused   : PropTypes.func.isRequired,
		scrolled  : PropTypes.func.isRequired
	}

	constructor(props, context)
	{
		super(props, context)

		this.focus = this.focus.bind(this)

		// If this field is being focused programmatically, then do it.
		this.focus_if_requested({}, props, context)

		// // If this field is being scrolled to programmatically, then do it.
		// this.scroll_if_requested({}, props, context)
	}

	componentWillReceiveProps(new_props)
	{
		// If this field is being focused programmatically, then do it.
		this.focus_if_requested(this.props, new_props, this.context)

		// If this field is being scrolled to programmatically, then do it.
		this.scroll_if_requested(this.props, new_props, this.context)
	}

	// If this field is being focused programmatically, then do it.
	focus_if_requested(props, new_props, context)
	{
		if (!props._focus && new_props._focus)
		{
			// Focus the field.
			// Do it in a timeout, otherwise it didn't work.
			// Probably because React rerenders this field
			// because the `props` have changed
			// and that discards the focus.
			new_props.focused()
			setTimeout(this.focus, 0)
		}
	}

	// Focuses the field (e.g. in case of validation errors)
	focus()
	{
		// If the form hasn't been unmounted yet
		if (this.refs.field)
		{
			// If the custom React component has a `.focus()` instance method
			if (this.refs.field.focus)
			{
				return this.refs.field.focus()
			}

			// Generic focusing
			ReactDOM.findDOMNode(this.refs.field).focus()
		}
	}

	// If this field is being scrolled to programmatically, then do it.
	scroll_if_requested(props, new_props, context)
	{
		if (!props._scroll_to && new_props._scroll_to)
		{
			// Focus the field.
			// Do it in a timeout, otherwise it didn't work.
			// Probably because React rerenders this field
			// because the `props` have changed
			// and that discards the focus.
			new_props.scrolled()
			this.scroll()
		}
	}

	// Scrolls to the field (e.g. in case of validation errors)
	scroll()
	{
		// If the form hasn't been unmounted yet
		if (this.refs.field)
		{
			const element = ReactDOM.findDOMNode(this.refs.field)

			// https://developer.mozilla.org/ru/docs/Web/API/Element/scrollIntoViewIfNeeded
			if (element.scrollIntoViewIfNeeded)
			{
				element.scrollIntoViewIfNeeded(false)
			}
			else
			{
				scrollIntoViewIfNeeded(element, false, { duration: 800 })
			}
		}
	}

	render()
	{
		// These props will be passed down to the field
		const rest_props = {}

		// Filter out inner props
		for (let prop of Object.keys(this.props))
		{
			if (connectable_field_inner_props.indexOf(prop) < 0)
			{
				rest_props[prop] = this.props[prop]
			}
		}

		let
		{
			component,
			value,
			initial_value,
			error,
			validate,
			indicate_invalid,
			form_validation_failed,
			on_change
		}
		= this.props

		value = initial_value !== undefined ? initial_value : value

		// Retain some of them
		rest_props.name     = this.props.name
		rest_props.value    = value
		rest_props.disabled = this.props.disabled

		// Don't show external error if form validation failed
		if (indicate_invalid && form_validation_failed)
		{
			error            = validate(value)
			indicate_invalid = error ? true : false
		}
		else
		{
			error = error || validate(value)
		}

		// Required for focusing on the field in case of validation errors
		rest_props.ref = 'field'

		// For generic Html elements (<input/>, etc)
		if (typeof component === 'string')
		{
			return createElement(component,
			{
				...rest_props,
				onChange : on_change
			})
		}

		// For custom React components
		return createElement(component,
		{
			...rest_props,
			on_change,
			onChange : on_change,
			indicate_invalid,
			indicateInvalid : indicate_invalid,
			error
		})
	}
}

const connectable_field_inner_props = Object.keys(Connectable_field.propTypes)