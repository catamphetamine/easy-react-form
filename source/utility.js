import scrollIntoView from 'scroll-into-view-if-needed'

export const NOT_FOUND = {}

export function getPassThroughProps(props, excludeProps) {
	const rest = {}
	for (const property of Object.keys(props)) {
		if (!excludeProps[property]) {
			rest[property] = props[property]
		}
	}
	return rest
}

export function scrollTo(node, options) {
	// https://github.com/stipsan/scroll-into-view-if-needed/issues/359
	// scrollIntoView(ReactDOM.findDOMNode(this.field.current), false, { duration: 300 })
	// Using `block: "center"` instead of `block: "nearest"`
	// because otherwise the `node` might be obstructed by a "floating" header.
	// https://github.com/stipsan/scroll-into-view-if-needed/issues/126#issuecomment-533089870
	scrollIntoView(node, {
		scrollMode: 'if-needed',
		behavior: 'smooth',
		block: 'center',
		inline: 'nearest',
		duration: options && options.duration
	})
}

/**
 * Selects only the values for non-removed fields:
 * removes fields thats have `0` field counter.
 *
 * Filters `values` object to contain only the "registered" fields' entries.
 * Because if a field is "unregistered", it means that the React element
 * was removed in the process, and therefore that field's entry shouldn't
 * exist in the returned `values` object.
 *
 * Values for "unregistered" fields don't get cleared from form's `values` by default
 * because of how React rendering works with unmounting and then re-mounted elements.
 *
 * @param  {object} values
 * @param  {object} fields
 * @return {object}
 */
export function getValues(values, fields) {
	const nonRemovedFieldValues = {}
	for (const key of Object.keys(values)) {
		if (fields[key]) {
			nonRemovedFieldValues[key] = values[key]
		}
	}
	return nonRemovedFieldValues
}

export function getValue(values, key) {
	return values[key]
}

// `MAX_SAFE_INTEGER` is not supported by older browsers
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53)
export function getNext(counter) {
	if (counter < MAX_SAFE_INTEGER) {
		return counter + 1
	} else {
		return 0
	}
}