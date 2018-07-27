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

* `validateVisitedFields` option removed and is now always `true`.

проверить `getWrappedInstance()` в проектах - вроде было что-то, где так сабмитилась форма.

проверить README

Scroll to и focus мб делать через ref. Ref регается при регистрации поля

Убрать context get form props, будет прямо на форме prop. Убрать options у декоратора, и декоратор сам тоже убрать.

Вместо декоратора формы делать просто тег Form (декоратор для постепенной миграции).
Посмотреть, как оформляется это у react-final-form

  * (breaking change) Removed `indicateInvalid` property.

Убрать экспорт по умолчанию Form.

import { Form, Field } from 'react-final-form'

<Form
    onSubmit={onSubmit}
    validate={validate}>

переименовать пакет и repo в `basic-react-form`, и версию сделать `1.0.0`

0.3.56 / 25.01.2018
===================

  * Added `defaultErrorHandler(error, dispatch)` configuration property.
  * `defaultErrorMessage` is now a function (legacy `string` values are still supported).

0.3.54 / 05.12.2017
===================

  * `validate(value)` -> `validate(value, values)`

0.3.36 / 05.05.2017
===================

  * Added `onSubmitted(props)` and `onAbandoned(props, field, value)` `@Form()` decorator settings (and the corresponding `props` for the decorated form component).

0.3.32 / 26.04.2017
===================

  * Added `getLatestFocusedField()` method for forms (for Google Analytics on abandoned forms).
  * Added `get(field)` method for forms.

0.3.26 / 11.04.2017
===================

  * Added `required` property for `<Field/>` component.

0.3.17 / 31.03.2017
==================

  * Added the new `reset()` method (both on form instance and in `props`). Also `clear(fieldName)` and `set(fieldName, value)` don't take `error` argument anymore (it's computed automatically).

0.3.13 / 20.02.2017
==================

  * Added `methods` decorator parameter for proxied instance methods

0.3.9 / 26.01.2017
==================

  * Rewriting logic to fix a couple of small "initial values" bugs

0.3.7 / 24.01.2017
==================

  * Added form autofocus on mount

0.3.0 / 16.01.2017
==================

  * Added `@Form` id autogeneration
  * (breaking change) The default export `Form` now doesn't take any options, use the named exported `Form` instead for passing options

0.2.6 / 16.01.2017
==================

  * The form's `submitting` flag now is also automatically inferred if the form submission action returned a `Promise`

0.2.5 / 15.01.2017
==================

  * Refactoring, initial value bug fix

0.2.2 / 26.09.2016
==================

  * Fixed `hoist-non-react-statics`

0.2.1 / 25.09.2016
==================

  * Fixed initial form values

0.2.0 / 24.09.2016
==================

  * (breaking change) Form `id` is now set as a parameter of `@Form()` decorator options
  * (breaking change) Renamed `busy` to `submitting`, and setting it (again) via decorator options
  * Introducing `<Submit/>` button
  * Small fix: now accounting for an explicitly set `disabled` property on `<Field/>`s

0.1.10 / 23.09.2016
==================

  * Moved `busy` from decorator options to a regular property

0.1.9 / 22.09.2016
==================

  * Added `set(fieldName, value, error)` method

0.1.8 / 21.09.2016
==================

  * Added `ref()` method

0.1.6 / 13.09.2016
==================

  * Added `scroll` helper
  * Now autofocusing invalid fields and fields with errors (and scrolling to them too)

0.1.2 / 05.09.2016
==================

  * Refactoring and rewriting, bugs fixed
  * Added `busy` property and option
  * Added `reset_invalid_indication` prop
  * Added `beforeSubmit` handler
  * Now setting `disabled` property for all fields if `busy` property function was supplied

0.1.1 / 04.09.2016
==================

  * Renamed `form` prop to `formId`

0.1.0 / 04.09.2016
==================

  * Initial release