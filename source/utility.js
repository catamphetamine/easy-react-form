import scrollIntoView from 'scroll-into-view-if-needed'

import {
	LIST_VALUE_NOT_FOUND,
	getListValue,
	convertListValues
} from './utility.list'

export function getPassThroughProps(props, excludeProps) {
	const rest = {}
	for (const property of Object.keys(props)) {
		if (!excludeProps[property]) {
			rest[property] = props[property]
		}
	}
	return rest
}

export function scrollTo(node) {
	// https://github.com/stipsan/scroll-into-view-if-needed/issues/359
	// scrollIntoView(ReactDOM.findDOMNode(this.field.current), false, { duration: 300 })
	scrollIntoView(node, {
		scrollMode : 'if-needed',
		behavior   : 'smooth',
		block      : 'nearest',
		inline     : 'nearest'
	})
}

export function getValues(values, fields) {
	// Select only values for non-removed fields.
	// Removed fields have `0` field counter.
	const existingValues = {}
	for (const key of Object.keys(values)) {
		if (fields[key]) {
			existingValues[key] = values[key]
		}
	}
	// Convert list value keys having format
	// `${list}:${index}:${field}` to arrays of objects.
	return convertListValues(existingValues)
}

export function getValue(values, key) {
	const listValue = getListValue(values, key)
	if (listValue !== LIST_VALUE_NOT_FOUND) {
		return listValue
	}
	return values[key]
}
