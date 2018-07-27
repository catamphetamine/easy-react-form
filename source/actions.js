export const registerField = (field, value, validate, error) => state =>
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
		state.fields[field] = 1

		// Only initializes the field with its default value
		// if it hasn't been seen before.
		// Otherwise will initialize the field with its current value.
		state.values[field] = value === undefined ? state.initialValues[field] : value
		state.errors[field] = validate(state.values[field])

		// Stores the initial value for this field.
		// Is used later when calling `reset()` to reset the form.
		state.initialValues[field] = state.values[field]
		// state.initialValueErrors[field] = state.errors[field]

		// If an externally set `error` was passed then show it.
		if (error) {
			state.indicateInvalid[field] = true
		}
	}
	else
	{
		state.fields[field]++
	}
}

export const unregisterField = (field) => state =>
{
	// Uses a numerical counter instead of a boolean.
	// https://github.com/erikras/redux-form/issues/1705
	// Even if the registration counter for a field
	// becomes equal to `0` it's still not destroyed,
	// because theoretically it could be a new field
	// being added in the beginning of the form
	// therefore causing all field to unregister and then register again.
	// If those fields were destroyed then their values would be lost.
	state.fields[field]--
}

// The user edits field value.
export const updateFieldValue = (field, value, error) => state =>
{
	state.values[field] = value
	state.errors[field] = error
	// The user is currently editing this field
	// so don't show the validation error yet.
	state.indicateInvalid[field] = false
}

// Manually set field value.
// (e.g. `this.form.set(field, value)`).
export const setFieldValue = (field, value, error) => state =>
{
	state.values[field] = value
	state.errors[field] = error
	state.indicateInvalid[field] = error ? true : false
}

export const fieldFocused = (field) => state =>
{
	state.latestFocusedField = field
}

export const setFieldIndicateInvalid = (field, indicateInvalid) => state =>
{
	state.indicateInvalid[field] = indicateInvalid
}

export const resetFormInvalidIndication = () => state =>
{
	state.indicateInvalid = {}
}

export const setFormSubmitting = (submitting) => state =>
{
	state.submitting = submitting
}

export const setFormValid = (valid) => state =>
{
	state.valid = valid
}