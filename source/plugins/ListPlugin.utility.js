import { NOT_FOUND } from '../utility'

const LIST_ITEM_KEY_REGEXP = /^([^:]+):(\d+):([^:]+)$/

/**
 * Converts values having keys `${list}:${i}:${field}`
 * into arrays of objects `{ list: [{ field, ... }, ...] }`.
 * @param {object} values
 * @return {object}
 */
export function convertListValues(values) {
	const actualValues = {}
	const listNames = []
	for (const key of Object.keys(values)) {
		const value = values[key]
		const match = key.match(LIST_ITEM_KEY_REGEXP)
		if (match) {
			const [
				unused,
				list,
				index,
				name
			] = match
			if (!actualValues[list]) {
				actualValues[list] = []
			}
			if (!actualValues[list][index]) {
				actualValues[list][index] = {}
			}
			actualValues[list][index][name] = value
			if (listNames.indexOf(list) < 0) {
				listNames.push(list)
			}
		} else {
			actualValues[key] = value
		}
	}
	// Compact lists: remove removed items.
	// When an item is removed indexes are not shifted.
	for (const listName of listNames) {
		actualValues[listName] = actualValues[listName].filter(_ => _)
	}
	return actualValues
}

/**
 * Gets a value by path `${list}:${i}:${field}`
 * from an object having shape `{ list: [{ field, ... }, ...] }`.
 * @param {object} values
 * @param {string} key
 * @return {any} Returns `NOT_FOUND` if the value wasn't found.
 */
export function getListValue(values, key) {
	const match = key.match(LIST_ITEM_KEY_REGEXP)
	if (match) {
		const [
			unused,
			list,
			index,
			name
		] = match
		return values[list] && values[list][index] && values[list][index][name]
	}
	return NOT_FOUND
}

export function getFieldName(listName, i, name) {
	return `${listName}:${i}:${name}`
}