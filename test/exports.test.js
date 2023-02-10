import {
	Form,
	Field,
	List,
	Submit,
	useFormState
} from '../index.js'

describe(`exports`, function() {
	it(`should export ES6`, function() {
		expect(Form).to.be.a('function')
		expect(Field).to.be.a('function')
		expect(List).to.be.a('function')
		expect(Submit).to.be.a('function')
		expect(useFormState).to.be.a('function')
	})

	it(`should export CommonJS`, function() {
		const Library = require('../index.commonjs')
		expect(Library.Form).to.be.a('function')
		expect(Library.Field).to.be.a('function')
		expect(Library.List).to.be.a('function')
		expect(Library.Submit).to.be.a('function')
		expect(Library.useFormState).to.be.a('function')
	})
})