export const registerField = ({ field, value, validate, error }) => state =>
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

		// Only initializes the field with its default `value`
		// if it hasn't been seen before.
		state.values[field] = value
		state.validationErrors[field] = validate(value)

		if (error) {
			state.errors[field] = error
			state.showErrors[field] = true
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

// Sets field `value`.
// (e.g. `this.form.set(field, value)`).
export const setFieldValue = (field, value) => state =>
{
	state.values[field] = value
}

// Sets field externally-set `error`.
export const setFieldError = (field, error) => state =>
{
	state.errors[field] = error
	state.showErrors[field] = Boolean(state.validationErrors[field] || state.errors[field])
}

// Sets field validation `error`.
export const setFieldValidationError = (field, error) => state =>
{
	state.validationErrors[field] = error
	state.showErrors[field] = Boolean(state.validationErrors[field] || state.errors[field])
}

export const fieldFocused = (field) => state =>
{
	state.latestFocusedField = field
}

export const setFormSubmitting = (submitting) => state =>
{
	state.submitting = submitting
}

export const showFieldError = (field) => state =>
{
	state.showErrors[field] = true
}

export const removeField = (field) => state => {
	delete state.fields[field]
	delete state.values[field]
	delete state.errors[field]
	delete state.validationErrors[field]
	delete state.showErrors[field]
	if (state.latestFocusedField === field) {
		state.latestFocusedField = undefined
	}
}