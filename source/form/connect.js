import { connect } from 'react-redux'

import { initial_form_state } from '../reducer'

import
{
	initialize_form,
	destroy_form,
	register_field,
	unregister_field,
	update_field_value,
	indicate_invalid_field,
	reset_invalid_indication,
	reset_form_invalid_indication,
	clear_field,
	set_field,
	focus_field,
	focused_field,
	scroll_to_field,
	scrolled_to_field,
	set_form_validation_passed
}
from '../actions'

// Connects the form component to Redux state
export default function redux_state_connector(options, wrapped_component_display_name)
{
	return connect
	(
		(state, props) =>
		{
			// Check for restricted React property names
			// (due to being used by `simpler-redux-form`)
			check_for_reserved_props(props)

			const form_id = get_form_id(options, props, wrapped_component_display_name)

			// These React `props` will be passed
			// to the underlying form component
			let underlying_props

			const form_already_initialized = state.form[form_id] !== undefined

			// If the form has not yet been initialized
			// then emulate its pristine state
			// (it will be initialized later at `componentWillMount()`
			//  which happens after the `constructor()` is called
			//  on the decorated component, which is where
			//  this state mapper fires for the first time)
			if (!form_already_initialized)
			{
				// Initial form state will be like this.
				// `props.values` are the initial form values (optional).
				underlying_props = initial_form_state(props.values)
			}
			// If the form has already been initialized,
			// then copy its state as a new object
			// to prevent mutating Redux state directly
			// (which would not be considered a good practice).
			//
			// And also in order for Redux'es `@connect()` to rerender
			// the decorated component returning a
			// new object from this mapper is required,
			// otherwise it would just see that "prevous_props === new_props"
			// and wouldn't rerender the decorated component,
			// therefore, for example, an updated `submitting` property
			// wouldn't be reflected on the screen.
			//
			else
			{
				underlying_props = { ...state.form[form_id] }
			}

			// Pass form `id`
			underlying_props.id = form_id

			// If `submitting` is set up for this form,
			// then update the submitting status for this form.
			if (options.submitting)
			{
				// Update the submitting status for this form
				underlying_props.submitting = options.submitting(state, props)
			}

			// Return underlying form component props
			return underlying_props
		},
		// Redux `bindActionCreators`
		{
			initialize_form,
			destroy_form,
			register_field,
			unregister_field,
			update_field_value,
			indicate_invalid_field,
			reset_invalid_indication,
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
}

// Get form id
function get_form_id(options, props, wrapped_component_display_name)
{
	// If `id` was set in the decorator options
	if (options.id)
	{
		// `id` can be either a String or a Function of `props`
		return typeof options.id === 'string' ? options.id : options.id(props)
	}

	// camelCase aliasing for `formId` property on the decorated component
	if (props.form_id || props.formId)
	{
		return props.form_id || props.formId
	}

	// @Form() `id` is required
	throw new Error("@Form() `id` property not specified for `simpler-redux-form` decorator for " + wrapped_component_display_name)
}

function check_for_reserved_props(props)
{
	for (let prop of Object.keys(props))
	{
		if (reserved_props.indexOf(prop) >= 0)
		{
			throw new Error(`"${prop}" prop is reserved by simpler-redux-form`)
		}
	}
}

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