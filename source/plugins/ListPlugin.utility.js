import { NOT_FOUND } from '../utility'

const LIST_ITEM_KEY_REGEXP = /^([^:]+):(\d+):([^:]+)$/

/**
 * Converts values having keys `${list}:${i}:${field}`
 * into arrays of objects `{ list: [{ field, ... }, ...] }`.
 *
 * For example, in a form, there's a `<List name="list">` container element
 * and inside that container element there're 3 `<Field name="value"/>` elements.
 *
 * Then, in `values` argument, there'd be 3 fields names corresponding to those list items:
 * * "list:0:value": "a"
 * * "list:1:value": "b"
 * * "list:2:value": "c"
 *
 * After calling this function, a new `values` object is returned
 * where those 3 entries have been replaced with a single entry:
 * * "list": [{ value: "a" }, { value: "c" }]
 *
 * @param {object} values
 * @return {object}
 */
export function convertListValues(values) {
	// `values` are converted to `actualValues`.
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
	// Example:
	// "list:0:value": "a"
	// "list:2:value": "c"
	// Result:
	// "list": [{ value: "a" }, { value: "c" }]
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