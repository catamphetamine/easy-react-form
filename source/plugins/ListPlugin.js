import {
	getListValue,
	convertListValues
} from './ListPlugin.utility'

export default class ListPlugin {
	getValues(values) {
		// Convert list value keys having format
		// `${list}:${index}:${field}` to arrays of objects.
		return convertListValues(values)
	}

	getValue(values, key) {
		return getListValue(values, key)
	}
}