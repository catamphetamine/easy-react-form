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

export function getValues(values, fields) {
	// Select only values for non-removed fields.
	// Removed fields have `0` field counter.
	const existingValues = {}
	for (const key of Object.keys(values)) {
		if (fields[key]) {
			existingValues[key] = values[key]
		}
	}
	return existingValues
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