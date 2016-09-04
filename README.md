# simpler-redux-form

[![NPM Version][npm-badge]][npm]
[![Build Status][travis-badge]][travis]
[![Test Coverage][coveralls-badge]][coveralls]

Just like [`redux-form`](https://github.com/erikras/redux-form) but much simpler.

## Install

```
npm install simpler-redux-form --save
```

## Usage

Add `form` reducer to the main Redux reducer

```js
export { default as reducer_1 } from './reducer 1'
export { default as reducer_2 } from './reducer 2'
...
export { reducer as form } from 'simpler-redux-form'
```

Create the form

```js
import React, { Component, PropTypes } from 'react'
import Form, { Field } from 'simpler-redux-form'

@Form('form_name')
export default class Form_name extends Component
{
	submit(values)
	{
		console.log('Submitting form with', values)
	}

	validate_phone(phone)
	{
		if (!phone)
		{
			return 'Phone number is required'
		}
	}

	render()
	{
		const { submit } = this.props

		return (
			<form
				onSubmit={submit(this.submit)}>

				<Field
					name="phone"
					component={Input}
					validate={this.validate_phone}
					type="tel"
					placeholder="Enter phone number"/>
			</form>
		)
	}
}

function Input(props)
{
	const { error, indicateInvalid, ...rest } = props

	return (
		<div>
			<input {...rest}/>
			{ indicateInvalid && <div className="error">{error}</div> }
		</div>
	)
}
```

## API

### @Form()

It injects some extra `props` into the resulting React component:

  * `submit(handler : Function)` — creates a form submission handler

The resulting React component also takes a required `form : String` property which must be an application-wide unique form name (because form data path inside Redux store is gonna be `state.form.${form}`).

### Field

Takes the following required `props`:

  * `name` — the field name in Redux store
  * `component` — the actual React input component (or a `String` for a generic HTML component such as `"input"` for an `<input/>`)

And also the following optional `props`:

  * `value` - the initial value of the field
  * `validate(value) : String` — form field value validation function returning an error message if the field value is invalid
  * `error : String` - externally set error which can be set outside of the `validate()` function (e.g. "Wrong password"), will be passed directly to the underlying input component

All other `props` are passed through to the underlying input component.

Additional `props` passed to the `component`:

  * `error : String` — either the `error` passed to the `<Field/>` or a validation error, if any
  * `indicateInvalid : boolean` — tells the `component` whether it should render itself as being invalid

The `indicateInvalid` algorythm is as follows:

  * Initially `indicateInvalid` for a field is `false`
  * Whenever the user submits the form, `indicateInvalid` becomes `true` for the first found invalid form field
  * Whenever the user changes a field's value, `indicateInvalid` becomes `false` for that field
  * Whenever the `error` property is set on the `<Field/>` component, `indicateInvalid` becomes `true` for that field

### reducer

This Redux reducer is plugged into the main Redux reducer under the name of `form`.

## Contributing and Feature requests

I made this little library because I liked (and almost reinvented myself) the idea of [`redux-form`](https://github.com/erikras/redux-form) but still found `redux-form` to be somewhat bloated with numerous features. I aimed for simplicity and designed this library to have the minimal sane set of features. The result is just 4 small javascript files. If you're looking for all the features of `redux-form` then go with `redux-form` with no doubt.

<!-- ## Contributing

After cloning this repo, ensure dependencies are installed by running:

```sh
npm install
```

This module is written in ES6 and uses [Babel](http://babeljs.io/) for ES5
transpilation. Widely consumable JavaScript can be produced by running:

```sh
npm run build
```

Once `npm run build` has run, you may `import` or `require()` directly from
node.

After developing, the full test suite can be evaluated by running:

```sh
npm test
```

When you're ready to test your new functionality on a real project, you can run

```sh
npm pack
```

It will `build`, `test` and then create a `.tgz` archive which you can then install in your project folder

```sh
npm install [module name with version].tar.gz
``` -->

## License

[MIT](LICENSE)
[npm]: https://www.npmjs.org/package/simpler-redux-form
[npm-badge]: https://img.shields.io/npm/v/simpler-redux-form.svg?style=flat-square
[travis]: https://travis-ci.org/halt-hammerzeit/simpler-redux-form
[travis-badge]: https://img.shields.io/travis/halt-hammerzeit/simpler-redux-form/master.svg?style=flat-square
[coveralls]: https://coveralls.io/r/halt-hammerzeit/simpler-redux-form?branch=master
[coveralls-badge]: https://img.shields.io/coveralls/halt-hammerzeit/simpler-redux-form/master.svg?style=flat-square
