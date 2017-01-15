import { connect } from 'react-redux'

export default function redux_state_connector(name, context)
{
	return connect
	(
		// The following connected props aren't derived from Redux `state`,
		// but Redux `@connect()` is still utilised here for forcing
		// the field component to rerender itself when its value changes
		// in the Redux state (or when its invalid indication changes).
		//
		// Why aren't these properties derived from Redux `state`?
		// Actually I don't remember 100% why I did this.
		// But apparently there was a reason to do so.
		//
		(state) =>
		{
			// `context` seems to stay the same
			// while the contents of the `context`
			// seem to be recreated on each `prop`
			// or `state` change of the context provider.
			// https://facebook.github.io/react/docs/context.html#updating-context
			const form = context.simpler_redux_form

			const result =
			{
				value                  : form.get_value(name),
				indicate_invalid       : form.get_indicate_invalid(name),
				_focus                 : form.get_focus(name),
				_scroll_to             : form.get_scroll_to(name),
				form_validation_failed : form.get_form_validation_failed()
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