import React from 'react'
import PropTypes from 'prop-types'

import { Context } from './form.js'
import { getFieldName } from './plugins/ListPlugin.utility.js'

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

		this.state = {
			listContext: {
				getFieldNameInsideList: this.getFieldName,
				onRegisterFieldInsideList: this.onRegisterField
			},
			state: this.getInitialListState()
		}
	}

	componentDidMount() {
		const { name, context } = this.props
		context.onRegisterList(name, {
			onReset: this.reset,
			state: this.getListState()
		})
	}

	componentWillUnmount() {
		const { name, context } = this.props
		context.onUnregisterList(name)
	}

	reset = () => {
		this.setListState(this.getInitialListState())
	}

	getInitialItems() {
		const { context, name, count } = this.props
		// console.error(`[easy-react-form] \`initialState\` doesn't include the state for list "${name}"`)
		const initialListValue = context.state.initialValues[name]
		if (initialListValue) {
			return createItemIdsArray(initialListValue.length)
		}
		return createItemIdsArray(count)
	}

	getInitialListState() {
		// Get list initial state from the form's `initialState`.
		const { context, name } = this.props
		if (context.state.lists[name]) {
			if (context.state.listInstanceCounters[name] > 0) {
				return context.state.lists[name]
			}
		}

		// Create list initial state.
		const items = this.getInitialItems()
		return {
			items,
			maxItemId: items[items.length - 1]
		}
	}

	getFieldName = (itemId, name) => {
		if (typeof itemId !== 'number') {
			throw new Error('Each `<Feild/>` in a `<List/>` must have an `item` property')
		}
		return getFieldName(this.props.name, itemId, name)
	}

	onRegisterField = (name) => {
		if (!this.firstFieldName) {
			this.firstFieldName = name
		}
	}

	add = () => {
		const { context } = this.props
		const { items, maxItemId } = this.getListState()
		const itemId = maxItemId + 1
		this.setListState({
			maxItemId: itemId,
			items: items.concat([itemId])
		}, () => {
			if (this.firstFieldName) {
				context.focus(this.getFieldName(itemId, this.firstFieldName))
			}
		})
	}

	remove = (itemId) => {
		const { items, maxItemId } = this.getListState()
		this.setListState({
			maxItemId,
			items: items.filter(_ => _ !== itemId)
		})
	}

	map = (func) => {
		const { items } = this.getListState()
		return items.map((item, i) => func(item, i))
	}

	getListState() {
		return this.state.state
	}

	setListState(state, callback) {
		const { context, name } = this.props
		context.onListStateChange(name, state)
		this.setState({ state }, callback)
	}

	getListContext() {
		return this.state.listContext
	}

	render() {
		const { children } = this.props
		return (
			<Context.Consumer>
				{context => (
					<ListContext.Provider value={this.getListContext()}>
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

export const ListContext = React.createContext()

function createItemIdsArray(size) {
	const array = new Array(size)
	let i = 0
	while (i < size) {
		array[i] = i
		i++
	}
	return array
}

export const listContextPropType = PropTypes.shape({
	getFieldNameInsideList: PropTypes.func.isRequired,
	onRegisterFieldInsideList: PropTypes.func.isRequired
})