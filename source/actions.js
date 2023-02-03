// With the current implementation, actions "mutate" the original `state` object
// instead of creating a new one every time.
//
// One rationale is that this way it might theoretically be more performant
// to reuse and "mutate" the existing `state` object instead of creating a new one
// on each keystroke.
//
// The most significant rationale is that mutating the original `state` object directly
// eliminates any potential "race condition" bugs where state changes would be lost.
// Consider two consequtive action calls: one to set a field's value
// and the other one to focus the field. If the original `state` object is mutated,
// no changes are lost. But if a new state object would've been created by each
// of those two actions, the second one would overwrite the changes made by the first one.

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

		const validationError = validate(value)

		// Only initializes the field with its default `value`
		// if it hasn't been seen before.
		state.values[field] = value
		state.validationErrors[field] = validationError

		state.errors[field] = error
		state.showErrors[field] = Boolean(error || validationError)
	}
	else
	{
		state.fields[field]++
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
	const validationError = state.validationErrors[field]

	state.errors[field] = error
	state.showErrors[field] = Boolean(validationError || error)
}

// Sets field validation `error`.
export const setFieldValidationError = (field, validationError) => state =>
{
	const error = state.errors[field]

	state.validationErrors[field] = validationError
	state.showErrors[field] = Boolean(validationError || error)
}

export const fieldFocused = (field) => state =>
{
	state.latestFocusedField = field
}

export const setFormSubmitting = (submitting) => state =>
{
	state.submitting = submitting
}

export const setFormSubmitAttempted = (submitAttempted) => state =>
{
	state.submitAttempted = submitAttempted
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