import { Component, createElement } from 'react'
import PropTypes from 'prop-types'
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
		value                  : PropTypes.any,
		indicate_invalid       : PropTypes.bool,
		error                  : PropTypes.string,
		_focus                 : PropTypes.bool,
		_scroll_to             : PropTypes.bool,
		form_validation_failed : PropTypes.bool,
		validate               : PropTypes.func,
		focused                : PropTypes.func.isRequired,
		scrolled               : PropTypes.func.isRequired
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

	// `.focus()` didn't work without a timeout in `componentWillReceiveProps`,
	// therefore using `componentDidUpdate` here (shouldn't be much of a deal
	// since `state` is not used in this component, so an update means updated props)
	componentDidUpdate(old_props)
	{
		const new_props = this.props

		// If this field is being focused programmatically, then do it.
		this.focus_if_requested(old_props, new_props, this.context)

		// If this field is being scrolled to programmatically, then do it.
		this.scroll_if_requested(old_props, new_props, this.context)
	}

	// If this field is being focused programmatically, then do it.
	focus_if_requested(old_props, new_props, context)
	{
		if (!old_props._focus && new_props._focus)
		{
			// Focus the field.
			new_props.focused()
			this.focus()
		}
	}

	// Focuses the field (e.g. in case of validation errors)
	focus()
	{
		// If the form hasn't been unmounted yet
		if (this.refs.field)
		{
			// If the custom React component has a `.focus()` instance method
			if (typeof this.refs.field.focus === 'function')
			{
				return this.refs.field.focus()
			}

			// Generic focusing
			ReactDOM.findDOMNode(this.refs.field).focus()
		}
	}

	// If this field is being scrolled to programmatically, then do it.
	scroll_if_requested(old_props, new_props, context)
	{
		if (!old_props._scroll_to && new_props._scroll_to)
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

		// Properties used for inner operation won't be passed down.
		// All other properties will be passed down.
		for (let prop of Object.keys(this.props))
		{
			if (discarded_properties.indexOf(prop) === -1)
			{
				rest_props[prop] = this.props[prop]
			}
		}

		const
		{
			component,
			value,
			validate,
			required,
			form_validation_failed
		}
		= this.props

		let
		{
			error,
			indicate_invalid
		}
		= this.props

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
			return createElement(component, rest_props)
		}

		// For custom React components
		return createElement(component,
		{
			...rest_props,
			error,
			indicateInvalid : indicate_invalid,
			required : required ? true : false
		})
	}
}

const discarded_properties = Object.keys(Connectable_field.propTypes).filter((prop) =>
{
	switch (prop)
	{
		case 'name':
		case 'value':
		case 'disabled':
			return false
		default:
			return true
	}
})