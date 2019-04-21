import scrollIntoView from 'scroll-into-view-if-needed'

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