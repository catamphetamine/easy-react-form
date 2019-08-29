import {
	getListValue,
	convertListValues
} from './ListPlugin.utility'

export default class ListPlugin {
	// Tracks `<List/>`s.
	lists = {}

	initContext(context) {
		context.onRegisterList = (name, { onReset }) => {
			this.lists[name] = { onReset }
		}
	}

	getValues(values) {
		// Convert list value keys having format
		// `${list}:${index}:${field}` to arrays of objects.
		return convertListValues(values)
	}

	getValue(values, key) {
		return getListValue(values, key)
	}

	onResetField(name, form) {
		if (this.lists[name]) {
			const { fields } = form.state
			for (const field of Object.keys(fields)) {
				if (field.indexOf(`${name}:`) === 0) {
					form.resetField(field)
				}
			}
			this.lists[name].onReset()
			return true
		}
	}
}