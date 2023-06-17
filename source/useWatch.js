import { useContext } from 'react'

import { Context } from './form.js'

export default function useWatch(fieldName) {
	const context = useContext(Context)
	return context.watch
}