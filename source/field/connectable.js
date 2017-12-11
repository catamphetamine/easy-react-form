import { Component, createElement } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'

// This component will be `@connect()`ed to Redux state
// and therefore will update itself when its value changes.
// (or when its invalid indication changes)
// Also watches `focus` flag for changes
// and updates its focus accordingly.
// Also watches `scroll_to` flag for changes
// and scrolls to this field upon request.
//
// The name was originally `ConnectableField`
// but was later changed to `SimplerReduxFormField`
// for more user-friendly React error messages and warnings.
//
export default class SimplerReduxFormField extends Component
{
	static propTypes =
	{
		component              : PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
		value                  : PropTypes.any,
		values                 : PropTypes.object.isRequired,
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

	componentWillUnmount()
	{
		// Maybe this flag is not strictly required 
		this.unmounted = true
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
		// and an underlying component is a `React.Component`.
		if (this.field)
		{
			// If the custom React component has a `.focus()` instance method
			if (typeof this.field.focus === 'function')
			{
				return this.field.focus()
			}

			// Generic focusing
			return ReactDOM.findDOMNode(this.field).focus()
		}

		// React throws when calling `findDOMNode` on an unmounted component
		// therefore the explicit check for the component being still mounted.
		if (!this.unmounted)
		{
			const node = ReactDOM.findDOMNode(this)

			const focusable =
				node.querySelector('input') ||
				node.querySelector('select') ||
				node.querySelector('textarea') ||
				node.querySelector('button')

			if (focusable)
			{
				focusable.focus();
			}
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
		if (this.field)
		{
			const element = ReactDOM.findDOMNode(this.field)

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
		for (const prop of Object.keys(this.props))
		{
			if (intercepted_properties.indexOf(prop) === -1)
			{
				rest_props[prop] = this.props[prop]
			}
		}

		const
		{
			component,
			value,
			values,
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

		// Makes sure `indicateInvalid` is always set to some `boolean` value.
		if (indicate_invalid === undefined)
		{
			indicate_invalid = false
		}

		// If the form validation doesn't pass
		// then don't show externally set `error` property for this field
		// (reset the `error` to the form validation one),
		// i.e. the user must first correct the form field values
		// so that the form validation passes
		// and after that can he resubmit the form
		// and deal with those externally set `error`s.
		//
		// (`indicate_invalid` is set to `true`
		//  the moment `error` property is set externally;
		//  this is achieved using `componentWillReceiveProps()` hook)
		//
		if (indicate_invalid && form_validation_failed)
		{
			error            = validate(value, values)
			indicate_invalid = error ? true : false
		}
		// Else, don't override the externally set `error` (if it has been set).
		else
		{
			error = error || validate(value, values)
		}

		// Required for focusing on the field in case of validation errors
		if (!is_stateless(component))
		{
			rest_props.ref = ref => this.field = ref
		}

		// For generic Html elements (<input/>, etc)
		if (typeof component === 'string')
		{
			return createElement(component, rest_props)
		}

		// For custom React components
		return createElement(component,
		{
			...rest_props,
			value,
			error,
			indicateInvalid : indicate_invalid,
			required : required ? true : false
		})
	}
}

const intercepted_properties = Object.keys(SimplerReduxFormField.propTypes);

function is_stateless(Component)
{
	return typeof Component !== 'string' && !Component.prototype.render
}