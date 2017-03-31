import { PropTypes } from 'react'

const create_context = (form) =>
({
	// Is submit in progress
	is_submitting()
	{
		return form.state.submitting || form.props.submitting
	},

	// Registers field (used because React optimizes rerendering process)
	register_field(field, value, validate, non_validation_error)
	{
		form.register_field(field, value, validate)
		form.props.register_field(form.props.id, field, value, validate, non_validation_error)
	},

	// Unregisters field (used because React optimizes rerendering process)
	unregister_field(field)
	{
		form.unregister_field(field)
		form.props.unregister_field(form.props.id, field)
	},

	// Field `onChange` handler fires
	update_field_value(field, value, error)
	{
		form.props.update_field_value(form.props.id, field, value, error)
	},

	// Enables invalid field indication
	indicate_invalid_field(field)
	{
		form.props.indicate_invalid_field(form.props.id, field)
	},

	// Resets invalid indication for a field
	reset_invalid_indication(field)
	{
		form.props.reset_invalid_indication(form.props.id, field)
	},

	// Returns form values
	get_value(field)
	{
		return form.props.values[field]
	},

	// Returns form initial values
	get_initial_value(field)
	{
		return form.props.initial_values[field]
	},

	// Invalid field indication
	get_indicate_invalid(field)
	{
		return form.props.indicate_invalid[field]
	},

	// Focusing on a field
	get_focus(field)
	{
		return form.props.focus[field]
	},

	// Scrolling to form fields
	get_scroll_to(field)
	{
		return form.props.scroll_to[field]
	},

	// Focuses on a form field
	focus_field(field)
	{
		return form.props.focus_field(form.props.id, field)
	},

	// Scrolls to a form field
	scroll_to_field(field)
	{
		return form.props.scroll_to_field(form.props.id, field)
	},

	// Did form validation pass
	get_form_validation_failed()
	{
		return form.props.misc.validation_failed
	},

	// Focus on a field was requested and was performed
	focused_field(field)
	{
		form.props.focused_field(form.props.id, field)
	},

	// Scroll to a form field was requested and was performed
	scrolled_to_field(field)
	{
		form.props.scrolled_to_field(form.props.id, field)
	},

	// Returns this form ID.
	// Is used when connecting a form field to Redux state.
	get_id()
	{
		return form.props.id
	}
})

export default create_context

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
	scrolled_to_field        : PropTypes.func.isRequired,
	focus_field              : PropTypes.func.isRequired,
	scroll_to_field          : PropTypes.func.isRequired
})
.isRequired
