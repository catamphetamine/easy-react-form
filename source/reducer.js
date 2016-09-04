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
				[action.form] : initial_form_state()
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

		case '@@simpler-redux-form/initialize-field':

			// if (state[action.form].values[action.field] !== undefined)
			// {
			// 	throw new Error(`Form "${action.form}" field "${action.field}" has already been initialized.`)
			// }

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
			// 		}
			// 	}
			// }

			state = { ...state }

			form_state.values[action.field] = action.value
			form_state.errors[action.field] = action.error

			return state

		case '@@simpler-redux-form/destroy-field':

			// It will have been already initialized on the server-side
			// if (state[action.form].values[action.field] === undefined)
			// {
			// 	throw new Error(`Form "${action.form}" field "${action.field}" has already been destroyed.`)
			// }

			if (!state[action.form])
			{
				return state
			}

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
			// 			...form_state.values
			// 		},
			// 		errors:
			// 		{
			// 			...form_state.errors
			// 		},
			// 		indicate_invalid:
			// 		{
			// 			...form_state.indicate_invalid
			// 		}
			// 	}
			// }

			state = { ...state }

			delete state[action.form].values[action.field]
			delete state[action.form].errors[action.field]
			delete state[action.form].indicate_invalid[action.field]

			if (form_state.focus[action.field])
			{
				delete state[action.form].focus[action.field]
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

			// This changes [action.form] object's properties,
			// and therefore Redux'es shallow compare
			// rerenders the form every time.
			//
			// state =
			// {
			// 	...state,
			// 	...
			// }

			state = { ...state }

			form_state.indicate_invalid[action.field] = false

			return state

		case '@@simpler-redux-form/focus':

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
			// 		focus:
			// 		{
			// 			[action.field] : true
			// 		}
			// 	}
			// }

			state = { ...state }

			for (let field of Object.keys(form_state.focus))
			{
				delete form_state.focus[field]
			}

			form_state.focus[action.field] = true

			return state

		case '@@simpler-redux-form/focused':

			// This changes [action.form] object's properties,
			// and therefore Redux'es shallow compare
			// rerenders the form every time.
			//
			// state =
			// {
			// 	...state,
			// 	...
			// }

			state = { ...state }

			for (let field of Object.keys(form_state.focus))
			{
				delete form_state.focus[field]
			}

			return state

		case '@@simpler-redux-form/validation-passed':

			// This changes [action.form] object's properties,
			// and therefore Redux'es shallow compare
			// rerenders the form every time.
			//
			// state =
			// {
			// 	...state,
			// 	...
			// }

			state = { ...state }

			form_state.misc.validation_failed = !action.passed

			return state

		default:
			return state
	}
}

export function initial_form_state()
{
	const state =
	{
		values           : {},
		errors           : {},
		indicate_invalid : {},
		focus            : {},
		misc             : {}
	}

	return state
}