'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var hoistNonReactStatics = _interopDefault(require('hoist-non-react-statics'));
var createContext = _interopDefault(require('create-react-context'));
var cloneDeep = _interopDefault(require('lodash.clonedeep'));
var toPath = _interopDefault(require('lodash.topath'));
var isEqual = _interopDefault(require('react-fast-compare'));
var warning = _interopDefault(require('warning'));
var deepmerge = _interopDefault(require('deepmerge'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

var _a;
var FormikProvider = (_a = createContext({}), _a.Provider), FormikConsumer = _a.Consumer;
function connect(Comp) {
    var C = function (props) { return (React.createElement(FormikConsumer, null, function (formik) { return React.createElement(Comp, __assign({}, props, { formik: formik })); })); };
    C.WrappedComponent = Comp;
    return hoistNonReactStatics(C, Comp);
}

function getIn(obj, key, def, p) {
    if (p === void 0) { p = 0; }
    var path = toPath(key);
    while (obj && p < path.length) {
        obj = obj[path[p++]];
    }
    return obj === undefined ? def : obj;
}
function setIn(obj, path, value) {
    var res = {};
    var resVal = res;
    var i = 0;
    var pathArray = toPath(path);
    for (; i < pathArray.length - 1; i++) {
        var currentPath = pathArray[i];
        var currentObj = getIn(obj, pathArray.slice(0, i + 1));
        if (resVal[currentPath]) {
            resVal = resVal[currentPath];
        }
        else if (currentObj) {
            resVal = resVal[currentPath] = cloneDeep(currentObj);
        }
        else {
            var nextPath = pathArray[i + 1];
            resVal = resVal[currentPath] =
                isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {};
        }
    }
    resVal[pathArray[i]] = value;
    return __assign({}, obj, res);
}
function setNestedObjectValues(object, value, visited, response) {
    if (visited === void 0) { visited = new WeakMap(); }
    if (response === void 0) { response = {}; }
    for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
        var k = _a[_i];
        var val = object[k];
        if (isObject(val)) {
            if (!visited.get(val)) {
                visited.set(val, true);
                response[k] = Array.isArray(val) ? [] : {};
                setNestedObjectValues(val, value, visited, response[k]);
            }
        }
        else {
            response[k] = value;
        }
    }
    return response;
}
var isFunction = function (obj) {
    return typeof obj === 'function';
};
var isObject = function (obj) {
    return obj !== null && typeof obj === 'object';
};
var isInteger = function (obj) {
    return String(Math.floor(Number(obj))) === obj;
};
var isString = function (obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
};
var isNaN = function (obj) { return obj !== obj; };
var isEmptyChildren = function (children) {
    return React.Children.count(children) === 0;
};
var isPromise = function (value) {
    return isObject(value) && isFunction(value.then);
};
function getActiveElement(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : undefined);
    if (typeof doc === 'undefined') {
        return null;
    }
    try {
        return doc.activeElement || doc.body;
    }
    catch (e) {
        return doc.body;
    }
}

var Formik = (function (_super) {
    __extends(Formik, _super);
    function Formik(props) {
        var _this = _super.call(this, props) || this;
        _this.hcCache = {};
        _this.hbCache = {};
        _this.registerField = function (name, fns) {
            _this.fields[name] = fns;
        };
        _this.unregisterField = function (name) {
            delete _this.fields[name];
        };
        _this.setErrors = function (errors) {
            _this.setState({ errors: errors });
        };
        _this.setTouched = function (touched) {
            _this.setState({ touched: touched }, function () {
                if (_this.props.validateOnBlur) {
                    _this.runValidations(_this.state.values);
                }
            });
        };
        _this.setValues = function (values) {
            _this.setState({ values: values }, function () {
                if (_this.props.validateOnChange) {
                    _this.runValidations(values);
                }
            });
        };
        _this.setStatus = function (status) {
            _this.setState({ status: status });
        };
        _this.setError = function (error) {
            _this.setState({ error: error });
        };
        _this.setSubmitting = function (isSubmitting) {
            _this.setState({ isSubmitting: isSubmitting });
        };
        _this.validateField = function (field) {
            _this.setState({ isValidating: true });
            _this.runSingleFieldLevelValidation(field, getIn(_this.state.values, field)).then(function (error) {
                if (!!error && _this.didMount) {
                    _this.setState({
                        errors: setIn(_this.state.errors, field, error),
                        isValidating: false,
                    });
                }
            });
        };
        _this.runSingleFieldLevelValidation = function (field, value) {
            return new Promise(function (resolve) { return resolve(_this.fields[field].validate(value)); });
        };
        _this.runValidationSchema = function (values) {
            return new Promise(function (resolve) {
                var validationSchema = _this.props.validationSchema;
                var schema = isFunction(validationSchema)
                    ? validationSchema()
                    : validationSchema;
                validateYupSchema(values, schema).then(function () {
                    resolve({});
                }, function (err) {
                    resolve(yupToFormErrors(err));
                });
            });
        };
        _this.runValidations = function (values) {
            if (values === void 0) { values = _this.state.values; }
            _this.setState({ isValidating: true });
            return Promise.all([
                _this.runFieldLevelValidations(values),
                _this.props.validationSchema ? _this.runValidationSchema(values) : {},
                _this.props.validate ? _this.runValidateHandler(values) : {},
            ]).then(function (_a) {
                var fieldErrors = _a[0], schemaErrors = _a[1], handlerErrors = _a[2];
                var combinedErrors = deepmerge.all([
                    fieldErrors,
                    schemaErrors,
                    handlerErrors,
                ]);
                if (_this.didMount) {
                    _this.setState({ isValidating: false, errors: combinedErrors });
                }
                return combinedErrors;
            });
        };
        _this.handleChange = function (eventOrPath) {
            var executeChange = function (eventOrTextValue, maybePath) {
                var field = maybePath;
                var val = eventOrTextValue;
                var parsed;
                if (!isString(eventOrTextValue)) {
                    if (eventOrTextValue.persist) {
                        eventOrTextValue.persist();
                    }
                    var _a = eventOrTextValue.target, type = _a.type, name_1 = _a.name, id = _a.id, value = _a.value, checked = _a.checked, outerHTML = _a.outerHTML;
                    field = maybePath ? maybePath : name_1 ? name_1 : id;
                    if (!field && "production" !== 'production') {
                        warnAboutMissingIdentifier({
                            htmlContent: outerHTML,
                            documentationAnchorLink: 'handlechange-e-reactchangeeventany--void',
                            handlerName: 'handleChange',
                        });
                    }
                    val = /number|range/.test(type)
                        ? ((parsed = parseFloat(value)), isNaN(parsed) ? '' : parsed)
                        : /checkbox/.test(type) ? checked : value;
                }
                if (field) {
                    _this.setState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, field, val) })); });
                    if (_this.props.validateOnChange) {
                        _this.runValidations(setIn(_this.state.values, field, val));
                    }
                }
            };
            if (isString(eventOrPath)) {
                return isFunction(_this.hcCache[eventOrPath])
                    ? _this.hcCache[eventOrPath]
                    : (_this.hcCache[eventOrPath] = function (event) {
                        return executeChange(event, eventOrPath);
                    });
            }
            else {
                executeChange(eventOrPath);
            }
        };
        _this.setFieldValue = function (field, value, shouldValidate) {
            if (shouldValidate === void 0) { shouldValidate = true; }
            _this.setState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, field, value) })); }, function () {
                if (_this.props.validateOnChange && shouldValidate) {
                    _this.runValidations(_this.state.values);
                }
            });
        };
        _this.handleSubmit = function (e) {
            if (e && e.preventDefault) {
                e.preventDefault();
            }
            _this.submitForm();
        };
        _this.submitForm = function () {
            _this.setState(function (prevState) { return ({
                touched: setNestedObjectValues(prevState.values, true),
                isSubmitting: true,
                submitCount: prevState.submitCount + 1,
            }); });
            return _this.runValidations().then(function (combinedErrors) {
                var isValid = Object.keys(combinedErrors).length === 0;
                if (isValid) {
                    _this.executeSubmit();
                }
                else {
                    _this.setState({ isSubmitting: false });
                }
            });
        };
        _this.executeSubmit = function () {
            _this.props.onSubmit(_this.state.values, _this.getFormikActions());
        };
        _this.handleBlur = function (eventOrString) {
            var executeBlur = function (e, path) {
                if (e.persist) {
                    e.persist();
                }
                var _a = e.target, name = _a.name, id = _a.id, outerHTML = _a.outerHTML;
                var field = path ? path : name ? name : id;
                if (!field && "production" !== 'production') {
                    warnAboutMissingIdentifier({
                        htmlContent: outerHTML,
                        documentationAnchorLink: 'handleblur-e-any--void',
                        handlerName: 'handleBlur',
                    });
                }
                _this.setState(function (prevState) { return ({
                    touched: setIn(prevState.touched, field, true),
                }); });
                if (_this.props.validateOnBlur) {
                    _this.runValidations(_this.state.values);
                }
            };
            if (isString(eventOrString)) {
                return isFunction(_this.hbCache[eventOrString])
                    ? _this.hbCache[eventOrString]
                    : (_this.hbCache[eventOrString] = function (event) {
                        return executeBlur(event, eventOrString);
                    });
            }
            else {
                executeBlur(eventOrString);
            }
        };
        _this.setFieldTouched = function (field, touched, shouldValidate) {
            if (touched === void 0) { touched = true; }
            if (shouldValidate === void 0) { shouldValidate = true; }
            _this.setState(function (prevState) { return (__assign({}, prevState, { touched: setIn(prevState.touched, field, touched) })); }, function () {
                if (_this.props.validateOnBlur && shouldValidate) {
                    _this.runValidations(_this.state.values);
                }
            });
        };
        _this.setFieldError = function (field, message) {
            _this.setState(function (prevState) { return (__assign({}, prevState, { errors: setIn(prevState.errors, field, message) })); });
        };
        _this.resetForm = function (nextValues) {
            var values = nextValues ? nextValues : _this.props.initialValues;
            _this.initialValues = values;
            _this.setState({
                isSubmitting: false,
                isValidating: false,
                errors: {},
                touched: {},
                error: undefined,
                status: undefined,
                values: values,
                submitCount: 0,
            });
        };
        _this.handleReset = function () {
            if (_this.props.onReset) {
                var maybePromisedOnReset = _this.props.onReset(_this.state.values, _this.getFormikActions());
                if (isPromise(maybePromisedOnReset)) {
                    maybePromisedOnReset.then(_this.resetForm);
                }
                else {
                    _this.resetForm();
                }
            }
            else {
                _this.resetForm();
            }
        };
        _this.setFormikState = function (s, callback) {
            return _this.setState(s, callback);
        };
        _this.getFormikActions = function () {
            return {
                resetForm: _this.resetForm,
                submitForm: _this.submitForm,
                validateForm: _this.runValidations,
                validateField: _this.validateField,
                setError: _this.setError,
                setErrors: _this.setErrors,
                setFieldError: _this.setFieldError,
                setFieldTouched: _this.setFieldTouched,
                setFieldValue: _this.setFieldValue,
                setStatus: _this.setStatus,
                setSubmitting: _this.setSubmitting,
                setTouched: _this.setTouched,
                setValues: _this.setValues,
                setFormikState: _this.setFormikState,
            };
        };
        _this.getFormikComputedProps = function () {
            var isInitialValid = _this.props.isInitialValid;
            var dirty = !isEqual(_this.initialValues, _this.state.values);
            return {
                dirty: dirty,
                isValid: dirty
                    ? _this.state.errors && Object.keys(_this.state.errors).length === 0
                    : isInitialValid !== false && isFunction(isInitialValid)
                        ? isInitialValid(_this.props)
                        : isInitialValid,
                initialValues: _this.initialValues,
            };
        };
        _this.getFormikBag = function () {
            return __assign({}, _this.state, _this.getFormikActions(), _this.getFormikComputedProps(), { registerField: _this.registerField, unregisterField: _this.unregisterField, handleBlur: _this.handleBlur, handleChange: _this.handleChange, handleReset: _this.handleReset, handleSubmit: _this.handleSubmit, validateOnChange: _this.props.validateOnChange, validateOnBlur: _this.props.validateOnBlur });
        };
        _this.getFormikContext = function () {
            return __assign({}, _this.getFormikBag(), { validationSchema: _this.props.validationSchema, validate: _this.props.validate });
        };
        _this.state = {
            values: props.initialValues || {},
            errors: {},
            touched: {},
            isSubmitting: false,
            isValidating: false,
            submitCount: 0,
        };
        _this.didMount = false;
        _this.fields = {};
        _this.initialValues = props.initialValues || {};
        warning(!(props.component && props.render), 'You should not use <Formik component> and <Formik render> in the same <Formik> component; <Formik render> will be ignored');
        warning(!(props.component && props.children && !isEmptyChildren(props.children)), 'You should not use <Formik component> and <Formik children> in the same <Formik> component; <Formik children> will be ignored');
        warning(!(props.render && props.children && !isEmptyChildren(props.children)), 'You should not use <Formik render> and <Formik children> in the same <Formik> component; <Formik children> will be ignored');
        return _this;
    }
    Formik.prototype.componentDidMount = function () {
        this.didMount = true;
    };
    Formik.prototype.componentWillUnmount = function () {
        this.didMount = false;
    };
    Formik.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.enableReinitialize &&
            !isEqual(prevProps.initialValues, this.props.initialValues)) {
            this.initialValues = this.props.initialValues;
            this.resetForm(this.props.initialValues);
        }
    };
    Formik.prototype.runFieldLevelValidations = function (values) {
        var _this = this;
        var fieldKeysWithValidation = Object.keys(this.fields).filter(function (f) {
            return _this.fields &&
                _this.fields[f] &&
                _this.fields[f].validate &&
                isFunction(_this.fields[f].validate);
        });
        var fieldValidations = fieldKeysWithValidation.length > 0
            ? fieldKeysWithValidation.map(function (f) {
                return _this.runSingleFieldLevelValidation(f, getIn(values, f)).then(function (x) { return x; }, function (e) { return e; });
            })
            : [Promise.resolve('DO_NOT_DELETE_YOU_WILL_BE_FIRED')];
        return Promise.all(fieldValidations).then(function (fieldErrorsList) {
            return fieldErrorsList.reduce(function (prev, curr, index) {
                if (curr === 'DO_NOT_DELETE_YOU_WILL_BE_FIRED') {
                    return prev;
                }
                if (!!curr) {
                    prev = setIn(prev, fieldKeysWithValidation[index], curr);
                }
                return prev;
            }, {});
        });
    };
    Formik.prototype.runValidateHandler = function (values) {
        var _this = this;
        return new Promise(function (resolve) {
            var maybePromisedErrors = _this.props.validate(values);
            if (maybePromisedErrors === undefined) {
                resolve({});
            }
            else if (isPromise(maybePromisedErrors)) {
                maybePromisedErrors.then(function () {
                    resolve({});
                }, function (errors) {
                    resolve(errors);
                });
            }
            else {
                resolve(maybePromisedErrors);
            }
        });
    };
    Formik.prototype.render = function () {
        var _a = this.props, component = _a.component, render = _a.render, children = _a.children;
        var props = this.getFormikBag();
        var ctx = this.getFormikContext();
        return (React.createElement(FormikProvider, { value: ctx }, component
            ? React.createElement(component, props)
            : render
                ? render(props)
                : children
                    ? typeof children === 'function'
                        ? children(props)
                        : !isEmptyChildren(children)
                            ? React.Children.only(children)
                            : null
                    : null));
    };
    Formik.defaultProps = {
        validateOnChange: true,
        validateOnBlur: true,
        isInitialValid: false,
        enableReinitialize: false,
    };
    return Formik;
}(React.Component));
function warnAboutMissingIdentifier(_a) {
    var htmlContent = _a.htmlContent, documentationAnchorLink = _a.documentationAnchorLink, handlerName = _a.handlerName;
    console.error("Warning: Formik called `" + handlerName + "`, but you forgot to pass an `id` or `name` attribute to your input:\n\n    " + htmlContent + "\n\n    Formik cannot determine which value to update. For more info see https://github.com/jaredpalmer/formik#" + documentationAnchorLink + "\n  ");
}
function yupToFormErrors(yupError) {
    var errors = {};
    for (var _i = 0, _a = yupError.inner; _i < _a.length; _i++) {
        var err = _a[_i];
        if (!errors[err.path]) {
            errors = setIn(errors, err.path, err.message);
        }
    }
    return errors;
}
function validateYupSchema(values, schema, sync, context) {
    if (sync === void 0) { sync = false; }
    if (context === void 0) { context = {}; }
    var validateData = {};
    validateData = values;
    return schema[sync ? 'validateSync' : 'validate'](validateData, {
        abortEarly: false,
        context: context,
    });
}

var FieldInner = (function (_super) {
    __extends(FieldInner, _super);
    function FieldInner(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (e) {
            var _a = _this.props.formik, handleChange = _a.handleChange, validateOnChange = _a.validateOnChange;
            handleChange(e);
            if (!!validateOnChange && !!_this.props.validate) {
                _this.runFieldValidations(e.target.value);
            }
        };
        _this.handleBlur = function (e) {
            var _a = _this.props.formik, handleBlur = _a.handleBlur, validateOnBlur = _a.validateOnBlur;
            handleBlur(e);
            if (!!validateOnBlur && !!_this.props.validate) {
                _this.runFieldValidations(e.target.value);
            }
        };
        _this.runFieldValidations = function (value) {
            var setFieldError = _this.props.formik.setFieldError;
            var _a = _this.props, name = _a.name, validate = _a.validate;
            var maybePromise = validate(value);
            if (isPromise(maybePromise)) {
                maybePromise.then(function () { return setFieldError(name, undefined); }, function (error) { return setFieldError(name, error); });
            }
            else {
                setFieldError(name, maybePromise);
            }
        };
        var render = props.render, children = props.children, component = props.component, formik = props.formik;
        warning(!(component && render), 'You should not use <Field component> and <Field render> in the same <Field> component; <Field component> will be ignored');
        warning(!(component && children && isFunction(children)), 'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.');
        warning(!(render && children && !isEmptyChildren(children)), 'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored');
        formik.registerField(props.name, {
            validate: props.validate,
        });
        return _this;
    }
    FieldInner.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.name !== prevProps.name) {
            this.props.formik.unregisterField(prevProps.name);
            this.props.formik.registerField(this.props.name, {
                validate: this.props.validate,
            });
        }
        if (this.props.validate !== prevProps.validate) {
            this.props.formik.registerField(this.props.name, {
                validate: this.props.validate,
            });
        }
    };
    FieldInner.prototype.componentWillUnmount = function () {
        this.props.formik.unregisterField(this.props.name);
    };
    FieldInner.prototype.render = function () {
        var _a = this.props, validate = _a.validate, name = _a.name, render = _a.render, children = _a.children, _b = _a.component, component = _b === void 0 ? 'input' : _b, formik = _a.formik, props = __rest(_a, ["validate", "name", "render", "children", "component", "formik"]);
        var _validate = formik.validate, _validationSchema = formik.validationSchema, restOfFormik = __rest(formik, ["validate", "validationSchema"]);
        var field = {
            value: props.type === 'radio' || props.type === 'checkbox'
                ? props.value
                : getIn(formik.values, name),
            name: name,
            onChange: validate ? this.handleChange : formik.handleChange,
            onBlur: validate ? this.handleBlur : formik.handleBlur,
        };
        var bag = { field: field, form: restOfFormik };
        if (render) {
            return render(bag);
        }
        if (isFunction(children)) {
            return children(bag);
        }
        if (typeof component === 'string') {
            var innerRef = props.innerRef, rest = __rest(props, ["innerRef"]);
            return React.createElement(component, __assign({ ref: innerRef }, field, rest, { children: children }));
        }
        return React.createElement(component, __assign({}, bag, props, { children: children }));
    };
    return FieldInner;
}(React.Component));
var Field = connect(FieldInner);

var Form = connect(function (_a) {
    var handleSubmit = _a.formik.handleSubmit, props = __rest(_a, ["formik"]);
    return (React.createElement("form", __assign({ onSubmit: handleSubmit }, props)));
});
Form.displayName = 'Form';

function withFormik(_a) {
    var _b = _a.mapPropsToValues, mapPropsToValues = _b === void 0 ? function (vanillaProps) {
        var val = {};
        for (var k in vanillaProps) {
            if (vanillaProps.hasOwnProperty(k) &&
                typeof vanillaProps[k] !== 'function') {
                val[k] = vanillaProps[k];
            }
        }
        return val;
    } : _b, config = __rest(_a, ["mapPropsToValues"]);
    return function createFormik(Component) {
        var componentDisplayName = Component.displayName ||
            Component.name ||
            (Component.constructor && Component.constructor.name) ||
            'Component';
        var C = (function (_super) {
            __extends(C, _super);
            function C() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.validate = function (values) {
                    return config.validate(values, _this.props);
                };
                _this.validationSchema = function () {
                    return isFunction(config.validationSchema)
                        ? config.validationSchema(_this.props)
                        : config.validationSchema;
                };
                _this.handleSubmit = function (values, actions) {
                    return config.handleSubmit(values, __assign({}, actions, { props: _this.props }));
                };
                _this.renderFormComponent = function (formikProps) {
                    return React.createElement(Component, __assign({}, _this.props, formikProps));
                };
                return _this;
            }
            C.prototype.render = function () {
                return (React.createElement(Formik, __assign({}, this.props, config, { validate: config.validate && this.validate, validationSchema: config.validationSchema && this.validationSchema, initialValues: mapPropsToValues(this.props), onSubmit: this.handleSubmit, render: this.renderFormComponent })));
            };
            C.displayName = "WithFormik(" + componentDisplayName + ")";
            return C;
        }(React.Component));
        return hoistNonReactStatics(C, Component);
    };
}

var move = function (array, from, to) {
    var copy = (array || []).slice();
    var value = copy[from];
    copy.splice(from, 1);
    copy.splice(to, 0, value);
    return copy;
};
var swap = function (array, indexA, indexB) {
    var copy = (array || []).slice();
    var a = copy[indexA];
    copy[indexA] = copy[indexB];
    copy[indexB] = a;
    return copy;
};
var insert = function (array, index, value) {
    var copy = (array || []).slice();
    copy.splice(index, 0, value);
    return copy;
};
var replace = function (array, index, value) {
    var copy = (array || []).slice();
    copy[index] = value;
    return copy;
};
var FieldArrayInner = (function (_super) {
    __extends(FieldArrayInner, _super);
    function FieldArrayInner(props) {
        var _this = _super.call(this, props) || this;
        _this.updateArrayField = function (fn, alterTouched, alterErrors) {
            var _a = _this.props, name = _a.name, validateOnChange = _a.validateOnChange, _b = _a.formik, setFormikState = _b.setFormikState, validateForm = _b.validateForm, values = _b.values, touched = _b.touched, errors = _b.errors;
            setFormikState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, name, fn(getIn(values, name))), errors: alterErrors
                    ? setIn(prevState.errors, name, fn(getIn(errors, name)))
                    : prevState.errors, touched: alterTouched
                    ? setIn(prevState.touched, name, fn(getIn(touched, name)))
                    : prevState.touched })); }, function () {
                if (validateOnChange) {
                    validateForm();
                }
            });
        };
        _this.push = function (value) {
            return _this.updateArrayField(function (array) { return (array || []).concat([value]); }, false, false);
        };
        _this.handlePush = function (value) { return function () { return _this.push(value); }; };
        _this.swap = function (indexA, indexB) {
            return _this.updateArrayField(function (array) { return swap(array, indexA, indexB); }, false, false);
        };
        _this.handleSwap = function (indexA, indexB) { return function () {
            return _this.swap(indexA, indexB);
        }; };
        _this.move = function (from, to) {
            return _this.updateArrayField(function (array) { return move(array, from, to); }, false, false);
        };
        _this.handleMove = function (from, to) { return function () { return _this.move(from, to); }; };
        _this.insert = function (index, value) {
            return _this.updateArrayField(function (array) { return insert(array, index, value); }, false, false);
        };
        _this.handleInsert = function (index, value) { return function () { return _this.insert(index, value); }; };
        _this.replace = function (index, value) {
            return _this.updateArrayField(function (array) { return replace(array, index, value); }, false, false);
        };
        _this.handleReplace = function (index, value) { return function () {
            return _this.replace(index, value);
        }; };
        _this.unshift = function (value) {
            var arr = [];
            _this.updateArrayField(function (array) {
                arr = array ? [value].concat(array) : [value];
                return arr;
            }, false, false);
            return arr.length;
        };
        _this.handleUnshift = function (value) { return function () { return _this.unshift(value); }; };
        _this.handleRemove = function (index) { return function () { return _this.remove(index); }; };
        _this.handlePop = function () { return function () { return _this.pop(); }; };
        _this.remove = _this.remove.bind(_this);
        _this.pop = _this.pop.bind(_this);
        return _this;
    }
    FieldArrayInner.prototype.remove = function (index) {
        var result;
        this.updateArrayField(function (array) {
            var copy = array ? array.slice() : [];
            if (!result) {
                result = copy[index];
            }
            if (isFunction(copy.splice)) {
                copy.splice(index, 1);
            }
            return copy;
        }, true, true);
        return result;
    };
    FieldArrayInner.prototype.pop = function () {
        var result;
        this.updateArrayField(function (array) {
            var tmp = array;
            if (!result) {
                result = tmp && tmp.pop && tmp.pop();
            }
            return tmp;
        }, true, true);
        return result;
    };
    FieldArrayInner.prototype.render = function () {
        var arrayHelpers = {
            push: this.push,
            pop: this.pop,
            swap: this.swap,
            move: this.move,
            insert: this.insert,
            replace: this.replace,
            unshift: this.unshift,
            remove: this.remove,
            handlePush: this.handlePush,
            handlePop: this.handlePop,
            handleSwap: this.handleSwap,
            handleMove: this.handleMove,
            handleInsert: this.handleInsert,
            handleReplace: this.handleReplace,
            handleUnshift: this.handleUnshift,
            handleRemove: this.handleRemove,
        };
        var _a = this.props, component = _a.component, render = _a.render, children = _a.children, name = _a.name, _b = _a.formik, _validate = _b.validate, _validationSchema = _b.validationSchema, restOfFormik = __rest(_b, ["validate", "validationSchema"]);
        var props = __assign({}, arrayHelpers, { form: restOfFormik, name: name });
        return component
            ? React.createElement(component, props)
            : render
                ? render(props)
                : children
                    ? typeof children === 'function'
                        ? children(props)
                        : !isEmptyChildren(children) ? React.Children.only(children) : null
                    : null;
    };
    FieldArrayInner.defaultProps = {
        validateOnChange: true,
    };
    return FieldArrayInner;
}(React.Component));
var FieldArray = connect(FieldArrayInner);

function isEqualExceptForKey(a, b, path) {
    return isEqual(setIn(a, path, undefined), setIn(b, path, undefined));
}
var FastFieldInner = (function (_super) {
    __extends(FastFieldInner, _super);
    function FastFieldInner(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (e) {
            e.persist();
            var _a = _this.props.formik, validateOnChange = _a.validateOnChange, validate = _a.validate, values = _a.values, validationSchema = _a.validationSchema, errors = _a.errors, setFormikState = _a.setFormikState;
            var _b = e.target, type = _b.type, value = _b.value, checked = _b.checked;
            var val = /number|range/.test(type)
                ? parseFloat(value)
                : /checkbox/.test(type) ? checked : value;
            if (validateOnChange) {
                if (_this.props.validate) {
                    var maybePromise = _this.props.validate(value);
                    if (isPromise(maybePromise)) {
                        _this.setState({ value: val });
                        maybePromise.then(function () { return _this.setState({ error: undefined }); }, function (error) { return _this.setState({ error: error }); });
                    }
                    else {
                        _this.setState({ value: val, error: maybePromise });
                    }
                }
                else if (validate) {
                    var maybePromise_1 = validate(setIn(values, _this.props.name, val));
                    if (isPromise(maybePromise_1)) {
                        _this.setState({ value: val });
                        maybePromise_1.then(function () { return _this.setState({ error: undefined }); }, function (error) {
                            if (isEqualExceptForKey(maybePromise_1, errors, _this.props.name)) {
                                _this.setState({ error: getIn(error, _this.props.name) });
                            }
                            else {
                                setFormikState(function (prevState) { return (__assign({}, prevState, { errors: error })); });
                            }
                        });
                    }
                    else {
                        if (isEqualExceptForKey(maybePromise_1, errors, _this.props.name)) {
                            _this.setState({
                                value: val,
                                error: getIn(maybePromise_1, _this.props.name),
                            });
                        }
                        else {
                            _this.setState({
                                value: val,
                            });
                            setFormikState(function (prevState) { return (__assign({}, prevState, { errors: maybePromise_1 })); });
                        }
                    }
                }
                else if (validationSchema) {
                    var schema = isFunction(validationSchema)
                        ? validationSchema()
                        : validationSchema;
                    var mergedValues = setIn(values, _this.props.name, val);
                    try {
                        validateYupSchema(mergedValues, schema, true);
                        _this.setState({
                            value: val,
                            error: undefined,
                        });
                    }
                    catch (e) {
                        if (e.name === 'ValidationError') {
                            _this.setState({
                                value: val,
                                error: getIn(yupToFormErrors(e), _this.props.name),
                            });
                        }
                        else {
                            _this.setState({
                                value: val,
                            });
                            validateYupSchema(mergedValues, schema).then(function () { return _this.setState({ error: undefined }); }, function (err) {
                                return _this.setState(function (s) { return (__assign({}, s, { error: getIn(yupToFormErrors(err), _this.props.name) })); });
                            });
                        }
                    }
                }
                else {
                    _this.setState({ value: val });
                }
            }
            else {
                _this.setState({ value: val });
            }
        };
        _this.handleBlur = function () {
            var _a = _this.props.formik, validateOnBlur = _a.validateOnBlur, setFormikState = _a.setFormikState;
            var _b = _this.props, name = _b.name, validate = _b.validate;
            if (validateOnBlur && validate) {
                var maybePromise_2 = validate(_this.state.value);
                if (isPromise(maybePromise_2)) {
                    maybePromise_2.then(function () {
                        return setFormikState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, name, _this.state.value), errors: setIn(prevState.errors, name, undefined), touched: setIn(prevState.touched, name, true) })); });
                    }, function (error) {
                        return setFormikState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, name, _this.state.value), errors: setIn(prevState.errors, name, error), touched: setIn(prevState.touched, name, true) })); });
                    });
                }
                else {
                    setFormikState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, name, _this.state.value), errors: setIn(prevState.errors, name, maybePromise_2), touched: setIn(prevState.touched, name, true) })); });
                }
            }
            else {
                setFormikState(function (prevState) { return (__assign({}, prevState, { errors: setIn(prevState.errors, name, _this.state.error), values: setIn(prevState.values, name, _this.state.value), touched: setIn(prevState.touched, name, true) })); });
            }
        };
        _this.state = {
            value: getIn(props.formik.values, props.name),
            error: getIn(props.formik.errors, props.name),
        };
        var render = props.render, children = props.children, component = props.component, formik = props.formik;
        warning(!(component && render), 'You should not use <FastField component> and <FastField render> in the same <FastField> component; <FastField component> will be ignored');
        warning(!(props.component && children && isFunction(children)), 'You should not use <FastField component> and <FastField children> as a function in the same <FastField> component; <FastField component> will be ignored.');
        warning(!(render && children && !isEmptyChildren(children)), 'You should not use <FastField render> and <FastField children> in the same <FastField> component; <FastField children> will be ignored');
        formik.registerField(props.name, {
            validate: props.validate,
        });
        return _this;
    }
    FastFieldInner.prototype.componentDidUpdate = function (prevProps, _state) {
        var nextFieldValue = getIn(this.props.formik.values, this.props.name);
        var nextFieldError = getIn(this.props.formik.errors, this.props.name);
        var prevFieldValue = getIn(prevProps.formik.values, prevProps.name);
        var prevFieldError = getIn(prevProps.formik.errors, prevProps.name);
        if (!isEqual(nextFieldValue, prevFieldValue)) {
            this.setState({ value: nextFieldValue });
        }
        if (!isEqual(nextFieldError, prevFieldError)) {
            this.setState({ error: nextFieldError });
        }
        if (this.props.name !== prevProps.name) {
            this.props.formik.unregisterField(prevProps.name);
            this.props.formik.registerField(this.props.name, {
                validate: this.props.validate,
            });
        }
        if (this.props.validate !== prevProps.validate) {
            this.props.formik.registerField(this.props.name, {
                validate: this.props.validate,
            });
        }
    };
    FastFieldInner.prototype.componentWillUnmount = function () {
        this.props.formik.unregisterField(this.props.name);
    };
    FastFieldInner.prototype.render = function () {
        var _a = this.props, validate = _a.validate, name = _a.name, render = _a.render, children = _a.children, _b = _a.component, component = _b === void 0 ? 'input' : _b, formik = _a.formik, props = __rest(_a, ["validate", "name", "render", "children", "component", "formik"]);
        var _validate = formik.validate, _validationSchema = formik.validationSchema, restOfFormik = __rest(formik, ["validate", "validationSchema"]);
        var field = {
            value: props.type === 'radio' || props.type === 'checkbox'
                ? props.value
                : this.state.value,
            name: name,
            onChange: this.handleChange,
            onBlur: this.handleBlur,
        };
        var bag = {
            field: field,
            form: restOfFormik,
            meta: { touched: getIn(formik.touched, name), error: this.state.error },
        };
        if (render) {
            return render(bag);
        }
        if (isFunction(children)) {
            return children(bag);
        }
        if (typeof component === 'string') {
            var innerRef = props.innerRef, rest = __rest(props, ["innerRef"]);
            return React.createElement(component, __assign({ ref: innerRef }, field, rest, { children: children }));
        }
        return React.createElement(component, __assign({}, bag, props, { children: children }));
    };
    return FastFieldInner;
}(React.Component));
var FastField = connect(FastFieldInner);

exports.Formik = Formik;
exports.yupToFormErrors = yupToFormErrors;
exports.validateYupSchema = validateYupSchema;
exports.Field = Field;
exports.Form = Form;
exports.withFormik = withFormik;
exports.move = move;
exports.swap = swap;
exports.insert = insert;
exports.replace = replace;
exports.FieldArray = FieldArray;
exports.getIn = getIn;
exports.setIn = setIn;
exports.setNestedObjectValues = setNestedObjectValues;
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isInteger = isInteger;
exports.isString = isString;
exports.isNaN = isNaN;
exports.isEmptyChildren = isEmptyChildren;
exports.isPromise = isPromise;
exports.getActiveElement = getActiveElement;
exports.FastField = FastField;
exports.FormikProvider = FormikProvider;
exports.FormikConsumer = FormikConsumer;
exports.connect = connect;
//# sourceMappingURL=formik.cjs.production.js.map
