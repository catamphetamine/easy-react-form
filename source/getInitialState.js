export default function getInitialState(initialValues = {}) {
	return {
		// `mounted`/`unmounted` counters for each form field.
		fields : {},

		// Current form field values.
		values : {},

		// Initial form field values.
		initialValues,

		// Externally set `error`s on form fields.
		errors : {},

		// The results of `validate()` functions called on
		// the corresponding form field `value`s.
		validationErrors : {},

		// Whether should show field errors.
		showErrors : {},

		// Is used for tracking abandoned forms for Google Analytics.
		latestFocusedField : undefined,

		// If `onSubmit` returns a `Promise` (or is `async/await`)
		// then `submitting` will be `true` until `onSubmit` finishes.
		submitting : false,

		// Once the user clicks the "Submit" button, this flag becomes `true`.
		submitAttempted : false
	}
}