import React from 'react'

import Form,
{
	Form as Form_with_options,
	Field,
	Submit,
	reducer
}
from '../index.es6'

describe(`exports`, function()
{
	it(`should export ES6`, function()
	{
		const Decorated_form = Form(props => <div>Test</div>)
		const Decorated_form_with_options = Form_with_options('test')(props => <div>Test</div>)
		const render = <Decorated_form/>
		
		const field_render = <Field name="test" component={props => <div>Test</div>}/>
		const submit_render = <Submit component={props => <button>Test</button>}/>

		reducer({}, {})
	})

	it(`should export CommonJS`, function()
	{
		const Form = require('../index.common')
		const Form_with_options = Form.Form

		const Decorated_form = Form(props => <div>Test</div>)
		const Decorated_form_with_options = Form_with_options('test')(props => <div>Test</div>)
		const render = <Decorated_form/>
		
		const Field = Form.Field
		const field_render = <Field name="test" component={props => <div>Test</div>}/>

		const Submit = Form.Submit
		const submit_render = <Submit component={props => <button>Test</button>}/>

		Form.reducer({}, {})
	})
})