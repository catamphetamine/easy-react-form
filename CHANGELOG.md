<!-- pass through `required` property even when the field is not empty: maybe add some `passThroughRequiredWhenNotEmpty` configuration option. -->

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
