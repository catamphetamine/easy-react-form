export default class OnAbandonPlugin {
	constructor(getProps, getState) {
		this.getProps = getProps
		this.getState = getState
		this.onReset()
	}

	onMount() {
		const { onAbandon } = this.getProps()
		if (!onAbandon) {
			return
		}
		// Report abandoned form on page close.
		// (though it might not have time sufficient to report anything)
		window.addEventListener('beforeunload', this.onLeaveForm)
	}

	onUnmount() {
		const { onAbandon } = this.getProps()
		if (!onAbandon) {
			return
		}
		window.removeEventListener('beforeunload', this.onLeaveForm)
		this.onLeaveForm()
	}

	onLeaveForm = () => {
		const { onAbandon } = this.getProps()

		// If the form is already submitted
		// then it's not abandoned.
		if (this.submitted) {
			return
		}

		// Get the latest focused form field
		const field = this.getState().latestFocusedField

		// If no form field was ever focused
		// then the form is not being abandoned.
		if (!field) {
			return
		}

		onAbandon(field, this.getState().values[field])
	}

	onAfterSubmit() {
		this.submitted = true
	}

	onReset() {
		this.submitted = undefined
	}
}