import { Component, createElement, PropTypes } from 'react'
import hoist_statics          from 'hoist-non-react-statics'
import { bindActionCreators } from 'redux'
import { connect }            from 'react-redux'

import
{
	initialize_form,
	destroy_form,
	initialize_field,
	destroy_field,
	update_field_value,
	indicate_invalid_field,
	reset_invalid_indication,
	focus_field,
	focused_field,
	set_form_validation_passed
}
from './actions'

import { initial_form_state } from './reducer'

const _initial_form_state_ = initial_form_state()

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
export default function Form()
{
	return function(Wrapped)
	{
		class Form extends Component
		{
			static WrappedComponent = Wrapped

			static propTypes =
			{
				form_id : PropTypes.string,
				formId  : PropTypes.string,

				values           : PropTypes.object.isRequired,
				errors           : PropTypes.object.isRequired,
				indicate_invalid : PropTypes.object.isRequired,
				focus            : PropTypes.object.isRequired,

				initialize_form : PropTypes.func.isRequired,
				destroy_form    : PropTypes.func.isRequired,

				initialize_field           : PropTypes.func.isRequired,
				destroy_field              : PropTypes.func.isRequired,
				update_field_value         : PropTypes.func.isRequired,
				indicate_invalid_field     : PropTypes.func.isRequired,
				focus_field                : PropTypes.func.isRequired,
				focused_field              : PropTypes.func.isRequired,
				set_form_validation_passed : PropTypes.func.isRequired
			}

			static childContextTypes =
			{
				simpler_redux_form : PropTypes.object.isRequired
			}

			constructor(props, context)
			{
				super(props, context)

				this.get_value                  = this.get_value.bind(this)
				this.get_indicate_invalid       = this.get_indicate_invalid.bind(this)
				this.get_focus                  = this.get_focus.bind(this)
				this.get_form_validation_failed = this.get_form_validation_failed.bind(this)

				this.initialize_field         = this.initialize_field.bind(this)
				this.destroy_field            = this.destroy_field.bind(this)
				this.update_field_value       = this.update_field_value.bind(this)
				this.indicate_invalid_field   = this.indicate_invalid_field.bind(this)
				this.reset_invalid_indication = this.reset_invalid_indication.bind(this)
				this.focused_field            = this.focused_field.bind(this)

				this.submit = this.submit.bind(this)
			}

			componentWillMount()
			{
				this.props.initialize_form(this.form_id())
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
						get_indicate_invalid       : this.get_indicate_invalid,
						get_focus                  : this.get_focus,
						get_form_validation_failed : this.get_form_validation_failed,

						initialize_field         : this.initialize_field,
						destroy_field            : this.destroy_field,
						update_field_value       : this.update_field_value,
						indicate_invalid_field   : this.indicate_invalid_field,
						reset_invalid_indication : this.reset_invalid_indication,
						focused_field            : this.focused_field
					}
            }

            return context
			}

			form_id()
			{
				return form_id(this.props)
			}

			// Field mounts
			initialize_field(field, value, error)
			{
				this.props.initialize_field(this.form_id(), field, value, error)
			}

			// Field unmounts
			destroy_field(field)
			{
				this.props.destroy_field(this.form_id(), field)
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
				this.props.reset_invalid_indication(this.form_id(), field)
			}

			// Returns form values
			get_value(field)
			{
				return this.props.values[field]
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

			// Did form validation pass
			get_form_validation_failed()
			{
				return this.props.misc.validation_failed
			}

			// Submits the form if it's valid.
			// Otherwise marks invalid fields.
			submit_if_valid(action)
			{
				const { values, errors, set_form_validation_passed } = this.props

				// Ignores previous form submission errors until validation passes
				set_form_validation_passed(this.form_id(), false)

				// Check if there are any invalid fields
				const invalid_fields = Object.keys(values).filter(field => errors[field] !== undefined)

				// If all fields are valid, then submit the form
				if (invalid_fields.length === 0)
				{
					// Stop ignoring form submission errors
					set_form_validation_passed(this.form_id(), true)

					return action(values)
				}

				// Indicate the first invalid field error
				this.indicate_invalid_field(invalid_fields[0])

				// Focus the invalid field
				this.focus_field(invalid_fields[0])
			}

			// Creates form submit handler
			// (this function is passed as a property)
			submit(action)
			{
				return (event) =>
				{
					// If it's an event handler then `.preventDefault()` it
					if (event && typeof event.preventDefault === 'function')
					{
						event.preventDefault()
					}

					// Check field validity and submit the form
					this.submit_if_valid(action)
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

			render()
			{
				return createElement(Wrapped,
				{
					...this.props,
					submit : this.submit
				})
			}
		}

		Form.displayName = `Form(${get_display_name(Wrapped)})`

		// `this.intl` will be available for this component
		const Connected_form = connect
		(
			(state, props) =>
			{
				const _form_id = form_id(props)

				if (!_form_id)
				{
					throw new Error("`formId` property not specified on `simpler-redux-form` component")
				}

				state = state.form[_form_id]

				if (!state)
				{
					return _initial_form_state_
				}

				const result =
				{
					values           : state.values,
					errors           : state.errors,
					indicate_invalid : state.indicate_invalid,
					focus            : state.focus,
					misc             : state.misc
				}

				return result
			},
			(dispatch) => bindActionCreators
			({
				initialize_form,
				destroy_form,
				initialize_field,
				destroy_field,
				update_field_value,
				indicate_invalid_field,
				reset_invalid_indication,
				focus_field,
				focused_field,
				set_form_validation_passed
			},
			dispatch)
		)
		(Form)

		return hoist_statics(Connected_form, Wrapped)
	}
}

function get_display_name(Wrapped)
{
	return Wrapped.displayName || Wrapped.name || 'Component'
}

function form_id(props)
{
	return props.form_id || props.formId
}