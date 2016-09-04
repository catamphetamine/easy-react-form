import React from 'react'

import Form,
{
	Field,
	reducer
}
from '../index.es6'

describe(`exports`, function()
{
	it(`should export ES6`, function()
	{
		const Decorated_form = Form('test')(props => <div>Test</div>)
		const render = <Decorated_form/>
		
		const field_render = <Field name="test" component={props => <div>Test</div>}/>

		reducer({}, {})
	})

	it(`should export CommonJS`, function()
	{
		const Form = require('../index.common')

		const Decorated_form = Form('test')(props => <div>Test</div>)
		const render = <Decorated_form/>
		
		const Field = Form.Field
		const field_render = <Field name="test" component={props => <div>Test</div>}/>

		Form.reducer({}, {})
	})
})