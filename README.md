# basic-react-form

[![npm version](https://img.shields.io/npm/v/basic-react-form.svg?style=flat-square)](https://www.npmjs.com/package/basic-react-form)
[![npm downloads](https://img.shields.io/npm/dm/basic-react-form.svg?style=flat-square)](https://www.npmjs.com/package/basic-react-form)
[![coverage](https://img.shields.io/coveralls/catamphetamine/basic-react-form/master.svg?style=flat-square)](https://coveralls.io/r/catamphetamine/basic-react-form?branch=master)

## Install

```
npm install basic-react-form --save
```

## Use

```js
import React, { Component } from 'react'
import { Form, Field, Submit } from 'basic-react-form'

export default class Example extends Component {
  validatePhone = (phone) => if (!phone) return 'Phone number is required'

  // Returns a `Promise`.
  submit = (values) => {
    console.log(values)
    return new Promise(resolve => setTimeout(resolve, 3000))
  }

  render() {
    const { phone, submit, submitAction } = this.props

    return (
      <Form onSubmit={ this.submit }>
        <Field
          name="phone"
          component={ TextInput }
          type="tel"
          placeholder="Enter phone number"
          // Initial value for this field
          value={ phone }
          validate={ this.validatePhone } />

        <Submit component={ SubmitButton }>
          Save
        </Submit>
      </Form>
    )
  }
}

function TextInput({ error, ...rest }) {
  return (
    <div>
      <input type="text" { ...rest }/>
      { error && <div className="error">{ error }</div> }
    </div>
  )
}

// `busy` is `true` while form is submitting.
function SubmitButton({ busy, children }) {
  return (
    <button type="submit" disabled={ busy || false }>
      { children }
    </button>
  )
}
```

## API

### Form

The `<Form/>` takes the following required properties:

  * `onSubmit : Function(values)` — Can be `async` or return a `Promise`.

The `<Form/>` takes the following optional properties:

  * `trim : boolean` – Set to `false` to disable field value trimming. Defaults to `true`.

  * `requiredMessage : String` – The default `error` message for `<Field required/>`. Is `"Required"` by default.

  * `onError : Function(Error)` — Submit error handler. E.g. can show a popup with error details.

  * `autoFocus : boolean` — Can automatically focus on the first form field when the form is mounted. Defauls to `true`.

  * `onBeforeSubmit : Function`

  * `onAfterSubmit : Function`

The `<Form/>` component instance (`ref`) provides the following methods:

  * `focus(fieldName : String)` — focuses on a field.

  * `scroll(fieldName : String)` — scrolls to a field (if it's not visible on the screen).

  * `clear(fieldName : String)` — clears field value.

  * `get(fieldName : String)` — gets form field value.

  * `set(fieldName : String, value : String)` — sets form field value.

  * `values()` — returns form field values (an alternative to `get(fieldName : String)`).

  * `reset()` — resets the form.

Upon form submission, if any of its fields is invalid, then that field will be automatically scrolled to and focused, and the actual form submission won't happen.

### Field

`<Field/>` takes the following required properties:

  * `name : String`

  * `component : class|function|string` — the field React component (can also be a string like `input`).

And also `<Field/>` takes the following optional properties:

  * `value` - the initial value of the field.

  * `validate(value, allFormValues) : String` — form field value validation function returning an error message if the field value is invalid.

  * `error : String` - an error message which can be set outside of the `validate()` function. Can be used for some hypothetical advanced use cases.

  * `required : String or Boolean` — adds "this field is required" validation for the `<Field/>` with the `error` message equal to `required` property value if it's a `String` defaulting to `"Required"` otherwise. Note that `value={false}` is valid in case of `required` because `false` is a non-empty value (e.g. "Yes"/"No" dropdown), therefore use `validate` function instead of `required` for checkboxes that are required to be checked, otherwise an unchecked checkbox will have `value={false}` and will pass the `required` check.

`<Field/>` passes the following properties to the field `component`:

  * `value`

  * `onChange`

  * `onFocus`

  * `onBlur`

  * `disabled : Boolean` — is `true` when form is submitting.

  * `required : Boolean` — is `true` when the `<Field/>` is `required` and the value is missing.

  * `error : String` — error message.

  * All other properties are passed through.

The `error` display algorythm is as follows:

  * Initially `error` for a field is not passed.

  * Whenever the user submits the form, `error` is displayed for the first found invalid form field.

  * Whenever the user edits a field's value, `error` becomes `undefined` for that field.

  * Whenever the new `error` property is manually set on the `<Field/>` component, `error` is passed to that field.

Therefore, the `error` message is only shown when it makes sense. For example, while the user is inputting a phone number that phone number is invalid until the used inputs it fully, but it wouldn't make sense to show the "Invalid phone number" error to the user while he is in the process of inputting the phone number.

### Submit

`<Submit/>` takes the following required properties:

  * `component : class|function|string` — the field React component (can also be a string like `input`).

`<Submit/>` passes the following properties to the `component`:

  * `busy : boolean` — indicates if the form is currently being submitted.

  * All other properties are passed through.

```js
function Example() {
  return (
    <Form onSubmit={ submit(...) }>
      <Field name="text" component={ Input } />

      <Submit component={ SubmitButton }>
        Submit
      </Submit>
    </Form>
  )
}

function SubmitButton({ busy, children }) {
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

## Field errors

An `error` property can be set on a `<Field/>` if this field was the reason form submission failed on the server side.

This must not be a simple client-side validation error because for validation errors there already is `validate` property. Everything that can be validated up-front (i.e. before sending form data to the server) should be validated inside `validate` function. All other validity checks which can not be performed without submitting form data to the server are performed on the server side and if an error occurs then this error goes to the `error` property of the relevant `<Field/>`.

For example, consider a login form. Username and password `<Field/>`s both have `validate` properties set to the corresponding basic validation functions (e.g. checking that the values aren't empty). That's as much as can be validated before sending form data to the server. When the form data is sent to the server, server-side validation takes place: the server checks if the username exists and that the password matches. If the username doesn't exist then an error is returned from the HTTP POST request and the `error` property of the username `<Field/>` should be set to `"User not found"` error message. Otherwise, if the username does exist, but, say, the password doesn't match, then the `error` property of the password `<Field/>` should be set to `"Wrong password"` error message.

One thing to note about `<Field/>` `error`s is that they must be reset before form data is sent to the server: otherwise it would always say `"Wrong password"` even if the password is correct this time. Another case is when the `error` is set to the same value again (e.g. the entered password is wrong once again) which will not trigger showing that error because the `error` is shown only when its value changes: `nextProps.error !== this.props.error`. This is easily solved too by simply resetting `error`s before form data is sent to the server.

```js
import { connect } from 'react-redux'
import { Form, Field, Submit } from 'basic-react-form'

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
      <Form onSubmit={this.submit}>
        <Field
          name="username"
          component={Input}
          validate={this.validateNotEmpty}
          error={loginError === 'User not found' ? loginError : undefined} />

        <Field
          name="password"
          component={Input}
          validate={this.validateNotEmpty}
          error={loginError === 'Wrong password' ? loginError : undefined} />

        <Submit component={SubmitButton}>
          Log In
        </Submit>
      </Form>
    )
  }
}

function Input({ error, ...rest }) {
  return (
    <div>
      <input {...rest}/>
      { error && <div className="error">{ error }</div> }
    </div>
  )
}
```

<!--
### Abandoned forms

One day marketing department asked me if I could make it track abandoned forms via Google Analytics. For this reason form component instance has `.getLatestFocusedField()` method to find out which exact form field the user got confused by. `getLatestFocusedField` property function is also passed to the decorated form component.

Also the following `@Form()` decorator options are available:

  * `onSubmitted(props)` — is called after the form is submitted (if submit function returns a `Promise` then `onSubmitted()` is called after this `Promise` is resolved)

  * `onAbandoned(props, field, value)` — is called if the form was focued but was then abandoned (if the form was focused and then either the page is closed, or `react-router` route is changed, or the form is unmounted), can be used for Google Analytics. Requires `router` configuration parameter being set to a `react-router@3` instance.

Alternatively the corresponding `props` may be passed directly to the decorated form component.
-->

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