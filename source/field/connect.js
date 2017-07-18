import { connect } from 'react-redux'
import { get_configuration } from '../configuration'

export default function redux_state_connector(name, context)
{
	return connect
	(
		(state) =>
		{
			// `context` seems to stay the same
			// while the contents of the `context`
			// seem to be recreated on each `prop`
			// or `state` change of the context provider.
			// https://facebook.github.io/react/docs/context.html#updating-context
			const form_state = state[get_configuration().reducer][context.simpler_redux_form.get_id()]

			const result =
			{
				value                  : form_state.values[name],
				indicate_invalid       : form_state.indicate_invalid[name],
				_focus                 : form_state.focus[name],
				_scroll_to             : form_state.scroll_to[name],
				form_validation_failed : form_state.misc.validation_failed,
				initialized            : true
			}

			return result
		},
		undefined,
		undefined,
		{
			withRef : true
		}
	)
}