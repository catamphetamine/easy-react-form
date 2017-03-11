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
import Form, { Field, Submit } from 'simpler-redux-form'
import { connect } from 'react-redux'

// `redux-thunk` example.
// When `dispatch()`ed returns a `Promise`
function submitAction(values) {
	return (dispatch) => {
		dispatch({ type: 'SUBMIT_REQUEST' })

		return ajax.post('/save', values).then(
			(result) => dispatch({ type: 'SUBMIT_SUCCESS', result }),
			(error)  => dispatch({ type: 'SUBMIT_FAILURE', error  })
		)
	}
}

@Form
@connect(
	// Get user's current phone number from Redux state
	state => ({ phone: state.user.phone }),
	// Redux `bindActionCreators`
	{ submitAction }
)
export default class PhoneNumberForm extends Component {
	validatePhone(phone) {
		if (!phone) {
			return 'Phone number is required'
		}
	}

	render() {
		const { phone, submit, submitAction } = this.props

		return (
			<form
				onSubmit={submit(submitAction)}>

				<Field
					name="phone"
					component={ TexInput }
					type="tel"
					// Initial value for this field
					value={ phone }
					validate={ this.validatePhone }
					placeholder="Enter phone number"/>

				<Submit component={ SubmitButton }>Save</Submit>
			</form>
		)
	}
}

function TextInput({ error, indicateInvalid, ...rest }) {
	return (
		<div>
			<input type="text" { ...rest }/>
			{/* Shows this form field validation error */}
			{ indicateInvalid && <div className="error">{ error }</div> }
		</div>
	)
}

// `children` is button text ("Save")
function SubmitButton({ children }) {
	return (
		<button type="submit">
			{ children }
		</button>
	)
}
```

And use it anywhere on a page

```js
import FormComponent from './form'

function Page() {
	return <FormComponent/>
}
```

## API

### @Form

`@Form` decorator ("higher order component") decorates a React component of the original form injecting the following `props` into it:

  * `submit : Function` — form submit handler, pass it to your `<form/>` as an `onSubmit` property: `<form onSubmit={submit(this.submitForm)}/>`, where the `submitForm(values)` argument is your form submission function. If the form submission function returns a `Promise` then the form's `submitting` flag will be set to `true` upon submit until the returned `Promise` is either resolved or rejected.

  * `submitting : boolean` — "Is this form currently being submitted?" flag, complements the `submit()` function `Promise` above

  * `focus(fieldName : String)` — focuses on a field

  * `scroll(fieldName : String)` — scrolls to a field (if it's not visible on the screen)

  * `clear(fieldName : String, error : String)` — clears field value (the second `error` argument is optional and is required only if validation feature is used for this field in which case `error` must be equal to `validate(undefined)` for this field)

  * `set(fieldName : String, value : String, error : String)` — sets form field value (the second `error` argument is optional and is required only if validation feature is used for this field in which case `error` must be equal to `validate(value)` for this field)

  * `resetInvalidIndication()` — resets `invalidIndication` for all fields in this form

Upon form submission, if any of its fields is invalid, then that field will be automatically scrolled to and focused, and the actual form submission won't happen.

### Field

`<Field/>` takes the following required `props`:

  * `name` — the field name (ID)

  * `component` — the actual React component for this field

And also `<Field/>` takes the following optional `props`:

  * `value` - the initial value of the field

  * `validate(value) : String` — form field value validation function returning an error message if the field value is invalid

  * `error : String` - an error message which can be set outside of the `validate()` function. Can be used for advanced validation, e.g. setting a `"Wrong password"` error on a password field after the form is submitted. This `error` will be passed directly to the underlying field component.

All other `props` are passed through to the underlying field component.

These additional `props` are passed to the underlying `component`:

  * `error : String` — either the `error` property passed to the `<Field/>` or a validation error in case `validate` property was set for this `<Field/>`

  * `indicateInvalid : boolean` — tells the `component` whether it should render itself as being invalid

The `indicateInvalid` algorythm is as follows:

  * Initially `indicateInvalid` for a field is `false`

  * Whenever the user submits the form, `indicateInvalid` becomes `true` for the first found invalid form field

  * Whenever the user edits a field's value, `indicateInvalid` becomes `false` for that field

  * Whenever the new `error` property is manually set on the `<Field/>` component, `indicateInvalid` becomes `true` for that field

Therefore, the purpose of `indicateInvalid` is to only show the `error` message when it makes sense. For example, while the user is inputting a phone number that phone number is invalid until the used inputs it fully, but it wouldn't make sense to show the "Invalid phone number" error to the user while he is in the process of inputting the phone number. Hence the `indicateInvalid` flag.

### Submit

Use `<Submit/>` component to render the form submit button.

Takes the following required `props`:

  * `component` — the actual React submit button component

All other `props` are passed through to the underlying button component.

These additional `props` are passed to the underlying submit button `component`:

  * `busy : boolean` — indicates if the form is currently being submitted

```js
@Form
class Form extends Component {
	render() {
		const { submit } = this.props
		return (
			<form onSubmit={ submit(...) }>
				<Field component={ Input } name="text"/>
				<Submit component={ Button }>Submit</Submit>
			</form>
		)
	}
}

// `children` is button text (e.g. "Submit")
function Button({ busy, children }) {
	return (
		<button
			type="submit"
			disabled={ busy }>
			{ busy && <Spinner/> }
			{ children }
		</button>
	)
}
```

### reducer

The form Redux reducer is plugged into the main Redux reducer under the name of `form`.

## Field errors

An `error` property can be set on a `<Field/>` if this field was the reason form submission failed on the server side.

This must not be a simple client-side validation error because for validation errors there already is `validate` property. Everything that can be validated up-front (i.e. before sending form data to the server) should be validated inside `validate` function. All other validity checks which can not be performed without submitting form data to the server are performed on the server side and if an error occurs then this error goes to the `error` property of the relevant `<Field/>`.

For example, consider a login form. Username and password `<Field/>`s both have `validate` properties set to the corresponding basic validation functions (e.g. checking that the values aren't empty). That's as much as can be validated before sending form data to the server. When the form data is sent to the server, server-side validation takes place: the server checks if the username exists and that the password matches. If the username doesn't exist then an error is returned from the HTTP POST request and the `error` property of the username `<Field/>` should be set to `"User not found"` error message. Otherwise, if the username does exist, but, say, the password doesn't match, then the `error` property of the password `<Field/>` should be set to `"Wrong password"` error message.

One thing to note about `<Field/>` `error`s is that they must be reset before form data is sent to the server: otherwise it would always say `"Wrong password"` even if the password is correct this time. Another case is when the `error` is set to the same value again (e.g. the entered password is wrong once again) which will not trigger showing that error because the `error` is shown only when its value changes: `nextProps.error !== this.props.error`. This is easily solved too by simply resetting `error`s before form data is sent to the server.

```js
import { connect } from 'react-redux'
import Form, { Field } from 'simpler-redux-form'

@Form({ id: 'example' })
@connect(state => ({ loginError: state.loginForm.error }))
class LoginForm extends Component {
	validateNotEmpty(value) {
		if (!value) {
			return 'Required'
		}
	}

	submit(values) {
		// Clears `state.loginForm.error`
		dispatch({ type: 'LOGIN_FORM_CLEAR_ERROR' })

		// Sends form data to the server
		return dispatch(sendHTTPLoginRequest(values))
	}

	render() {
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

function Input({ error, indicateInvalid, ...rest }) {
	return (
		<div>
			<input {...rest}/>
			{ indicateInvalid && <div className="error">{error}</div> }
		</div>
	)
}
```

## Advanced

This is an advanced section describing all other miscellaneous configuration options and use cases.

### Form instance methods

The decorated form component instance exposes the following instance methods (in case anyone needs them):

  * `ref()` — returns the original form component instance

  * `focus(fieldName : String)` — focuses on a field

  * `scroll(fieldName : String)` — scrolls to a field (if it's not visible on the screen)

  * `clear(fieldName : String, error : String)` — clears field value (the second `error` argument is optional and is required only if validation feature is used for this field in which case `error` must be equal to `validate(undefined)` for this field)

  * `set(fieldName : String, value : String, error : String)` — sets form field value (the second `error` argument is optional and is required only if validation feature is used for this field in which case `error` must be equal to `validate(value)` for this field)

### Form decorator options

Besides the default expored `Form` decorator there is a named exported `Form` decorator creator which takes `options`:

```js
// Use the named export `Form`
// instead of the default one
// to pass in options.
import { Form } from 'simpler-redux-form'

@Form({ ... })
class Form extends Component {
	...
}
```

This `@Form()` decorator creator takes the following options:

  * `id : String` — an application-wide unique form ID (because form data path inside Redux store is gonna be `state.form.${id}`). Alternatively form id can be set via `formId` property passed to the decorated form component. If no `id` is set up for a form then it's autogenerated.
  
  * `values : object` — initial form field values (`{ field: value, ... }`), an alternative way of setting `value` for each `<Field/>`.

  * `submitting(reduxState, props) => boolean` — a function that determines by analysing current Redux state (having access to the `props`) if the form is currently being submitted. If this option is specified then `submitting : boolean` property will be injected into the decorated form component, and also all `<Field/>`s will be `disabled` while the form is `submitting`, and also the `<Submit/>` button will be passed `busy={true}` property. Alternatively `submitting` boolean property can be passed to the decorated form component via `props` and it would have the same effect. By default, if the form submission function returns a `Promise` then the form's `submitting` flag will be set to `true` upon submit until the returned `Promise` is either resolved or rejected. This extra `submitting` setting complements the `Promise` based one.

  * `autofocus : boolean` — by default the form focuses itself upon being mounted

  * `methods : [String]` — takes an optional array of method names which will be proxied to the decorated component instance

### preSubmit

If two arguments are passed to the `submit(preSubmit, submitForm)` form `onSubmit` handler then the first argument will be called before form submission attempt (before any validation) while the second argument (form submission itself) will be called only if the form validation passes — this can be used, for example, to reset custom form errors (not `<Field/>` `error`s) in `preSubmit` before the form tries to submit itself a subsequent time. For example, this could be used to reset overall form errors like `"Form submission failed, try again later"` which aren't bound to a particular form field, and if such errors aren't reset in `preSubmit` then they will be shown even if a user edits a field, clicks the "Submit" button once again, and a form field validation fails and nothing is actually submitted, but the aforementioned non-field errors stays confusing the user. Therefore such non-field errors should be always reset in `preSubmit`.

## Contributing and Feature requests

I made this little library because I liked (and almost reinvented myself) the idea of [`redux-form`](https://github.com/erikras/redux-form) but still found `redux-form` to be somewhat bloated with numerous features. I aimed for simplicity and designed this library to have the minimal sane set of features. If you're looking for all the features of `redux-form` then go with `redux-form`.

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
