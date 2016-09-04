export const initialize_form = (form) =>
({
	type : '@@simpler-redux-form/initialize',
	form
})

export const destroy_form = (form) =>
({
	type : '@@simpler-redux-form/destroy',
	form
})

export const update_field_value = (form, field, value, error) =>
({
	type : '@@simpler-redux-form/changed',
	form,
	field,
	value,
	error
})

export const initialize_field = (form, field, value, error) =>
({
	type : '@@simpler-redux-form/initialize-field',
	form,
	field,
	value,
	error
})

export const destroy_field = (form, field) =>
({
	type : '@@simpler-redux-form/destroy-field',
	form,
	field
})

export const indicate_invalid_field = (form, field) =>
({
	type : '@@simpler-redux-form/indicate-invalid',
	form,
	field
})

export const reset_invalid_indication = (form, field) =>
({
	type : '@@simpler-redux-form/dont-indicate-invalid',
	form,
	field
})

export const focus_field = (form, field) =>
({
	type : '@@simpler-redux-form/focus',
	form,
	field
})

export const focused_field = (form, field) =>
({
	type : '@@simpler-redux-form/focused',
	form,
	field
})

export const set_form_validation_passed = (form, passed) =>
({
	type : '@@simpler-redux-form/validation-passed',
	form,
	passed
})