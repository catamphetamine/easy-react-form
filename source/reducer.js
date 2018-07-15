export default function reducer(state = {}, action)
{
	// Temporary debugging
	// console.log('Action', action)
	// console.log('Previous state', state)

	const form_state = state[action.form]

	switch (action.type)
	{
		case '@@simpler-redux-form/initialize':

			// It will have been already initialized on the server-side
			// if (state[action.form] !== undefined)
			// {
			// 	throw new Error(`Form "${action.form}" has already been initialized.`)
			// }

			state =
			{
				...state,
				[action.form] : initial_form_state(action.values)
			}

			return state

		case '@@simpler-redux-form/destroy':

			// if (state[action.form] === undefined)
			// {
			// 	throw new Error(`Form "${action.form}" has already been destroyed.`)
			// }

			state = { ...state }

			delete state[action.form]

			return state

		case '@@simpler-redux-form/register-field':

			state = { ...state }

			// Uses a numerical counter instead of a boolean.
			// https://github.com/erikras/redux-form/issues/1705
			// If the value is `0` then it means that the field
			// has been previously initialized so not reinitializing it.
			// This also preserves the initial value of the field.
			if (form_state.fields[action.field] === undefined)
			{
				form_state.fields[action.field] = 1

				const field_value = action.value !== undefined ? action.value : form_state.initial_values[action.field]
				const field_error = action.validate(field_value)

				// Only initializes the field with its default value
				// if it hasn't been seen before.
				// Otherwise will initialize the field with its current value.
				form_state.values[action.field] = field_value
				form_state.errors[action.field] = field_error

				form_state.initial_values[action.field]       = field_value
				form_state.initial_value_errors[action.field] = field_error

				// If an external error was specified, then show it
				if (action.non_validation_error)
				{
					form_state.indicate_invalid[action.field] = true
				}
			}
			else
			{
				form_state.fields[action.field]++
			}

			return state

		case '@@simpler-redux-form/unregister-field':

			// Seems that a form gets destroyed before its fields,
			// so `form_state` could be undefined (probably).
			if (form_state)
			{
				state = { ...state }

				if (!form_state.fields[action.field])
				{
					console.error(`Warning: An "unregister field" request was sent for field "${action.field}" which is not currently registered. This is a bug and it needs to be reported: https://github.com/catamphetamine/simpler-redux-form/issues`)
				}

				// Uses a numerical counter instead of a boolean.
				// https://github.com/erikras/redux-form/issues/1705
				form_state.fields[action.field]--

				// Even if the registration counter for a field
				// becomes equal to `0` it's still not destroyed,
				// because theoretically it could correspond to a new field
				// being added in the beginning of the field list
				// therefore causing all field to unregister and then register again.
				// If those fields were destroyed then their values would be lost.
				// In almost all cases the decision to not delete the field info is not a memory leak
				// because all fields finally get destroyed when the form is unmounted
				// and also almost all forms don't ever unmount fields.
			}

			return state

		case '@@simpler-redux-form/changed':

			// This changes [action.form] object's properties,
			// and therefore Redux'es shallow compare
			// rerenders the form every time.
			//
			// state =
			// {
			// 	...state,
			// 	[action.form]:
			// 	{
			// 		...form_state,
			// 		values:
			// 		{
			// 			...form_state.values,
			// 			[action.field] : action.value
			// 		},
			// 		errors:
			// 		{
			// 			...form_state.errors,
			// 			[action.field] : action.error
			// 		},
			// 		indicate_invalid:
			// 		{
			// 			...form_state.indicate_invalid,
			// 			[action.field] : false
			// 		}
			// 	}
			// }

			state = { ...state }

			form_state.values[action.field]           = action.value
			form_state.errors[action.field]           = action.error
			form_state.indicate_invalid[action.field] = false

			return state

		case '@@simpler-redux-form/indicate-invalid':

			// This changes [action.form] object's properties,
			// and therefore Redux'es shallow compare
			// rerenders the form every time.
			//
			// state =
			// {
			// 	...state,
			// 	[action.form]:
			// 	{
			// 		...form_state,
			// 		indicate_invalid:
			// 		{
			// 			...form_state.indicate_invalid,
			// 			[action.field] : true
			// 		}
			// 	}
			// }

			state = { ...state }

			form_state.indicate_invalid[action.field] = true

			return state

		case '@@simpler-redux-form/dont-indicate-invalid':

			state = { ...state }

			form_state.indicate_invalid[action.field] = false

			return state

		case '@@simpler-redux-form/set':

			state = { ...state }

			form_state.values[action.field]           = action.value
			form_state.errors[action.field]           = action.error
			form_state.indicate_invalid[action.field] = action.error ? true : false

			return state

		case '@@simpler-redux-form/focus':

			state = { ...state }

			for (let field of Object.keys(form_state.focus))
			{
				delete form_state.focus[field]
			}

			form_state.focus[action.field] = true

			return state

		case '@@simpler-redux-form/focused':

			state = { ...state }

			for (let field of Object.keys(form_state.focus))
			{
				delete form_state.focus[field]
			}

			return state

		case '@@simpler-redux-form/scroll':

			state = { ...state }

			for (let field of Object.keys(form_state.scroll_to))
			{
				delete form_state.scroll_to[field]
			}

			form_state.scroll_to[action.field] = true

			return state

		case '@@simpler-redux-form/scrolled':

			state = { ...state }

			for (let field of Object.keys(form_state.scroll_to))
			{
				delete form_state.scroll_to[field]
			}

			return state

		case '@@simpler-redux-form/on-field-focused':

			state = { ...state }

			form_state.misc.latest_focused_field = action.field

			return state

		case '@@simpler-redux-form/validation-passed':

			state = { ...state }

			form_state.misc.validation_failed = !action.passed

			return state

		case '@@simpler-redux-form/reset-invalid-indication':

			state = { ...state }

			for (let field of Object.keys(form_state.indicate_invalid))
			{
				form_state.indicate_invalid[field] = false
				// delete form_state.indicate_invalid[field]
			}

			form_state.misc.validation_failed = false

			return state

		default:
			return state
	}
}

export function initial_form_state(initial_values = {})
{
	return {
		// Whether the form has been "initialized".
		// The form is considered "initialized"
		// when all its fields have been initialized
		// which is some time after it has been created,
		// and which is some time after the first `@connect()` is called.
		initialized : false,

		// All form `<Field/>`s
		fields : {},

		// All form `<Field/>` values
		values : {},

		// Initial form `<Field/>` values
		initial_values,

		// `validate()` results for initial form `<Field/>` values
		initial_value_errors : {},

		// `validate()` results for current form `<Field/>` values
		errors : {},

		// Whether `validate()` errors for current form `<Field/>` values should be displayed
		indicate_invalid : {},

		// If a `<Field/>` is being focused programmatically then
		// the `focus` object contains `<Field/>` `name` set to `true`.
		focus : {},

		// If a `<Field/>` is being scrolled to programmatically then
		// the `scroll_to` object contains `<Field/>` `name` set to `true`.
		scroll_to : {},

		// Form properties which should not trigger re-`render()`ing are kept here.
		misc :
		{
			// Whether `validate()`s for all form `<Field/>`s pass
			validation_failed : undefined,
			
			// Is used for tracking abandoned forms in Google Analytics
			latest_focused_field : undefined
		}
	}
}