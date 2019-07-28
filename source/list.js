import React from 'react'
import PropTypes from 'prop-types'
import createContext from 'create-react-context'

import { Context } from './form'
import { getFieldName } from './plugins/ListPlugin.utility'

export default function List_(props) {
	return (
		<Context.Consumer>
			{context => (
				<List {...props} context={context}/>
			)}
		</Context.Consumer>
	)
}

class List extends React.Component {
	constructor(props) {
		super(props)
		const {  name } = this.props
		const items = this.getInitialItems()
		this.state = {
			context: {
				getFieldName: this.getFieldName,
				onRegisterField: this.onRegisterField
			},
			items,
			itemsCounter: items.length
		}
	}

	getInitialItems() {
		const { context, name, count } = this.props
		if (context.initialValues[name]) {
			return createIndexArray(context.initialValues[name].length)
		}
		return createIndexArray(count)
	}

	getFieldName = (i, name) => {
		if (typeof i !== 'number') {
			throw new Error('Each `<Feild/>` in a `<List/>` must have an `i` property')
		}
		return getFieldName(this.props.name, i, name)
	}

	onRegisterField = (name) => {
		if (!this.firstFieldName) {
			this.firstFieldName = name
		}
	}

	onReset = () => {
		const items = this.getInitialItems()
		this.setState({
			items,
			itemsCounter: items.length
		})
	}

	add = () => {
		const { context } = this.props
		const { items, itemsCounter } = this.state
		this.setState({
			itemsCounter: itemsCounter + 1,
			items: items.concat([itemsCounter])
		}, () => {
			const { name } = this.props
			if (this.firstFieldName) {
				context.focus(`${name}:${itemsCounter}:${this.firstFieldName}`)
			}
		})
	}

	remove = (i) => {
		const { items } = this.state
		this.setState({
			items: items.filter(_ => _ !== i)
		})
	}

	map = (func) => {
		const { items } = this.state
		return items.map(i => func(i))
	}

	render() {
		const { children } = this.props
		const { context: listContext } = this.state
		return (
			<Context.Consumer>
				{context => (
					<ListContext.Provider value={listContext}>
						{children({
							map: this.map,
							add: this.add,
							remove: this.remove
						})}
					</ListContext.Provider>
				)}
			</Context.Consumer>
		)
	}
}

List.propTypes = {
	name: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
	context: PropTypes.object.isRequired,
	children: PropTypes.func.isRequired
}

List.defaultProps = {
	count: 1
}

export const ListContext = createContext()

function createIndexArray(size) {
	const array = new Array(size)
	let i = 0
	while (i < size) {
		array[i] = i
		i++
	}
	return array
}

export const listContextPropType = PropTypes.shape({
	getFieldName: PropTypes.func.isRequired,
	onRegisterField: PropTypes.func.isRequired
})