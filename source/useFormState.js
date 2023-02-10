import { useContext } from 'react'

import { Context } from './form.js'

export default function useFormState() {
	const context = useContext(Context)
	return context.state
}