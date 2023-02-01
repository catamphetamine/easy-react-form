import React from 'react'
import PropTypes from 'prop-types'

import { Context } from './form'
import { getPassThroughProps } from './utility'

export default function Submit(props) {
	return (
		<Context.Consumer>
			{context => React.createElement(props.component, {
				...getPassThroughProps(props, Submit.propTypes),
				wait: context.state.submitting
			})}
		</Context.Consumer>
	)
}

Submit.propTypes = {
	component: PropTypes.elementType.isRequired
}