import { Component, createElement } from 'react'

// Build an outer component
// with the only purpose
// to expose instance API methods
export default function build_outer_component(Connected_form)
{
	return class ReduxForm extends Component
	{
		constructor()
		{
			super()

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
}