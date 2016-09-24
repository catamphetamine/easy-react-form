import { Component, createElement, PropTypes } from 'react'
import { connect } from 'react-redux'

import { context_prop_type } from './form'

// <Submit
// 	component={Button}/>
//
export default class Submit extends Component
{
	static propTypes =
	{
		component : PropTypes.oneOfType([ PropTypes.func, PropTypes.string ]).isRequired
	}

	static contextTypes =
	{
		simpler_redux_form : context_prop_type
	}

	render()
	{
		const { component, ...rest_props } = this.props

		return createElement(component,
		{
			...rest_props,
			busy : this.context.simpler_redux_form.is_submitting()
		})
	}
}