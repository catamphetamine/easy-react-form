export function getPassThroughProps(props, excludeProps)
{
	const rest = {}
	for (const property of Object.keys(props)) {
		if (!excludeProps[property]) {
			rest[property] = props[property]
		}
	}
	return rest
}