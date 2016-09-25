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
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

// `redux-thunk` example
function submitAction(values)
{
	return (dispatch) =>
	{
		dispatch({ type: 'SUBMIT_REQUEST' })

		return ajax.post('/form', values).then
		(
			(result) => dispatch({ type: 'SUBMIT_SUCCESS', result }),
			(error)  => dispatch({ type: 'SUBMIT_FAILURE', error  })
		)
	}
}

@Form({ id: 'example' })
@connect
(
	(state)    => ({ phone: state.user.phone }),
	(dispatch) => bindActionCreators({ submitAction }, dispatch)
)
export default class Form_name extends Component
{
	validatePhone(phone)
	{
		if (!phone)
		{
			return 'Phone number is required'
		}
	}

	render()
	{
		const { phone, submit, submitAction } = this.props

		return (
			<form
				onSubmit={submit(submitAction)}>

				<Field
					name="phone"
					component={Input}
					value={phone}
					validate={this.validatePhone}
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

```js
import FormComponent from './form'

function Page(props)
{
	return <FormComponent/>
}
```

## API

### @Form()

`@Form()` decorator takes these options:

  * `id : String` — (required) an application-wide unique form name (because form data path inside Redux store is gonna be `state.form.${id}`). Alternatively form id can be set via `formId` property passed to the decorated form component.

  * `submitting(reduxState, props) => boolean` — (optional) a function that determines by analysing current Redux state (having access to the `props`) if the form is currently being submitted; if this option is specified then `submitting : boolean` property will be injected into the `<Form/>` component, and also all `<Field/>`s will be `disabled` while the form is `submitting`, and also the `<Submit/>` button will be passed `busy={true}` property. Alternatively `submitting` property can be passed to the decorated form component and it would have the same effect.

The resulting React component takes the following props:

  * `values : object` — initial form field values (`{ field: value, ... }`)

The following properties are injected into the resulting `<Form/>` element:

  * `submit(submitForm(values) : Function)` — form submit handler, pass it to your form's `onSubmit` handler: `<form onSubmit={submit(this.submitForm)}/>`; the `submitForm(values)` argument is your form submission function; if two arguments are passed to the `submit(preSubmit, submitForm)` function then the first argument will be called before form submission attempt while the second argument (form submission itself) will be called only if form validation passes — this can be used, for example, to reset custom form errors (not `<Field/>` `error`s) in `preSubmit` before the form tries to submit itself a subsequent time (e.g. it could be used to reset overall form errors like `"Form submission failed, try again later"` which aren't bound to a particular form field, and if such errors aren't reset in `preSubmit` then they will be shown even if form validation fails and nothing is submitted, therefore they should be always reset in `preSubmit`).

  * `submitting : boolean` — only if `submitting : boolean` was specified (see above)

  * `focus(fieldName : String)` — focuses on a field

  * `scroll(fieldName : String)` — scrolls to a field (if it's not visible on the screen)

  * `clear(fieldName : String, error : String)` — clears field value (`error` argument should be `validate(undefined)`)

  * `set(fieldName : String, value : String, error : String)` — sets form field value (`error` should be `validate(value)`)

  * `reset_invalid_indication()` — resets `invalidIndication` for all fields

If an invalid field is found upon form submission, or if an error is set for a field, then that field will be automatically scrolled to and focused.

A form instance exposes these instance methods (in case anyone needs them):

  * `ref()` — returns the decorated form component

  * `focus(fieldName : String)` — focuses on a field

  * `scroll(fieldName : String)` — scrolls to a field (if it's not visible on the screen)

  * `clear(fieldName : String, error : String)` — clears field value (`error` should be `validate(undefined)`)

  * `set(fieldName : String, value : String, error : String)` — sets form field value (`error` should be `validate(value)`)

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

### Submit

Using this component is purely optional. The only thing it does is it takes `busy={true}` property when the form is being submitted, and that's it.

Takes the following required `props`:

  * `component` — the actual React submit button component

All other `props` are passed through to the underlying button component.

Additional `props` passed to the `component`:

  * `busy : boolean` — if `submitting: boolean` option is set in `@Form()` decorator then `busy={true}` will be passed to the button `component` when the form is being submitted.

### reducer

This Redux reducer is plugged into the main Redux reducer under the name of `form`.

## Field errors

An `error` property can be set on a `<Field/>` if this field was the reasons form submission failed on the server side.

This must not be a simple client-side validation error because for validation errors there already is `validate` property. Everything that can be validated up-front (i.e. before sending form data to the server) should be validated inside `validate` function. All other validity checks which can not be performed without submitting form data to the server are performed on the server side and if an error occurs then this error goes to the `error` property of the relevant `<Field/>`.

For example, consider a login form. Username and password `<Field/>`s both have `validate` properties set to the corresponding basic validation functions (e.g. checking that the values aren't empty). That's as much as can be validated before sending form data to the server. When the form data is sent to the server, server-side validation takes place: the server checks if the username exists and that the password matches. If the username doesn't exist then an error is returned from the HTTP POST request and the `error` property of the username `<Field/>` should be set to `"User not found"` error message. Otherwise, if the username does exist, but, say, the password doesn't match, then the `error` property of the password `<Field/>` should be set to `"Wrong password"` error message.

One thing to note about `<Field/>` `error`s is that they must be reset before form data is sent to the server: otherwise it would always say `"Wrong password"` even if the password is correct this time. Another case is when the `error` is set to the same value again (e.g. the entered password is wrong once again) which will not trigger showing that error because the `error` is shown only when its value changes: `nextProps.error !== this.props.error`. This is easily solved too by simply resetting `error`s before form data is sent to the server.

```js
import { connect } from 'react-redux'
import Form, { Field } from 'simpler-redux-form'

@Form({ id: 'example' })
@connect(state => ({ loginError: state.loginForm.error }))
class LoginForm extends Component
{
	validateNotEmpty(value)
	{
		if (!value)
		{
			return 'Required'
		}
	}

	submit(values)
	{
		// Clears `state.loginForm.error`
		dispatch({ type: 'LOGIN_FORM_CLEAR_ERROR' })

		// Sends form data to the server
		dispatch(sendHTTPLoginRequest(values))
	}

	render()
	{
		const { loginError } = this.props

		return (
			<form onSubmit={submit(this.submit)}>
				<Field
					component={Input}
					name="username"
					validate={this.validateNotEmpty}
					error={loginError === 'User not found' ? loginError : undefined}/>

				<Field
					component={Input}
					name="password"
					validate={this.validateNotEmpty}
					error={loginError === 'Wrong password' ? loginError : undefined}/>

				<button type="submit">Log in</button>
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

## Contributing and Feature requests

I made this little library because I liked (and almost reinvented myself) the idea of [`redux-form`](https://github.com/erikras/redux-form) but still found `redux-form` to be somewhat bloated with numerous features. I aimed for simplicity and designed this library to have the minimal sane set of features. The result is just five javascript files. If you're looking for all the features of `redux-form` then go with `redux-form`.

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
