<!-- pass through `required` property even when the field is not empty: maybe add some `passThroughRequiredWhenNotEmpty` configuration option. -->


2.2.1 / 12.08.2023
==================

* Added `defaultValue` on the `<Field/>` component.

2.0.0 — 2.0.9 / 31.01.2023 — 17.06.2023
=======================================

* Refactored the code regarding form state. A new "major" version means that there might hypothetically be some unforeseen accidental bugs.

* Added `useFormState()` hook. Added `useWatch()` hook.

* Added property `onErrorChange(newError?: string)` on `<Field/>`.

* Added properties `initialState` and `onStateDidChange(newState)` on `<Form/>`.

Breaking changes:

* Changed the "empty" value from being `undefined` to being `null`.

* Previously, `<Field/>` accepted a `required: string` property which was the "required" error message. Now, `required` property can only be a boolean and for passing the "required" error message there's now a separate property on a `<Field/>` called `requiredMessage: string`.

* Previously, when `onChange` property was passed to a `<Field/>` — `<Field onChange={onChange} component={Component}/>` - it was called as if it was "passed through" directly to the `Component`, i.e. it was up to the `Component` to determine what the arguments of that function would be (for example, it could be an `event`). Now the `onChange` function is always called with the current `value` as the only argument.

* The `required` validation now only runs when the form has been submitted at least once. It doesn't run when the form hasn't been submitted yet. This results in less confusion when prevously it was showing "required" errors before the user even started filling out the form.

* Input Components now should use `React.forwardRef()` in order to be focusable.

* Bumped React version to `18.2.0`.

* `<List/>`s: renamed `<Field i/>` property to `<Field item/>` property. Also added a second argument called `i` to the `.map()` function. Migration:

```js
// Old code.
<List name="list">
  {(items) => (
    <div>
      {items.map((item, i) => (
        <div key={item}>
          <Field
            i={item}
            name="field"
            .../>
        </div>
      ))}
    </div>
  )}
</List>

// New code.
<List name="list">
  {(items) => (
    <div>
      {items.map((item, i) => (
        <div key={item}>
          <Field
            item={item}
            name="field"
            .../>
        </div>
      ))}
    </div>
  )}
</List>
```

* Removed `<Form wait/>` property. Previously it could be passed to mark all `<Field/>`s of the form as `disabled`, along with the `<SubmitButton/>`. The rationale for removing that property is that it might've been used to disable the form initially while it's loading by some developers, but in reality the styles for "wait while the form is submitting" and "wait while the form is loading" should be visually different in order to not result in a slightly confusing UI.

* When the form is submitting, every `component` of every `<Field/>` now receives `wait={true}` property rather than `disabled={true}` property. The rationale is that `disabled` is not always the most-fitting candidate for showing a "submitting" status. For example, `disabled` property loses the focus, while `readOnly` property doesn't, etc.

* Removed the second argument of the `validate()` function — the argument that contained all form values. Migration:

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

* The `validate()` function for a `<Field/>` doesn't get called for an "empty" `value`: `null` / `undefined` / `""` / `[]`. Migration:

```js
// Old code.
const validatePhone = (value) => {
  if (value && !isValidPhoneNumber(value)) {
    return 'Invalid phone number'
  }
}

// New code.
const validatePhone = (value) => {
  if (!isValidPhoneNumber(value)) {
    return 'Invalid phone number'
  }
}
```

1.2.0 / 09.08.2021
==================

* (could hypothetically be a breaking change for someone) Empty `<input/>` values used to be converted to `undefined`. Now they're converted to `null`: otherwise the browser doesn't send such fields to the server because `JSON.stringify()` skips `undefined` properties when converting a JSON object to a string.

1.1.2 / 16.01.2021
===================

* `<Form/>` `.reset()` instance method no longer accepts `fieldName: string` argument. It still works the old way, but the `fieldName: string` arugment is considered deprecated. It worked in a weird way: reset the field to its initial value rather than `undefined`. To reset a field, use `.clear(fieldName)` instance method instead.

1.1.0 / 05.02.2020
===================

* `<Field required={true}/>` property is now always passed through to the underlying `component` (previously it was passed through only when the field `value` was empty).

1.0.15 / 26.07.2019
===================

* Added `<List/>` for lists of fields.

<!-- * `validate(name, values)` now receives a function instead of an object as the second argument: `validate(name, getValues())`. The reason is the addition of `<List/>`. -->

1.0.0 / 28.07.2018
===================

* Supports new React Context API which means it will work for React 17 too (compared to `simpler-redux-form` which only supports React < 17). Much simpler design overall.

* (breaking change) Moved from `redux` to `React.Context`, so no Redux `reducer` is now exported, and Redux is not required now.

* Instead of the old `@Form` way the new way is `<Form onSubmit={...}>`. And there's no default export now.

* (breaking change) Things like `submitting`, `get()`, `set()`, `clear()`, `reset()`, `getLatestFocusedField()`, `resetInvalidIndication()` are no longer properties, some of them are now accessible via the form component instance itself: `<Form ref={ ref => this.form = ref }/>`.

* (breaking change) Removed `@Form()` decorator (it had options like `onAbandoned`, `onError`, `methods`, etc).

* (breaking change) Replaced `onAbandoned` with `onAbandon` `<Form/>` property. `onAbandon` arguments are `fieldName` and `fieldValue`.

* (breaking change) Removed `configure()` and now all configuration properties are set directly on `<Form/>` as properties instead.

* (breaking change) Renamed `defaultErrorHandler` configuration property to `onError`.

* (breaking change) Renamed `defaultRequiredMessage` configuration property to `requiredMessage`.

* (breaking change) Support for `configuration.defaultRequiredMessage` `String` was removed (use a `Function` of `props` instead).

* (breaking change) Removed `preSubmit` handler (`submit(preSubmit, submitForm)`), it's now a `onBeforeSubmit` property of `<Form/>`.

* (breaking change) `onSubmitted` property renamed to `onAfterSubmit`.

* (breaking change) Removed `indicateInvalid` property.

* (breaking change) Renamed `busy` property to `wait`.

* `validateVisitedFields` option removed and is now always `true`.
