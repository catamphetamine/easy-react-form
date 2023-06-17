// This file is not currently used.
// See the comments in `actions.js` for more info on why.

export const registerField = ({ field, value, validate }) => state =>
{
	// Uses a numerical counter instead of a boolean.
	// https://github.com/erikras/redux-form/issues/1705
	// If the value is `0` then it means that the field
	// has been previously initialized so not reinitializing it.
	// This also preserves the initial value of the field.
	// Because a user may choose some value which would result in
	// a couple of new form fields to appear above this field,
	// and so React unmounts this field only to later mount it again
	// a couple of new form fields lower.
	// So this trick retains the field's state (including value).
	if (state.fields[field] === undefined)
	{
		const error = validate(value)

		return {
			...state,
			fields: {
				...state.fields,
				[field]: 1
			},
			values: {
				...state.values,
				// Only initializes the field with its default `value`
				// if it hasn't been seen before.
				[field]: value
			},
			errors: {
				...state.errors,
				[field]: error
			}
		}
	}

	return {
		...state,
		fields: {
			...state.fields,
			[field]: state.fields[field] + 1
		}
	}
}

export const unregisterField = (field) => state =>
{
	// This library uses a numerical counter for tracking a field's "presence" status.
	// https://github.com/erikras/redux-form/issues/1705
	//
	// The reason is that React re-uses existing (mounted) components
	// when their properties change, resulting in situtations when
	// a field gets inserted or removed from the list of fields
	// causing a wave of "unregister"/"register" events.
	//
	// For example:
	//
	// <Field name="one"/>
	// <Field name="two"/>
	// <Field name="three"/>
	//
	// At some point becomes:
	//
	// <Field name="one"/>
	// <Field name="four"/>
	// <Field name="two"/>
	//
	// In that case, React:
	// * Re-purposes `<Field name="two"/>` for rendering `<Field name="four"/>`
	// * Re-purposes `<Field name="three"/>` for rendering `<Field name="two"/>`
	//
	// The first of the two results in "unregiser"-ing `<Field name="two"/>`.
	// The second of the two results in re-"regiser"-ing `<Field name="two"/>`.
	//
	// In order for `<Field name="two"/>` value to not get lost, it has to be retained
	// after it gets "unregister"-ed.
	//
	// So even if the registration counter for a field becomes equal to `0`,
	// it's still not destroyed, because it could reappear at some other position in the form.
	//
	return {
		...state,
		fields: {
			...state.fields,
			[field]: state.fields[field] - 1
		}
	}
}

// Sets field `value`.
// (e.g. `this.form.set(field, value)`).
export const setFieldValue = (field, value) => state =>
{
	return {
		...state,
		values: {
			...state.values,
			[field]: value
		}
	}
}

// Sets field `error`.
export const setFieldError = (field, error) => state =>
{
	return {
		...state,
		errors: {
			...state.errors,
			[field]: error
		}
	}
}

export const fieldFocused = (field) => state =>
{
	return {
		...state,
		latestFocusedField: field
	}
}

export const setFormSubmitting = (submitting) => state =>
{
	return {
		...state,
		submitting
	}
}

export const setFormSubmitAttempted = (submitAttempted) => state =>
{
	return {
		...state,
		submitAttempted
	}
}

export const removeField = (field) => state => {
	return {
		...state,
		fields: {
			...state.fields,
			[field]: undefined
		},
		values: {
			...state.values,
			[field]: undefined
		},
		errors: {
			...state.errors,
			[field]: undefined
		},
		latestFocusedField: state.latestFocusedField === field ? undefined : state.latestFocusedField
	}
}