import
{
	Form,
	Field,
	Submit
}
from '../index'

describe(`exports`, function()
{
	it(`should export ES6`, function()
	{
		expect(Form).to.be.a('function')
		expect(Field).to.be.a('function')
		expect(Submit).to.be.a('function')
	})

	it(`should export CommonJS`, function()
	{
		const Library = require('../index.commonjs')

		expect(Library.Form).to.be.a('function')
		expect(Library.Field).to.be.a('function')
		expect(Library.Submit).to.be.a('function')
	})
})