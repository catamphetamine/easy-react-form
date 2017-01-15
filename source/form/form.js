import { Component, createElement, PropTypes } from 'react'
import hoist_statics from 'hoist-non-react-statics'

import create_context, { context_prop_type } from './context'
import build_outer_component from './wrapper'
import redux_state_connector from './connect'

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
export default function createFormComponentDecorator(options = {})
{
	return function createFormComponent(Wrapped_component)
	{
		class Form extends Component
		{
			static propTypes =
			{
				// Form id (required)
				// (is set by the @Form() decorator)
				id : PropTypes.string,

				// These two React properties
				// can be set on the decorated form element
				// and they will be transformed into the `id` property above.
				form_id : PropTypes.string,
				formId  : PropTypes.string,

				// Initial form field values
				// (is set by the @Form() decorator
				//  gathering `value`s from all `<Field/>`s)
				initial_values : PropTypes.object,

				// Whether the form is being submitted right now
				// (is set by the @Form() decorator's `submitting` option)
				submitting : PropTypes.bool
			}

			static childContextTypes =
			{
				simpler_redux_form : context_prop_type
			}

			constructor()
			{
				super()

				this.reset_form_invalid_indication = this.reset_form_invalid_indication.bind(this)

				this.submit = this.submit.bind(this)
				this.focus_field = this.focus_field.bind(this)
				this.scroll_to_field = this.scroll_to_field.bind(this)
				this.clear_field = this.clear_field.bind(this)
				this.set_field = this.set_field.bind(this)
			}

			componentWillMount()
			{
				const { initialize_form, initial_values } = this.props

				initialize_form(this.props.id, initial_values)
			}

			componentWillUnmount()
			{
				const { destroy_form } = this.props

				destroy_form(this.props.id)
			}

			getChildContext()
			{
				const context =
				{
					simpler_redux_form: create_context(this)
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

			// Resets invalid indication for the whole form
			reset_form_invalid_indication()
			{
				this.props.reset_form_invalid_indication(this.props.id)
			}

			// Submits the form if it's valid.
			// Otherwise marks invalid fields.
			validate_and_submit(action)
			{
				const
				{
					id,
					fields,
					values,
					errors,
					set_form_validation_passed,
					indicate_invalid_field
				}
				=
				this.props

				// Ignores previous form submission errors until validation passes
				set_form_validation_passed(id, false)

				// Check if there are any invalid fields
				const invalid_fields = Object.keys(fields)
					.filter(field => fields[field])
					.filter(field => errors[field] !== undefined)

				// If all fields are valid, then submit the form
				if (invalid_fields.length === 0)
				{
					// Stop ignoring form submission errors
					set_form_validation_passed(id, true)

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
				indicate_invalid_field(id, invalid_fields[0])

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

			// Focuses on a given form field (used internally + public API)
			focus_field(field)
			{
				this.props.focus_field(this.props.id, field)
			}

			// Scrolls to a form field (used internally + public API)
			scroll_to_field(field)
			{
				this.props.scroll_to_field(this.props.id, field)
			}

			// Clears field value (public API)
			clear_field(field, error)
			{
				this.props.clear_field(this.props.id, field, error)
			}

			// Sets field value (public API)
			set_field(field, value, error)
			{
				this.props.set_field(this.props.id, field, value, error)
			}

			render()
			{
				return createElement(Wrapped_component,
				{
					...this.passed_props(),
					ref    : 'user_form',
					submit : this.submit,
					focus  : this.focus_field,
					scroll : this.scroll_to_field,
					clear  : this.clear_field,
					set    : this.set_field,
					reset_invalid_indication : this.reset_form_invalid_indication
				})
			}
		}

		// A more meaningful React `displayName`
		const wrapped_component_display_name = get_display_name(Wrapped_component)
		Form.displayName = `Form(${wrapped_component_display_name})`

		// Connect the form component to Redux state
		const Connected_form = redux_state_connector(options, wrapped_component_display_name)(Form)

		// Build an outer component
		// with the only purpose
		// to expose instance API methods
		const ReduxForm = build_outer_component(Connected_form)

		// Preserve all static methods and properties
		// defined on the original decorated component
		return hoist_statics(ReduxForm, Wrapped_component)
	}
}

export function get_display_name(Wrapped)
{
	return Wrapped.displayName || Wrapped.name || 'Component'
}