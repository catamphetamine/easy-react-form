import React from 'react'

export default React.createRef || function createRef()
{
	var ref = function(_) { ref.current = _ }
	ref(null)
	return ref
}