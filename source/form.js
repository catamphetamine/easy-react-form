import { Component, createElement, PropTypes } from 'react'
import hoist_statics          from 'hoist-non-react-statics'
import { bindActionCreators } from 'redux'
import { connect }            from 'react-redux'

import
{
	initialize_form,
	destroy_form,
	register_field,
	unregister_field,
	update_field_value,
	indicate_invalid_field,
	reset_form_invalid_indication,
	clear_field,
	set_field,
	focus_field,
	focused_field,
	scroll_to_field,
	scrolled_to_field,
	set_form_validation_passed
}
from './actions'

import { initial_form_state } from './reducer'

const _initial_form_state_ = initial_form_state()

const reserved_props =
[
	// @connect()-ed Redux state props
	'fields',
	'values',
	'errors',
	'indicate_invalid',
	'focus',
	'misc',

	// Props passed to the underlying form
	'submit',
	'focus',
	'clear',
	'reset_invalid_indication'
]

// <Form
// 	action={this.submit}>
//
// 	<Field
// 		component={Text_input}
// 		value="Text"
// 		validate={this.validate_email}
// 		error="Optional externally set error (aside validation)"/>
//
// 	<button type="submit">Submit</button>
// </Form>
//
// validate_email(value) { return 'Error message' }
//
// submit(values) { ... }
//
export default function Form(options = {})
{
	return function(Wrapped)
	{
		class Form extends Component
		{
			static propTypes =
			{
				id : PropTypes.string,
				form_id : PropTypes.string,
				formId  : PropTypes.string,

				initial_values : PropTypes.object,

				submitting : PropTypes.bool,

				fields           : PropTypes.object.isRequired,
				values           : PropTypes.object.isRequired,
				errors           : PropTypes.object.isRequired,
				indicate_invalid : PropTypes.object.isRequired,
				focus            : PropTypes.object.isRequired,
				misc             : PropTypes.object.isRequired,

				initialize_form : PropTypes.func.isRequired,
				destroy_form    : PropTypes.func.isRequired,

				register_field                : PropTypes.func.isRequired,
				unregister_field              : PropTypes.func.isRequired,
				update_field_value            : PropTypes.func.isRequired,
				indicate_invalid_field        : PropTypes.func.isRequired,
				clear_field                   : PropTypes.func.isRequired,
				set_field                     : PropTypes.func.isRequired,
				focus_field                   : PropTypes.func.isRequired,
				focused_field                 : PropTypes.func.isRequired,
				scroll_to_field               : PropTypes.func.isRequired,
				scrolled_to_field             : PropTypes.func.isRequired,
				set_form_validation_passed    : PropTypes.func.isRequired,
				reset_form_invalid_indication : PropTypes.func.isRequired
			}

			static childContextTypes =
			{
				simpler_redux_form : PropTypes.object.isRequired
			}

			constructor(props, context)
			{
				super(props, context)

				this.get_value                  = this.get_value.bind(this)
				this.get_initial_value          = this.get_initial_value.bind(this)
				this.get_indicate_invalid       = this.get_indicate_invalid.bind(this)
				this.get_focus                  = this.get_focus.bind(this)
				this.get_scroll_to              = this.get_scroll_to.bind(this)
				this.get_form_validation_failed = this.get_form_validation_failed.bind(this)

				this.is_submitting = this.is_submitting.bind(this)

				this.register_field           = this.register_field.bind(this)
				this.unregister_field         = this.unregister_field.bind(this)
				this.update_field_value       = this.update_field_value.bind(this)
				this.indicate_invalid_field   = this.indicate_invalid_field.bind(this)
				this.reset_invalid_indication = this.reset_invalid_indication.bind(this)
				this.focused_field            = this.focused_field.bind(this)
				this.scrolled_to_field        = this.scrolled_to_field.bind(this)

				this.submit = this.submit.bind(this)
				this.focus_field = this.focus_field.bind(this)
				this.scroll_to_field = this.scroll_to_field.bind(this)
				this.clear_field = this.clear_field.bind(this)
				this.set_field = this.set_field.bind(this)
			}

			componentWillMount()
			{
				this.props.initialize_form(this.form_id(), this.props.initial_values)
			}

			componentWillUnmount()
			{
				this.props.destroy_form(this.form_id())
			}

			getChildContext()
			{
				const context =
				{
					simpler_redux_form:
					{
						get_value                  : this.get_value,
						get_initial_value          : this.get_initial_value,
						get_indicate_invalid       : this.get_indicate_invalid,
						get_focus                  : this.get_focus,
						get_scroll_to              : this.get_scroll_to,
						get_form_validation_failed : this.get_form_validation_failed,

						is_submitting : this.is_submitting,

						register_field           : this.register_field,
						unregister_field         : this.unregister_field,
						update_field_value       : this.update_field_value,
						indicate_invalid_field   : this.indicate_invalid_field,
						reset_invalid_indication : this.reset_invalid_indication,
						focused_field            : this.focused_field,
						scrolled_to_field        : this.scrolled_to_field
					}
            }

            return context
			}

			// Public API
			focus(field)
			{
				if (!field)
				{
					const { fields } = this.props

					field = Object.keys(fields)[0]
				}

				this.focus_field(field)
			}

			// Not all of `this.props` are passed
			passed_props()
			{
				const passed_props = {}

				// Drop all inner props,
				// retaining only 'submitting' and 'formId' prop.
				// All other user-specified props are passed on.
				for (let prop_name of Object.keys(this.props))
				{
					if (Form.propTypes[prop_name])
					{
						if (prop_name !== 'form_id'
							&& prop_name !== 'formId'
							&& prop_name !== 'submitting')
						{
							continue
						}
					}

					passed_props[prop_name] = this.props[prop_name]
				}

				return passed_props
			}

			// Extracts form id from `props`
			form_id()
			{
				return form_id(this.props)
			}

			// Is submit in progress
			is_submitting()
			{
				return this.props.submitting
			}

			// Is called from outside
			reset_invalid_indication()
			{
				this.props.reset_invalid_indication(this.form_id())
			}

			// Registers field (used because React optimizes rerendering process)
			register_field(field, value, error, non_validation_error)
			{
				this.props.register_field(this.form_id(), field, value, error, non_validation_error)
			}

			// Unregisters field (used because React optimizes rerendering process)
			unregister_field(field)
			{
				this.props.unregister_field(this.form_id(), field)
			}

			// Field `onChange` handler fires
			update_field_value(field, value, error)
			{
				this.props.update_field_value(this.form_id(), field, value, error)
			}

			// Enables invalid field indication
			indicate_invalid_field(field)
			{
				this.props.indicate_invalid_field(this.form_id(), field)
			}

			// Reset invalid indication for a field
			reset_invalid_indication(field)
			{
				this.props.reset_form_invalid_indication(this.form_id(), field)
			}

			// Returns form values
			get_value(field)
			{
				return this.props.values[field]
			}

			// Returns form initial values
			get_initial_value(field)
			{
				return this.props.initial_values[field]
			}

			// Invalid field indication
			get_indicate_invalid(field)
			{
				return this.props.indicate_invalid[field]
			}

			// Focusing on a field
			get_focus(field)
			{
				return this.props.focus[field]
			}

			// Scrolling to form fields
			get_scroll_to(field)
			{
				return this.props.scroll_to[field]
			}

			// Did form validation pass
			get_form_validation_failed()
			{
				return this.props.misc.validation_failed
			}

			// Submits the form if it's valid.
			// Otherwise marks invalid fields.
			validate_and_submit(action)
			{
				const { fields, values, errors, set_form_validation_passed } = this.props

				// Ignores previous form submission errors until validation passes
				set_form_validation_passed(this.form_id(), false)

				// Check if there are any invalid fields
				const invalid_fields = Object.keys(fields)
					.filter(field => fields[field])
					.filter(field => errors[field] !== undefined)

				// If all fields are valid, then submit the form
				if (invalid_fields.length === 0)
				{
					// Stop ignoring form submission errors
					set_form_validation_passed(this.form_id(), true)

					const form_data = {}

					// Pass only registered fields to form submit action
					// (because if a field is unregistered that means that
					//  its React element was removed in the process,
					//  and therefore it's not needed anymore)
					for (let key of Object.keys(fields))
					{
						form_data[key] = values[key]
					}

					return action(form_data)
				}

				// Indicate the first invalid field error
				this.indicate_invalid_field(invalid_fields[0])

				// Scroll to the invalid field
				this.scroll_to_field(invalid_fields[0])

				// Focus the invalid field
				this.focus_field(invalid_fields[0])
			}

			// Creates form submit handler
			// (this function is passed as a property)
			submit(before_submit, action)
			{
				if (!action)
				{
					action = before_submit
					before_submit = undefined
				}

				if (!action)
				{
					throw new Error(`No action specified for form "submit"`)
				}

				return (event) =>
				{
					// If it's an event handler then `.preventDefault()` it
					if (event && typeof event.preventDefault === 'function')
					{
						event.preventDefault()
					}

					// Do nothing if the form is submitting
					// (i.e. submit is in progress)
					if (this.props.submitting)
					{
						return
					}

					// Can be used, for example, to reset
					// custom error messages.
					// (not <Field/> `error`s)
					// E.g. it could be used to reset
					// overall form errors like "Form submission failed".
					if (before_submit)
					{
						before_submit()
					}

					// Check field validity and submit the form
					this.validate_and_submit(action)
				}
			}

			// Focuses on a given form field
			focus_field(field)
			{
				this.props.focus_field(this.form_id(), field)
			}

			// Focus on a field was requested and was performed
			focused_field(field)
			{
				this.props.focused_field(this.form_id(), field)
			}

			// Scrolls to a form field
			scroll_to_field(field)
			{
				this.props.scroll_to_field(this.form_id(), field)
			}

			// Scroll to a form field was requested and was performed
			scrolled_to_field(field)
			{
				this.props.scrolled_to_field(this.form_id(), field)
			}

			// Clears field value
			clear_field(field, error)
			{
				this.props.clear_field(this.form_id(), field, error)
			}

			// Sets field value
			set_field(field, value, error)
			{
				this.props.set_field(this.form_id(), field, value, error)
			}

			render()
			{
				return createElement(Wrapped,
				{
					...this.passed_props(),
					ref    : 'user_form',
					submit : this.submit,
					focus  : this.focus_field,
					scroll : this.scroll_to_field,
					clear  : this.clear_field,
					set    : this.set_field,
					reset_invalid_indication : this.reset_invalid_indication
				})
			}
		}

		Form.displayName = `Form(${get_display_name(Wrapped)})`

		// `this.intl` will be available for this component
		const Connected_form = connect
		(
			(state, props) =>
			{
				let form_id

				// Get form id
				if (options.id)
				{
					// `id` can be either a String or a Function of `props`
					form_id = typeof options.id === 'string' ? options.id : options.id(props)
				}
				else
				{
					form_id = props.form_id || props.formId
				}

				if (!form_id)
				{
					throw new Error("@Form() `id` property not specified for `simpler-redux-form` decorator for " + get_display_name(Wrapped))
				}

				let form_state = state.form[form_id]

				if (!form_state)
				{
					form_state = { ..._initial_form_state_ }
				}

				form_state.id = form_id

				if (options.submitting)
				{
					// This is needed for Redux store listener
					// shallow compare to actually go into the object.
					// Otherwise it will just see that `before === after`
					// and won't rerender React component.
					form_state = { ...form_state }

					form_state.submitting = options.submitting(state, props)
				}

				for (let prop of Object.keys(props))
				{
					if (prop === 'values')
					{
						form_state.initial_values = props.values
					}
					else if (reserved_props.indexOf(prop) >= 0)
					{
						throw new Error(`"${prop}" prop is reserved by simpler-redux-form`)
					}
				}

				return form_state
			},
			{
				initialize_form,
				destroy_form,
				register_field,
				unregister_field,
				update_field_value,
				indicate_invalid_field,
				reset_form_invalid_indication,
				clear_field,
				set_field,
				focus_field,
				focused_field,
				scroll_to_field,
				scrolled_to_field,
				set_form_validation_passed
			},
			undefined,
			{ withRef: true }
		)
		(Form)

		// Build outer component to expose instance api
		class ReduxForm extends Component
		{
			constructor(props, context)
			{
				super(props, context)

				this.focus = this.focus.bind(this)
			}

			ref()
			{
				return this.refs.connected_form.getWrappedInstance().refs.user_form
			}

			focus(field)
			{
				return this.refs.connected_form.getWrappedInstance().focus(field)
			}

			scroll(field)
			{
				return this.refs.connected_form.getWrappedInstance().scroll_to_field(field)
			}

			clear(field, error)
			{
				return this.refs.connected_form.getWrappedInstance().clear_field(field, error)
			}

			set(field, value, error)
			{
				return this.refs.connected_form.getWrappedInstance().set_field(field, value, error)
			}

			// // For tests
			// get wrappedInstance()
			// {
			// 	return this.refs.connected_form.getWrappedInstance().refs.wrapped
			// }

			render()
			{
				return createElement(Connected_form,
				{
					...this.props,
					ref : 'connected_form'
				})
			}
		}

		hoist_statics(ReduxForm, Wrapped)

		return ReduxForm
	}
}

function get_display_name(Wrapped)
{
	return Wrapped.displayName || Wrapped.name || 'Component'
}

function form_id(props)
{
	return props.id
}

export const context_prop_type = PropTypes.shape
({
	get_value                  : PropTypes.func.isRequired,
	get_initial_value          : PropTypes.func.isRequired,
	get_indicate_invalid       : PropTypes.func.isRequired,
	get_focus                  : PropTypes.func.isRequired,
	get_scroll_to              : PropTypes.func.isRequired,
	get_form_validation_failed : PropTypes.func.isRequired,

	is_submitting : PropTypes.func.isRequired,

	register_field           : PropTypes.func.isRequired,
	unregister_field         : PropTypes.func.isRequired,
	update_field_value       : PropTypes.func.isRequired,
	indicate_invalid_field   : PropTypes.func.isRequired,
	reset_invalid_indication : PropTypes.func.isRequired,
	focused_field            : PropTypes.func.isRequired,
	scrolled_to_field        : PropTypes.func.isRequired
})
.isRequired