import {
	getListValue,
	convertListValues,
	removeListAction
} from './ListPlugin.utility.js'

export default class ListPlugin {
	// Tracks `<List/>`s.
	lists = {}

	getContextFunctions() {
		return {
			onRegisterList: ({ updateState }) => (name, { onReset, state: listState }) => {
				this.lists[name] = { onReset }
				updateState((state) => {
					if (state.listInstanceCounters[name] === undefined) {
						state.listInstanceCounters[name] = 1
					} else {
						state.listInstanceCounters[name]++
					}
					state.lists[name] = listState
				})
			},
			onUnregisterList: ({ updateState }) => (name) => {
				this.lists[name] = undefined
				// Doesn't reset the list's `state` in form state
				// because the list might get re-mounted at some other position
				// in the document during the ongoing React re-render.
				updateState((state) => {
					// Doesn't create a new `state` object.
					// Instead it "mutates" the original one.
					// The rationale is provided in `actions.js`.
					state.listInstanceCounters[name]--
				})
			},
			onListStateChange: ({ updateState }) => (name, newState) => {
				updateState((state) => {
					// Doesn't create a new `state` object.
					// Instead it "mutates" the original one.
					// The rationale is provided in `actions.js`.
					state.lists[name] = newState
				})
			}
		}
	}

	getInitialState(state) {
		return {
			...state,
			lists: {},
			listInstanceCounters: {}
		}
	}

	getValues(values) {
		// In `values`, replace all entries having keys `${list}:${index}:${field}`
		// with a single `${list}` entry being an array of objects with keys `${field}`.
		return convertListValues(values)
	}

	getValue(values, key) {
		return getListValue(values, key)
	}

	onResetField(name, form) {
		if (this.lists[name]) {
			const { fields } = form.getState()
			for (const field of Object.keys(fields)) {
				if (field.indexOf(`${name}:`) === 0) {
					form.resetField(field)
				}
			}
			this.lists[name].onReset()
			return true
		}
	}

	onUpdate({ getState, dispatch }) {
		const { listInstanceCounters } = getState()
		for (const name of Object.keys(listInstanceCounters)) {
			// Remove unmounted `<List/>`s.
			if (listInstanceCounters[name] === 0) {
				dispatch(removeListAction(name))
			}
		}
	}
}