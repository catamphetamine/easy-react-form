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