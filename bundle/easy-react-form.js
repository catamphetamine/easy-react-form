(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('prop-types')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'prop-types'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.EasyReactForm = {}, global.React, global.PropTypes));
})(this, (function (exports, React, PropTypes) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
  var PropTypes__default = /*#__PURE__*/_interopDefaultLegacy(PropTypes);

  function getInitialState() {
    var initialValues = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      // `mounted`/`unmounted` counters for each form field.
      fields: {},
      // Current form field values.
      values: {},
      // Initial form field values.
      initialValues: initialValues,
      // Externally set `error`s on form fields.
      errors: {},
      // The results of `validate()` functions called on
      // the corresponding form field `value`s.
      validationErrors: {},
      // Whether should show field errors.
      showErrors: {},
      // Is used for tracking abandoned forms for Google Analytics.
      latestFocusedField: undefined,
      // If `onSubmit` returns a `Promise` (or is `async/await`)
      // then `submitting` will be `true` until `onSubmit` finishes.
      submitting: false,
      // Once the user clicks the "Submit" button, this flag becomes `true`.
      submitAttempted: false
    };
  }

  function _typeof$5(obj) { "@babel/helpers - typeof"; return _typeof$5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof$5(obj); }
  function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties$4(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$5(descriptor.key), descriptor); } }
  function _createClass$4(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$4(Constructor.prototype, protoProps); if (staticProps) _defineProperties$4(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _defineProperty$5(obj, key, value) { key = _toPropertyKey$5(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey$5(arg) { var key = _toPrimitive$5(arg, "string"); return _typeof$5(key) === "symbol" ? key : String(key); }
  function _toPrimitive$5(input, hint) { if (_typeof$5(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof$5(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var OnAbandonPlugin = /*#__PURE__*/function () {
    function OnAbandonPlugin(getProps, getState) {
      var _this = this;
      _classCallCheck$4(this, OnAbandonPlugin);
      _defineProperty$5(this, "onLeaveForm", function () {
        var _this$getProps = _this.getProps(),
          onAbandon = _this$getProps.onAbandon;

        // If the form is already submitted
        // then it's not abandoned.
        if (_this.submitted) {
          return;
        }

        // Get the latest focused form field
        var field = _this.getState().latestFocusedField;

        // If no form field was ever focused
        // then the form is not being abandoned.
        if (!field) {
          return;
        }
        onAbandon(field, _this.getState().values[field]);
      });
      this.getProps = getProps;
      this.getState = getState;
      this.onReset();
    }
    _createClass$4(OnAbandonPlugin, [{
      key: "onMount",
      value: function onMount() {
        var _this$getProps2 = this.getProps(),
          onAbandon = _this$getProps2.onAbandon;
        if (!onAbandon) {
          return;
        }
        // Report abandoned form on page close.
        // (though it might not have time sufficient to report anything)
        window.addEventListener('beforeunload', this.onLeaveForm);
      }
    }, {
      key: "onUnmount",
      value: function onUnmount() {
        var _this$getProps3 = this.getProps(),
          onAbandon = _this$getProps3.onAbandon;
        if (!onAbandon) {
          return;
        }
        window.removeEventListener('beforeunload', this.onLeaveForm);
        this.onLeaveForm();
      }
    }, {
      key: "onAfterSubmit",
      value: function onAfterSubmit() {
        this.submitted = true;
      }
    }, {
      key: "onReset",
      value: function onReset() {
        this.submitted = undefined;
      }
    }]);
    return OnAbandonPlugin;
  }();

  function isElement(el) {
    return el != null && typeof el === 'object' && el.nodeType === 1;
  }

  function canOverflow(overflow, skipOverflowHiddenElements) {
    if (skipOverflowHiddenElements && overflow === 'hidden') {
      return false;
    }

    return overflow !== 'visible' && overflow !== 'clip';
  }

  function getFrameElement(el) {
    if (!el.ownerDocument || !el.ownerDocument.defaultView) {
      return null;
    }

    return el.ownerDocument.defaultView.frameElement;
  }

  function isHiddenByFrame(el) {
    var frame = getFrameElement(el);

    if (!frame) {
      return false;
    }

    return frame.clientHeight < el.scrollHeight || frame.clientWidth < el.scrollWidth;
  }

  function isScrollable(el, skipOverflowHiddenElements) {
    if (el.clientHeight < el.scrollHeight || el.clientWidth < el.scrollWidth) {
      var style = getComputedStyle(el, null);
      return canOverflow(style.overflowY, skipOverflowHiddenElements) || canOverflow(style.overflowX, skipOverflowHiddenElements) || isHiddenByFrame(el);
    }

    return false;
  }

  function alignNearest(scrollingEdgeStart, scrollingEdgeEnd, scrollingSize, scrollingBorderStart, scrollingBorderEnd, elementEdgeStart, elementEdgeEnd, elementSize) {
    if (elementEdgeStart < scrollingEdgeStart && elementEdgeEnd > scrollingEdgeEnd || elementEdgeStart > scrollingEdgeStart && elementEdgeEnd < scrollingEdgeEnd) {
      return 0;
    }

    if (elementEdgeStart <= scrollingEdgeStart && elementSize <= scrollingSize || elementEdgeEnd >= scrollingEdgeEnd && elementSize >= scrollingSize) {
      return elementEdgeStart - scrollingEdgeStart - scrollingBorderStart;
    }

    if (elementEdgeEnd > scrollingEdgeEnd && elementSize < scrollingSize || elementEdgeStart < scrollingEdgeStart && elementSize > scrollingSize) {
      return elementEdgeEnd - scrollingEdgeEnd + scrollingBorderEnd;
    }

    return 0;
  }

  var compute = (function (target, options) {
    var scrollMode = options.scrollMode,
        block = options.block,
        inline = options.inline,
        boundary = options.boundary,
        skipOverflowHiddenElements = options.skipOverflowHiddenElements;
    var checkBoundary = typeof boundary === 'function' ? boundary : function (node) {
      return node !== boundary;
    };

    if (!isElement(target)) {
      throw new TypeError('Invalid target');
    }

    var scrollingElement = document.scrollingElement || document.documentElement;
    var frames = [];
    var cursor = target;

    while (isElement(cursor) && checkBoundary(cursor)) {
      cursor = cursor.parentNode;

      if (cursor === scrollingElement) {
        frames.push(cursor);
        break;
      }

      if (cursor === document.body && isScrollable(cursor) && !isScrollable(document.documentElement)) {
        continue;
      }

      if (isScrollable(cursor, skipOverflowHiddenElements)) {
        frames.push(cursor);
      }
    }

    var viewportWidth = window.visualViewport ? visualViewport.width : innerWidth;
    var viewportHeight = window.visualViewport ? visualViewport.height : innerHeight;
    var viewportX = window.scrollX || pageXOffset;
    var viewportY = window.scrollY || pageYOffset;

    var _target$getBoundingCl = target.getBoundingClientRect(),
        targetHeight = _target$getBoundingCl.height,
        targetWidth = _target$getBoundingCl.width,
        targetTop = _target$getBoundingCl.top,
        targetRight = _target$getBoundingCl.right,
        targetBottom = _target$getBoundingCl.bottom,
        targetLeft = _target$getBoundingCl.left;

    var targetBlock = block === 'start' || block === 'nearest' ? targetTop : block === 'end' ? targetBottom : targetTop + targetHeight / 2;
    var targetInline = inline === 'center' ? targetLeft + targetWidth / 2 : inline === 'end' ? targetRight : targetLeft;
    var computations = [];

    for (var index = 0; index < frames.length; index++) {
      var frame = frames[index];

      var _frame$getBoundingCli = frame.getBoundingClientRect(),
          height = _frame$getBoundingCli.height,
          width = _frame$getBoundingCli.width,
          top = _frame$getBoundingCli.top,
          right = _frame$getBoundingCli.right,
          bottom = _frame$getBoundingCli.bottom,
          left = _frame$getBoundingCli.left;

      if (scrollMode === 'if-needed' && targetTop >= 0 && targetLeft >= 0 && targetBottom <= viewportHeight && targetRight <= viewportWidth && targetTop >= top && targetBottom <= bottom && targetLeft >= left && targetRight <= right) {
        return computations;
      }

      var frameStyle = getComputedStyle(frame);
      var borderLeft = parseInt(frameStyle.borderLeftWidth, 10);
      var borderTop = parseInt(frameStyle.borderTopWidth, 10);
      var borderRight = parseInt(frameStyle.borderRightWidth, 10);
      var borderBottom = parseInt(frameStyle.borderBottomWidth, 10);
      var blockScroll = 0;
      var inlineScroll = 0;
      var scrollbarWidth = 'offsetWidth' in frame ? frame.offsetWidth - frame.clientWidth - borderLeft - borderRight : 0;
      var scrollbarHeight = 'offsetHeight' in frame ? frame.offsetHeight - frame.clientHeight - borderTop - borderBottom : 0;

      if (scrollingElement === frame) {
        if (block === 'start') {
          blockScroll = targetBlock;
        } else if (block === 'end') {
          blockScroll = targetBlock - viewportHeight;
        } else if (block === 'nearest') {
          blockScroll = alignNearest(viewportY, viewportY + viewportHeight, viewportHeight, borderTop, borderBottom, viewportY + targetBlock, viewportY + targetBlock + targetHeight, targetHeight);
        } else {
          blockScroll = targetBlock - viewportHeight / 2;
        }

        if (inline === 'start') {
          inlineScroll = targetInline;
        } else if (inline === 'center') {
          inlineScroll = targetInline - viewportWidth / 2;
        } else if (inline === 'end') {
          inlineScroll = targetInline - viewportWidth;
        } else {
          inlineScroll = alignNearest(viewportX, viewportX + viewportWidth, viewportWidth, borderLeft, borderRight, viewportX + targetInline, viewportX + targetInline + targetWidth, targetWidth);
        }

        blockScroll = Math.max(0, blockScroll + viewportY);
        inlineScroll = Math.max(0, inlineScroll + viewportX);
      } else {
        if (block === 'start') {
          blockScroll = targetBlock - top - borderTop;
        } else if (block === 'end') {
          blockScroll = targetBlock - bottom + borderBottom + scrollbarHeight;
        } else if (block === 'nearest') {
          blockScroll = alignNearest(top, bottom, height, borderTop, borderBottom + scrollbarHeight, targetBlock, targetBlock + targetHeight, targetHeight);
        } else {
          blockScroll = targetBlock - (top + height / 2) + scrollbarHeight / 2;
        }

        if (inline === 'start') {
          inlineScroll = targetInline - left - borderLeft;
        } else if (inline === 'center') {
          inlineScroll = targetInline - (left + width / 2) + scrollbarWidth / 2;
        } else if (inline === 'end') {
          inlineScroll = targetInline - right + borderRight + scrollbarWidth;
        } else {
          inlineScroll = alignNearest(left, right, width, borderLeft, borderRight + scrollbarWidth, targetInline, targetInline + targetWidth, targetWidth);
        }

        var scrollLeft = frame.scrollLeft,
            scrollTop = frame.scrollTop;
        blockScroll = Math.max(0, Math.min(scrollTop + blockScroll, frame.scrollHeight - height + scrollbarHeight));
        inlineScroll = Math.max(0, Math.min(scrollLeft + inlineScroll, frame.scrollWidth - width + scrollbarWidth));
        targetBlock += scrollTop - blockScroll;
        targetInline += scrollLeft - inlineScroll;
      }

      computations.push({
        el: frame,
        top: blockScroll,
        left: inlineScroll
      });
    }

    return computations;
  });

  function isOptionsObject(options) {
    return options === Object(options) && Object.keys(options).length !== 0;
  }

  function defaultBehavior(actions, behavior) {
    if (behavior === void 0) {
      behavior = 'auto';
    }

    var canSmoothScroll = 'scrollBehavior' in document.body.style;
    actions.forEach(function (_ref) {
      var el = _ref.el,
          top = _ref.top,
          left = _ref.left;

      if (el.scroll && canSmoothScroll) {
        el.scroll({
          top: top,
          left: left,
          behavior: behavior
        });
      } else {
        el.scrollTop = top;
        el.scrollLeft = left;
      }
    });
  }

  function getOptions(options) {
    if (options === false) {
      return {
        block: 'end',
        inline: 'nearest'
      };
    }

    if (isOptionsObject(options)) {
      return options;
    }

    return {
      block: 'start',
      inline: 'nearest'
    };
  }

  function scrollIntoView(target, options) {
    var targetIsDetached = !target.ownerDocument.documentElement.contains(target);

    if (isOptionsObject(options) && typeof options.behavior === 'function') {
      return options.behavior(targetIsDetached ? [] : compute(target, options));
    }

    if (targetIsDetached) {
      return;
    }

    var computeOptions = getOptions(options);
    return defaultBehavior(compute(target, computeOptions), computeOptions.behavior);
  }

  var NOT_FOUND = {};
  function getPassThroughProps(props, excludeProps) {
    var rest = {};
    for (var _i = 0, _Object$keys = Object.keys(props); _i < _Object$keys.length; _i++) {
      var property = _Object$keys[_i];
      if (!excludeProps[property]) {
        rest[property] = props[property];
      }
    }
    return rest;
  }
  function scrollTo(node, options) {
    // https://github.com/stipsan/scroll-into-view-if-needed/issues/359
    // scrollIntoView(ReactDOM.findDOMNode(this.field.current), false, { duration: 300 })
    // Using `block: "center"` instead of `block: "nearest"`
    // because otherwise the `node` might be obstructed by a "floating" header.
    // https://github.com/stipsan/scroll-into-view-if-needed/issues/126#issuecomment-533089870
    scrollIntoView(node, {
      scrollMode: 'if-needed',
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      duration: options && options.duration
    });
  }

  /**
   * Selects only the values for non-removed fields:
   * removes fields thats have `0` field counter.
   *
   * Filters `values` object to contain only the "registered" fields' entries.
   * Because if a field is "unregistered", it means that the React element
   * was removed in the process, and therefore that field's entry shouldn't
   * exist in the returned `values` object.
   *
   * Values for "unregistered" fields don't get cleared from form's `values` by default
   * because of how React rendering works with unmounting and then re-mounted elements.
   *
   * @param  {object} values
   * @param  {object} fields
   * @return {object}
   */
  function getValues(values, fields) {
    var nonRemovedFieldValues = {};
    for (var _i2 = 0, _Object$keys2 = Object.keys(values); _i2 < _Object$keys2.length; _i2++) {
      var key = _Object$keys2[_i2];
      if (fields[key]) {
        nonRemovedFieldValues[key] = values[key];
      }
    }
    return nonRemovedFieldValues;
  }
  function getValue(values, key) {
    return values[key];
  }

  // `MAX_SAFE_INTEGER` is not supported by older browsers
  var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53);
  function getNext(counter) {
    if (counter < MAX_SAFE_INTEGER) {
      return counter + 1;
    } else {
      return 0;
    }
  }

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray$1(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }
  function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  var LIST_ITEM_KEY_REGEXP = /^([^:]+):(\d+):([^:]+)$/;

  /**
   * Converts values having keys `${list}:${i}:${field}`
   * into arrays of objects `{ list: [{ field, ... }, ...] }`.
   *
   * For example, in a form, there's a `<List name="list">` container element
   * and inside that container element there're 3 `<Field name="value"/>` elements.
   *
   * Then, in `values` argument, there'd be 3 fields names corresponding to those list items:
   * * "list:0:value": "a"
   * * "list:1:value": "b"
   * * "list:2:value": "c"
   *
   * After calling this function, a new `values` object is returned
   * where those 3 entries have been replaced with a single entry:
   * * "list": [{ value: "a" }, { value: "c" }]
   *
   * @param {object} values
   * @return {object}
   */
  function convertListValues(values) {
    // `values` are converted to `actualValues`.
    var actualValues = {};
    var listNames = [];
    for (var _i = 0, _Object$keys = Object.keys(values); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];
      var value = values[key];
      var match = key.match(LIST_ITEM_KEY_REGEXP);
      if (match) {
        var _match = _slicedToArray(match, 4);
          _match[0];
          var list = _match[1],
          index = _match[2],
          name = _match[3];
        if (!actualValues[list]) {
          actualValues[list] = [];
        }
        if (!actualValues[list][index]) {
          actualValues[list][index] = {};
        }
        actualValues[list][index][name] = value;
        if (listNames.indexOf(list) < 0) {
          listNames.push(list);
        }
      } else {
        actualValues[key] = value;
      }
    }
    // Compact lists: remove removed items.
    // When an item is removed indexes are not shifted.
    // Example:
    // "list:0:value": "a"
    // "list:2:value": "c"
    // Result:
    // "list": [{ value: "a" }, { value: "c" }]
    for (var _i2 = 0, _listNames = listNames; _i2 < _listNames.length; _i2++) {
      var listName = _listNames[_i2];
      actualValues[listName] = actualValues[listName].filter(function (_) {
        return _;
      });
    }
    return actualValues;
  }

  /**
   * Gets a value by path `${list}:${i}:${field}`
   * from an object having shape `{ list: [{ field, ... }, ...] }`.
   * @param {object} values
   * @param {string} key
   * @return {any} Returns `NOT_FOUND` if the value wasn't found.
   */
  function getListValue(values, key) {
    var match = key.match(LIST_ITEM_KEY_REGEXP);
    if (match) {
      var _match2 = _slicedToArray(match, 4);
        _match2[0];
        var list = _match2[1],
        index = _match2[2],
        name = _match2[3];
      return values[list] && values[list][index] && values[list][index][name];
    }
    return NOT_FOUND;
  }
  function getFieldName(listName, i, name) {
    return "".concat(listName, ":").concat(i, ":").concat(name);
  }
  var removeListAction = function removeListAction(name) {
    return function (state) {
      delete state.lists[name];
      delete state.listInstanceCounters[name];
    };
  };

  function _typeof$4(obj) { "@babel/helpers - typeof"; return _typeof$4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof$4(obj); }
  function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$3(Object(source), !0).forEach(function (key) { _defineProperty$4(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties$3(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$4(descriptor.key), descriptor); } }
  function _createClass$3(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$3(Constructor.prototype, protoProps); if (staticProps) _defineProperties$3(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _defineProperty$4(obj, key, value) { key = _toPropertyKey$4(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey$4(arg) { var key = _toPrimitive$4(arg, "string"); return _typeof$4(key) === "symbol" ? key : String(key); }
  function _toPrimitive$4(input, hint) { if (_typeof$4(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof$4(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var ListPlugin = /*#__PURE__*/function () {
    function ListPlugin() {
      _classCallCheck$3(this, ListPlugin);
      _defineProperty$4(this, "lists", {});
    }
    _createClass$3(ListPlugin, [{
      key: "getContextFunctions",
      value: function getContextFunctions() {
        var _this = this;
        return {
          onRegisterList: function onRegisterList(_ref) {
            var updateState = _ref.updateState;
            return function (name, _ref2) {
              var onReset = _ref2.onReset,
                listState = _ref2.state;
              _this.lists[name] = {
                onReset: onReset
              };
              updateState(function (state) {
                if (state.listInstanceCounters[name] === undefined) {
                  state.listInstanceCounters[name] = 1;
                } else {
                  state.listInstanceCounters[name]++;
                }
                state.lists[name] = listState;
              });
            };
          },
          onUnregisterList: function onUnregisterList(_ref3) {
            var updateState = _ref3.updateState;
            return function (name) {
              _this.lists[name] = undefined;
              // Doesn't reset the list's `state` in form state
              // because the list might get re-mounted at some other position
              // in the document during the ongoing React re-render.
              updateState(function (state) {
                // Doesn't create a new `state` object.
                // Instead it "mutates" the original one.
                // The rationale is provided in `actions.js`.
                state.listInstanceCounters[name]--;
              });
            };
          },
          onListStateChange: function onListStateChange(_ref4) {
            var updateState = _ref4.updateState;
            return function (name, newState) {
              updateState(function (state) {
                // Doesn't create a new `state` object.
                // Instead it "mutates" the original one.
                // The rationale is provided in `actions.js`.
                state.lists[name] = newState;
              });
            };
          }
        };
      }
    }, {
      key: "getInitialState",
      value: function getInitialState(state) {
        return _objectSpread$3(_objectSpread$3({}, state), {}, {
          lists: {},
          listInstanceCounters: {}
        });
      }
    }, {
      key: "getValues",
      value: function getValues(values) {
        // In `values`, replace all entries having keys `${list}:${index}:${field}`
        // with a single `${list}` entry being an array of objects with keys `${field}`.
        return convertListValues(values);
      }
    }, {
      key: "getValue",
      value: function getValue(values, key) {
        return getListValue(values, key);
      }
    }, {
      key: "onResetField",
      value: function onResetField(name, form) {
        if (this.lists[name]) {
          var _form$getState = form.getState(),
            fields = _form$getState.fields;
          for (var _i = 0, _Object$keys = Object.keys(fields); _i < _Object$keys.length; _i++) {
            var field = _Object$keys[_i];
            if (field.indexOf("".concat(name, ":")) === 0) {
              form.resetField(field);
            }
          }
          this.lists[name].onReset();
          return true;
        }
      }
    }, {
      key: "onUpdate",
      value: function onUpdate(_ref5) {
        var getState = _ref5.getState,
          dispatch = _ref5.dispatch;
        var _getState = getState(),
          listInstanceCounters = _getState.listInstanceCounters;
        for (var _i2 = 0, _Object$keys2 = Object.keys(listInstanceCounters); _i2 < _Object$keys2.length; _i2++) {
          var name = _Object$keys2[_i2];
          // Remove unmounted `<List/>`s.
          if (listInstanceCounters[name] === 0) {
            dispatch(removeListAction(name));
          }
        }
      }
    }]);
    return ListPlugin;
  }();

  // With the current implementation, actions "mutate" the original `state` object
  // instead of creating a new one every time.
  //
  // One rationale is that this way it might theoretically be more performant
  // to reuse and "mutate" the existing `state` object instead of creating a new one
  // on each keystroke.
  //
  // The most significant rationale is that mutating the original `state` object directly
  // eliminates any potential "race condition" bugs where state changes would be lost.
  // Consider two consequtive action calls: one to set a field's value
  // and the other one to focus the field. If the original `state` object is mutated,
  // no changes are lost. But if a new state object would've been created by each
  // of those two actions, the second one would overwrite the changes made by the first one.

  var registerField = function registerField(_ref) {
    var field = _ref.field,
      value = _ref.value,
      validate = _ref.validate,
      error = _ref.error;
    return function (state) {
      // Uses a numerical counter instead of a boolean.
      // https://github.com/erikras/redux-form/issues/1705
      // If the value is `0` then it means that the field
      // has been previously initialized so not reinitializing it.
      // This also preserves the initial value of the field.
      // Because a user may choose some value which would result in
      // a couple of new form fields to appear above this field,
      // and so React unmounts this field only to later mount it again
      // a couple of new form fields lower.
      // So this trick retains the field's state (including value).
      if (state.fields[field] === undefined) {
        state.fields[field] = 1;
        var validationError = validate(value);

        // Only initializes the field with its default `value`
        // if it hasn't been seen before.
        state.values[field] = value;
        state.validationErrors[field] = validationError;
        state.errors[field] = error;
        state.showErrors[field] = Boolean(error || validationError);
      } else {
        state.fields[field]++;
      }
    };
  };
  var unregisterField = function unregisterField(field) {
    return function (state) {
      // This library uses a numerical counter for tracking a field's "presence" status.
      // https://github.com/erikras/redux-form/issues/1705
      //
      // The reason is that React re-uses existing (mounted) components
      // when their properties change, resulting in situtations when
      // a field gets inserted or removed from the list of fields
      // causing a wave of "unregister"/"register" events.
      //
      // For example:
      //
      // <Field name="one"/>
      // <Field name="two"/>
      // <Field name="three"/>
      //
      // At some point becomes:
      //
      // <Field name="one"/>
      // <Field name="four"/>
      // <Field name="two"/>
      //
      // In that case, React:
      // * Re-purposes `<Field name="two"/>` for rendering `<Field name="four"/>`
      // * Re-purposes `<Field name="three"/>` for rendering `<Field name="two"/>`
      //
      // The first of the two results in "unregiser"-ing `<Field name="two"/>`.
      // The second of the two results in re-"regiser"-ing `<Field name="two"/>`.
      //
      // In order for `<Field name="two"/>` value to not get lost, it has to be retained
      // after it gets "unregister"-ed.
      //
      // So even if the registration counter for a field becomes equal to `0`,
      // it's still not destroyed, because it could reappear at some other position in the form.
      //
      state.fields[field]--;
    };
  };

  // Sets field `value`.
  // (e.g. `this.form.set(field, value)`).
  var setFieldValue = function setFieldValue(field, value) {
    return function (state) {
      state.values[field] = value;
    };
  };

  // Sets field externally-set `error`.
  var setFieldError = function setFieldError(field, error) {
    return function (state) {
      var validationError = state.validationErrors[field];
      state.errors[field] = error;
      state.showErrors[field] = Boolean(validationError || error);
    };
  };

  // Sets field validation `error`.
  var setFieldValidationError = function setFieldValidationError(field, validationError) {
    return function (state) {
      var error = state.errors[field];
      state.validationErrors[field] = validationError;
      state.showErrors[field] = Boolean(validationError || error);
    };
  };
  var fieldFocused = function fieldFocused(field) {
    return function (state) {
      state.latestFocusedField = field;
    };
  };
  var setFormSubmitting = function setFormSubmitting(submitting) {
    return function (state) {
      state.submitting = submitting;
    };
  };
  var setFormSubmitAttempted = function setFormSubmitAttempted(submitAttempted) {
    return function (state) {
      state.submitAttempted = submitAttempted;
    };
  };
  var removeField = function removeField(field) {
    return function (state) {
      delete state.fields[field];
      delete state.values[field];
      delete state.errors[field];
      delete state.validationErrors[field];
      delete state.showErrors[field];
      if (state.latestFocusedField === field) {
        state.latestFocusedField = undefined;
      }
    };
  };

  function _typeof$3(obj) { "@babel/helpers - typeof"; return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof$3(obj); }
  function _extends$2() { _extends$2 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$2.apply(this, arguments); }
  function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$2(Object(source), !0).forEach(function (key) { _defineProperty$3(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties$2(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$3(descriptor.key), descriptor); } }
  function _createClass$2(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$2(Constructor.prototype, protoProps); if (staticProps) _defineProperties$2(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf$2(subClass, superClass); }
  function _setPrototypeOf$2(o, p) { _setPrototypeOf$2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$2(o, p); }
  function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf$2(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$2(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$2(this, result); }; }
  function _possibleConstructorReturn$2(self, call) { if (call && (_typeof$3(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized$2(self); }
  function _assertThisInitialized$2(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
  function _getPrototypeOf$2(o) { _getPrototypeOf$2 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$2(o); }
  function _defineProperty$3(obj, key, value) { key = _toPropertyKey$3(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey$3(arg) { var key = _toPrimitive$3(arg, "string"); return _typeof$3(key) === "symbol" ? key : String(key); }
  function _toPrimitive$3(input, hint) { if (_typeof$3(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof$3(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var Context = /*#__PURE__*/React__default["default"].createContext();
  var EMPTY_VALUE = null;
  var Form = /*#__PURE__*/function (_Component) {
    _inherits$2(Form, _Component);
    var _super = _createSuper$2(Form);
    // Stores fields' `validate()` functions which are used
    // when calling `set(field, value)` and `clear(field)`.
    // Also stores fields' `scroll()` and `focus()` functions.

    function Form(props) {
      var _this;
      _classCallCheck$2(this, Form);
      _this = _super.call(this, props);
      _defineProperty$3(_assertThisInitialized$2(_this), "fields", {});
      _defineProperty$3(_assertThisInitialized$2(_this), "watchedFields", {});
      _defineProperty$3(_assertThisInitialized$2(_this), "watchedFieldsList", []);
      _defineProperty$3(_assertThisInitialized$2(_this), "onRegisterField", function (field, _ref) {
        var value = _ref.value,
          onChange = _ref.onChange,
          validate = _ref.validate,
          error = _ref.error,
          scroll = _ref.scroll,
          focus = _ref.focus;
        if (value === undefined) {
          value = _this.getInitialValue(field);
        }

        // React doesn't know how to properly handle `value === undefined`.
        // https://stackoverflow.com/a/74229877/970769
        if (value === undefined) {
          value = EMPTY_VALUE;
        }

        // The stored field info is used to `validate()` field `value`s
        // and set the corresponding `error`s
        // when calling `set(field, value)` and `clear(field)`.
        //
        // If a field happens to register the second time
        // (e.g. as a result of React "reconciliation" because of the order change)
        // then the methods for the field will be updated.
        //
        _this.fields[field] = {
          initialValue: value,
          validate: validate,
          scroll: scroll,
          focus: focus,
          onChange: onChange
        };
        // This is used for the `autofocus` feature.
        if (!_this.firstField) {
          _this.firstField = field;
        }
        _this.dispatch(registerField({
          field: field,
          value: value,
          validate: validate,
          error: error
        }));
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "onUnregisterField", function (field) {
        _this.dispatch(unregisterField(field));
        // Rerender the form so that the field is
        // removed if it's no longer mounted.
        _this.forceUpdate();
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "dispatch", function (action, callback) {
        // const newState = action(this.getState())
        // this.applyStateChanges(newState, callback)

        // See the comments in `actions.js` for the rationale
        // on why the original `state` gets mutated instead of
        // creating a new `state` object.
        action(_this.getState());
        _this.applyStateChanges(_this.getState(), callback);
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "updateState", function (stateUpdater) {
        // const newState = stateUpdater(this.state)
        // this.applyStateChanges(newState)

        // See the comments in `actions.js` for the rationale
        // on why the original `state` gets mutated instead of
        // creating a new `state` object.
        stateUpdater(_this.getState());
        _this.applyStateChanges(_this.getState());
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "transformValueForSubmit", function (value) {
        var trim = _this.props.trim;
        if (trim && typeof value === 'string') {
          value = value.trim();
        }
        // Convert empty strings to `null`.
        //
        // Using `undefined` instead of `null` wouldn't work because the browser
        // wouldn't send such fields to the server because `JSON.stringify()` skips
        // `undefined` properties when converting a JSON object to a string.
        //
        // Sending a `null` field value rather than omitting it entirely from an HTTP request
        // is used in order to be able to "clear" the form field value on the server side.
        //
        if (value === '') {
          value = null;
        }
        return value;
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "getInitialValue", function (name) {
        var _this$getState = _this.getState(),
          initialValues = _this$getState.initialValues;
        for (var _iterator = _createForOfIteratorHelperLoose(_this.plugins), _step; !(_step = _iterator()).done;) {
          var plugin = _step.value;
          if (plugin.getValue) {
            var value = plugin.getValue(initialValues, name);
            if (value !== NOT_FOUND) {
              return value;
            }
          }
        }
        return getValue(initialValues, name);
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "values", function () {
        var _this$getState2 = _this.getState(),
          values = _this$getState2.values,
          fields = _this$getState2.fields;
        return _this.applyPluginValueTransforms(getValues(values, fields));
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "reset", function (field) {
        // `<Form/>` `.reset()` instance method no longer accepts `fieldName: string` argument.
        // It still works the old way, but the `fieldName: string` arugment is considered deprecated.
        // It worked in a weird way: reset the field to its initial value rather than `undefined`.
        // To reset a field, use `.clear(fieldName)` instance method instead.
        if (typeof field === 'string') {
          return _this.resetField(field);
        }
        _this.props.plugins;
        for (var _iterator2 = _createForOfIteratorHelperLoose(_this.plugins), _step2; !(_step2 = _iterator2()).done;) {
          var plugin = _step2.value;
          if (plugin.onReset) {
            plugin.onReset();
          }
        }

        // `this.setState()` is called on `this.state`
        // rather than creating a new `state` because `this.state`
        // is used as the `context` property for `React.Context`
        // meaning that `state` reference shouldn't change.

        // All `<Field/>`s will be re-mounted and re-registered.
        var newState = _this.getInitialState();

        // `this.getInitialState()` produces a state with zero `fields` counters.
        // But, subsequently, the change to `resetCounter` results in  a complete
        // re-mounting of the `<form/>`, including all of the `<Field/>`s, which
        // decrements all `fields` counters.
        // If the current `fields` counters weren't preserved, then the counters
        // would first be decremented to `-1` on unmount, and then incremented to `0`
        // on re-mount, and the form would think that no fields are mounted.
        // Preserving the current non-zero `fields` counters fixes that.
        newState.fields = _this.getState().fields;

        // Reset the first focusable field since the form is gonna be reset.
        _this.firstField = undefined;
        _this.applyStateChanges(newState, function () {
          if (!_this.mounted) {
            return;
          }
          // Autofocus the form (if not configured otherwise)
          var autoFocus = _this.props.autoFocus;
          if (autoFocus) {
            // If `reset()` was called inside `onSubmit()`, then
            // don't focus on a field here because it might be `disabled`.
            // Instead, schedule the autofocus for later, when the fields
            // are no longer disabled.
            if (_this.getState().submitting) {
              _this.focusableBeforeSubmit = _this.getFocusable();
            } else {
              _this.focus();
            }
          }
          // Trigger each `<Field/>`'s `onChange()` handler.
          for (var _i = 0, _Object$keys = Object.keys(_this.getState().fields); _i < _Object$keys.length; _i++) {
            var _field = _Object$keys[_i];
            // If the field is still mounted.
            if (_this.fields[_field]) {
              var _this$fields$_field = _this.fields[_field],
                onChange = _this$fields$_field.onChange,
                initialValue = _this$fields$_field.initialValue;
              if (onChange) {
                onChange(initialValue);
              }
            }
          }
        }, {
          resetForm: true
        });
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "resetField", function (name) {
        for (var _iterator3 = _createForOfIteratorHelperLoose(_this.plugins), _step3; !(_step3 = _iterator3()).done;) {
          var plugin = _step3.value;
          if (plugin.onResetField) {
            if (plugin.onResetField(name, _assertThisInitialized$2(_this))) {
              return;
            }
          }
        }
        var initialValue = !_this.fields[name] || _this.fields[name].initialValue === undefined ? _this.getInitialValue(name) : _this.fields[name].initialValue;
        // If the field is still registered (mounted), then validate the value.
        // Otherwise, assume the value is valid because there's no validation function available.
        var validationError = _this.fields[name] ? _this.fields[name].validate(initialValue) : undefined;
        _this.dispatch(setFieldValue(name, initialValue));
        _this.dispatch(setFieldValidationError(name, validationError));
        // Trigger the `<Field/>`'s `onChange()` handler.
        // If the field is still mounted.
        if (_this.fields[name]) {
          var _this$fields$name = _this.fields[name],
            onChange = _this$fields$name.onChange,
            onValidationError = _this$fields$name.onValidationError,
            _initialValue = _this$fields$name.initialValue;
          if (onChange) {
            onChange(_initialValue);
          }
          if (onValidationError) {
            onValidationError(validationError);
          }
        }
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "removeField", function (field) {
        _this.dispatch(removeField(field));
        delete _this.fields[field];
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "cleanUpRemovedFields", function () {
        var _this$getState3 = _this.getState(),
          fields = _this$getState3.fields;
        for (var _i2 = 0, _Object$keys2 = Object.keys(fields); _i2 < _Object$keys2.length; _i2++) {
          var field = _Object$keys2[_i2];
          // Remove unmounted `<Field/>`s.
          if (fields[field] === 0) {
            _this.removeField(field);
          }
        }
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "onAfterSubmit", function () {
        var onAfterSubmit = _this.props.onAfterSubmit;
        for (var _iterator4 = _createForOfIteratorHelperLoose(_this.plugins), _step4; !(_step4 = _iterator4()).done;) {
          var plugin = _step4.value;
          if (plugin.onAfterSubmit) {
            plugin.onAfterSubmit();
          }
        }
        if (onAfterSubmit) {
          onAfterSubmit();
        }
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "onSubmit", function (event) {
        var _this$props = _this.props,
          onSubmit = _this$props.onSubmit,
          onBeforeSubmit = _this$props.onBeforeSubmit;
        var _this$getState4 = _this.getState();
          _this$getState4.submitAttempted;
        _this.dispatch(setFormSubmitAttempted(true));

        // If it's an event handler then `.preventDefault()` it
        // (which is the case for the intended
        //  `<form onSubmit={ submit(...) }/>` use case)
        if (event && typeof event.preventDefault === 'function') {
          event.preventDefault();
        }

        // Do nothing if the form is submitting
        // (i.e. submit is in progress)
        if (_this.getState().submitting) {
          return;
        }

        // Can be used, for example, to reset
        // custom error messages.
        // (not <Field/> `error`s)
        // E.g. it could be used to reset
        // overall form errors like "Form submission failed".
        if (onBeforeSubmit) {
          onBeforeSubmit();
        }

        // Submit the form if it's valid.
        // Otherwise highlight invalid fields.
        if (_this.validate()) {
          _this.executeFormAction(onSubmit, _this.getValuesForSubmit());
        }
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "focus", function (field) {
        if (field) {
          return _this.fields[field].focus();
        }
        _this.getFocusable().focus();
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "scroll", function (field, options) {
        return _this.fields[field].scroll(options);
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "clear", function (field) {
        return _this.set(field, EMPTY_VALUE);
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "get", function (field) {
        return _this.getState().values[field];
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "set", function (field, value) {
        return _this._set(field, value, {});
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "_set", function (field, value, _ref2) {
        var changed = _ref2.changed;
        _this.dispatch(setFieldValue(field, value));
        // If the field is still mounted.
        if (_this.fields[field]) {
          // Validate field value.
          var validationError = _this.fields[field].validate(value);
          _this.dispatch(setFieldValidationError(field, validationError));
          // Trigger the `<Field/>`'s `onChange()` handler.
          if (changed !== false) {
            var _this$fields$field = _this.fields[field],
              onChange = _this$fields$field.onChange,
              onValidationError = _this$fields$field.onValidationError;
            if (onChange) {
              onChange(value);
            }
            if (onValidationError) {
              onValidationError(validationError);
            }
          }
        }
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "watch", function (field) {
        if (!_this.watchedFields[field]) {
          _this.watchedFields[field] = true;
          _this.watchedFieldsList.push(field);
        }
        return _this.get(field);
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "getState", function () {
        return _this.state.state;
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "setFormNode", function (node) {
        return _this.form = node;
      });
      _defineProperty$3(_assertThisInitialized$2(_this), "getSubmitButtonNode", function () {
        return _this.form.querySelector('button[type="submit"]');
      });
      var plugins = _this.props.plugins;
      _this.plugins = plugins.map(function (Plugin) {
        return new Plugin(function () {
          return _this.props;
        }, function () {
          return _this.getState();
        });
      });
      _this.state = _this.getInitialContext();
      return _this;
    }
    _createClass$2(Form, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var autoFocus = this.props.autoFocus;
        this.mounted = true;

        // First `form.constructor` is called,
        // then `form.componentWillMount` is called,
        // then `field.constructor` is called,
        // then `field.componentWillMount` is called,
        // then `field.componentDidMount` is called,
        // then `form.componentDidMount` is called.

        for (var _iterator5 = _createForOfIteratorHelperLoose(this.plugins), _step5; !(_step5 = _iterator5()).done;) {
          var plugin = _step5.value;
          if (plugin.onMount) {
            plugin.onMount();
          }
        }

        // Autofocus the form when it's mounted and all of its fields are initialized.
        if (autoFocus) {
          this.focus();
        }
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        this.cleanUpRemovedFields();
        for (var _iterator6 = _createForOfIteratorHelperLoose(this.plugins), _step6; !(_step6 = _iterator6()).done;) {
          var plugin = _step6.value;
          if (plugin.onUpdate) {
            plugin.onUpdate({
              getState: this.getState,
              dispatch: this.dispatch
            });
          }
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        for (var _iterator7 = _createForOfIteratorHelperLoose(this.plugins), _step7; !(_step7 = _iterator7()).done;) {
          var plugin = _step7.value;
          if (plugin.onUnmount) {
            plugin.onUnmount();
          }
        }
        this.mounted = false;
      }
    }, {
      key: "getInitialState",
      value: function getInitialState() {
        var initialState = this._getInitialState();
        for (var _iterator8 = _createForOfIteratorHelperLoose(this.plugins), _step8; !(_step8 = _iterator8()).done;) {
          var plugin = _step8.value;
          if (plugin.getInitialState) {
            initialState = plugin.getInitialState(initialState);
          }
        }
        return initialState;
      }
    }, {
      key: "_getInitialState",
      value: function _getInitialState() {
        var values = this.props.values;
        return getInitialState(this.state ? this.getState().initialValues : values);
      }
    }, {
      key: "getInitialContext",
      value: function getInitialContext() {
        var initialContext = this._getInitialContext();

        // Add `context` functions by plugins.
        for (var _iterator9 = _createForOfIteratorHelperLoose(this.plugins), _step9; !(_step9 = _iterator9()).done;) {
          var plugin = _step9.value;
          if (plugin.getContextFunctions) {
            var contextFunctions = plugin.getContextFunctions();
            for (var _i3 = 0, _Object$keys3 = Object.keys(contextFunctions); _i3 < _Object$keys3.length; _i3++) {
              var name = _Object$keys3[_i3];
              initialContext[name] = contextFunctions[name]({
                updateState: initialContext.updateState
              });
            }
          }
        }
        return initialContext;
      }
    }, {
      key: "_getInitialContext",
      value: function _getInitialContext() {
        var _this$props2 = this.props,
          requiredMessage = _this$props2.requiredMessage,
          initialState = _this$props2.initialState;
        return {
          state: initialState || this.getInitialState(),
          // initialState,
          resetCounter: 0,
          dispatch: this.dispatch,
          updateState: this.updateState,
          onRegisterField: this.onRegisterField,
          onUnregisterField: this.onUnregisterField,
          transformValueForSubmit: this.transformValueForSubmit,
          getRequiredMessage: function getRequiredMessage() {
            return requiredMessage;
          },
          // These're used by `<List/>`.
          focus: this.focus,
          getValues: this.values
        };
      }
    }, {
      key: "applyStateChanges",
      value: function applyStateChanges(newState, callback) {
        var _this2 = this;
        var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          resetForm = _ref3.resetForm;
        // Currently, `prevState` is always equal to `newState`
        // because state changes mutate the state object itself.
        var prevContext = this.getContext();
        var prevState = prevContext.state;

        // Run any field value watchers:
        //
        // See if any fields are watched.
        // If they are, see if their values have changed.
        // If they have, re-render the form after updating state.
        //
        // This piece of code currently doesn't do anything
        // because `prevState` is always equal to `newState`.
        // Maybe it could be used in some future if new state objects would be created
        // instead of mutating the existing state object.
        //
        var shouldReRenderForm = false;
        for (var _iterator10 = _createForOfIteratorHelperLoose(this.watchedFieldsList), _step10; !(_step10 = _iterator10()).done;) {
          var field = _step10.value;
          if (newState.values[field] !== prevState.values[field]) {
            // Re-render the form after updating state.
            shouldReRenderForm = true;
            break;
          }
        }

        // Update state.
        //
        // A `React.Component` always re-renders on `this.setState()`,
        // even if the `state` hasn't changed.
        // The re-rendering of the `<Form/>` is used to re-render
        // the `<Field/`>s with the updated `value`s.
        // This could potentially result in slower performance
        // on `<Form/>`s with a lots of `<Field/>`s
        // (maybe hundreds or something like that?)
        // but on regular `<Form/>`s I didn't notice any lag.
        // A possible performance optimization could be
        // not calling `this.setState()` for `<Form/>` re-rendering
        // and instead calling something like `this.forceUpdate()`
        // on just the exact `<Field/>` that called `context.dispatch(action)`.
        //
        // `this.setState()` is called on `this.state` rather than creating
        // a new `state`, because `this.state` is used as the `context` property
        // for `React.Context`, so if `state` reference changes, the whole form
        // gets re-rendered, and that's not something that should be done
        // unless any "field value watchers" have been triggered due to a changed field value.
        //
        var newContext = shouldReRenderForm ? _objectSpread$2({}, prevContext) : prevContext;
        newContext.state = newState;
        if (resetForm) {
          // Changing the `resetCounter` property results in a complete re-mounting
          // of the `<form/>`, including all of the `<Field/>`s.
          newContext.resetCounter = getNext(newContext.resetCounter);
        }
        this.setState(newContext, function () {
          // Call `onStateDidChange()` listener.
          var onStateDidChange = _this2.props.onStateDidChange;
          if (onStateDidChange) {
            onStateDidChange(_this2.getState());
          }
          if (callback) {
            callback();
          }
        });
      }

      // `value` parameter is an initial field value.
      // It is used later in case of a form or field reset.
    }, {
      key: "applyPluginValueTransforms",
      value:
      /**
       * Applies plugins' transformations to form field values.
       * @param  {object} values
       * @return {object}
       */
      function applyPluginValueTransforms(values) {
        for (var _iterator11 = _createForOfIteratorHelperLoose(this.plugins), _step11; !(_step11 = _iterator11()).done;) {
          var plugin = _step11.value;
          if (plugin.getValues) {
            values = plugin.getValues(values);
          }
        }
        return values;
      }

      // Public API
    }, {
      key: "searchForInvalidField",
      value: function searchForInvalidField() {
        var _this$getState5 = this.getState(),
          fields = _this$getState5.fields,
          values = _this$getState5.values,
          errors = _this$getState5.errors;

        // Re-run `validate()` for each field.
        // Because `validate()` function takes two arguments:
        // the current field value and all form field values,
        // and at the same time it's only called in field's `onChange`,
        // therefore other form field values could change since then
        // and that particular `validate()` wouldn't get called
        // without this explicit "revalidate all fields before submit".
        for (var _i4 = 0, _Object$keys4 = Object.keys(fields); _i4 < _Object$keys4.length; _i4++) {
          var field = _Object$keys4[_i4];
          // If the field is not mounted then ignore it.
          if (!fields[field]) {
            continue;
          }
          // Check for an externally set `error`.
          if (errors[field] !== undefined) {
            return field;
          }
          // If the field's `value` is not valid,
          // `validate(value)` returns a validation error message (or `true`).
          if (this.fields[field].validate(values[field])) {
            return field;
          }
        }
      }
    }, {
      key: "validate",
      value: function validate() {
        var _this3 = this;
        var scrollDuration = this.props.scrollDuration;
        var _this$getState6 = this.getState(),
          fields = _this$getState6.fields,
          values = _this$getState6.values;

        // Are there any invalid fields.
        // Returns the first one.
        var field = this.searchForInvalidField();
        if (!field) {
          return true;
        }

        // Re-validate all fields to highlight all required ones that're empty.
        // Otherwise, it'd just stop at the first not-valid field
        // and the user would just see that single field highlighted
        // as "Required", and then they'd have to re-submit the form
        // just to find out that some other field is "Required" too,
        // so it's better "user experience" to just highlight all
        // required fields right away.
        for (var _i5 = 0, _Object$keys5 = Object.keys(fields); _i5 < _Object$keys5.length; _i5++) {
          var _field2 = _Object$keys5[_i5];
          // Trigger `validate()` on the field
          // so that `errors` is updated inside form state.
          // (if the field is still mounted)
          if (fields[_field2]) {
            this._set(_field2, values[_field2], {
              changed: false
            });
          }
        }

        // Scroll to the invalid field.
        this.scroll(field, {
          duration: scrollDuration
        });

        // Focus the invalid field after it has been scrolled to.
        setTimeout(function () {
          if (_this3.mounted) {
            // Focus the invalid field.
            _this3.focus(field);
          }
        }, scrollDuration);

        // The form is invalid.
        return false;
      }

      /**
       * Collects the currently "registered" fields' values.
       * @return {object} `values`
       */
    }, {
      key: "getValuesForSubmit",
      value: function getValuesForSubmit() {
        var _this$getState7 = this.getState(),
          fields = _this$getState7.fields,
          values = _this$getState7.values;
        // Get only "registered" (non-removed) field values.
        var fieldValues = getValues(values, fields);
        for (var _i6 = 0, _Object$keys6 = Object.keys(fieldValues); _i6 < _Object$keys6.length; _i6++) {
          var key = _Object$keys6[_i6];
          // Trim strings (if `trim` option is set to `true`, which is the default setting).
          // Convert empty strings to `null`s.
          fieldValues[key] = this.transformValueForSubmit(fieldValues[key]);
        }
        // Apply plugins' value transformations.
        return this.applyPluginValueTransforms(fieldValues);
      }

      // Calls `<form/>`'s `onSubmit` action.
    }, {
      key: "executeFormAction",
      value: function executeFormAction(action, values) {
        var onError = this.props.onError;
        var result;
        try {
          result = action(values);
        } catch (error) {
          if (onError(error) === false) {
            throw error;
          }
        }
        // If the form submit action returned a `Promise`
        // then track this `Promise`'s progress.
        if (result && typeof result.then === 'function') {
          this.onSubmitPromise(result).then(this.onAfterSubmit);
        } else {
          this.setFormSubmitting(false);
          this.onAfterSubmit();
        }
      }
    }, {
      key: "snapshotFocus",
      value: function snapshotFocus() {
        // On Mac, elements that aren't text input elements
        // tend not to get focus assigned to them.
        // Therefore, if the submit button was clicked to submit the form
        // then `document.activeElement` will still be `<body/>`.
        this.focusableBeforeSubmit = document.activeElement;
        if (!document.activeElement || document.activeElement === document.body) {
          this.focusableBeforeSubmit = this.getSubmitButtonNode();
        }
      }
    }, {
      key: "restoreFocus",
      value: function restoreFocus(force) {
        if (force || !document.activeElement || document.activeElement === document.body) {
          // The `<input/>` field might have been remounted right after form submit,
          // for example, if the developer calls `form.reset()` in `onSubmit()`.
          if (this.focusableBeforeSubmit instanceof Element && !document.body.contains(this.focusableBeforeSubmit)) {
            this.focusableBeforeSubmit = undefined;
          }
          if (this.focusableBeforeSubmit) {
            this.focusableBeforeSubmit.focus();
            this.focusableBeforeSubmit = undefined;
          }
        }
      }
    }, {
      key: "setFormSubmitting",
      value: function setFormSubmitting$1(submitting, callback, forceRestoreFocus) {
        var _this4 = this;
        this.dispatch(setFormSubmitting(submitting), function () {
          if (!submitting) {
            _this4.restoreFocus(forceRestoreFocus);
          }
          if (callback) {
            callback();
          }
        });
      }
    }, {
      key: "resetFormSubmittingState",
      value: function resetFormSubmittingState(forceRestoreFocus) {
        var _this5 = this;
        return new Promise(function (resolve) {
          if (_this5.mounted) {
            _this5.setFormSubmitting(false, resolve, forceRestoreFocus);
          } else {
            resolve();
          }
        });
      }

      // Is called when `<form/>` `onSubmit` returns a `Promise`.
    }, {
      key: "onSubmitPromise",
      value: function onSubmitPromise(promise) {
        var _this6 = this;
        // When `submitting` flag is set to `true`
        // all fields and the submit button will become disabled.
        // This results in focus being lost.
        // To preserve focus, the currently focused DOM node is noted
        // and after the form is submitted the focus is restored.
        // The focus must be restored after the form re-renders
        // with `submitting: false`, hence the `.setState()` `Promise`.
        this.snapshotFocus();
        this.setFormSubmitting(true);
        return promise.then(function () {
          return _this6.resetFormSubmittingState();
        }, function (error) {
          return _this6.resetFormSubmittingState(true).then(function () {
            var onError = _this6.props.onError;
            if (onError(error) === false) {
              throw error;
            }
          });
        });
      }
    }, {
      key: "getFocusable",
      value:
      /**
       * Returns a "focusable".
       * @return {(object|Element)} Returns either a `field` object having `.focus()` method or the submit button `Element`.
       */
      function getFocusable() {
        if (this.firstField) {
          return this.fields[this.firstField];
        }
        return this.getSubmitButtonNode();
      }

      // Scrolls to a form field (is used internally + public API).
    }, {
      key: "getContext",
      value: function getContext() {
        return this.state;
      }
    }, {
      key: "render",
      value: function render() {
        var children = this.props.children;
        var resetCounter = this.getContext.resetCounter;
        var _this$getState8 = this.getState(),
          submitting = _this$getState8.submitting;
        return /*#__PURE__*/React__default["default"].createElement("form", _extends$2({
          key: resetCounter,
          ref: this.setFormNode
        }, getPassThroughProps(this.props, Form.propTypes), {
          onSubmit: this.onSubmit
        }), /*#__PURE__*/React__default["default"].createElement(Context.Provider, {
          value: this.getContext()
        }, typeof children === 'function' ? /*#__PURE__*/React__default["default"].createElement(Children, {
          values: this.mounted ? this.values() : undefined,
          reset: this.reset,
          set: this.set,
          clear: this.clear,
          scroll: this.scroll,
          focus: this.focus,
          watch: this.watch,
          submitting: submitting
        }, children) : children));
      }
    }]);
    return Form;
  }(React.Component); // Added a functional `Children` component to work around a React warning:
  // "Invalid hook call. Hooks can only be called inside of the body of a function component".
  _defineProperty$3(Form, "propTypes", {
    onSubmit: PropTypes__default["default"].func.isRequired,
    onBeforeSubmit: PropTypes__default["default"].func,
    onAfterSubmit: PropTypes__default["default"].func,
    onStateDidChange: PropTypes__default["default"].func,
    onAbandon: PropTypes__default["default"].func,
    initialState: PropTypes__default["default"].object,
    values: PropTypes__default["default"].object,
    autoFocus: PropTypes__default["default"].bool.isRequired,
    trim: PropTypes__default["default"].bool.isRequired,
    requiredMessage: PropTypes__default["default"].string.isRequired,
    onError: PropTypes__default["default"].func.isRequired,
    scrollDuration: PropTypes__default["default"].number.isRequired,
    plugins: PropTypes__default["default"].arrayOf(PropTypes__default["default"].func).isRequired,
    children: PropTypes__default["default"].oneOfType([PropTypes__default["default"].func, PropTypes__default["default"].node]).isRequired
  });
  _defineProperty$3(Form, "defaultProps", {
    autoFocus: false,
    trim: true,
    requiredMessage: 'Required',
    onError: function onError(error) {
      return false;
    },
    scrollDuration: 300,
    plugins: [OnAbandonPlugin, ListPlugin]
  });
  function Children(_ref4) {
    var values = _ref4.values,
      reset = _ref4.reset,
      set = _ref4.set,
      clear = _ref4.clear,
      scroll = _ref4.scroll,
      focus = _ref4.focus,
      watch = _ref4.watch,
      submitting = _ref4.submitting,
      children = _ref4.children;
    return children({
      values: values,
      reset: reset,
      set: set,
      clear: clear,
      scroll: scroll,
      focus: focus,
      watch: watch,
      submitting: submitting
    });
  }
  Children.propTypes = {
    values: PropTypes__default["default"].object,
    reset: PropTypes__default["default"].func.isRequired,
    set: PropTypes__default["default"].func.isRequired,
    clear: PropTypes__default["default"].func.isRequired,
    scroll: PropTypes__default["default"].func.isRequired,
    focus: PropTypes__default["default"].func.isRequired,
    watch: PropTypes__default["default"].func.isRequired,
    submitting: PropTypes__default["default"].bool.isRequired,
    children: PropTypes__default["default"].func.isRequired
  };
  var contextPropType = PropTypes__default["default"].shape({
    state: PropTypes__default["default"].shape({
      fields: PropTypes__default["default"].object.isRequired,
      values: PropTypes__default["default"].object.isRequired,
      initialValues: PropTypes__default["default"].object.isRequired,
      errors: PropTypes__default["default"].object.isRequired,
      validationErrors: PropTypes__default["default"].object.isRequired,
      showErrors: PropTypes__default["default"].object.isRequired,
      latestFocusedField: PropTypes__default["default"].string,
      submitting: PropTypes__default["default"].bool.isRequired,
      submitAttempted: PropTypes__default["default"].bool.isRequired
    }).isRequired,
    updateState: PropTypes__default["default"].func.isRequired,
    onRegisterField: PropTypes__default["default"].func.isRequired,
    onUnregisterField: PropTypes__default["default"].func.isRequired,
    transformValueForSubmit: PropTypes__default["default"].func.isRequired,
    focus: PropTypes__default["default"].func.isRequired,
    dispatch: PropTypes__default["default"].func.isRequired,
    getRequiredMessage: PropTypes__default["default"].func.isRequired,
    getValues: PropTypes__default["default"].func.isRequired,
    // These get added by `ListPlugin`.
    onRegisterList: PropTypes__default["default"].func.isRequired,
    onListStateChange: PropTypes__default["default"].func.isRequired
  });

  function _typeof$2(obj) { "@babel/helpers - typeof"; return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof$2(obj); }
  function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$2(descriptor.key), descriptor); } }
  function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf$1(subClass, superClass); }
  function _setPrototypeOf$1(o, p) { _setPrototypeOf$1 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$1(o, p); }
  function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf$1(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$1(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$1(this, result); }; }
  function _possibleConstructorReturn$1(self, call) { if (call && (_typeof$2(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized$1(self); }
  function _assertThisInitialized$1(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
  function _getPrototypeOf$1(o) { _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$1(o); }
  function _defineProperty$2(obj, key, value) { key = _toPropertyKey$2(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey$2(arg) { var key = _toPrimitive$2(arg, "string"); return _typeof$2(key) === "symbol" ? key : String(key); }
  function _toPrimitive$2(input, hint) { if (_typeof$2(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof$2(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _extends$1() { _extends$1 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }
  function List_(props) {
    return /*#__PURE__*/React__default["default"].createElement(Context.Consumer, null, function (context) {
      return /*#__PURE__*/React__default["default"].createElement(List, _extends$1({}, props, {
        context: context
      }));
    });
  }
  var List = /*#__PURE__*/function (_React$Component) {
    _inherits$1(List, _React$Component);
    var _super = _createSuper$1(List);
    function List(props) {
      var _this;
      _classCallCheck$1(this, List);
      _this = _super.call(this, props);
      _defineProperty$2(_assertThisInitialized$1(_this), "reset", function () {
        _this.setListState(_this.getInitialListState());
      });
      _defineProperty$2(_assertThisInitialized$1(_this), "getFieldName", function (itemId, name) {
        if (typeof itemId !== 'number') {
          throw new Error('Each `<Feild/>` in a `<List/>` must have an `item` property');
        }
        return getFieldName(_this.props.name, itemId, name);
      });
      _defineProperty$2(_assertThisInitialized$1(_this), "onRegisterField", function (name) {
        if (!_this.firstFieldName) {
          _this.firstFieldName = name;
        }
      });
      _defineProperty$2(_assertThisInitialized$1(_this), "add", function () {
        var context = _this.props.context;
        var _this$getListState = _this.getListState(),
          items = _this$getListState.items,
          maxItemId = _this$getListState.maxItemId;
        var itemId = maxItemId + 1;
        _this.setListState({
          maxItemId: itemId,
          items: items.concat([itemId])
        }, function () {
          if (_this.firstFieldName) {
            context.focus(_this.getFieldName(itemId, _this.firstFieldName));
          }
        });
      });
      _defineProperty$2(_assertThisInitialized$1(_this), "remove", function (itemId) {
        var _this$getListState2 = _this.getListState(),
          items = _this$getListState2.items,
          maxItemId = _this$getListState2.maxItemId;
        _this.setListState({
          maxItemId: maxItemId,
          items: items.filter(function (_) {
            return _ !== itemId;
          })
        });
      });
      _defineProperty$2(_assertThisInitialized$1(_this), "map", function (func) {
        var _this$getListState3 = _this.getListState(),
          items = _this$getListState3.items;
        return items.map(function (item) {
          return func(item);
        });
      });
      _this.state = {
        listContext: {
          getFieldNameInsideList: _this.getFieldName,
          onRegisterFieldInsideList: _this.onRegisterField
        },
        state: _this.getInitialListState()
      };
      return _this;
    }
    _createClass$1(List, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this$props = this.props,
          name = _this$props.name,
          context = _this$props.context;
        context.onRegisterList(name, {
          onReset: this.reset,
          state: this.getListState()
        });
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        var _this$props2 = this.props,
          name = _this$props2.name,
          context = _this$props2.context;
        context.onUnregisterList(name);
      }
    }, {
      key: "getInitialItems",
      value: function getInitialItems() {
        var _this$props3 = this.props,
          context = _this$props3.context,
          name = _this$props3.name,
          count = _this$props3.count;
        // console.error(`[easy-react-form] \`initialState\` doesn't include the state for list "${name}"`)
        var initialListValue = context.state.initialValues[name];
        if (initialListValue) {
          return createItemIdsArray(initialListValue.length);
        }
        return createItemIdsArray(count);
      }
    }, {
      key: "getInitialListState",
      value: function getInitialListState() {
        // Get list initial state from the form's `initialState`.
        var _this$props4 = this.props,
          context = _this$props4.context,
          name = _this$props4.name;
        if (context.state.lists[name]) {
          if (context.state.listInstanceCounters[name] > 0) {
            return context.state.lists[name];
          }
        }

        // Create list initial state.
        var items = this.getInitialItems();
        return {
          items: items,
          maxItemId: items[items.length - 1]
        };
      }
    }, {
      key: "getListState",
      value: function getListState() {
        return this.state.state;
      }
    }, {
      key: "setListState",
      value: function setListState(state, callback) {
        var _this$props5 = this.props,
          context = _this$props5.context,
          name = _this$props5.name;
        context.onListStateChange(name, state);
        this.setState({
          state: state
        }, callback);
      }
    }, {
      key: "getListContext",
      value: function getListContext() {
        return this.state.listContext;
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;
        var children = this.props.children;
        return /*#__PURE__*/React__default["default"].createElement(Context.Consumer, null, function (context) {
          return /*#__PURE__*/React__default["default"].createElement(ListContext.Provider, {
            value: _this2.getListContext()
          }, children({
            map: _this2.map,
            add: _this2.add,
            remove: _this2.remove
          }));
        });
      }
    }]);
    return List;
  }(React__default["default"].Component);
  List.propTypes = {
    name: PropTypes__default["default"].string.isRequired,
    count: PropTypes__default["default"].number.isRequired,
    context: PropTypes__default["default"].object.isRequired,
    children: PropTypes__default["default"].func.isRequired
  };
  List.defaultProps = {
    count: 1
  };
  var ListContext = /*#__PURE__*/React__default["default"].createContext();
  function createItemIdsArray(size) {
    var array = new Array(size);
    var i = 0;
    while (i < size) {
      array[i] = i;
      i++;
    }
    return array;
  }
  var listContextPropType = PropTypes__default["default"].shape({
    getFieldNameInsideList: PropTypes__default["default"].func.isRequired,
    onRegisterFieldInsideList: PropTypes__default["default"].func.isRequired
  });

  function _typeof$1(obj) { "@babel/helpers - typeof"; return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof$1(obj); }
  function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty$1(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$1(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
  function _possibleConstructorReturn(self, call) { if (call && (_typeof$1(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
  function _defineProperty$1(obj, key, value) { key = _toPropertyKey$1(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey$1(arg) { var key = _toPrimitive$1(arg, "string"); return _typeof$1(key) === "symbol" ? key : String(key); }
  function _toPrimitive$1(input, hint) { if (_typeof$1(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof$1(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
  function Field(props) {
    return /*#__PURE__*/React__default["default"].createElement(Context.Consumer, null, function (context) {
      return /*#__PURE__*/React__default["default"].createElement(ListContext.Consumer, null, function (listContext) {
        return /*#__PURE__*/React__default["default"].createElement(FormField, _extends({}, props, {
          context: context,
          listContext: listContext
        }));
      });
    });
  }
  var itemType = PropTypes__default["default"].number;
  var FormField = /*#__PURE__*/function (_Component) {
    _inherits(FormField, _Component);
    var _super = _createSuper(FormField);
    function FormField(props) {
      var _this;
      _classCallCheck(this, FormField);
      _this = _super.call(this, props);

      // The field could register itself inside `componentDidMount`
      // but in that case initial `value` wouldn't yet be applied at mount time.
      _defineProperty$1(_assertThisInitialized(_this), "field", /*#__PURE__*/React__default["default"].createRef());
      _defineProperty$1(_assertThisInitialized(_this), "onChange", function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        var event = args[0];
        var value = event;
        if (event && typeof event.preventDefault === 'function') {
          value = event.target.value;
        }

        // Once a user enters/erases a value in this field
        // the default `value` property no longer applies.
        // This flag won't work with `form.reset()`.
        _this.hasBeenEdited = true;
        var _this$props = _this.props,
          context = _this$props.context,
          validateOnChange = _this$props.validateOnChange,
          onChange = _this$props.onChange;

        // The `validateOnChange` feature is currently not used.
        // Validation is currently only performed on `blur` event
        // and any validation errors are cleared while the user is typing.
        // Perhaps that results in a slightly less unneeded CPU load or something like that.
        var validationError = validateOnChange ? _this.validate(value) : undefined;
        if (onChange) {
          onChange(value);
        }
        _this.onValidationError(validationError);
        context.dispatch(setFieldValue(_this.getName(), value));
        context.dispatch(setFieldValidationError(_this.getName(), validationError));
      });
      _defineProperty$1(_assertThisInitialized(_this), "onFocus", function (event) {
        var _this$props2 = _this.props,
          context = _this$props2.context,
          onFocus = _this$props2.onFocus;
        context.dispatch(fieldFocused(_this.getName()));
        if (onFocus) {
          onFocus(event);
        }
      });
      _defineProperty$1(_assertThisInitialized(_this), "onBlur", function (event) {
        var _this$props3 = _this.props,
          context = _this$props3.context,
          onBlur = _this$props3.onBlur;
        var validationError = _this.validate(context.state.values[_this.getName()]);
        if (validationError) {
          _this.onValidationError(validationError);
          context.dispatch(setFieldValidationError(_this.getName(), validationError));
        }
        if (onBlur) {
          onBlur(event);
        }
      });
      _defineProperty$1(_assertThisInitialized(_this), "onValidationError", function (validationError) {});
      _defineProperty$1(_assertThisInitialized(_this), "focus", function () {
        // `.focus()` could theoretically maybe potentially be called in a timeout,
        // so check if the component is still mounted.
        if (!_this.mounted) {
          return;
        }
        if (!_this.field.current) {
          return;
        }
        if (typeof _this.field.current.focus === 'function') {
          return _this.field.current.focus();
        }
        // Generic DOM focusing.
        var node = _this.getNode();
        if (node) {
          node.focus();
        } else {
          console.error("Couldn't focus on field \"".concat(_this.getName(), "\": DOM Node not found. ").concat(STATELESS_COMPONENT_HINT));
        }
      });
      _defineProperty$1(_assertThisInitialized(_this), "scroll", function (options) {
        // `.scroll()` could theoretically maybe potentially be called in a timeout,
        // so check if the component is still mounted.
        if (!_this.mounted) {
          return;
        }
        var node = _this.getNode();
        if (node) {
          scrollTo(node, options);
        } else {
          console.error("Couldn't scroll to field \"".concat(_this.getName(), "\": DOM Node not found. ").concat(STATELESS_COMPONENT_HINT));
        }
      });
      _defineProperty$1(_assertThisInitialized(_this), "validate", function (value) {
        var _this$props4 = _this.props,
          context = _this$props4.context,
          validate = _this$props4.validate,
          required = _this$props4.required;
        value = context.transformValueForSubmit(value);
        if (required && isValueEmpty(value) && _this.shouldValidateRequired()) {
          return typeof required === 'string' ? required : context.getRequiredMessage();
        }
        if (validate) {
          // `context.state.values` could be replaced with
          // something else, like `context.getValues()`
          // because `<List/>` values are prefixed in `context.state.values`.
          // But running RegExps and re-creating the object
          // on each `validate()` call seems like a not-the-best architecture.
          // Instead `values` could be replaced with something like
          // `context.getValues()` but that would be a "breaking change" in the API.
          // On a modern CPU a single `context.getValues()` run is about 0.005 ms.
          // So I guess it's acceptable, since the API already exists.
          return validate(value, context.getValues());
        }
      });
      _this.register();
      return _this;
    }
    _createClass(FormField, [{
      key: "getName",
      value: function getName() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
        var listContext = props.listContext,
          item = props.item,
          name = props.name;
        if (listContext) {
          return listContext.getFieldNameInsideList(item, name);
        }
        return name;
      }
    }, {
      key: "register",
      value: function register() {
        var _this$props5 = this.props,
          context = _this$props5.context,
          listContext = _this$props5.listContext,
          error = _this$props5.error,
          name = _this$props5.name,
          value = _this$props5.value,
          onChange = _this$props5.onChange;

        // "Register" the field and initialize it with the default value.
        //
        // React will reuse and reshuffle existing `<Fields/>`
        // when hiding/showing new fields, so a field might get
        // "registered"/"unregistered" several times in those cases.
        //
        context.onRegisterField(this.getName(), {
          value: value,
          onChange: onChange,
          error: error,
          onValidationError: this.onValidationError,
          validate: this.validate,
          scroll: this.scroll,
          focus: this.focus
        });
        if (listContext) {
          listContext.onRegisterFieldInsideList(name);
        }
      }
    }, {
      key: "unregister",
      value: function unregister(prevProps) {
        var context = this.props.context;
        context.onUnregisterField(this.getName(prevProps));
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        this.mounted = true;
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        // "Unregister" field.
        this.unregister();
        this.mounted = false;
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        var _this$props6 = this.props,
          context = _this$props6.context,
          value = _this$props6.value,
          error = _this$props6.error;

        // If React reused one `<Field/>` element for another form field
        // then handle this type of situation correctly.
        if (this.getName() !== this.getName(prevProps)) {
          // Unregister old field.
          this.unregister(prevProps);
          // Register new field.
          this.register();
        }
        // Else, if it's still the same field.
        else {
          // If the default value changed for this `<Field/>`
          // and the field hasn't been edited yet
          // then apply this new default value.
          if (value !== prevProps.value && !this.hasBeenEdited) {
            var validationError = this.validate(value);
            this.onValidationError(validationError);
            context.dispatch(setFieldValue(this.getName(), value));
            context.dispatch(setFieldValidationError(this.getName(), validationError));
          }
          // If an externally set `error` property is updated,
          // then update invalid indication for this field accordingly.
          // If the same error happened once again,
          // then it should have been reset
          // before sending form data to the server,
          // and in that case it will be shown once again.
          if (prevProps.error !== error) {
            this.showOrHideExternallySetError(error);
          }
        }
      }
    }, {
      key: "showOrHideExternallySetError",
      value: function showOrHideExternallySetError(error) {
        var context = this.props.context;
        var value = context.state.values[this.getName()];
        context.state.showErrors[this.getName()];
        this.onError(error);

        // If the `error` is set then indicate this field as being invalid.
        if (error) {
          context.dispatch(setFieldError(this.getName(), error));
          // `setFieldError()` action also automatically sets `showErrors[field]` property.
          // context.dispatch(showFieldError(this.getName()))
          this.scroll();
          this.focus();
        }
        // If the `error` is reset and the field is valid
        // then reset invalid indication.
        else {
          var validationError = this.validate(value);
          context.dispatch(setFieldError(this.getName(), validationError));
        }
      }
    }, {
      key: "onError",
      value: function onError(error) {}
    }, {
      key: "getNode",
      value:
      // onError(newError) {
      // 	const { context, onErrorChange } = this.props
      // 	if (!onErrorChange) {
      // 		return
      // 	}
      // 	const error = context.state.errors[this.getName()]
      // 	const validationError = context.state.validationErrors[this.getName()]
      // 	// const showError = context.state.showErrors[this.getName()]
      // 	if (newError === error) {
      // 		// No changes.
      // 		// If the error is present and didn't change then no changes.
      // 		// If the error wasn't present then the validation error should be shown,
      // 		// if present, but since it didn't change either, there's no need to call
      // 		// `onErrorChange()`.
      // 		return
      // 	}
      // 	// If the external error is being reset.
      // 	if (error && !newError) {
      // 		// Then use the validaton error, if it's any different
      // 		// from the argument of the previous call of `onErrorChange()`.
      // 		if (error !== validationError) {
      // 			 onErrorChange(validationError)
      // 		} else {
      // 			// Otherwise, no changes.
      // 		}
      // 		return
      // 	}
      // 	// `newError` is defined and `error` is not:
      // 	// an external error is being set.
      // 	onErrorChange(newError)
      // }

      // onValidationError(newValidationError) {
      // 	const { context, onErrorChange } = this.props
      // 	if (!onErrorChange) {
      // 		return
      // 	}
      // 	const error = context.state.errors[this.getName()]
      // 	const validationError = context.state.validationErrors[this.getName()]
      // 	// const showError = context.state.showErrors[this.getName()]
      // 	// An externally set error overrides a validation error.
      // 	// And the externally set error hasn't been changed,
      // 	// so no need to call `onErrorChange()`.
      // 	if (error) {
      // 		return
      // 	}
      // 	// If validation error is being reset and there's no external error
      // 	// then show no error.
      // 	// Otherwise, show new validation error, if it has changed.
      // 	if (newValidationError !== validationError) {
      // 		onErrorChange(newValidationError)
      // 	}
      // }

      function getNode() {
        return this.field.current;
      }

      // Focuses on a field (can be called externally through a ref).
    }, {
      key: "shouldValidateRequired",
      value: function shouldValidateRequired() {
        var _this$props7 = this.props,
          context = _this$props7.context,
          validateRequiredBeforeSubmit = _this$props7.validateRequiredBeforeSubmit;
        if (validateRequiredBeforeSubmit) {
          return true;
        }
        // If the user has attempted to submit the form
        // then start showing "required" errors.
        return context.state.submitAttempted;
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props8 = this.props,
          context = _this$props8.context,
          required = _this$props8.required,
          component = _this$props8.component;
        var value = context.state.values[this.getName()];
        var error = context.state.validationErrors[this.getName()] || context.state.errors[this.getName()];
        var showError = context.state.showErrors[this.getName()];
        return /*#__PURE__*/React__default["default"].createElement(component, _objectSpread$1(_objectSpread$1({}, getPassThroughProps(this.props, FormField.propTypes)), {}, {
          ref: this.field,
          onChange: this.onChange,
          onFocus: this.onFocus,
          onBlur: this.onBlur,
          wait: context.state.submitting,
          error: showError ? error : undefined,
          required: required ? true : false,
          value: value
        }));
      }
    }]);
    return FormField;
  }(React.Component);
  _defineProperty$1(FormField, "propTypes", {
    name: PropTypes__default["default"].string.isRequired,
    component: PropTypes__default["default"].elementType.isRequired,
    required: PropTypes__default["default"].oneOfType([PropTypes__default["default"].bool, PropTypes__default["default"].string]),
    value: PropTypes__default["default"].any,
    error: PropTypes__default["default"].string,
    validate: PropTypes__default["default"].func,
    // This property is currently not used.
    // Validation is currently only performed on `blur` event
    // and any validation errors are cleared while the user is typing.
    // Perhaps that results in a slightly less unneeded CPU load or something like that.
    validateOnChange: PropTypes__default["default"].bool,
    // This property is currently not used.
    // "Required" validation is currently only performed after a user has attempted
    // to submit the form. The reason is that otherwise there'd be unnecessarily-shown
    // "Required" error messages when the form has `autoFocus` feature enabled
    // and the user clicks away (for example, on a "Close Form Modal" button).
    // Or, for example, showing the "Required" error message on blur could result in
    // a shift of content when the user attempts to click the "Submit" button
    // resulting in the user clicking another button or empty space.
    validateRequiredBeforeSubmit: PropTypes__default["default"].bool,
    onChange: PropTypes__default["default"].func,
    // onErrorChange: PropTypes.func,
    // onValidationErrorChange: PropTypes.func,

    context: contextPropType.isRequired,
    listContext: listContextPropType,
    item: itemType
  });
  function isValueEmpty(_) {
    return _ === undefined || _ === null || Array.isArray(_) && _.length === 0;
  }
  var STATELESS_COMPONENT_HINT = 'For example, if it\'s a "stateless" component then rewrite it as a "React.Component" having a ".focus()" method.';

  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function Submit(props) {
    return /*#__PURE__*/React__default["default"].createElement(Context.Consumer, null, function (context) {
      return /*#__PURE__*/React__default["default"].createElement(props.component, _objectSpread(_objectSpread({}, getPassThroughProps(props, Submit.propTypes)), {}, {
        wait: context.state.submitting
      }));
    });
  }
  Submit.propTypes = {
    component: PropTypes__default["default"].elementType.isRequired
  };

  exports.Field = Field;
  exports.Form = Form;
  exports.List = List_;
  exports.Submit = Submit;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=easy-react-form.js.map
