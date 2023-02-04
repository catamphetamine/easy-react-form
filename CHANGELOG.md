<!-- pass through `required` property even when the field is not empty: maybe add some `passThroughRequiredWhenNotEmpty` configuration option. -->

2.0.0 / 31.01.2023
==================

* Refactored the code regarding form state. A new "major" version means that there might hypothetically be some unforeseen accidental bugs.

* Changed the empty value from `undefined` to `null`.

* `<Field onChange/>` property is now always called with `value` argument. Previously it could be called with an `event` argument.

* Added `onErrorChange()` function on `<Field/>`.

* The `required` validation only runs when the form has been submitted. It doesn't run when the form hasn't been submitted yet.

* Input Components now should use `React.forwardRef()` in order to be focusable.

* Bumped React version to `18.2.0`.

* Added properties: `initialState` and `onStateDidChange(newState)`.

* List Plugin: renamed `<Field i/>` property to `<Field item/>`.

* Removed `<Form wait/>` property.

* `<Field/>` now receives property `wait={true}` rather than `disabled={true}` during form submit.

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
