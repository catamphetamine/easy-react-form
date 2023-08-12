# easy-react-form

Simple, fast and easy-to-use React Form.

[![npm version](https://img.shields.io/npm/v/easy-react-form.svg?style=flat-square)](https://www.npmjs.com/package/easy-react-form)
<!--
[![npm downloads](https://img.shields.io/npm/dm/easy-react-form.svg?style=flat-square)](https://www.npmjs.com/package/easy-react-form)
-->
<!--
[![coverage](https://img.shields.io/coveralls/catamphetamine/easy-react-form/master.svg?style=flat-square)](https://coveralls.io/r/catamphetamine/easy-react-form?branch=master)
-->

## Install

```
npm install easy-react-form --save
```

## Use

1. Create a `<Form/>` element with `onSubmit` property being a function of `values`.
2. Put several `<Field/>`s inside the `<Form/>` each one having a `name` and a `component`.
3. Put a submit button inside the `<Form/>`.

Simplest example:

```js
import { Form, Field } from 'easy-react-form'

<Form onSubmit={ async (values) => console.log(values) }>
  <Field
    name="phone"
    component="input"
    type="tel"
    placeholder="Enter phone number" />

  <button> Submit </button>
</Form>
```

Advanced example:

```js
import { Form, Field, Submit } from 'easy-react-form'

function AdvancedExample({ user }) {
  // Form field validation example.
  // If `validate` returns a string
  // then it becomes the `error` of the `<Field/>`.
  const validatePhone = (value) => {
    if (!isValidPhoneNumber(value)) {
      return 'Invalid phone number'
    }
  }

  // Form submit function.
  // Can be `async/await`.
  // Can return a `Promise`.
  const onSubmit = async (values) => {
    console.log(values)
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  return (
    <Form onSubmit={ onSubmit }>
      <Field
        required
        name="phone"
        component={ TextInput }
        type="tel"
        placeholder="Enter phone number"
        // Initial value for this field.
        value={ user.phone }
        validate={ validatePhone } />

      <Submit component={ SubmitButton }>
        Save
      </Submit>
    </Form>
  )
}

// `error` is passed if the field is invalid.
function TextInput({ error, ...rest }) {
  return (
    <div>
      <input type="text" {...rest}/>
      {error &&
        <div className="error">{error}</div>
      }
    </div>
  )
}

// `wait` is `true` while form is submitting.
function SubmitButton({ wait, children }) {
  return (
    <button disabled={ wait }>
      { children }
    </button>
  )
}
```

## API

### Form

The `<Form/>` accepts the following required properties:

  * `onSubmit : Function(values)` — Can be `async` or return a `Promise`.

The `<Form/>` accepts the following optional properties:

  * `values : object` — The initial values for this form's fields.

  * `trim : Boolean` – By default, the form trims string field values when passing them to `onSubmit()` function. To disable this feature, set `trim` property to `false` (defaults to `true`). Regardless of the `trim` setting, empty string field values are converted to `null`s when passed to `onSubmit()` function.

  * `requiredMessage : String` – The default `error` message for `<Field required/>`. Is `"Required"` by default.

  * `onError : Function(Error)` — Submit error handler. E.g. can show a popup with error message.

  * `autoFocus : Boolean` — Set to `true` to automatically focus on the first form field when the form is mounted. Defauls to `false`.

  * `initialState : object` — One can pass a previously stored form state in order to restore the form to the state it was at that point in time.

  * `onStateDidChange(newState : object)` — Will get called whenever a form's state has changed.
    * There's no `prevState : object?` argument currently because the state object is mutated "in place" instead of creating an "immutable" copy of it every time it changes.

  * `onBeforeSubmit : Function`

  * `onAfterSubmit : Function`

  * `onAbandon : Function(fieldName, fieldValue)` — If a form field was focused but then the form wasn't submitted and was unmounted then this function is called meaning that the user possibly tried to fill out the form but then decided to move on for some reason (e.g. didn't know what to enter in a particular form field).

#### `ref`

The `<Form/>` component instance (`ref`) provides the following methods:

  * `focus(fieldName : String)` — Focuses on a field.

  * `scroll(fieldName : String)` — Scrolls to a field (if it's not visible on the screen).

  * `clear(fieldName : String)` — Clears field value.

  * `get(fieldName : String)` — Gets form field value.

  * `set(fieldName : String, value : any)` — Sets form field value.

  * `watch(fieldName : String) : any` — Watches a form field's value. Returns the current form field's value and re-renders the whole form whenever that value changes.

  * `values : object?` — An object containing all form field values. Is `undefined` until the form has mounted.

  <!-- * `values()` — Returns form field values (an alternative to `get(fieldName : String)`). -->

  * `reset()` — Resets all form field values.

Upon form submission, if any one of its fields is invalid, then that field will be automatically scrolled to and focused, and the actual form submission won't happen.

#### `children`

The `<Form/>` can also accept `children` being a `function(parameters)` returning a `React.Element` that will be called on any form value change, so it can be used in cases when re-rendering the whole `<Form/>` is required on any form value change. Available `parameters`:

* `values : Object` — Form values. Is `undefined` until the form is initialized (mounted) (`<Field/>` `value`s are `undefined` until those `<Feild/>`s are mounted).

* `set(fieldName : String, value : any)` — Sets form field value.

* `clear(fieldName : String)` — Clears field value.

* `reset()` — Resets all form field values.

* `watch(fieldName : String) : any` — "Watches" a form field's value: always returns the current value of the form field and also causes a re-render of the whole form whenever that value changes. Returns `undefined` until the form is initialized (mounted), because `<Field/>`s' default values are not set until those `<Feild/>`s have mounted.

* `focus(fieldName : String)` — Focuses on a field.

* `scroll(fieldName : String)` — Scrolls to a field (if it's not visible on the screen).

* `submitting : boolean` — Whether the form is currently being submitted.

```js
<Form ...>
  {({ values }) => {
    const validateOne = (oneValue) => {
      if (oneValue !== values.two) {
        return 'The input values must be identical'
      }
    }
    const validateTwo = (twoValue) => {
      if (values.one !== twoValue) {
        return 'The input values must be identical'
      }
    }
    return (
      <Field name="one" validate={validateOne} />
      <Field name="two" validate={validateTwo} />
    )
  }}
</Form>
```

#### `useWatch()`

`useWatch()` hook returns the [`watch()`](#children) function.

#### `useFormState()`

`useFormState()` hook returns the entire state of the `<Form/>`:

* `fields: object<number?>` — An object containing field "counters" (integers). When a field is no longer rendered in a form, its counter becomes `0`. Until a field is mounted, its counter value is `undefined`.
* `values: object<any?>` — An object containing field values. Field `name`s are keys. Until a field is mounted, its value is `undefined`.
* `initialValues: object<any?>` — An object containing field initial values. Field `name`s are keys.
* `errors: object<string?>` — An object containing field error messages. Field `name`s are keys. Until a field is mounted, its error is `undefined`.
* `latestFocusedField?: string` — The `name` of the latest focused field.
* `submitting: boolean` — Whether the form is being submitted.
* `submitAttempted: boolean` — Whether the form submission has been attempted by the user.

### Field

`<Field/>` accepts the following required properties:

  * `name : String`

  * `component : (React.Component|Function|String)` — React component (can also be a string like `input`). Must accept a `ref` for calling `ref.current.focus()` and also must provide the means of obtaining the DOM Element for calling `element.scrollIntoView()`. Therefore, `component` must be either a `string`, or a `React.Component`, or a "functional" component wrapped in `React.forwardRef()`, or a "functional" component using `useImperativeRef()` "hook" providing `.focus()` and `.getDOMNode()` methods.

`<Field/>` accepts the following optional properties:

  * `value` - the initial value of the field.
    * When both `<Field name="fieldName" value={...}/>` and `<Form values={{ fieldName: ... }}/>` are provided, the `value` property of the `<Field/>` overrides the field's value in the `values` object. This makes it more of a "specific initial value" rather than "default initial value". So it can't be used, for example, to set a checkbox'es "default" value to `false` (rather than `null`) because it would always be `false` even when different `<Form values={...}/>` are provided.

  * `defaultValue` - the default initial value of the field.
    * Basically, same as the `value` property but with one difference: it doesn't override `<Form values={...}/>`, which makes it suitable for cases like setting a checkbox'es "default" initial value to `false` (rather than `null`).

  * `validate(value) : String?` — Form field value validation function. Is only called when `value` is not "empty": `null` / `undefined` / `""` / `[]`. Should return an error message if the field value is invalid.

  * `required : String or Boolean` — adds "this field is required" validation for the `<Field/>` with the `error` message equal to `required` property value if it's a `String` defaulting to `"Required"` otherwise. Note that `value: false` is considered a valid value even in case of `required: true` because `false` is not an "empty" value (for example, consider a "Yes"/"No" dropdown). For that reason, if `false` should be considered an invalid value (e.g. for a checkbox) then use `validate` function instead of `required: true` for such validation.

`<Field/>` passes the following properties to the field `component`:

  * `value`

  * `onChange`

  * `onFocus`

  * `onBlur`

  * `wait : Boolean` — is `true` when form is submitting.

  * `required : Boolean` — is `true` when the `<Field/>` is `required` and the value is missing.

  * `error : String` — error message.

  * All other properties are passed through.

The `error` display algorithm is as follows:

  * Initially, if `validate()` returns an error for a field's default `value`, that `error` is shown.

  * Whenever the user submits the form, `error`s are displayed for all invalid form fields.

  * Whenever the user edits a field's value, `error` becomes `undefined` for that field while the user is focused on the field.

  * Whenever the user focuses out of a field it is re-validated and `error` is passed if it's invalid.

  * By default, `required` errors are only displayed after the user has attempted submitting the form.

Therefore, the `error` message is only shown when the user is not editing the field. For example, while the user is typing a phone number that phone number is invalid until the used inputs it fully, but it wouldn't make sense to show the "Invalid phone number" error to the user while he is in the process of inputting the phone number (it would just be an annoying distraction).

### Submit

`<Submit/>` accepts the following required properties:

  * `component : (React.Component|Function|String)` — React component (can also be a string like `button`).

`<Submit/>` passes the following properties to the `component`:

  * `wait : Boolean` — indicates if the form is currently being submitted.

  * All other properties are passed through.

```js
function Example() {
  return (
    <Form onSubmit={ ... }>
      <Field name="text" component={ Input } />

      <Submit component={ SubmitButton }>
        Submit
      </Submit>
    </Form>
  )
}

function SubmitButton({ wait, children }) {
  return (
    <button disabled={ wait }>
      { wait && <Spinner/> }
      { children }
    </button>
  )
}
```

## Lists

Sometimes there're forms on which new rows can be added by clicking "Add new row" button. For such cases there's `<List/>` component that handles adding new rows and removing existing ones.

```js
import React from 'react'
import { Form, Field, List, Submit } from 'easy-react-form'

export default function Page() {
  return (
    <Form onSubmit={...}>
      <h1>
        The list of employees
      </h1>
      <List name="employees">
        {(items) => (
          <div>
            {items.map((item, i) => (
              <div key={item}>
                <Field
                  item={item}
                  name="firstName"
                  .../>
                <Field
                  item={item}
                  name="lastName"
                  .../>
                <button type="button" onClick={() => items.remove(item)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => items.add()}>
              Add
            </button>
          </div>
        )}
      </List>
      <Submit component="button">
        Save
      </Submit>
    </Form>
  )
}
```

`<List/>` accepts properties:

* `name: String` — (required) The name of the array property in form `values`.
* `count: Number` — The initial size of the list. Is `1` by default, meaning that initially there will be `1` item in the list.
* `children: Function` — (required) A function that receives an `items` object and returns a `React.Element`. The `items` object provides functions:
  * `map(Function)` — Maps each item to a `React.Element`. The argument should be a mapping function: `(item: any, i: number) => React.Element`.
  * `add()` — Appends a new item.
  * `remove(item: any)` — Removes a given item.
  * `reset()` — Resets the whole list.

Nested `<List/>`s are not supported.

<!-- For setting `<List/>` value manually use `.setList(name, value)` method of a `Form` instance (analogous to `.set(name, value)`). -->

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