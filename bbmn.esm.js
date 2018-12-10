import Backbone, { Collection, Events, Model, Router, View, ajax, history } from 'backbone';
export { Model, Collection, View as BackboneView, Events, Router, history, ajax } from 'backbone';
import $ from 'jquery';
import Mn, { MnObject, Object as Object$1, Region, normalizeMethods, View as View$1, CollectionView } from 'backbone.marionette';
export { Region } from 'backbone.marionette';
import _ from 'underscore';

var version = "1.0.0";

/* istanbul ignore next */
var newObject = MnObject || Object$1;

function isClass(arg, Base) {
	return _.isFunction(arg) && (arg == Base || arg.prototype instanceof Base);
}

function isModel(arg) {
	return arg instanceof Model;
}

function isModelClass(arg) {
	return isClass(arg, Model);
}

function isCollection(arg) {
	return arg instanceof Collection;
}
function isCollectionClass(arg) {
	return isClass(arg, Collection);
}

function isView(arg) {
	return arg instanceof View;
}

function isViewClass(arg) {
	return isClass(arg, View);
}

var extend = Model.extend;

var BaseClass = function BaseClass() {};
BaseClass.extend = extend;

var ctors = _.reduce([Model, Collection, View, Router, newObject, Region, BaseClass], function (ctors, ctor) {
	/* istanbul ignore next */
	if (_.isFunction(ctor)) {
		ctors.push(ctor);
	}
	return ctors;
}, []);

var tryGetFromMn = ['Application', 'AppRouter'];

_.each(tryGetFromMn, function (ClassName) {
	_.isFunction(Mn[ClassName]) && ctors.push(Mn[ClassName]);
});

function isKnownCtor(arg) {
	if (!_.isFunction(arg)) {
		return false;
	}
	return _(ctors).some(function (ctor) {
		return arg === ctor || arg.prototype instanceof ctor;
	});
}

function betterResult() {
	var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var key = arguments[1];
	var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	var context = opts.context,
	    args = opts.args,
	    checkAlso = opts.checkAlso,
	    force = opts.force;

	var defaultValue = opts.default;

	if (!_.isString(key) || key === '') {
		return;
	}

	var value = obj[key];

	if (value != null && (!_.isFunction(value) || isKnownCtor(value))) {
		return value;
	}

	if (force !== false && _.isFunction(value)) {
		value = value.apply(context || obj, args);
	}

	//let result = force !== false && _.isFunction(value) ? value.apply(context || obj, args) : value;

	if (value == null && _.isObject(checkAlso)) {
		var alsoOptions = _.omit(opts, 'checkAlso');
		value = betterResult(checkAlso, key, alsoOptions);
	}

	if (value == null && defaultValue != null) {
		value = defaultValue;
	}

	return value;
}

// camelCase('asd:qwe:zxc') -> asdQweZxc
// camelCase('asd:qwe:zxc', true) -> AsdQweZxc
function camelCase() {

	var text = void 0;
	var first = void 0;

	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	if (!args.length) return;else if (args.length == 1) {
		text = args[0];
	} else {
		if (_.isBoolean(args[args.length - 1])) {
			first = args.pop();
		}
		text = _.filter(args, function (chunk) {
			return chunk != null;
		}).join(':');
	}

	if (!text) return text;

	if (!_.isString(text)) return text.toString();
	text = text.replace(/:{2,}/gmi, ':');
	var splitter = first === true ? /(^|:)(\w)/gi : /(:)(\w)/gi;
	text = text.replace(splitter, function (match, prefix, text) {
		return text.toUpperCase();
	});
	if (!first) text = text.replace(/(^)(\w)/gi, function (match, prefix, text) {
		return text.toLowerCase();
	});
	return text;
}

function takeFirst(key) {
	if (!_.isString(key) || key === '') return;
	var value = void 0;

	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	_.some(args, function (arg) {
		if (!_.isObject(arg)) {
			return false;
		}

		if (key in arg) {
			value = arg[key];
			return true;
		}
	});
	return value;
}

function getModel(arg) {

	if (isModel(arg)) {
		return arg;
	}

	if (isView(arg)) {
		return arg.model;
	}
}

function getModel$1(arg) {
	return isView(arg) && arg;
}

function compareAB(a, b, func) {
	if (_.isArray(func)) {

		var result = 0;

		_(func).every(function (f) {
			result = compareAB(a, b, f);
			return result === 0;
		});

		return result;
	} else {
		if (_.isFunction(func)) {
			a = func.call(a, getModel(a), getModel$1(a));
			b = func.call(b, getModel(b), getModel$1(b));
		}

		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	}
}

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function comparator() {
	var result = 0;

	//for simple case (arg1, arg2, compare)

	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	if (args.length <= 3 && !_.isArray(args[0])) {

		return compareAB.apply(null, args);
	}
	//for complex cases ([arg1, arg2, compare], [], .... [])
	//each arguments should be an array
	else {

			_(args).every(function (single) {

				if (!_.isArray(single)) {
					return true;
				}
				result = compareAB.apply(undefined, toConsumableArray(single));
				return result === 0;
			});
		}

	return result;
}

function toNumber(text) {

	if (_.isNumber(text) && !_.isNaN(text)) {
		return text;
	} else if (text == null || !_.isString(text)) {
		return;
	}

	var value = parseFloat(text, 10);

	if (isNaN(value)) {
		return;
	}

	return value;
}

var defaultOptions = {
	nullable: true,
	strict: false,
	returnNullAs: undefined,
	returnEmptyAs: undefined,
	returnNullAndEmptyAs: undefined,
	returnAnyAs: undefined,
	returnOtherAs: undefined
};

var trueValues = ['true', '1', '-1', 'yes'];
var falseValues = ['false', '0', 'no'];

var alternative = function alternative() {
	var returnValue = void 0;

	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	_(args).some(function (arg) {
		if (_.isBoolean(arg)) {
			returnValue = arg;
			return true;
		}
	});
	return returnValue;
};

var valueOrAlternative = function valueOrAlternative(nullable, nullValue, value) {
	for (var _len2 = arguments.length, alts = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
		alts[_key2 - 3] = arguments[_key2];
	}

	var alt = alternative.apply(undefined, alts);
	if (alt != null) return alt;else if (nullable) return nullValue;else return value;
};

var convertToBoolean = function convertToBoolean(arg) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


	var other = void 0;
	var options = _.extend({}, defaultOptions, opts);
	var nullable = options.nullable,
	    strict = options.strict,
	    returnNullAs = options.returnNullAs,
	    returnEmptyAs = options.returnEmptyAs,
	    returnNullAndEmptyAs = options.returnNullAndEmptyAs,
	    returnAnyAs = options.returnAnyAs,
	    returnOtherAs = options.returnOtherAs;


	if (arg == null) {
		return valueOrAlternative(nullable, undefined, false, returnNullAs, returnNullAndEmptyAs);
	} else if (arg === '') {
		return valueOrAlternative(nullable, undefined, false, returnEmptyAs, returnNullAndEmptyAs);
	} else if (_.isBoolean(arg)) {
		return arg;
	}
	//  else if (_.isObject(arg)) {
	// }

	other = strict ? nullable ? undefined : false : true;

	var text = arg.toString().toLowerCase();
	var isTrue = convertToBoolean.trueValues.indexOf(text) > -1;
	var isFalse = convertToBoolean.falseValues.indexOf(text) > -1;

	if (_.isBoolean(returnAnyAs)) {
		return returnAnyAs;
	} else if (_.isBoolean(returnOtherAs)) {
		other = returnOtherAs;
	}

	return isTrue ? true : isFalse ? false : other;
};

convertToBoolean.trueValues = trueValues;
convertToBoolean.falseValues = falseValues;

var converters = {
	number: toNumber,
	boolean: convertToBoolean,
	bool: convertToBoolean
};

//this is under development yet and can be change in any time
function convertString(text, type, options) {

	if (!_.isString(type)) {
		return text;
	}

	var converter = converters[type];

	if (!_.isFunction(converter)) {
		return text;
	}

	return converter(text, options);
}

function isBadSource(src, flatted) {
	if (typeof global !== 'undefined' && src === global) {
		return true;
	} else if (typeof window !== 'undefined' && src === window) {
		return true;
	} else if (flatted.indexOf(src) > -1) {
		return true;
	}
}

var privateApi = {
	traverse: function traverse(source) {
		var destination = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		var root = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
		var sources = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

		if (_.isFunction(source) || _.isArray(source)) {
			return source;
		}
		if (isBadSource(source, sources)) {
			return;
		}
		sources.push(source);
		var hash = isModel(source) ? source.attributes : source;

		var props = Object.getOwnPropertyNames(hash);

		for (var x = 0; x < props.length; x++) {
			var name = props[x];
			var prop = hash[name];
			if (prop === undefined) {
				continue;
			} else if (_.isArray(prop)) {
				destination[root + name] = prop.slice(0);
			} else if (_.isDate(prop)) {
				destination[root + name] = new Date(prop.valueOf());
			} else if (!_.isObject(prop) || _.isFunction(prop)) {
				destination[root + name] = prop;
			} else {
				privateApi.traverse(prop, destination, root + name + '.', _.clone(sources));
			}
		}

		return destination;
	}
};

function flattenObject(obj) {
	if (_.isObject(obj)) {
		return privateApi.traverse(obj);
	}
}

function isEmptyValue(arg) {
	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$allowWhiteSpace = _ref.allowWhiteSpace,
	    allowWhiteSpace = _ref$allowWhiteSpace === undefined ? false : _ref$allowWhiteSpace;

	if (arg == null || _.isNaN(arg)) return true;

	if (!_.isString(arg)) return false;

	if (arg === '') return true;

	return !allowWhiteSpace && arg.trim() === '';
}

function getProperty(context, name) {
	var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	if (!_.isObject(context) || isEmptyValue(name)) {
		return;
	}

	if (isModel(context)) {
		var noModelAttributes = options.noModelAttributes,
		    includeModelProperty = options.includeModelProperty,
		    modelPropertyFirst = options.modelPropertyFirst;


		var attrValue = context.get(name, { gettingByPath: true });
		var propValue = context[name];
		var value = void 0;

		if (noModelAttributes === true) {
			value = propValue;
		} else if (modelPropertyFirst) {
			value = propValue != null ? propValue : attrValue;
		} else if (includeModelProperty) {
			value = attrValue != null ? attrValue : propValue;
		} else {
			value = attrValue;
		}

		return value;
	} else {
		return context[name];
	}
}

function getByPathArray(context, propertyName, pathArray, options) {

	if (!_.isObject(context) || isEmptyValue(propertyName)) return;

	var prop = getProperty(context, propertyName, options);

	if (!pathArray.length || prop == null) return prop;

	var nextName = pathArray.shift();

	return getByPathArray(prop, nextName, pathArray, options);
}

function getByPath(obj, path, options) {

	if (!_.isObject(obj) || isEmptyValue(path)) return;

	var pathArray = _.isString(path) ? path.split('.') : _.isArray(path) ? [].slice.call(path) : [path];

	var prop = pathArray.shift();

	return getByPathArray(obj, prop, pathArray, options);
}

function getOption() {
	var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var key = arguments[1];
	var opts = arguments[2];
	var also = arguments[3];


	if (_.isObject(key) && _.isString(opts)) {
		var _opts = also;
		also = key;
		key = opts;
		opts = _opts;
	}

	var options = _.extend({ args: [context], context: context }, opts, { default: null });
	var deep = options.deep;

	var defaultValue = opts && opts.default;

	var value = betterResult(context.options || also, key, options);
	if (value == null && deep !== false) {
		value = betterResult(context, key, options);
	}

	return value != null ? value : defaultValue;
}

function instanceGetOption() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	return getOption.apply(undefined, [this].concat(args));
}

function normalizeStringArray(arr) {
	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    caseSensitive = _ref.caseSensitive;

	var check = {};
	return _.reduce(arr, function (result, item) {

		if (isEmptyValue(item)) {
			return result;
		}
		item = item.toString();
		var checkKey = caseSensitive ? item : item.toLowerCase();
		if (checkKey in check) {
			return result;
		}
		check[checkKey] = 1;
		result.push(item.toString());
		return result;
	}, []);
}

function normalizeArgument(value, options, returnObject) {

	if (_.isString(value)) {
		value = value.split(/\s*,\s*/gmi);
	}

	if (_.isArray(value)) {
		return normalizeStringArray(value, options);
	} else if (_.isObject(value) && returnObject) {
		return value;
	}
}

function normalizeValueAndFlag(value, flag, options) {
	return {
		values: normalizeArgument(value, options, true),
		flags: normalizeArgument(flag, options)
	};
}

function compare(a, b, _ref2) {
	var caseSensitive = _ref2.caseSensitive;


	if (!caseSensitive) {
		a = a.toLowerCase();
		b = b.toLowerCase();
	}

	return a === b;
}

function searchFlags(values, flags, options) {
	var isArray = _.isArray(values);
	var useObjectValues = options.useObjectValues;


	var result = _.reduce(values, function (filtered, item, key) {
		var check = item;
		if (!isArray && !useObjectValues) {
			check = key;
		}

		var good = _.some(flags, function (flag) {
			return compare(check, flag, options);
		});

		if (!good) {
			return filtered;
		}

		if (isArray) {
			filtered.push(check);
		} else {
			filtered.push({ value: item, key: key });
		}

		return filtered;
	}, []);

	var all = options.all;
	if (!result.length || all && result.length != flags.length) {
		return;
	}

	return result;
}

var processReturns = {
	string: function string(_ref) {
		var isArray = _ref.isArray,
		    founded = _ref.founded,
		    delimeter = _ref.delimeter,
		    takeObjectKeys = _ref.takeObjectKeys;

		if (isArray) {
			return founded.join(delimeter);
		} else {
			var key = takeObjectKeys ? 'key' : 'value';
			return _.pluck(founded, key).join(delimeter);
		}
	},
	array: function array(_ref2) {
		var isArray = _ref2.isArray,
		    doNotPluck = _ref2.doNotPluck,
		    founded = _ref2.founded,
		    takeObjectKeys = _ref2.takeObjectKeys;

		if (isArray || doNotPluck) {
			return founded;
		} else {
			var key = takeObjectKeys ? 'key' : 'value';
			return _.pluck(founded, key);
		}
	},
	object: function object(_ref3) {
		var isArray = _ref3.isArray,
		    takeObjectKeys = _ref3.takeObjectKeys,
		    founded = _ref3.founded;

		return _.reduce(founded, function (result, item, index$$1) {
			var value = isArray ? item : takeObjectKeys ? item.key : item.value;
			var key = isArray ? index$$1 : takeObjectKeys ? item.value : item.key;
			result[key] = value;
			return result;
		}, {});
	}
};

function normalizedReturn(_ref4) {
	var returnAs = _ref4.returnAs,
	    flag = _ref4.flag,
	    isArray = _ref4.isArray,
	    founded = _ref4.founded,
	    delimeter = _ref4.delimeter,
	    takeObjectKeys = _ref4.takeObjectKeys,
	    doNotPluck = _ref4.doNotPluck;

	if (returnAs == null) {
		returnAs = _.isArray(flag) ? 'array' : 'string';
	}
	var processor = processReturns[returnAs];
	if (!_.isFunction(processor)) {
		return;
	}

	var processorOptions = {
		isArray: isArray, founded: founded, delimeter: delimeter, takeObjectKeys: takeObjectKeys, doNotPluck: doNotPluck
	};

	return processor(processorOptions);
}

function getFlag(value, flag) {
	var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	var _normalizeValueAndFla = normalizeValueAndFlag(value, flag, options),
	    flags = _normalizeValueAndFla.flags,
	    values = _normalizeValueAndFla.values;

	if (!flags || !values) {
		return;
	}

	var founded = searchFlags(values, flags, options);
	if (!founded) {
		return;
	}

	var returnOptions = _.extend({
		delimeter: ', ',
		isArray: _.isArray(values),
		flag: flag,
		founded: founded
	}, _.pick(options, 'returnAs', 'takeObjectKeys', 'doNotPluck'));

	return normalizedReturn(returnOptions);
}

function hasFlag(value, flag) {
	var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


	if (value == null || flag == null) return false;

	if (_.isNumber(value)) {

		if (!_.isNumber(flag)) return false;

		var has = value & flag;
		return options.all === true ? has === flag : has > 0;
	}

	var _normalizeValueAndFla = normalizeValueAndFlag(value, flag, options),
	    flags = _normalizeValueAndFla.flags,
	    values = _normalizeValueAndFla.values;

	if (!flags || !values) {
		return false;
	}

	var founded = searchFlags(values, flags, options);
	return !!founded && !!founded.length;
}

var defaultOptions$1 = {
	mergeObjects: true,
	wrapObjectWithConstructor: true
};

function createMixinFromObject(arg) {

	var mixedObj = _.clone(arg);
	var ctor = mixedObj.hasOwnProperty('constructor') && _.isFunction(mixedObj.constructor) && mixedObj.constructor;
	var hasConstructor = _.isFunction(ctor);

	return function (Base) {
		if (hasConstructor) {
			mixedObj.constructor = function mx() {
				Base.apply(this, arguments);
				ctor.apply(this, arguments);
			};
		}
		return Base.extend(mixedObj);
	};
}

function normalizeArguments(args, opts) {
	var raw = {};
	var wrap = opts.wrapObjectWithConstructor == true;
	var merge = opts.mergeObjects == true;
	var mixins = [];
	_(args).each(function (arg) {

		//if argument is function just put it to mixins array
		//and continue;
		if (_.isFunction(arg)) {
			mixins.push(arg);
			return;
		}

		//if argument is not an object just skip it
		if (!_.isObject(arg)) return;

		//if mergeObjects == false or wrapObjectWithConstructor == true 
		//and there is a constructor function
		//converting to a mixin function
		//otherwise extend rawObject
		if (!merge || wrap && _.isFunction(arg.constructor)) {
			mixins.push(createMixinFromObject(arg));
		} else {
			_.extend(raw, arg);
		}
	});

	//if rawObject is not empty
	//convert it to a mixin function
	//and put it to the begin of mixins array
	if (_.size(raw)) mixins.unshift(createMixinFromObject(raw));

	return mixins;
}

function withMethod() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var mixins = normalizeArguments(args, this.options);
	var Mixed = this.class;
	if (!mixins.length) {
		return Mixed;
	} else {
		return _.reduce(mixins, function (Memo, Ctor) {
			var mixed = Ctor(Memo);
			return mixed;
		}, Mixed);
	}
}

function mix(_ctor, options) {

	var opts = _.extend({}, defaultOptions$1, options);

	var ctor = void 0;

	if (_.isFunction(_ctor)) {
		ctor = _ctor;
	} else if (_.isObject(_ctor)) {
		var b = _.isFunction(_ctor.constructor) && _ctor.constructor;
		ctor = function mx() {
			b.apply(this, arguments);
		};
		_.extend(ctor.prototype, _.omit(_ctor, 'constructor'));
	} else {
		throw new Error('Mix argument should be a class or a plain object');
	}

	if (!_.isFunction(ctor.extend)) {
		ctor.extend = extend;
	}

	return {
		options: opts,
		with: withMethod,
		class: ctor
	};
}

function pstoSetPair(context, pair, options) {
	if (!_.isString(pair) || pair === '') return;

	var keyvalue = pair.split('=');
	var key = keyvalue.shift();
	var value = keyvalue.join('=');
	return pstoSetKeyValue(context, key, value, options);
}

function pstoSetKeyValue(context, key, value, options) {

	if (isEmptyValue(key)) return;

	key = decodeURIComponent(key);
	value = decodeURIComponent(value);

	var transform = options.transform;
	if (_.isFunction(transform)) {
		value = transform(key, value, options);
	}

	if (isEmptyValue(value)) return;

	if (key in context) {
		if (!_.isArray(context[key])) {
			context[key] = [context[key]];
		}
		context[key].push(value);
	} else {
		context[key] = value;
	}
	return { key: key, value: value };
}

function paramsToObject(raw, options) {
	var emptyObject = options.emptyObject !== false;
	var result = {};
	if (!_.isString(raw)) return emptyObject ? result : undefined;

	var rawpairs = raw.split('&');
	var pairs = _(rawpairs).reduce(function (memo, rawpair) {
		var pair = pstoSetPair(result, rawpair, options);
		if (pair != null) {
			memo.push(pair);
		}
		return memo;
	}, []);

	if (!_.size(result) && !emptyObject) {
		return;
	}

	return !options.asArray ? result : pairs;
}

function setProperty(context, name, value) {
	if (isModel(context)) {
		context.set(name, value, { silent: true });
	} else {
		context[name] = value;
	}

	return getProperty(context, name);
}

function setByPathArr(context, propertyName, pathArray, value, options) {

	var modelContext = void 0;
	if (isModel(context)) {
		modelContext = {
			model: context,
			property: propertyName,
			pathChunks: [].slice.call(pathArray)
		};
	}

	//set value if this is a last chunk of path
	if (!pathArray.length) {

		modelContext && options.models.push(modelContext);

		return {
			value: setProperty(context, propertyName, value, options)
		};
	} else {

		var prop = getProperty(context, propertyName);

		if (!_.isObject(prop) && !options.force) {
			return;
		} else if (!_.isObject(prop) && options.force) {
			prop = setProperty(context, propertyName, {}, options);
		}

		modelContext && options.models.push(modelContext);

		var nextName = pathArray.shift();

		return setByPathArr(prop, nextName, pathArray, value, options);
	}
}

function normalizeSetByPathOptions() {
	var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var ext = arguments[1];
	var silent = opts.silent,
	    force = opts.force;

	silent = silent === true;
	force = force !== false;
	var options = _.extend({}, opts, ext, {
		silent: silent, force: force,
		models: []
	});

	return options;
}

function triggerModelEventsOnSetByPath(value, options) {
	if (options.silent || !options.models.length) {
		return;
	}

	_(options.models).each(function (context) {
		var rest = context.pathChunks.join(':');
		if (rest) {
			context.model.trigger('change:' + context.property + ':' + rest, context.model, value);
		}
		context.model.trigger('change:' + context.property, context.model, value);
		context.model.trigger('change', context.model);
	});
}

function ensureSetByPathArguments(context, path) {
	var errors = [];
	if (!_.isObject(context)) {
		errors.push(new Error('Context is not an object'));
	}
	if (!_.isString(path) || path === '') {
		errors.push(new Error('Path is not a string'));
	}
	if (errors.length) {
		return errors;
	}
}

function setByPath(context, path, value, opts) {

	var argumentsErrors = ensureSetByPathArguments(context, path);
	if (argumentsErrors) {
		return value;
	}

	var pathArray = path.split('.');
	var options = normalizeSetByPathOptions(opts, { path: path, pathArray: [].slice.call(pathArray) });

	var propertyName = pathArray.shift();

	var result = setByPathArr(context, propertyName, pathArray, value, options);
	if (result === undefined) {
		return value;
	} else {
		triggerModelEventsOnSetByPath(value, options);
		return result.value;
	}
}

function parseKey(raw) {
	var chunks = raw.split('.');
	var _key = chunks.shift();
	var rest = chunks.join('.');
	chunks = _key.split('[');
	var key = chunks.shift();
	var index$$1 = chunks.length ? parseInt(chunks.shift().replace(/\D/g, ''), 10) : false;
	return {
		raw: raw,
		key: key,
		rest: rest,
		property: rest.split('.').shift() || undefined,
		index: index$$1,
		notIndexed: index$$1 === false
	};
}

function buildKeyPath(k) {
	var path = [];
	k.key && path.push(k.key);
	path.push(k.index);
	k.property && path.push(k.property);
	if (path.length != 3) return;
	return path.join('.');
}

function build(text, opts) {

	var params = paramsToObject(text, _.extend({}, opts, { asArray: true }));

	var qs = {};
	var allmeeted = {};

	function hasMeet(k) {
		var path = buildKeyPath(k);
		return path && allmeeted[path] == true;
	}
	function markAsMeeted(k) {
		var path = buildKeyPath(k);
		path && (allmeeted[path] = true);
	}

	_.each(params, function (_ref) {
		var value = _ref.value,
		    key = _ref.key;


		var okey = parseKey(key);

		var stored = qs[okey.key];

		if (!stored) {
			if (!_.isNumber(okey.index)) {
				okey.index = 0;
			}
			if (okey.property) {
				var hash = {};
				setByPath(hash, okey.rest, value);
				value = hash;
				markAsMeeted(okey);
			}
			if (okey.index) {
				var arr = [];
				arr[okey.index] = value;
				value = arr;
			}
			qs[okey.key] = value;
		} else {
			if (!_.isArray(stored)) {
				if (!_.isNumber(okey.index)) {
					okey.index = 0;
				}
				var meeted = hasMeet(okey);
				if (okey.property) {
					if (!meeted) {
						var _hash = !okey.index && _.isObject(stored) ? stored : {};
						setByPath(_hash, okey.rest, value);
						markAsMeeted(okey);
						if (okey.index) {
							stored = [stored];
							stored[okey.index] = _hash;
						}
					} else {
						stored = [stored];
						okey.index = stored.length;
						var _hash2 = {};
						setByPath(_hash2, okey.rest, value);
						markAsMeeted(okey);
						stored.push(_hash2);
					}
				} else {
					stored = [stored];
					var index$$1 = okey.index || stored.length;
					stored[index$$1] = value;
				}
			} else {
				if (okey.property) {
					if (!_.isNumber(okey.index)) {
						okey.index = stored.length - 1;
					}
					var _meeted = hasMeet(okey);
					if (!_meeted) {
						var exists = stored[okey.index];
						var _hash3 = exists || {};
						setByPath(_hash3, okey.rest, value);
						if (!exists) {
							stored[okey.index] = _hash3;
						}
						markAsMeeted(okey);
					} else {
						var _exists = !okey.notIndexed && stored[okey.index];
						var _hash4 = _exists || {};
						setByPath(_hash4, okey.rest, value);
						if (okey.notIndexed) okey.index = stored.length;
						markAsMeeted(okey);
						if (!_exists) stored[okey.index] = _hash4;
					}
				} else {
					var _index = okey.index || stored.length;
					stored[_index] = value;
				}
			}
			qs[okey.key] = stored;
		}
	});
	return qs;
}

function paramsToObject$1(raw) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (options.complex) {
		return build(raw, _.omit(options, 'complex'));
	} else {
		return paramsToObject(raw, options);
	}
}

function unFlat(obj) {

	if (obj == null || !_.isObject(obj)) return;
	var res = {};
	for (var e in obj) {
		setByPath(res, e, obj[e]);
	}
	return res;
}

/*
function check(arg, opts) {
	opts.ob += _.isObject(arg) && 1 || 0;
	opts.ar += _.isArray(arg) && 1 || 0;
	opts.fn += _.isFunction(arg) && 1 || 0;
	opts.sum += (opts.ob + opts.ar + opts.fn);
}

function checkArguments(a,b)
{
	let chck = { ob:0, ar:0, fn: 0, sum:0  };
	check(a, chck);
	check(b, chck);
	return [chck.sum, chck.ob, chck.fn, chck.ar];
}

*/

function getType(arg) {
	if (_.isFunction(arg)) {
		return 8;
	} else if (_.isArray(arg)) {
		return 4;
	} else if (_.isObject(arg)) {
		return 2;
	} else {
		return 1;
	}
}
function sameType(a, b) {
	var at = getType(a);
	var bt = getType(b);
	return at == bt && at != 8 ? at : false;
}
function compareObjects(objectA, objectB) {

	if (objectA == null && objectB == null) {
		return objectA == objectB;
	}

	if (objectA === '' || objectB === '') {
		return objectA === objectB;
	}

	if (objectA == objectB) {
		return true;
	}

	var type = sameType(objectA, objectB);
	if (!type) {
		return false;
	} else if (type == 1) {
		return objectA == objectB;
	}

	objectA = flattenObject(objectA);
	objectB = flattenObject(objectB);

	var size = _.size(objectA);
	if (size != _.size(objectB)) {
		return false;
	}

	if (_.isArray(objectA)) {
		var allvalues = _.uniq(objectA.concat(objectB));
		return _.every(allvalues, function (value) {
			var valuesA = _.filter(objectA, function (_v) {
				return compareObjects(_v, value);
			});
			var valuesB = _.filter(objectB, function (_v) {
				return compareObjects(_v, value);
			});
			if (valuesA.length != valuesB.length) return false;
			return compareObjects(valuesA[0], valuesB[0]);
		});
	} else {
		var allkeys = _.uniq(_.keys(objectA).concat(_.keys(objectB)));
		if (allkeys.length != size) return false;
		return _.every(allkeys, function (key) {
			return compareObjects(objectA[key], objectB[key]);
		});
	}
}

function triggerMethodOn(context) {
	if (!_.isObject(context)) {
		return;
	}

	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	return triggerMethod.call.apply(triggerMethod, [context].concat(args));
}

function triggerMethod(event) {
	for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
		args[_key2 - 1] = arguments[_key2];
	}

	// get the method name from the event name
	var methodName = camelCase('on:' + event);
	var method = getOption(this, methodName, { force: false });
	var result = void 0;

	// call the onMethodName if it exists
	if (_.isFunction(method)) {
		// pass all args, except the event name
		result = method.apply(this, args);
	}

	if (_.isFunction(this.trigger)) {
		// trigger the event
		this.trigger.apply(this, arguments);
	}

	return result;
}

function mergeOptions(options) {
	var _this = this;

	for (var _len = arguments.length, keys = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		keys[_key - 1] = arguments[_key];
	}

	if (!_.isObject(options)) {
		return;
	}

	keys = _.flatten(keys);

	return _.reduce(keys, function (merged, key) {
		if (!_.isString(key)) {
			return merged;
		}
		var option = options[key];

		if (option !== undefined) {
			_this[key] = option;
			merged[key] = option;
		}

		return merged;
	}, {});
}

function isCtor(instance, ctor, checkCtor) {
	return _.isFunction(ctor) && isClass(instance, ctor) || _.isFunction(checkCtor) && checkCtor(instance) || isKnownCtor(instance);
}

function shouldInvoke(instance, ctor, checkCtor) {
	return _.isFunction(instance) && !isCtor(instance, ctor, checkCtor);
}

function getByKey(context, key) {
	var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
	    ctor = _ref.ctor,
	    checkCtor = _ref.checkCtor,
	    options = _ref.options,
	    defaultOptions = _ref.defaultOptions;

	if (!_.isString(key)) {
		return;
	}

	var instance = getOption(context, key, { force: false, args: [context] });
	if (instance == null) {
		return;
	}
	if (shouldInvoke(instance, ctor, checkCtor)) {
		instance = instance.call(context, context);
	}

	var contextOptions = getOption(context, key + 'Options', { args: [context] });
	var compiledOptions = _.extend({}, defaultOptions, contextOptions, options);

	if (_.isFunction(instance)) {

		return {
			definition: instance,
			options: compiledOptions
		};
	}

	return { value: instance, options: compiledOptions };
}

function buildByKey(context, key) {
	var getOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	var buildContext = getByKey(context, key, getOptions);

	if (!_.isObject(buildContext)) {
		return;
	}

	var buildText = getOptions.buildText,
	    ctor = getOptions.ctor,
	    checkCtor = getOptions.checkCtor,
	    knownCtor = getOptions.knownCtor,
	    toArguments = getOptions.toArguments;
	var value = buildContext.value,
	    definition = buildContext.definition,
	    options = buildContext.options;


	if (!_.isFunction(toArguments)) toArguments = function toArguments(context, definition, options) {
		return [options];
	};

	var args = toArguments.call(context, context, definition, options);

	if (value != null) {
		if (!_.isObject(value)) {
			if (_.isFunction(buildText)) {
				return buildText.apply(undefined, [value].concat(toConsumableArray(args)));
			}
		} else {
			if (isCtor(value.constructor, ctor, checkCtor, knownCtor)) {
				return value;
			}
		}
	} else {
		return new (Function.prototype.bind.apply(definition, [null].concat(toConsumableArray(args))))();
	}
}

function buildViewByKey(context, key) {
	var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
	    TextView = _ref.TextView,
	    defaultOptions = _ref.defaultOptions,
	    options = _ref.options;

	var getOptions = {
		defaultOptions: defaultOptions,
		options: options,
		checkCtor: function checkCtor(ctor) {
			return isViewClass(ctor);
		}
	};

	if (TextView != null && isViewClass(TextView)) {
		getOptions.buildText = function (text, opts) {
			return new TextView(_.extend({}, opts, { text: text }));
		};
	}

	return buildByKey(context, key, getOptions);
}

var enumsStore = {};

var enumsApi = {
	getFlag: getFlag,
	hasFlag: hasFlag,
	getByPath: getByPath,
	setByPath: setByPath,
	extendStore: function extendStore(hash) {
		_.extend(enumsStore, hash);
	},
	getEnum: function getEnum(arg) {
		if (_.isObject(arg)) {
			return arg;
		} else if (isEmptyValue(arg) || !_.isString(arg)) {
			return;
		}

		return enumsApi.getByPath(enumsStore, arg);
	}
};

function get$1(arg, flag, options) {
	if (arguments.length === 0) {
		return enumsStore;
	}

	var _enum = enumsApi.getEnum(arg);
	if (arguments.length === 1) {
		return _enum;
	}

	return enumsApi.getFlag(_enum, flag, options);
}

function has(arg, flag, options) {
	var _enum = enumsApi.getEnum(arg);
	return enumsApi.hasFlag(_enum, flag, options);
}

var enums = {
	get: get$1,
	has: has,
	set: function set(name, hash) {
		if (_.isString(name)) {
			enumsApi.setByPath(enumsStore, name, hash);
		} else if (_.isObject(name)) {
			enumsApi.extendStore(name);
		}
	}
};

function skipTake(array, take) {
	var skip = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;


	if (!_.isObject(array)) {
		return;
	}

	if (!_.isNumber(take) || !_.isNumber(skip)) {
		throw new Error('skipTake skip and take arguments must be a numbers');
	}

	if (!_.isArray(array)) {
		array = _.toArray(array);
	}

	var length = take + skip;
	if (array.length < length) {
		length = array.length;
	}
	var taken = [];
	for (var x = skip; x < length; x++) {
		taken.push(array[x]);
	}
	return taken;
}

var config = {
	destroySelfOnEmpty: false,
	destroyOnEmpty: false,
	replaceElement: false
};

var BaseNodeRegion = Region.extend({
	onEmpty: function onEmpty() {
		var destroySelf = this.getOption('destroySelfOnEmpty') || this.getOption('destroyOnEmpty');
		var destroyNode = this.getOption('destroyOnEmpty');
		if (destroySelf) {
			this.destroy();
		}
		if (destroyNode) {
			this.el.remove();
		}
	}
});

config.Region = BaseNodeRegion;

function normalizeElement(selector) {
	var body = document.querySelector('body');
	var el = void 0;
	if (selector == null) {
		el = body;
	} else if (selector instanceof Element) {
		el = selector;
	} else if (selector && selector.jquery) {
		el = selector.get(0);
	} else if (_.isString(selector)) {
		el = document.querySelector(selector);
	}
	if (el instanceof Element) {
		return el;
	} else {
		throw new Error('el must be in Dom');
	}
}

var renderInNode = function renderInNode(view, opts) {
	var options = _.extend({}, config, opts);
	var el = options.el,
	    replaceElement = options.replaceElement,
	    destroySelfOnEmpty = options.destroySelfOnEmpty,
	    destroyOnEmpty = options.destroyOnEmpty,
	    defer = options.defer;


	var NodeRegion = config.Region;
	el = normalizeElement(el);
	var body = document.querySelector('body');
	if (el === body) {
		el = document.createElement('div');
		body.appendChild(el);
		replaceElement = true;
	}
	var region = new NodeRegion({ el: el, replaceElement: replaceElement, destroySelfOnEmpty: destroySelfOnEmpty, destroyOnEmpty: destroyOnEmpty });
	if (defer) {
		_.defer(function () {
			return region.show(view);
		});
	} else {
		region.show(view);
	}
	return region;
};

renderInNode.config = config;

function cloneObject(obj, options) {
	if (!options.refs) {
		options.refs = [obj];
	} else {
		if (options.refs.indexOf(obj) > -1) {
			return;
		} else {
			options.refs.push(obj);
		}
	}
	return _.reduce(obj, function (memo, value, key) {
		var cloned = cloneValue(value, options);
		if (cloned !== undefined || obj[key] === undefined) {
			memo[key] = cloned;
		}
		return memo;
	}, {});
}

function cloneValue(value) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var functions = options.functions,
	    _options$deep = options.deep,
	    deep = _options$deep === undefined ? true : _options$deep;

	if (!deep) {
		return _.clone(value);
	}

	if (_.isFunction(value)) {
		return functions ? value : undefined;
	} else if (_.isDate(value)) {
		return new Date(value.valueOf());
	} else if (_.isArray(value)) {
		return _.clone(value);
	} else if (_.isObject(value)) {
		return cloneObject(value, options);
	} else {
		return _.clone(value);
	}
}

function norm(arg) {
	return _.isObject(arg) ? arg : {};
}

function mergeObjects$$1() {
	for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
		objects[_key] = arguments[_key];
	}

	var flatted = _.reduce(objects, function (dest, item) {
		_.extend(dest, flattenObject(norm(item)));
		return dest;
	}, {});

	return unFlat(flatted);
}

var emptyFetchMixin = CollectionView$$1 => CollectionView$$1.extend({
	shouldHandleEmptyFetch: true, 
	constructor(){
		CollectionView$$1.apply(this, arguments);

		this.getOption('shouldHandleEmptyFetch') && this.emptyView
			&& this._handleEmptyFetch();
	},
	_handleEmptyFetch(){
		if (!this.collection || this.collection.length) { return; }

		this.listenToOnce(this.collection, 'sync', 
			() => !this.collection.length && this._renderChildren()
		);

	},
});

var index$2 = Base => Base.extend({
	emptyView(){
		return this._emptyViewSelector({
			fetching: this.isFetching(),
			fetched: this.isFetched(),
		});
	},
	isFetching(){
		return this.collection && _.isFunction(this.collection.isFetching) && this.collection.isFetching();
	},
	isFetched(){
		return this.collection && _.isFunction(this.collection.isFetched) && this.collection.isFetched();
	},
	_emptyViewSelector({ fetching, fetched }={}){
		let wait = this.getOption('waitView');
		let nodata = this.getOption('noDataView');
		if (fetching && !fetched){
			return wait || nodata;
		} else {
			return nodata;
		}
	},
});

function rebuildIndexes() {
	if (!this.getOption('shouldRebuildIndexes') || !this.collection) {
		return;
	}
	let models = this.collection.models;
	for (let index = 0, length = models.length; index < length; index++) {
		let model = models[index];
		let view = this._children.findByModel(model);
		view && (view._index = index);
	}
}

var improvedIndexesMixin = CollectionView$$1 => CollectionView$$1.extend({
	shouldRebuildIndexes: true,

	constructor() {		
		
		CollectionView$$1.apply(this, arguments);
		this.on('before:sort', rebuildIndexes.bind(this));
	},
	_addChild(view, index){
		view._isModelView = arguments.length === 1;
		if(_.isObject(index)) {
			index = index.index;
		}
		if (index != null) {
			view._index = index;
		}
		return CollectionView$$1.prototype._addChild.apply(this, arguments);
	},
	_viewComparator(v1,v2){
		let res = v1._index - v2._index;
		if (res) return res;
		if (v1._isModelView) return 1;
		return -1;
	},
});

var nextCollectionViewMixin = CollectionView$$1 => CollectionView$$1.extend({
	_renderChildren() {
		// If there are unrendered views prevent add to end perf
		if (this._hasUnrenderedViews) {
			delete this._addedViews;
			delete this._hasUnrenderedViews;
		}

		const views = this._addedViews || this.children._views;

		this.triggerMethod('before:render:children', this, views);
	
		this._showEmptyView();
	
		const els = this._getBuffer(views);
	
		this._attachChildren(els, views);
	
		delete this._addedViews;
	
		this.triggerMethod('render:children', this, views);
	},
	addChildView(view, index, options = {}) {
		if (!view || view._isDestroyed) {
			return view;
		}

		if (_.isObject(index)) {
			options = index;
		}

		// If options has defined index we should use it
		if (options.index != null) {
			index = options.index;
		}

		if (!this._isRendered && !options.preventRender) {
			this.render();
		}

		this._addChild(view, index);

		if (options.preventRender) {
			this._hasUnrenderedViews = true;
			return view;
		}

		const hasIndex = (typeof index !== 'undefined');
		const isAddedToEnd = !hasIndex || index >= this._children.length;

		// Only cache views if added to the end and there is no unrendered views
		if (isAddedToEnd && !this._hasUnrenderedViews) {
			this._addedViews = [view];
		}
		
		if (hasIndex) {
			this._renderChildren();
		} else {
			this.sort();
		}
	
		return view;
	},
	_showEmptyView() {

		this._destroyEmptyView();
	
		if(!this.isEmpty()) { return; }

		const EmptyView = this._getEmptyView();	
		if (!EmptyView) {
			return;
		}
	
		const options = this._getEmptyViewOptions();
		this._emptyViewInstance = new EmptyView(options);
	
		this.addChildView(this._emptyViewInstance, { preventRender: true, index: 0, });
	
	},
	_destroyEmptyView(){
		let view = this._emptyViewInstance;
		if (!view) return;
	
		this._removeChildView(view);
	
		this._removeChild(view);
	
		view.destroy();
		delete this._emptyViewInstance;
	},
}, { CollectionViewMixin_4x: true});

var customsMixin = Base => Base.extend({
	
	renderAllCustoms: false,
	shouldMergeCustoms: false,
	renderCollection: true,

	constructor(){
		Base.apply(this, arguments);
		if (this.getOption('renderCollection') === false && this.collection) {
			this._collection = this.collection;
			delete this.collection;
		}
		this._initializeCustoms();
	},
	_getCustomsArray(){
		if (!this._customs)
			this._customs = [];
		return this._customs;
	},
	getCollection(){
		return this.collection || this._collection;
	},
	clearCustoms(){
		let arr = this._getCustomsArray();
		arr.length = 0;
	},
	addCustom(...args){
		let arr = this._getCustomsArray();
		arr.push(...args);
	},
	unshiftCustom(...args){
		let arr = this._getCustomsArray();
		arr.unshift(...args);
	},
	_initializeCustoms(){

		let optionsCustoms = betterResult(this.options, 'customs', { args: [this], context: this });
		let instanceCustoms = betterResult(this, 'customs', { args: [this] });
		let shouldMergeCustoms = this.getOption('shouldMergeCustoms');
		let add;
		if (shouldMergeCustoms) {
			add = (instanceCustoms || []).concat(optionsCustoms || []);			
		} else {
			add = instanceCustoms || optionsCustoms || [];
		}

		this.addCustom(...add);

		if (this.getOption('renderAllCustoms')) {
			this.on('render', this._renderCustoms);
		}
	},
	renderCustoms(){
		this.triggerMethod('before:customs:render');

		_.each(this._renderedCustoms, view => view.destroy());
		let registered = this._getCustoms();
		let rawcustoms = this.getCustoms(registered);
		let customs = this._prepareCustoms(rawcustoms);

		this._renderedCustoms = this.addChildViews(customs);

		this.triggerMethod('customs:render');
	},
	_renderCustoms(){
		if (!this.getOption('renderAllCustoms')) return;
		this.renderCustoms();
	},
	_getCustoms() {
		let arr = this._getCustomsArray();
		return _.clone(arr);
	},
	getCustoms(customs) {		
		return customs;
	},
	_prepareCustoms(rawcustoms){
		return _.reduce(rawcustoms, (array, item) => {
			let args = this._prepareCustom(item);
			args && (args = this.buildCustom(...args));
			args && array.push(args);
			return array;
		},[]);
	},
	_prepareCustom(arg){
		if (_.isArray(arg)) {
			return arg;
		}
		if (isView(arg) || isViewClass(arg)) {
			return [arg, { index: 0 }];
		}
		if (_.isFunction(arg)) {
			return this._prepareCustom(arg.call(this, this));
		}
		return [arg, { index: 0 }];
		// if (_.isArray(arg)) {
		// 	return arg;
		// } else {
		// 	return [arg, { index: 0 }];
		// }
	},
	buildCustom(view, options = {}){ 
		let childOptions = this.getOption('customViewOptions', { args: [ this ]});
		if (isViewClass(view)) {
			view = new view(childOptions);
		} else if (_.isFunction(view)) {
			view = view.call(this, this, childOptions);
		} else if(!isView(view) && _.isObject(view) && 'view' in view) {
			if(isView(view.view)) {
				if(_.isObject(view.options))
					options = view.options;
				view = view.view;
			} else if(isViewClass(view.view)) {
				let viewOptions = _.extend({}, childOptions, view.options);
				view = new view.view(viewOptions);
			}
		}
		if (isView(view)) {
			this._setupCustom(view);
			return [view, options]; 
		}
	},
	_setupCustom(view){
		return this.setupCustom(view);
	},
	setupCustom: view => view,
	addChildViews(children = []){
		if (!children.length) { return; }

		let awaitingRender = false;
		let rendered = [];
		while(children.length) {

			let args = children.pop();
			if (!args) { continue; }

			if (!_.isArray(args)) {
				args = [args, { index: 0 }];
			}

			let [ view, index$$1, options = {} ] = args;
			if (_.isObject(index$$1)) {
				options = index$$1;
				index$$1 = undefined;
			}
			if (index$$1 != null && !('index' in options)) {
				options.index = index$$1;
			}
			options.preventRender = !!children.length;
			if (!isView(view)) { continue; }

			this.addChildView(view, options);
			rendered.push(view);
			awaitingRender = options.preventRender;
		}
		if (awaitingRender) {
			this.sort();
		}
		return rendered;
	},
}, { CustomsMixin: true });

var index$3 = Base => Base.extend({
	fetchNextEdge: 'bottom',
	constructor(){
		Base.apply(this, arguments);
		let scrollEdge = this.getOption('fetchNextEdge');
		if (scrollEdge) {
			let event = scrollEdge + ':edge';
			this.addScrollEvents({
				[event](){
					this.fetchNext({ onlyIfNotFetching: true }).then(() => {
						this.clearScrollEdges();
					});
				}				
			});
			let collection = this.getCollection();
			if(collection){
				this.listenTo(collection,'query:change',() => {
					this.scrollToStart();
					this.clearScrollEdges();
				});
			}
		}
	},
	fetchNext({ onlyIfNotFetching }={}){
		let collection = this.getCollection();
		if(!collection) return Promise.resolve();
		if (onlyIfNotFetching && collection.isFetching()) return Promise.resolve(collection);
		return collection.fetchNext ? collection.fetchNext() : collection.fetch();
	},
});

var index$4 = Base => Base.extend({
	constructor(){
		
		this.on({
			request(){
				this._isFetching = true;
			},
			sync(){
				this._isFetching = false;
				this._isFetched = true;
			}
		});
		
		Base.apply(this, arguments);
	},
	isFetching(){
		return this._isFetching === true;
	},
	isFetched(){
		return this._isFetched === true;
	},
	concurrentFetch: 'first',
	fetch({ concurrent } = {}) {
		if (concurrent == null) {
			concurrent = this.concurrentFetch;
		}

		if (concurrent === 'first') {
			if (this._fetchingPromise) {
				return this._fetchingPromise;
			} else {
				let promise = this._fetchingPromise = Base.prototype.fetch.apply(this, arguments);
				promise.then(() => {
					delete this._fetchingPromise;
				}, () => {
					delete this._fetchingPromise;
				});
				return promise;	
			}
		} else {
			let promise = this._fetchingPromise = Base.prototype.fetch.apply(this, arguments);
			return promise;
		}
	},
	fetchIfNot(opts){
		if(this.isFetched()){
			return Promise.resolve();
		} else {
			return this.fetch(_.extend({ concurrent: 'first', opts }));
		}
	},
});

var childrenableMixin = Base => Base.extend({

	constructor(opts){

		Base.apply(this, arguments);
		this._initializeChildrenable(opts);

	},

	_initializeChildrenable(opts){
		mergeOptions.call(this, opts, ['parent', 'root']);
		if (this.parent == null && this.root == null) 
			this.root = this;
	},

	//call this method manualy for initialize children
	initializeChildren(){
		if (this._childrenInitialized) return;

		let children = getOption(this, 'children');
		this._children = [];
		_(children).each(child => this._initializeChild(child));

		this._childrenInitialized = true;

	},

	_initializeChild(arg){
		let Child;
		let options = {};

		if (isKnownCtor(arg))
			Child = arg;
		else if(_.isFunction(arg)){
			
			let invoked = arg.call(this, this);
			return this._initializeChild(invoked);

		} else if (_.isObject(arg)) {
			Child = arg.Child;
			_.extend(options, _.omit(arg, 'Child'));
		}

		

		_.extend(options, getOption(this, 'childOptions'), { parent: this });
		options = this.buildChildOptions(options);
		
		let child = this.buildChild(Child, options);
		this._children.push(child);

	},

	buildChildOptions(options){
		return options;
	},
	buildChild(Child, options){
		!Child && (Child = getOption(this, 'defaultChildClass') || this.prototype.constructor);
		return new Child(options);
	},
	_getChildren(items, opts = {}){
		let { exclude, filter, map } = opts;

		if(exclude != null && !_.isArray(exclude))
			opts.exclude = [exclude];

		if(!_.isFunction(filter))
			delete opts.filter;

		let result = [];
		let force = opts.force;
		_(items).each((item, index) => {

			if(!force && !this._childFilter(item, index, opts))
				return;

			if(_.isFunction(map))
				item = map(item);

			item && result.push(item);
		});
		return result;
	},
	_childFilter(item, index, opts = {}){
		
		if(opts.force) return item;

		let { exclude, filter } = opts;

		if(_.isFunction(this.childFilter) && !this.childFilter(item, index, opts))
			return;

		if(_.isArray(exclude) && exclude.indexOf(item) >= 0)
			return;

		if(_.isFunction(filter) && !filter.call(this, item, index, opts))
			return;

		return item;
	},
	childFilter: false,
	getChildren(opts = {}){
		let children = [].slice.call(this._children || []);
		opts.reverse && children.length > 1 && children.reverse();		
		return this._getChildren(children, opts);
	},
	getAllChildren(opts = {}){

		let { includeSelf, map, reverse } = opts;
		let options = _.omit(opts, 'includeSelf', 'map');


		let children = this.getChildren(options);
		let result = _(children).chain()
			.map(child => {
				let children = child.getAllChildren(options);
				return reverse ? [children, child] : [child, children];
			})
			.flatten()
			.value();

		if (includeSelf) {
			let method = reverse ? 'push' : 'unshift';
			result[method](this);
		}
		
		if (_.isFunction(map)) {
			return _(result).chain().map(map).filter(f => !!f).value();
		} else {			
			return result;
		}

	},

	getParent(){
		return this.parent;
	}



}, { ChildrenableMixin: true });

var index$5 = Base => Base.extend({
	
	// usage:
	// model.entity('users');
	entity(key, options){
		return this._getNestedEntity(key, options);
	},

	// override this if you need to do something with just created entity
	// by default here is settled change handlers
	setupNestedEntity(context){
		if (!context.entity) return;
		this._setNestedEntityHandlers(context);
		this._setNestedEntityParent(context.entity, context.parentKey);
	},

	_getNestedEntity(key, options){
		//get sure there is a nestedEntities store initialized;
		this._initEntitiesStore();
		// compiling passed `nestedEntities` contexts, occurs only at first call
		this._initOwnEntities();
		
		let context = this._nestedEntities[key];
		if (!context) { return; }
		if (!context.entity && !context._compiled) {
			context.entity = this._buildNestedEntity(context, options);
			if (context.entity) {
				this.setupNestedEntity(context);
			}
		}
		return context.entity;
	},
	_buildNestedEntity(context, options){
		let data = this.get(context.name);
		if (_.isFunction(context.build)) {
			context.entity = context.build.call(this, data, context, this);
		} else {
			data = data || context.data;
			let args = context.args;
			if (!args) {
				args = [data];
				if (context.parse) {
					if(!options) options = {};
					if(!('parse' in options)){
						options.parse = context.parse;
					}
				}
				if(options || context.options) {
					args.push(_.extend({}, context.options, options));
				}
			}
			context.entity = new context.class(...args);
		}
		context._compiled;
		return context.entity;
	},
	_initOwnEntities(){
		if (this._nestedEntitiesInitialized) {
			return;
		}
		let compiled = betterResult(this, 'nestedEntities', { args: [ this ] });
		let memo = this._nestedEntities;
		_.each(compiled, (context, key) => {
			// handle the case where its a runtime function or class definition
			context = betterResult({ context }, 'context', { args: [key] });
			if (isModelClass(context) || isCollectionClass(context) ) {
				context = {
					class: context,
				};
			} 
			// when its just a property name, trying to determine type of data and use default class
			else if (_.isString(context)) {
				context = {
					name: context
				};
			} else if (!_.isObject(context)) {
				context = {};				
			}

			let name = context.name || (_.isString(key) && key || undefined);
			
			if (!_.isString(name)) {
				return;
			}

			if(!context.name) {
				context.name = name;
			}

			if(!context.class) {
				let data = this.get(context.name);
				if (_.isArray(data)) {
					context.class = this.NestedCollectionClass || Collection;
				} else {
					context.class = this.NestedModelClass || Model;
				}				
			}

			memo[name] = cloneValue(context, { functions: true });

		});

		this._nestedEntitiesInitialized = true;
	},
	_initEntitiesStore(){
		if(!_.has(this, '_nestedEntities')){
			this._nestedEntities = {};
		}
	},	
	_setNestedEntityHandlers(context){
		let { name, entity } = context;
		let entityChangeEvents = 'change';

		if (isCollection(entity)) {
			entityChangeEvents += ' update reset';
		}

		// if entity get changed outside we should keep in sync this model property value
		if(!context.onEntityChange){
			context.onEntityChange = (instance, { changeInitiator } = {}) => {
				
				if (changeInitiator == this) return;

				changeInitiator == null && (changeInitiator = entity);

				let json = entity.toJSON();				
				if (context.saveOnChange && !this.isNew()) {
					this.save(name, json, { changeInitiator });
				} else {
					this.set(name, json, { changeInitiator });
				}
			};
		}
		this.listenTo(entity, entityChangeEvents, context.onEntityChange);

		// if this model property get changed outside we should keep in sync our nested entity
		if(!context.onPropertyChange) {
			context.onPropertyChange = (instance, _newvalue, { changeInitiator }) => {
				if (changeInitiator == this) return;
				changeInitiator == null && (changeInitiator = this);
				let val = this.get(name) || {};
				if (isModel(entity) && changeInitiator != entity) {
					let unset = _.reduce(entity.attributes, (memo, _val, key) => {
						if(key in val) return memo;
						memo[key] = undefined;
						return memo;
					}, {});
					entity.set(_.extend({}, val, unset), { changeInitiator });
					entity.set(unset, { unset: true, silent: true });

				} else if( isCollection(entity) && changeInitiator != entity) {

					entity.set(val, { changeInitiator });

				}
			};
		}
		this.on('change:' + name, context.onPropertyChange);
	},
	_setNestedEntityParent(entity, parentKey){
		parentKey || (parentKey = 'parent');
		entity[parentKey] = this;
	},
	_unsetNestedEntityParent(entity, parentKey){
		parentKey || (parentKey = 'parent');
		delete entity[parentKey];
	},
	destroy(){
		this.dispose({ destroying: true });
		let destroy = Base.prototype.destroy;
		return destroy && destroy.apply(this, arguments);
	},
	dispose(opts){
		this._disposeEntities(opts);
		let dispose = Base.prototype.dispose;		
		return dispose && dispose.apply(this, arguments);
	},
	_disposeEntities(opts){
		_.each(this._nestedEntities, context => this._disposeEntity(context, opts));
		delete this._nestedEntities;
	},
	_disposeEntity({ entity, name, onEntityChange, onPropertyChange, parentKey } = {}, { destroying } = {}){
		this.stopListening(entity, null, onEntityChange);
		this.off('change:'+ name, onPropertyChange);
		this._unsetNestedEntityParent(entity, parentKey);
		let method = destroying ? 'destroy' : 'dispose';
		entity[method] && entity[method]();
	},
});

//export default Mixin;

var optionsMixin = Base => Base.extend({
	getOption(){
		return getOption(this, ...arguments);
	},
	hasOption(key){
		let opts = this.options || {};
		return (opts[key] != null) || (this[key] != null);
	},
	mergeOptions
});

function urlError() {
	throw new Error('A "url" property or function must be specified');
}

function mixinError(){
	throw new Error('This mixin can be applied only on Model or Collection');
}

function getUrlPattern(options){
	let path = betterResult(this, 'urlPattern', { args: [this], default:'' });
	return path.replace(/\{([^}]+)\}/g, (match, group) => {
		let value = getByPath(this, group, options);
		return value;
	});
}

const ModelMixin = Base => Base.extend({
	getUrlPattern,
	getBaseUrl(){
		let base =
        betterResult(this, 'urlRoot', { args:[this]}) ||
		betterResult(this.collection, 'url', { args:[this]}) ||
		this.getUrlPattern({ includeModelProperty: true });
		return base;
	},
	url(){
		let base = this.getBaseUrl();
		if (!base) {
			urlError();
		}
		if (this.isNew()) return base;
		var id = this.get(this.idAttribute);
		return base.replace(/[^/]$/, '$&/') + encodeURIComponent(id);  
	}
});


const CollectionMixin = Base => Base.extend({
	url(){
		if (this.urlPattern) {			
			return this.getUrlPattern();
		}
	},
	getUrlPattern
});


var index$6 = Base => {

	const mixin = isModelClass(Base) ? ModelMixin(Base)
		: isCollectionClass(Base) ? CollectionMixin(Base)
			: mixinError();

	return mixin;
	
};

//import getOptionMixin from './get-option/index.js';

function getNestedResult(value, context, schema) {
	return value != null 
		&& _.isFunction(schema.nested) 
		&& schema.nested(value, context);
}

function getPropertySchema(model, key)
{
	if (_.isFunction(model.getPropertySchema)) {
		return model.getPropertySchema(key);
	} else {
		return {};
	}
}

function getDisplayConfig(key, model, schema){
	if (key == null) return {};
	return (_.isFunction(model.getPropertyDisplayConfig) && model.getPropertyDisplayConfig(key))
		|| (schema && schema.display) || {};
}

var index$7 = Base => {
	const originalGet = Model.prototype.get;
	const Mixed = Base.extend({
		getByPath(key){
			if(key.indexOf('.') > -1)
				return getByPath(this, key);
			else
				return originalGet.call(this, key);
		},
		get(key, opts = {}){
			if(key == null || key == '') return;	
			
			let value;
			if('value' in opts) {
				value = opts.value;
			} else {
				value = opts.byPath !== false ? this.getByPath.call(this, key) : originalGet.call(this, key);
			}

			if (!_.size(opts)) {
				return value;
			}

			let prop = getPropertySchema(this, key);
			let result = opts.nested && getNestedResult(value, this, prop);
			if (result != null) {
				return result;
			}

			if(_.isFunction(opts.transform) && !opts.raw) {
				value = opts.transform.call(this, value, opts, this);
			}

			if(_.isFunction(prop.transform) && !opts.raw){
				value = prop.transform.call(this, value, opts, this);
			}

			if(opts.display === true){

				let display = getDisplayConfig(key, this, prop);

				if(opts.alternative){
					value = _.isFunction(display.alternative) && display.alternative.call(this, value, _.extend({},opts,prop), this);
				}
				else if(_.isFunction(display.transform)) {
					value = display.transform.call(this, value, opts, this);
				}
				if(display.ifEmpty && (value == null || value === ''))
					return display.ifEmpty;
			}

			return value;
		},
		display(key, opts = {}){
			_.extend(opts, { display:true });
			return this.get(key, opts);
		},
		propertyName(key) {
			let prop = getPropertySchema(this, key);
			let display = getDisplayConfig(key, this, prop);
			return display.label || key;
		}
	});

	return Mixed;
};

var index$8 = Base => Base.extend({
	defaultWait: false,
	saveReturnPromise: false,
	patchInsteadSave: false,
	save(key, val, options){
		let attrs;
		if (key == null || typeof key === 'object') {
			attrs = key;
			options = val;
		} else {
			(attrs = {})[key] = val;
		}
		options || (options = {});
		if(!_.has(options, 'wait')){
			options.wait = this.defaultWait;
		}
		if(!_.has(options, 'patch')) {
			options.patch = this.patchInsteadSave;
		}

		if(options.addToUrl){
			let url = betterResult(this, 'url', { args: [ options ] });
			if (url) {
				url += '/' + options.addToUrl;
				options.url = url;
			}
		}


		const save = Base.prototype.save.call(this, attrs, options);
		if (!this.saveReturnPromise) {
			return save;
		}

		if (save && _.isFunction(save.then)) {
			return save;
		}
		if (!save) {
			return Promise.reject(save);
		} else {
			return Promise.resolve(save);
		}
	}
});

var index$9 = Base => Base.extend({
	buildViewByKey(...args){
		return buildViewByKey.call(this, ...args);
	},
});

const defaultCssConfig = {
	beforeRender: true,
	modelChange: true,
	refresh: true,
};

var cssClassModifiersMixin = (Base) => Base.extend({
	constructor(){
		Base.apply(this, arguments);
		this._setupCssClassModifiers();		
	},
	_initCssClassModifiers(){
		if (this.hasOwnProperty('cssClassModifiers')) { return; }
		let modifiers = [];
		let optsModifiers = betterResult(this.options || {}, 'cssClassModifiers', { args:[this.model, this], default: [] });
		let propsModifiers = betterResult(this, 'cssClassModifiers', { args:[this.model, this], default: [] });
		modifiers.push(...optsModifiers);
		modifiers.push(...propsModifiers);
		this.cssClassModifiers = modifiers;
	},
	addCssClassModifier(...modifiers){
		this._initCssClassModifiers();
		this.cssClassModifiers.push(...modifiers);
	},
	refreshCssClass(){
		let className = this._getCssClassString();
		if(className == ''){
			this.$el.removeAttr('class');
		}
		else {
			this.$el.attr({
				class: className
			});
		}
	},	

	_getCssClassModifiers(){
		this._initCssClassModifiers();
		let className = betterResult(this, 'className', { args:[this.model, this], default: [] });
		let modifiers = this.cssClassModifiers.concat([className]);
		return modifiers;
	},
	//override this if you need other logic
	getCssClassModifiers(){
		return this._getCssClassModifiers();
	},
	_getCssClassString()
	{
		let modifiers = this.getCssClassModifiers();
		
		let classes = _(modifiers).reduce((hash, modifier) => {
			if(modifier == null || modifier === '') { return hash; }
			let cls;
			if (_.isString(modifier)) {
				cls = modifier;
			} else if (_.isFunction(modifier)) {
				let builded = modifier.call(this, this.model, this);
				cls = _.isString(builded) && builded || undefined;
			}
			cls && (hash[cls] = true);
			return hash;
		}, {});

		return _.keys(classes).join(' ');

	},

	_setupCssClassModifiers(){

		if(this._cssClassModifiersInitialized) return;

		let cfg = this.getCssClassConfig();
		if(!cfg) return;

		let events = this.getCssClassEvents(cfg);
		_(events).each((eventName) => this.on(eventName, this.refreshCssClass));

		if (cfg.modelChange && this.model) {
			this.listenTo(this.model, 'change', this.refreshCssClass);
		}

		this._cssClassModifiersInitialized = true;
	},
	
	_getCssClassConfig(){
		let cfg = _.extend({}, defaultCssConfig, this.getOption('cssClassConfig'));
		if(!cfg || _.size(cfg) == 0) return;
		return cfg;
	},
	//override this if you need other logic
	getCssClassConfig(){
		return this._getCssClassConfig();
	},

	_getCssClassEvents(cfg){
		let events = [].concat(cfg.events || []);
		if(cfg.refresh) events.push('refresh');
		if(cfg.beforeRender) events.push('before:render');
		events = _(events).uniq();
		return events;
	},
	//override this if you need other logic
	getCssClassEvents(cfg){
		return this._getCssClassEvents(cfg);
	}
}, { CssClassModifiersMixin: true });

var destroyViewMixin = Base => Base.extend({
	destroy(){
		if(this._isDestroyed || this._isDestroying) { return; }
		this._isDestroying = true;
		Base.prototype.destroy.apply(this, arguments);
		delete this._isDestroying;
	},
	isDestroyed(){
		return this._isDestroyed || this._isDestroying;
	}
}, { DestroyMixin: true });

const defaultSelector = (name, prefix = '') => prefix + 'region-' + name;

function defaultUpdateDom(name, $el)
{
	let selector = defaultSelector(name);
	let element = $('<div>').addClass(selector);
	$el.append(element);

	return '.' + selector;
}

function buildRegionFunc(view, hash, context){

	let { $el } = view;	
	let { autoCreateRegion } = context;
	let { updateDom, name, el } = hash;
	let regionEl;
	
	let region = view.getRegion(name);


	if (el == null && autoCreateRegion !== false) {

		let testEl = region && region.getOption('el',{ deep:false});

		if (!region || !testEl || !$el.find(testEl).length) {

			regionEl = defaultUpdateDom(name, $el);

		} 

	} else if(_.isFunction(updateDom)) {
		updateDom.call(view, $el, view);

	} 
	
	
	if (!region) {
		let definition = _.pick(hash, 'replaceElement', 'regionClass');
		definition.el = hash.el || regionEl;
		region = view.addRegion(name, definition);
	}


	return region;
}

function normalizeNestedViewContextRegion(context) {

	let { region } = context;
	let regionName = (_.isString(region) && region) || context.regionName || context.name;

	if (_.isString(region) || region == null) {
		region = {};
	} else if (_.isFunction(region)) {
		region = region.call(this, context, this);
	}

	if (_.isObject(region)) {

		if(!region.name)
			region.name = regionName;
		let replaceElement = this.getOption('replaceNestedElement');
		context.region = _.extend({ replaceElement }, region);
		context.show = _.partial(buildRegionFunc, this, context.region, context);
	}
	return context;
}

var index$a = Base => Base.extend({
	constructor(){
		this._nestedViews = {};
		Base.apply(this, arguments);
		this.initializeNestedViews();
	},
	template: false,

	showAllNestedViewsOnRender: false,
	showNestedViewOnAdd: false,
	replaceNestedElement: true,

	initializeNestedViews(){
		if (this._nestedViewsInitialized) return;

		if(this.getOption('showAllNestedViewsOnRender')) {
			this.on('render', () => this.showAllNestedViews());
		}

		let nesteds = this.getOption('nestedViews', { args:[this.model, this]});
		_(nesteds).each((context, index$$1) => {

			let name = _.isString(index$$1) ? index$$1 : (context.name || _.uniqueId('nested'));
			this.addNestedView(name, context);

		});

		this._nestedViewsInitialized = true;
	},
	_normalizeNestedContext(name, context){

		if (isViewClass(context)) {
			let View$$1 = context;
			context = {
				name, View: View$$1
			};
		}

		//unwrap to plain object
		if (_.isFunction(context)) {
			context = context.call(this, this.model, this);
		}

		//fix name if its not provided
		if (context.name == null) {
			context.name = name || _.uniqueId('nested');
		}

		//convert region to valid function
		context = normalizeNestedViewContextRegion.call(this, context);		


		return context;
	},
	_createNestedContext(context){
		let contexts = this.getNestedViewContext();
		contexts[context.name] = context;
	},

	addNestedView(name, context){

		if (!_.isString(name) || name === '') {
			throw new Error('addNestedView: first argument should be a string');
		}

		context = this._normalizeNestedContext(name, context);
		this._createNestedContext(context);
		if(this.getOption('showNestedViewOnAdd') && this.isRendered()){
			this.showNestedView(context);
		}		
	},

	showNestedView(name){
		let region = this.getNestedViewRegion(name);
		let view = region && this.buildNestedView(name);
		if (view) {
			region.show(view);
		}
	},
	showAllNestedViews(){
		let contexts = this.getNestedViewContext();
		_(contexts).each(context => this.showNestedView(context));
	},
	getNestedViewContext(name){
		let contexts = this._nestedViews;
		if (arguments.length == 0)
			return contexts;
		else
			return contexts[name];
	},


	buildNestedView(name){

		let context = _.isObject(name) ? name
			: _.isString(name) ? this.getNestedViewContext(name)
				: null;

		if(!context) return;
		let passedView = betterResult(context, 'view', { context: this, args: [this, this.model] });
		if(_.isFunction(context.template))
			return context.template;
		else if ( isView(passedView) ) {
			return passedView;
		}
		else {
			let View$$1 = context.View;
			let options = this.buildNestedViewOptions(betterResult(context, 'options', { context: this, args: [this, this.model], default:{} }));
			
			return new View$$1(options);
		}
	},
	buildNestedViewOptions(opts){
		return opts;
	},
	getNestedViewRegion(name){
		let context = _.isObject(name) ? name
			: _.isString(name) ? this.getNestedViewContext(name)
				: null;
		return context && _.result(context, 'show');
	}
	
});

var index$b = Base => Base.extend({
	triggerScrollEvents: false,
	scrollHandlingEnabled: true,
	constructor(){
		Base.apply(this, arguments);
		this._initializeScrollHandler();
		this.addCssClassModifier('scrollable');
	},



	_initializeScrollHandler(){
		if (!this.getOption('scrollHandlingEnabled')) {
			return;
		}
		let scrollDelegate = {
			'scroll': this._scrollHandler.bind(this)
		};
		this.on({
			'attach': () => this.delegateEvents(scrollDelegate),
			'detach': () => this.undelegateEvents(scrollDelegate),
		});
		let events = this.getOption('scrollEvents', { args: [ this ] });
		this.addScrollEvents(events);
	},
	scrollToStart(){
		let el = this.getScrollElement();
		el.scrollTop = 0;
		el.scrollLeft = 0;
	},
	addScrollEvents(events){
		let hash = normalizeMethods(this, events);
		this._scrollEvents = _.extend({}, this._scrollEvents, hash);
	},

	_scrollHandler(){
		let info = this.getElementInfo();
		this.tryRegisterEdgeHit(info, 'bottom');
		this.tryRegisterEdgeHit(info, 'right');
	},
	tryRegisterEdgeHit(info, edge){
		let scroll = info[camelCase('scroll', edge)];
		let end = info[camelCase('scroll', edge, 'end')];
		if (scroll >= end && !this.isEdgeHited(edge)) {
			this._triggerEdge(edge);
		}
	},
	edgeHitKey:'_scrollHandler.edge',
	isEdgeHited(edge){
		let key = this.edgeHitKey + '.' + edge;
		return this[key] === true;
	},
	setEdgeHit(edge, arg = true){
		let key = this.edgeHitKey + '.' + edge;
		return this[key] = arg;
	},
	getScrollElement(){
		if (!this._scrollElement) {
			let el = this.getOption('scrollElement', { args: [ this ]});
			if(el instanceof Element){
				this._scrollElement;
			} else if(el == null) {
				this._scrollElement = this.el;
			} else if (el.jquery){
				this._scrollElement = el[0];
			}
		}
		return this._scrollElement;
	},	
	getElementInfo(){
		let el = this.getScrollElement();
		let $el = $(el);
		let width = $el.outerWidth();
		let height = $el.outerHeight();
		let scrollBottomEnd = el.scrollHeight - Math.floor(height / 2);
		let scrollRightEnd = el.scrollWidth - Math.floor(width / 2);
		return {
			width, height,
			scrollBottomEnd, scrollRightEnd,
			scrollBottom: el.scrollTop + height,
			scrollRight: el.scrollLeft + width,
		};
	},

	clearScrollEdges(){
		this.setEdgeHit('bottom', false);
		this.setEdgeHit('right', false);
	},

	_triggerEdge(edge){
		this.setEdgeHit(edge);
		if(this._scrollEvents) {
			let handler = this._scrollEvents[`${edge}:edge`];
			handler && handler.call(this);
		}
		if(this.getOption('triggerScrollEvents') != false) {
			this.triggerMethod('scrolled:to:' + edge);
		}
	},

});

var index$c = Base => Base.extend({
	defaultWait: false,
	createReturnPromise: false,
	create(model, options = {}){
		if(!_.has(options, 'wait')){
			options.wait = this.defaultWait;
		}
		const create = Base.prototype.create.call(this, model, options);
		if (!this.createReturnPromise) {
			return create;
		}

		if (create && _.isFunction(create.then)) {
			return create;
		}
		if (!create) {
			return Promise.reject(create);
		} else {
			return Promise.resolve(create);
		}
	}
});

function isPromisable(arg){
	return arg instanceof Promise || _.isFunction(arg && arg.then);
}

function asArray(arg) {
	if(_.isArray(arg))
		return arg;
	else if(arg == null || arg === '')
		return [];
	else
		return [arg];
}

function race(...promises){
	return Promise.race(promises);
}

function valueToPromise(arg){
	if(!isPromisable(arg)) {
		let result = arg;
		arg = arg == null || arg === '' ? Promise.resolve() : Promise.reject(result);
	}
	return arg;		
}

function registerProcess (Process, context, name, opts) {

	context[name] = function(...args){
		
		let process = new Process(context, name, _.extend({}, opts));
		let concurrent = process.concurrencyCheck();

		if (concurrent)
			return concurrent;
		else
			return process.run(...args);

	};

}

const Process = BaseClass.extend({
	constructor(context, name, opts){
		
		BaseClass.apply(this, arguments);

		this._initDefaults(name, context);
		this._initCancelation();
		this._mergeOptions(opts);
	},


	// initialize methods

	_initDefaults(name, context){
		if(name == null || name === '')
			throw new Error('Process requires two arguments: name [string], context [object]. name missing');
		
		if(!_.isObject(context))
			throw new Error('Process requires two arguments: name [string], context [object]. context is not an object');

		this.cid = _.uniqueId('process');
		this.name = name;
		this.context = context;
		this.errors = [];
	},

	_initCancelation(){
		this.cancelPromise = new Promise((resolve, reject) => {
			this.cancel = () => reject('cancel'); 
		});
	},
	_mergeOptions(opts = {}){
		let options = _.omit(opts, 'cid', 'name', 'context', 'cancelPromise', 'cancel', 'errors');
		_(options).each((value, key) => this[key] = value);
		if (this.exposeSelf == null) {
			this.exposeSelf = true;
		}
	},

	
	concurrencyCheck(){

		let previous = this.getProcessFromContext();
		//console.log(previous, this.context);
		if(!previous) return;
	
		let concurrent = this.concurrent;	
		
		if (concurrent === false) {
	
			this.cancel();
	
		} else if (concurrent == 'first') {
	
			return previous.promise;
	
		} else if (concurrent == 'last') {
	
			previous.cancel();
	
		}		
	},


	// life cycle methods	

	run(...args){
		this.updateProcessInContext(this);
		this.args = args || [];
		this.promise = this._createLifeCyclePromise();
		return this.promise;
	},


	_createLifeCyclePromise(){


		return this._notCanceled()
			.then(() => this._begin())
			.then(() => this._beforeStart())
			.then(() => this._canBeStarted())
			.then(() => this._waitOtherPromises())
			.then(() => {
				this.triggerComplete();
				return Promise.resolve();
			})
			.catch(error => {
				this.triggerError(error);
				let jsError;
				if(error instanceof Error) {
					throw error;
				} else if ((jsError = this.getJsError())) {
					throw jsError;
				} else {
					return Promise.reject(this);
				}
			});		
	},




	_notCanceled() {
		return this._cancelationRace(Promise.resolve());
	},
	_begin(){
		return this._getHookResultAsPromise('begin');
	},
	_beforeStart(){
		return this._getHookResultAsPromise('before');
	},
	_canBeStarted(){
		let contextMethod = 'can:not:' + this.name;
		let promise = this.invokeOnContext(contextMethod);
		if(!isPromisable(promise)) {
			promise = (promise == null || promise === '') 
				? Promise.resolve()
				: Promise.reject(promise);
		}
		return this._cancelationRace(promise);
	},
	_waitOtherPromises(){
		let contextMethod = `get:${this.name}:promises`;
		
		let promises = asArray(this.invokeOnContext(contextMethod));

		return this._cancelationRace(Promise.all(promises));
	},

	_getHookResultAsPromise(hookName){
		let procMethod = camelCase('on:' + hookName);
		let procHook = _.isFunction(this[procMethod]) && this[procMethod](this.context, ...this.args) || undefined;
		let result = valueToPromise(procHook).then(() => {
			let cntxHook = this.triggerOnContext(hookName);
			return valueToPromise(cntxHook);
		});

		return this._cancelationRace(result);

	},

	// trigger methods

	triggerComplete() { 

		this.updateProcessInContext(null);

		if (_.isFunction(this.onComplete))
			this.onComplete(this.context, ...this.args);

		this.triggerOnContext();

		this.triggerEnd();
		
	
	},
	triggerError(errors){


		this.updateProcessInContext(null);		

		if(!_.isArray(errors))
			errors = [errors];

		this.errors.push(...errors);

		
		if (_.isFunction(this.onError))
			this.onError(this.context, ...this.errors);
		
		this.triggerOnContext('error', ...this.errors);
		
		this.triggerEnd();

		
	},
	triggerEnd(){
		this.triggerOnContext('end');
	},



	// helpers methods

	getJsError(context){
		!context && (context = this);
		if(context != this && (!_.isObject(context) || !_.isArray(context.errors)))
			return;

		return _(context.errors).filter(f => f instanceof Error)[0];
	},	

	_cancelationRace(promise){
		return race(this.cancelPromise, promise);
	},


	getContextProcessKey(){
		return camelCase(`_process:${this.name}:executing`);
	},
	getProcessFromContext(){
		let key = this.getContextProcessKey();
		return this.context[key];
	},
	updateProcessInContext(process){
		let key = this.getContextProcessKey();		
		this.context[key] = process;
	},



	triggerOnContext (eventName) {
	
		let context = this.context; 
		if(!_.isFunction(context.trigger))
			return;
		
		let event = (eventName ? eventName + ':' : '') + this.name;
		let triggerArgs = [context, event];
		if (this.exposeSelf) {
			triggerArgs.push(this);
		}
		triggerArgs.push(...this.args);
		return triggerMethodOn(...triggerArgs);
	
	},

	invokeOnContext(methodName)
	{
		let method = camelCase(methodName);
		let context = this.context;
		let args = this.args;
		return betterResult(context, method, { args });

	}

}, {
	register(context, name, opts) {
		return registerProcess(this, context, name, opts);
	}
});

const defaultStartableOptions  = {
	concurrent: false,
	exposeSelf: true,
	//good place to supply own state collecting logic
	storeState(){

		this.contextState = [{
			key: 'startable.status',
			value: this.context['startable.status']
		}];


		/*

		for example: take all simple values from context

		for(var key in this.context){
			let value = this.context[key];
			if (value == null || !_.isObject(value.valueOf()))
				this.contextState.push({ key, value });
		}

		*/

	},
	restoreState(){
		_(this.contextState || []).each(keyValue => {
			this.context[keyValue.key] = keyValue.value;
		});
	},
	onBefore(...args){
		this.storeState();
		this.ensureState();
		this.context['startable.status'] = this.processingName;
		this.context['startable.start.lastArguments'] = args;
	},
	onComplete(){
		this.context['startable.status'] = this.processedName;
	},	
	onError(){
		this.restoreState();
	},
	ensureState(shouldThrow = true){
		let other = this.name == 'start' ? 'stop' : 'start';
		let error = this.name == 'start' ? 'not:stopped' : 'not:started';
		let status = this.context['startable.status'];
		switch(status){
		case 'stopping':
		case 'starting':
			if(shouldThrow) throw new Error('not:iddle');
			else return 'not:iddle';
		case 'iddle':
			if(this.name == 'start') return;
			else if(shouldThrow) throw new Error(error);
			else return error;
		case other:
			if(shouldThrow) throw new Error(error);
			else return error;			
		}
	}
};

const defaultStartOptions  = {
	processingName: 'starting',
	processedName: 'started'
};
const defaultStopOptions  = {
	processingName: 'stopping',
	processedName: 'stopped'
};



var startableMixin = Base => Base.extend({
	constructor(){
		Base.apply(this, arguments);
		this._initializeStartable();
	},
	_initializeStartable(){
		if (this._startableInitialized) return;

		let startable = _.extend({}, defaultStartableOptions, getOption(this, 'startableOptions', {args:[this]}));

		let start = _.extend({}, startable, defaultStartOptions, getOption(this, 'startOptions', {args:[this]}));
		let stop = _.extend({}, startable, defaultStopOptions, getOption(this, 'stopOptions', {args:[this]}));

		Process.register(this, 'start', start);
		Process.register(this, 'stop', stop);
		
		this._startableInitialized = true;
	},
	isStarted(){
		return this['startable.status'] === 'started';
	},
	isStopped(){
		return this['startable.status'] == null || this['startable.status'] === 'stopped' || this['startable.status'] === 'iddle';
	},
	isNotIddle(){
		return this['startable.status'] === 'stopping' || this['startable.status'] === 'starting';
	},
	restart(){
		if(this.isNotIddle())
			throw new Error('Restart not allowed while startable instance is not iddle: ', this['startable.status']);
		let stop = this.isStarted() ? this.stop() : Promise.resolve();
		let args = this['startable.start.lastArguments'] || [];
		return stop.then(() => this.start(...args));
	}	
},{ StartableMixin: true });

const BaseApp = mix(BaseClass).with(Events, startableMixin);

var App = BaseApp.extend({
	constructor(options = {}){
		this.options = _.clone(options);
		this._startPromises = [];
		BaseApp.apply(this, arguments);
		this.initialize(options);
		this.triggerMethod('initialize', options);	
	},
	triggerMethod,
	getOption(){
		return getOption(this, ...arguments);
	},
	getStartPromises(){
		
		if(!this._startPromises) {
			return;
		}

		return _.map(this._startPromises, item =>{
			if (_.isFunction(item)) {
				return item.call(this, this);
			} else {
				return item;
			}
		});
	},
	addStartPromise(...args){
		this._startPromises.push(...args);
	},
	initialize:() => {},
	doOnResolve(promise, callback, ...args){
		return promise.then(() => {
			return callback.apply(this, args);
		});
	},
	renderLayout(options){
		if (!this.layoutView) {
			let layout = this.buildLayout(options);
			if(!layout) { return; }
			this.layoutView = layout;
		}
		let region = this.getRegion();
		region.show(this.layoutView);
		return this.layoutView;
	},
	buildLayout(options){
		return buildViewByKey(this, 'layout', { options });
	},
	getRegion(){
		if (this._region) return this._region;
		this._region = this.buildRegion();
		return this._region;
	},
	_buildRegion(region, options){
		if (region == null) {
			return new Region(options);
		} else if (isClass(region, Region)) {
			return new region(options);
		} else if (_.isFunction(region)) {
			return this._buildRegion(region.call(this, this), options);
		} else if (_.isObject(region)) {
			let RegionClass = region.regionClass || Region;
			let newOptions = _.extend({}, _.omit(region, 'regionClass'));
			if(!newOptions.el) {
				newOptions.el = options.el;
			}
			if(newOptions.replaceElement == null) {
				newOptions.replaceElement = options.replaceElement;
			}
			return new RegionClass(newOptions);
		}
	},
	buildRegion(){
		let el = this.getOption('appEl') || 'body';
		let opts = { el, replaceElement: true };
		return this._buildRegion(this.getOption('region', { args: [this] }), opts);
	},
});

const Schema = mix(BaseClass).with(Events).extend({
	getOption: function(){
		return getOption(this, ...arguments);
	},
	triggerMethod
});

var PropertySchema = Schema.extend({
	constructor(options = {}){
		Schema.apply(this, arguments);
		let { name, property, modelSchema, order = 0 } = options;
		this.name = name;
		this.schema = _.extend({}, property);	
		this.modelSchema = modelSchema;
		if (this.schema.order != null)
			order = this.schema.order;
		this.order = order;
	},
	_getByKey(key, options = {}){
		let hash = betterResult(this.schema, key, { args: [options, {property:this,model:this.modelSchema}], default: {} });
		return cloneValue(hash, { functions: true });
	},
	getValidation(options) {
		return this._getByKey('validation', options);
	},
	getType(options) {
		let type = this._getByKey('value', options);
		if(!('multiple' in type)) {
			type.multiple = false;
		}
		return type;
	},
	getDisplay(options){
		return this._getByKey('display', options);
	},
	getLabel(model){
		let label = this.getDisplay().label;
		return betterResult({ label },'label', { context: model || this, args: [model] });
	},
	getEdit(options = {}){
		let editOptions = this._getByKey('edit', options);
		if (editOptions === false) return false;
		let valueOptions = this.getType(options);
		let label = this.getLabel(options.model);
		let compiled = _.extend({ name: this.name, label, schema: this }, options, editOptions, { valueOptions });
		return compiled;
	},
	// accepts: value, model, options
	getDisplayValue(val, model, options = {}){

		_.defaults(options, { value: val, allValues: model && model.toJSON && model.toJSON(), model });
		let display = this.getDisplay(options);
		let type = this.getType(options);

		options = _.extend(options, { display, type, property: this });
		if (display) {
			
			if (_.isFunction(display.transform)) {
				val = display.transform.call(model, val, options);
			} else if (type.type == 'boolean' && type.sourceValues) {
				_.some(type.sourceValues, (label, key) => {
					if(convertToBoolean(key) === val) {
						val = label;
						return true;
					}
				});
			} else if (type.type == 'enum' && type.sourceValues) {
				let sourceValues = betterResult({ sourceValues: type.sourceValues }, 'sourceValues', { context: model, args:[ model ]});
				let result = getFlag(sourceValues, val);
				if(result)
					val = result;
			}

			if (isEmptyValue(val) && display.ifEmpty) {
				val = display.ifEmpty;
			} else if (!isEmptyValue(val) && display.ifNotEmpty) {
				val = display.ifNotEmpty;
			}
		}
		return val;
	},
	onPropertyChange(property, opts = {}){
		if (this.modelSchema) {
			this.modelSchema.triggerMethod('property:change', property, opts);
		}
	},
	getDependedOn(name){
		let depended = this.schema.dependOn;
		if (!depended) {
			depended = [];
		} else if (_.isString(depended)) {
			depended = depended.split(/\s*,\s*/g).map(name => ({ name }));
		} else if (!_.isArray(depended) && _.isObject(depended)) {
			depended = _.map(depended, (value, name) => {
				value.name = name;
				return value;
			});
		} else {
			depended = [];
		}
		if(!name)
			return depended;
		else 
			return _.findWhere(depended, { name });
	},
	isDependedOn(name){
		let depended = this.getDependedOn(name);
		return !!depended;
	},
	resetValues(opts = {}, depended = {}){
		let { model, allValues, silent } = opts;
		let dependedValue = allValues[depended.name];
		let value = betterResult(depended, 'value', { args:[ dependedValue, this.modelSchema && this.modelSchema.getProperty(depended.name) ]});
		if (model) {
			model.set(this.name, value, { silent });
		} else if(allValues) {
			allValues[this.name] = value;
		}
	}
});

var ModelSchema = Schema.extend({
	constructor(properties = {}, options = {}){
		this.options = _.clone(options);
		this.properties = {};
		Schema.apply(this,arguments);
		this.setProperties(properties);
	},
	propertySchema: PropertySchema,
	_createProperty(property){
		let props = this.getProperties();
		let order = _.size(props);
		let Schema$$1 = this.getOption('propertySchema');
		let options = { name: property.name, property, modelSchema: this, order };
		return this.createProperty(Schema$$1, options);
	},
	createProperty(Schema$$1, options){
		return new Schema$$1(options);
	},
	setProperties(properties){
		return _.map(properties, (property, name) => {
			if(!_.isObject(property)) { return; }

			let propertyName = _.isString(name) ? name : property.name;
			if (isEmptyValue(propertyName)) {
				throw new Error('property name missing: ' + name);
			}			
			return this.setProperty(propertyName, property);

		});
	},
	getProperties(){
		return this.properties;
	},
	getPropertiesArray(){
		let props = this.getProperties();
		return _.toArray(props)
			.sort((p1,p2) => p1.order - p2.order);		
	},
	getPropertiesNames(){
		let props = this.getPropertiesArray();
		return _.pluck(props, 'name');
	},
	getProperty(name, { create = false } = {}){
		let properties = this.getProperties() || {};
		let property = properties[name];
		if(property || !create) {

			return property;
		}
		property = this._createProperty(name);
		return this.setProperty(name, property);
	},
	_setProperty(name, property){
		if(!_.isObject(property)){
			throw new Error('property is not an object', property);
		}
		if(isEmptyValue(name)){
			throw new Error('property has no name', property);
		}

		if (isEmptyValue(property.name)) {
			property.name = name;
		}

		if(!(property instanceof PropertySchema)){
			property = this._createProperty(property);
		}

		let properties = this.getProperties();
		properties[property.name] = property;

		return property;
	},
	setProperty(name, property) {
		if(_.isObject(name)){
			property = name;
			name = property.name;
		}
		return this._setProperty(name, property);
	},
	getValidation(name) {
		let property = this.getProperty(name);
		return property && property.getValidation() || {};
	},
	getType(name) {
		let property = this.getProperty(name);
		return property && property.getType() || {};
	},
	getLabel(name){
		let property = this.getProperty(name);
		return property && property.getLabel() || '';
	},
	onPropertyChange(property, opts = {}){
		let arr = this.getPropertiesArray();
		_.each(arr, prop => {
			let depended = prop.getDependedOn(property);
			if (!depended) return;
			prop.resetValues(opts, depended);
		});
	}

});

const ClassStore = BaseClass.extend({	
	constructor(options = {}){
		BaseClass.apply(this, arguments);
		_.extend(this, _.omit(options, 'createStore'));
		let key = _.uniqueId('__classstore');
		this._createStore = options.createStore;
		this.instanceNameKey = options.instanceNameKey || key;
		this.ctorNameKey = options.ctorNameKey || key;
		this.items = {};
	},
	onExists: () => false,
	createStore(arg, ...rest){
		if (this.isExists(arg)) {
			return this.onExists();
		}
		let context = this.getCreateStoreContext(arg);	
		let store = this.buildStore(context, ...rest);		
		this.setStore(context, store);
		return store;
	},
	getStoreName(arg, generate){
		if(_.isString(arg) && arg !== '') {
			return arg;
		}
		let store;
		if (_.isFunction(arg)) {
			store = this.getStoreByCtor(arg);
		} else if (_.isObject(arg)) {
			store = this.getStoreByInstance(arg);
		}
		if (store) {
			return store.name;
		}
		if (generate) {
			return _.uniqueId('modelSchema');		
		}
	},
	isExists(arg){
		return this.getStore(arg) != null;
	},
	getStoreByName(name){
		return this.items[name];
	},	
	getStoreByInstance(instance){
		let item;
		let name = instance[this.instanceNameKey];
		if(name) {
			item = this.getStoreByName(name);
			if(item){ return item; }
		}
		return this.getStoreByCtor(instance.constructor);
	},
	getStoreByCtor(ctor){
		let item;
		let name = ctor[this.ctorNameKey];
		if(name) {
			item = this.getStoreByName(name);
			if(item){ return item; }
		}
		return _.find(this.items, f => f.ctor === ctor);
	},
	getStore(arg){
		if (_.isString(arg)) {
			return this.getStoreByName(arg);
		} else if (_.isFunction(arg)) {
			return this.getStoreByCtor(arg);
		} else if(_.isObject(arg)) {
			return this.getStoreByInstance(arg);
		}
	},
	setStore({ name, ctor, instance } = {}, store){
		this.items[name] = store;
		this.setStoreNameOn(instance || ctor, name);
	},
	setStoreNameOn(arg, name){
		if(_.isFunction(arg)) {
			arg[this.ctorNameKey] = name;
			return;
		} else if(_.isObject(arg)) {
			arg[this.instanceNameKey] = name;
			return this.setStoreNameOn(arg.constructor, name);
		}
	},
	getCreateStoreContext(arg){
		let ctor = _.isFunction(arg) 
			? arg 
			: _.isObject(arg) ? arg.constructor
				: undefined;

		let instance = !_.isFunction(arg) && _.isObject(arg) && arg || undefined;

		let name = this.getStoreName(arg, true);
		
		return { instance, ctor, name };
	},
});

const store = new ClassStore({
	ctorNameKey: '__schemaName',
	instanceNameKey: '__schemaName',
	onExists: () => { throw new Error('Schema already exists'); },
	buildStore(context, schema = {}, options) {
		let { name, ctor } = context;
		if(!(schema instanceof ModelSchema) && _.isObject(schema)){
			schema = new ModelSchema(schema, options);
		} else {
			schema = new ModelSchema({}, options);
		}
		return {
			name, ctor, schema
		};
	},
	get(arg) {
		let cache = this.getStore(arg);
		return cache && cache.schema || undefined;
	},
	initialize(){
		let store = this.createStore(...arguments);
		return store.schema;
	}
});

var modelSchemaMixin = Model$$1 => Model$$1.extend({
	getSchema(){
		return store.get(this);
	},
	getPropertySchema(key){
		let schema = this.getSchema();
		if(schema) {
			return schema.getProperty(key);
		}
	},
	display(key, options = {}){
		let value = this.get(...arguments);
		let property = this.getPropertySchema(key);
		if (property) {			
			return property.getDisplayValue(value, this, options);
		}
		return value;
	},
	displayLabel(key){
		let property = this.getPropertySchema(key);
		if (property) {
			return property.getLabel(this);
		}
	}
});

function _initializeRenderOnModelChange(){
	let romc = this.getOption('renderOnModelChange', { args: [this.model, this]});
	if (romc && this.model) {
		this.listenTo(this.model, 'change', () => this.render());
	}
}


const BaseView = mix(View$1)
	.with(
		optionsMixin, 
		cssClassModifiersMixin,
		{
			_initializeRenderOnModelChange
		}		
	);



const ExtView = BaseView.extend({
	constructor(){
		BaseView.apply(this, arguments);
		this._initializeRenderOnModelChange();
	},
});

const BaseCollectionVIew = mix(CollectionView)
	.with(
		optionsMixin, 
		cssClassModifiersMixin, 
		customsMixin, 
		emptyFetchMixin, 
		improvedIndexesMixin,
		{
			_initializeRenderOnModelChange
		}
	);

const ExtCollectionVIew = BaseCollectionVIew.extend({
	constructor(){
		BaseCollectionVIew.apply(this, arguments);
		this._initializeRenderOnModelChange();
	},
});

const templates = {
	default: _.template('<span><%= _v.getText() %></span>'),
	small: _.template('<small><%= _v.getText() %></small>'),
	labeledText: _.template('<label><%= _v.getHeader() %></label><span><%= _v.getText() %></span><% if(_v.hasSmallText()){ %><small>_v.getSmallText()</small><% } %>'),
	full: _.template('<% if(_v.hasTopText()){ %><i><%= _v.getTopText() %></i><% } %><span><%= _v.getText() %></span><% if(_v.hasSmallText()){ %><small><%= _v.getSmallText() %></small><% } %><% if(_v.hasBottomText()){ %><b><%= _v.getBottomText() %></b><% } %>')
};
const AtomText = ExtView.extend({
	autodetectTemplate: true,
	constructor(){
		ExtView.apply(this, arguments);
		this.addCssClassModifier(
			'atom-text',
			(m,v) => 'atom-' + v.getType()
		);		
	},
	_hasAnyProperty(...properties){
		return _.some(properties, prop => {
			return (!!this[prop] || this.options[prop]);
		});
	},
	isFull(){
		return this.getOption('type') == 'full' || this._hasAnyProperty('topText','bottomText');
	},
	isSmall(){
		return this.getOption('type') == 'small';
	},
	isLabeledText(){
		return this.getOption('type') == 'labeledText' || this._hasAnyProperty('header');
	},
	getType(){
		let type = this.getOption('type') || 'default';
		if(type != 'default') { return type; }
		if(this.getOption('autodetectTemplate')) {
			if (this.isFull()) {
				return 'full';
			} else if (this.isLabeledText()){
				return 'labeledText';
			}
		}
		return type;
	},
	getTemplate(){
		let type = this.getType();
		return templates[type];
	},
	_getText(key){
		return this.getOption(key, { args: [ this.model, this ] });
	},

	hasHeader(){
		return !isEmptyValue(this.getHeader());
	},
	getHeader(){ return this._getText('header'); },

	hasTopText(){
		return !isEmptyValue(this.getTopText());
	},
	getTopText(){ return this._getText('topText'); },

	getText(){ return this._getText('text'); },

	hasSmallText(){
		return !isEmptyValue(this.getSmallText());
	},
	getSmallText(){ return this._getText('smallText'); },

	hasBottomText(){
		return !isEmptyValue(this.getBottomText());
	},	
	getBottomText(){ return this._getText('bottomText'); },

	templateContext(){
		return {
			_v: this,
		};
	}
}, {
	small(arg1, arg2){
		let defs = { type: 'small' };
		let uopts = {};
		if(_.isString(arg1) || !arg1) {
			defs.text = arg1;
			uopts = arg2;
		} else {
			uopts = arg1;
		}
		return new AtomText(_.extend({}, uopts, defs));
	},
	byModel(model, options){
		let keys =  ['header', 'topText', 'text', 'smallText', 'bottomText'];
		let values = _.reduce(keys,(memo, key) => {
			if(model.has(key) && !isEmptyValue(model.get(key))) {
				memo[key] = model.get(key);
			}
			return memo;
		}, {});
		return new AtomText(_.extend({}, values, options));
	}
});

const TextView = View.extend({
	displayInsteadGet: true,
	shouldEscapeValue: true,
	constructor(options = {}){
		this.options = options;
		let { text, value, shouldEscapeValue, property, schema, customValue } = options;
		if (!property && schema) {
			property = schema.name;
		}
		this.setValue(text || value, { shouldEscapeValue, preventRender: true });

		
		View.apply(this, arguments);
		if (this.model && property) {
			this.customValue = customValue;
			this.schema = schema;
			this.property = property;
			this.applyPropertyValue({ preventRender: true });
			property && this.listenTo(this.model, 'change:' + property, this.applyPropertyValue);
		}
	},
	getOption(){
		return getOption(this, ...arguments);
	},
	render(){
		this.setNodeValue();
	},
	setValue(value, opts = {}){
		
		this.value = value;
		let { preventRender, shouldEscapeValue } = opts;

		if(shouldEscapeValue != null){
			this.shouldEscapeValue = shouldEscapeValue;
		}

		if (!preventRender) {
			this.setNodeValue();
		}
	},
	getValue({ asIs, shouldEscapeValue } = {}){
		let value = this.value;
		if (asIs){
			return value;
		}
		
		if(!_.isString(value)) {
			value = value == null ? '' : value.toString();
		}

		if (shouldEscapeValue == null) {
			shouldEscapeValue = this.shouldEscapeValue;
		}

		if (shouldEscapeValue) {
			value = _.escape(value);
		}
		return value;
	},
	setNodeValue() {
		this.el.innerHTML = this.getValue();
	},
	applyPropertyValue(opts){
		let value = this.getPropertyValue();
		this.setValue(value, opts);
	},
	getPropertyValue(){
		
		if (_.isFunction(this.customValue)) {
			return this.customValue.call(this, this.property, this.model, this);
		}

		let val = this.model.get(this.property);
		let useDisplay = this.getOption('displayInsteadGet');
		if (useDisplay && this.schema) {
			return this.schema.getDisplayValue(val, this.model, { allValues: this.getOption('allValues') });
		} else {
			return val;
		}
	},
	triggerMethod,
	destroy(){
		if (this._isDestroyed || this._isDestroying) { return this; }
		this._isDestroying = true;
		
		this.off();

		this.remove();

		this._isDestroyed = true;
	
		return this;
	}
});

const rules = [
	{
		name: 'required',
		message: 'required',
		validate: (value) => {
			if (isEmptyValue(value)) {
				return 'required';
			}
		}
	},
	{
		name: 'email',
		message: 'not a email',
		validate: (value) => {
			
			if(isEmptyValue(value)) { return; }

			if (!_.isString(value)) {
				return 'type:mismatch';
			}

			let chunks = value.split('@');
			let left = chunks[0];
			let right = chunks[1];
		
			if(
				chunks.length != 2
				|| !/^[a-z0-9\-_.+]+$/gmi.test(left)
				|| !/^[a-z0-9\-_]+\.[a-z0-9\-_]+(\.[a-z0-9\-_]+)*$/gmi.test(right)
			) {
				return 'pattern:mismatch';
			} else {
				return;
			}
		}
	},
	{
		name:'valueIn',
		message: 'given value is not one of allowed values',
		validate: (value, { valueIn } = {}) => {
			if(_.isArray(valueIn) && valueIn.indexOf(value) === -1) {
				return 'value:not:in';
			}
		}
	},
	{
		name:'valueNotIn',
		message: 'given value is one of forbiden values',
		validate: (value, { valueNotIn } = {}) => {
			if(_.isArray(valueNotIn) && valueNotIn.indexOf(value) > -1) {
				return 'value:in';
			}
		}
	},
	{
		name:'shouldBeEqual',
		message: 'given value is not equal',
		validate: (value, { shouldBeEqual, allValues } = {}) => {
			
			let compare = _.isFunction(shouldBeEqual) 
				? shouldBeEqual(allValues) 
				: shouldBeEqual;

			if (value !== compare) {
				return 'value:not:equal';
			}
		}
	},	
	{
		name:'shouldNotBeEqual',
		message: 'given value is forbiden',
		validate: (value, { shouldNotBeEqual, allValues } = {}) => {

			let compare = _.isFunction(shouldNotBeEqual) 
				? shouldNotBeEqual(allValues) 
				: shouldNotBeEqual;

			if (value !== compare) {
				return 'value:equal';
			}


			if(_.isFunction(shouldNotBeEqual)) {
				return value !== shouldNotBeEqual(allValues);
			} else {
				return value !== shouldNotBeEqual;
			}
		}
	},
	{
		name:'minLength',
		message: ({ ruleValue } = {}) => 'length is less than ' + ruleValue,
		validate: (value, { minLength } = {}) => {
			if (_.isNumber(minLength) && (value || '').toString().length < minLength) {
				return 'min:length';
			}
		}
	},
	{
		name:'maxLength',
		message: ({ ruleValue } = {}) => 'length is greater than ' + ruleValue,
		validate: (value, { maxLength } = {}) => {
			if (_.isNumber(maxLength) && (value || '').toString().length > maxLength) {
				return 'max:length';
			}
		}
	},
	{
		name:'minValue',
		message: ({ ruleValue } = {}) => 'value is less than ' + ruleValue,
		validate: (value, { minValue } = {}) => {
			if (_.isNumber(minValue)) {
				let numValue = parseFloat(value, 10);
				if (isEmptyValue(numValue) || numValue < minValue) {
					return 'min:value';
				}
			}
		}
	},
	{
		name:'maxValue',
		message: ({ ruleValue } = {}) => 'value is greater than ' + ruleValue,
		validate: (value, { maxValue } = {}) => {
			if (_.isNumber(maxValue)) {
				let numValue = parseFloat(value, 10);
				if (isEmptyValue(numValue) || numValue > maxValue) {
					return 'max:value';
				}
			}			
		}
	},
	{
		name:'pattern',
		message: 'value is not in pattern',
		validate: (value, { pattern } = {}) => {
			value = (value || '').toString();

			if(_.isString(pattern) && !isEmptyValue(pattern)) {
				pattern = new RegExp(pattern);
			}
			if(!_.isRegExp(pattern)) { return; }

			if (!pattern.test(value)) {
				return 'pattern';
			}
		}
	},
	{
		name: 'validate',
		validate: (value, options = {}) => {
			let { ruleValue } = options;
			if(!_.isFunction(ruleValue)) return;
			return ruleValue(value, options);
		},
	},	
];

reIndex(false);

function reIndex(sortBefore = true) {
	if (sortBefore) {
		rules.sort((a,b) => a.index - b.index);
	}
	_.each(rules, (rule, index) => {
		rule.index = index;
	});
}

function normalizeValidationContext(context){
	if (context === 'required') {
		return { required: true };
	} else if(_.isFunction(context)) {
		return { validate: context };
	} else if(_.isObject(context)) {
		return context;
	}
}

function getRuleContexts(rule = {}){
	let founded = _.reduce(rule, (taken, ruleValue, name) => {
		let found = _.findWhere(rules, { name });
		if(!found) return taken;

		let message = rule[name + 'Message'];
		taken.push({
			rule: found,
			ruleValue,
			message,
			index: found.index
		});

		return taken;

	}, []);
	founded.sort((a,b) => a.index - b.index);
	return founded;
}

function check(value, ruleContext = {}) {
	
	let { rule = {}, ruleValue, allValues, errors = [] } = ruleContext;
	if (rule.skipIfInvalid && errors.length) {
		return Promise.reject();
	}
	let message = ruleContext.message || rule.message;
	let buildMessage = _.isFunction(message) ? message : ({ error } = {}) => isEmptyValue(message) ? error : message;

	let validate = rule.validate;
	let validateOptions = {
		ruleName: rule.name,
		ruleValue,
		[rule.name]: ruleValue,
		allValues,
		message: buildMessage({ value, allValues, ruleValue }),
		errors,
	};
	if (!_.isFunction(validate)) return Promise.resolve(value);

	
	let result = validate(value, validateOptions);

	if (!result) {
		return Promise.resolve(value);
	} else if(result && _.isFunction(result.then)) {
		return result.then(
			() => Promise.resolve(value),
			(error) => Promise.reject(buildMessage({ error, value, allValues, ruleValue }))
		);
	} else {
		return Promise.reject(buildMessage({ error: result, value, allValues, ruleValue }));
	}
}



function validate(value, rule, { allValues = {} } = {}){
	rule = normalizeValidationContext(rule);
	let contexts = getRuleContexts(rule);
	

	return new Promise((resolve, reject) => {
		let errors = [];

		let rulesPromise = _.reduce(contexts, (promise, ruleContext) => {

			promise = promise.then(() => {
				return check(value, _.extend({}, ruleContext, { allValues, errors }));
			}).catch(error => {
				if(error != null)
					errors.push(error);
			});

			return promise;

		}, Promise.resolve(value));

		rulesPromise.then(() => {
			if(errors.length){
				reject(errors);
			} else {
				resolve(value);
			}
		});

	});
}

function removeRule(name){
	let found = _.findIndex(rules, { name });
	if (found === -1) return;
	let removed = rules.splice(found, 1);
	reIndex();
	return removed;
}

function setRule(rule){
	if (rule.index == null) {
		rule.index = rules.length;
	}
	rules.push(rule);
	reIndex();
	return rule;
}

var validator = {
	setRule(name, rule = {}){
		if(_.isObject(name)) {
			rule = name;
			name = rule.name;
		}

		if(isEmptyValue(name)) {
			throw new Error('rule name not specified');
		}

		if(rule == null){
			return removeRule(name);
		} else if (!_.isObject(rule)) {
			throw new Error('validation rule must be an object');
		} else {
			if (rule.name != name) {
				rule.name = name;
			}
			return setRule(rule);
		}
	},
	removeRule(name) {
		return removeRule(name);
	},
	getRule(name){
		return _.findWhere(rules, { name });
	},
	setMessage(name, message){
		if(!_.isString(name) || isEmptyValue(name)) {
			throw new Error('name must be not empty string');
		}
		if(!(_.isString(message) || _.isFunction(message))) {
			throw new Error('message must be not empty string or a function returning a string');
		}
		let rule = _.findWhere(rules, { name });
		if (!rule) { return; }
		rule.message = message;
	},
	setMessages(hash = {}){
		_.each(hash, (message, name) => this.setMessage(name, message));
	},
	validate,
	_rules: rules,
};

/*
By default expects token on initialize
new User({...}, { token });
you can use bbmn-components bearer-token for that
or something else
but token should have this defined properties:
	token.ready - promise
	token.hasToken() - should return true or flase
	token.update() - invokes on user change event, should receive refreshed token

*/
var User = Model.extend({
	
	shouldRequestOnInitialize: true,

	constructor(hash, opts){
		this._waitFor = [];
		this.initializeToken(opts);
		Model.apply(this, arguments);

		if (this.shouldRequestOnInitialize) {
			this.getReady();
		}
	},
	initializeToken(opts = {}){
		let { token } = opts;
		if (!token) return;
		this.listenTo(token, 'changed', this.refresh);
		this.token = token;
		token.ready && this._waitFor.push(token.ready);
	},
	getReady(){
		if(this.ready) return this.ready;
		

		this.ready = new Promise((resolve) => {
			this.once('changed', () => resolve());
			Promise.all(this._waitFor).then(
				() => this.refresh(),
				() => this.reflectChanges({ clear: true })
			);
		});

		return this.ready;
	},
	logoff(options){
		return new Promise((resolve) => {
			this.once('changed', () => resolve());
			if (this.token) {
				this.token.update(undefined, options);
			} else {
				this.reflectChanges(_.extend({}, options, { clear: true }));
			}
		});
	},
	//override this for getting auth status
	getState(){
		return this.isLogged() ? 'auth' : 'anonym';
	},
	isLogged(){
		return this.get('authenticated') === true;
	},
	refresh(tokenOptions){		
		if (this._refreshing) { return this._refreshing; }
		let promise = this._refreshing = new Promise((resolve) => {
			if (!this.token.hasToken()) {
				this.reflectChanges(_.extend({}, tokenOptions, { clear: true }));
				resolve();
			} else {
				this.fetch().then(() => {
					this.reflectChanges(tokenOptions);
					resolve();
				}, () => {				
					this.reflectChanges(_.extend({}, tokenOptions, { store: false }));
					resolve();
				});
			}
		});		
		promise.then(() => {
			delete this._refreshing;
		});
		return promise;
	},
	reflectChanges(opts = {}){
		let { silent, clear, store = true } = opts;
		clear && this.clear();
		store && this.store(clear);
		let options = _.omit(opts, 'clear', 'store');
		!silent && this.trigger('changed', this, options);
	},
	isMe(arg){
		let me = this.get(this.idAttribute);
		return _.isEqual(me, arg);
	},
	// implement by your own
	store(){},
});

let nativeAjax = ajax;

const tokenizedAjax = function(...args){
	let options;

	if(args && args.length == 1 && _.isObject(args[0])){
		options = args[0];
	}
	if(args && args.length == 2 && !_.isObject(args[0]) && _.isObject(args[1])){
		options = args[1];
	}

	options && (options.headers = _.extend({}, options.headers, this.getAjaxHeaders()));

	return nativeAjax.apply(null, args);
};


const Token = Model.extend({

	tokenAttribute: 'access_token',
	refreshTokenAttribute: 'refresh_token',
	endPoint: 'auth/token',
	secondsOffset: 0,

	shouldRequestOnInitialize: true,

	constructor(){
		this.ajaxHeaders = {};
		this.flows = {};
		this.initializeFlows();
		this.setExpiration(null);

		Model.apply(this, arguments);

		if (this.shouldRequestOnInitialize) {
			this.getReady();
		}
	},

	getReady(){
		if(this.ready) return this.ready;
		
		if (!this.hasToken()) {
			this.ready = Promise.resolve();
		} else {
			this.ready = this.refresh({force: true}).catch(() => {
				this.update(null);
			});
		}

		return this.ready;
	},
	

	initializeFlows(){

		this.setFlow('password', {
			url: this.endPoint,
			method: 'POST'
		});
		this.setFlow('refresh', {
			url: this.endPoint,
			method: 'POST'
		});

	},
	getFlow(key){
		return _.clone(this.flows[key] || {});
	},
	setFlow(key, value){
		this.flows[key] = value;
	},



	hasToken(){
		return this.getToken() != null;
	},
	getToken(){
		return this.get(this.tokenAttribute);
	},

	getRefreshToken(){
		return this.get(this.refreshTokenAttribute);
	},

	getAjaxHeaders(){		
		return this.ajaxHeaders;
	},	

	parse(data){
		return data;
	},

	fetch(options = {}, userOptions){
		if(this._fetching) return this._fetching;		
		this._fetching = nativeAjax(options).then(
			(json) => {

				let parsed = this.parse(_.clone(json));
				this.update(parsed, userOptions);
				delete this._fetching;
				return Promise.resolve(json);
			}, 
			(xhr) => {
				
				delete this._fetching;
				
				options.clearOnFail !== false 
					&& this.update(null, userOptions);

				let error = this.handleError(xhr);
				if(error){

					return Promise.reject(error);
				} else {
					return Promise.reject(xhr);
				}
			});	
		return this._fetching;
	},
	handleError(){},
	update(hash, opts = {}){
		let { silent } = opts;
		if (hash == null) {

			this.clear(opts);

		} else {
			let fullhash = _.extend({}, this.attributes, hash);
			let unset = [];
			let shouldUnset = !!opts.unset;
			let setHash = _(fullhash).reduce((memo, value, key) => {
				if (key in hash) {
					memo[key] = value;
				} else if (shouldUnset) {
					unset.push(key);
				} else {
					memo[key] = undefined;
				}
				return memo;
			}, {});

			setHash = this.parse(setHash);
			this.set(setHash, { silent });
			_(unset).each(key => this.unset(key, { silent }));
		}

		let reflectOptions = _.extend({}, _.omit(opts, 'silent', 'store'));
		this.reflectTokenChanges(reflectOptions);

	},

	replaceBackboneAjax(){		
		if(!this.hasToken())
			Backbone.ajax = nativeAjax;
		else
			Backbone.ajax = (...args) => this.ajax(...args);
	},
	updateAjaxHeaders(token){
		token || (token = this.getToken());
		let headers = this.getAjaxHeaders();
		if (token) {
			headers.Authorization = 'Bearer ' + token;
			headers.Accept = 'application/json';
		} else {
			delete headers.Authorization;
		}
	},

	//implement by your own
	storeToken(){},

	reflectTokenChanges(opts = {}){
		let { silent, store = true } = opts;
		this.updateAjaxHeaders();
		this.replaceBackboneAjax();
		if (store)
			this.storeToken();
		if (!silent) {
			let options = _.omit(opts, 'silent', 'store');
			this.trigger('changed', options);
		}
	},

	ajax(...args){
		return this.refresh().then(
			() => tokenizedAjax.apply(this, args),
			error => Promise.reject(error)
		);
	},	
	refresh(opts = {}){		

		// if token is fresh enough and there is no force refresh
		// pass
		if (!this.isExpired() && !opts.force) {
			return Promise.resolve();
		}
		let options = this.getFlow('refresh');
		options.data = this.getRefreshTokenData();
		return this.fetch(options);
	},
	getRefreshTokenData(){
		return {
			'grant_type':'refresh_token',
			'refresh_token': this.getRefreshToken(),
		};
	},

	setExpiration(arg){

		if (arg === null) {
			this.expiresAt = null;
		}

		let date;
		let now = new Date();

		if (_.isDate(arg)) {
			date = arg;
		} else if(_.isObject(arg)) {
			date = new Date();
			
			let { seconds, minutes, hours, days } = arg;
			date.setDate(date.getDate() + (days || 0));
			date.setHours(date.getHours() + (hours || 0));
			date.setMinutes(date.getMinutes() + (minutes || 0));
			date.setSeconds(date.getSeconds() + (seconds || 0));
		}

		if(!_.isDate(date) || isNaN(date.valueOf()) || date < now) {
			date = new Date();
			date.setSeconds(now.getSeconds() + 90);
		}

		this.expiresAt = date;
	},
	getExpiration(){
		return this.expiresAt;
	},
	isExpired(){
		let date = this.getExpiration();
		if(!_.isDate(date) || isNaN(date.valueOf()))
			return true;
		return date.valueOf() < Date.now() + (this.secondsOffset * 1000);
	},
	login(username, password, opts){

		let options = this.getFlow('password');
		options.data = { grant_type:'password', username, password };
		options.clearOnFail = false;
		return this.fetch(options, opts);

	},

});

Token.setNativeAjax = function(arg){
	let old = nativeAjax;
	nativeAjax = arg;
	return old;
};

const Stack = mix(BaseClass).with(Events).extend({

	destroyOnRemove: true,
	removeOnOutsideClick: true,
	removeOnEsc: true,
	clearBeforeAdd: false,

	constructor(options){
		this.cid = _.uniqueId('stack');
		this.unremovableKey = `_${this.cid}_preventRemove`;
		this.options = options;
		this.stack = [];
		BaseClass.apply(this, arguments);			
	},




	add(view, options){
		if(!_.isObject(view)) { return; }
		if (this.getOption('clearBeforeAdd')) {
			this.removeAll();
		}
		this.triggerMethod('before:add');

		this.stack.push(view);
		this._setupView(view, options);

		this._stackChanged(1, view);

	},
	_setupView(view, { preventRemove } = {}){
		if (preventRemove) {
			let key = this.getUnremovableKey();
			view[key] = true;
		}
		this.listenToOnce(view, 'destroy', () => this._removeView(view, { selfDestroy: true }));		
	},	

	getLast(){
		return _.last(this.stack);
	},


	removeLast(){
		let view = this.getLast();
		this.remove(view);
	},
	destroyLast(){
		let view = this.getLast();
		this.remove(view, { destroy: true });
	},
	remove(view, { destroy } = {}){
		let destroyOnRemove = this.getOption('destroyOnRemove');
		let removed = this._removeView(view);
		if (removed && (destroy || destroyOnRemove)) {
			this._destroyView(view);
		}
	},

	_removeView(view, { selfDestroy } = {}){
		if (!_.isObject(view)) { return; }

		if (this.isViewUnremovable(view, selfDestroy)) {
			return;
		}

		this._cleanUpView(view);

		let index$$1 = this.stack.indexOf(view);
		if (index$$1 === -1) return;

		if (index$$1 == this.stack.length - 1)
			this.stack.pop();
		else
			this.stack.splice(index$$1, 1);
			
		this._stackChanged(-1);

		return view;
	},

	_cleanUpView(view){
		this.stopListening(view);
		delete view[this.getUnremovableKey()];
	},

	_destroyView(view) {
		if (_.isObject(view) && _.isFunction(view.destroy)) { 
			view.destroy();
		}
	},

	_stackChanged(change, view){
		if (change > 0) {
			this._setDocumentListeners();			
			this.triggerMethod('add', view);
		} else {
			this._unsetDocumentListeners();			
			this.triggerMethod('remove', view);
		}

	},


	/*
		Unremovable view methods
		sometimes you want to prevent view to be removed from the stack		
	*/
	getUnremovableKey(){
		return this.getOption('unremovableKey');
	},
	// options is for internal use only.
	// self destroy flag filled when a view destroyed outside the stack
	isViewUnremovable(view, { selfDestroy } = {}){
		if (selfDestroy) return false;
		let key = this.getUnremovableKey();
		return view[key];
	},		

	/*
		DOM listeners logic
		- esc handler
		- outside click handler
	*/
	getViewDomElement(view){
		return view && view.el;
	},
	isElementOutsideOfView(eventElement, view){
		let viewElement = this.getViewDomElement(view);
		if (!viewElement) return;
		return !$.contains(viewElement, eventElement);
	},
	getViewIfElementOutside(eventElement){
		let view = this.getLast();
		if (!view) return;
		if(this.isElementOutsideOfView(eventElement, view)) {
			return view;
		}
	},
	outsideClickHandler(event){
		if (!this.stack.length) { return; }

		let view = this.getViewIfElementOutside(event.target);
		if (!view) { return; }

		event.preventDefault();
		event.stopPropagation();
		this.remove(view);

	},
	escapePressHandler(event){
		if (!this.stack.length || event.keyCode !== 27 ) return;

		event.preventDefault();
		event.stopPropagation();
		this.removeLast();

	},

	_setDocumentListeners(){
		if (this._documentListeners || !this.stack.length) return;
		let $doc = this.getDocument();
		if (this._shouldRemoveOnEsc()) {			
			this._escapePressHandler = _.bind(this.escapePressHandler, this);
			$doc.on('keyup', this._escapePressHandler);
			this.triggerMethod('dom:listeners:escape:on');
		}
		if (this._shouldRemoveOnOutsideClick()) {
			this._outsideClickHandler = _.bind(this.outsideClickHandler, this);
			$doc.on('click', this._outsideClickHandler);
			this.triggerMethod('dom:listeners:click:on');
		}
		this.triggerMethod('dom:listeners:on');
		this._documentListeners = true;
	},
	_unsetDocumentListeners(){
		if (!(this._documentListeners && !this.stack.length)) return;
		let $doc = this.getDocument();
		if (this._escapePressHandler) {
			$doc.off('keyup', this._escapePressHandler);
			delete this._escapePressHandler;
			this.triggerMethod('dom:listeners:escape:off');
		}
		if(this._outsideClickHandler) {
			$doc.off('click', this._outsideClickHandler);
			delete this._outsideClickHandler;
			this.triggerMethod('dom:listeners:click:off');
		}
		this.triggerMethod('dom:listeners:off');
		this._documentListeners = false;
	},
	_shouldRemoveOnEsc(){
		return this.getOption('removeOnEsc') === true;
	},
	_shouldRemoveOnOutsideClick(){
		return this.getOption('removeOnOutsideClick') === true;
	},


	/* helpers */

	mergeOptions,
	triggerMethod,
	getOption() { return getOption(this, ...arguments); },

	getDocument(){
		return this.$doc || $(document);
	},
	isDestroyed(){
		return this._isDestroyed || this._isDestroying;
	},
	removeAll(){
		while(this.stack.length){
			this.destroyLast();
		}
	},
	destroy(){
		if(this._isDestroyed || this._isDestroying) { return; }		
		this._isDestroying = true;

		this.triggerMethod('before:destroy');

		this.removeAll();

		let $doc = this.getDocument();
		$doc.off('keyup', this._onKeyUp);
		$doc.off('click', this._outsideClick);

		this._isDestroyed = true;
		this.triggerMethod('destroy');
	},


});

const _disallowedKeys = ['setItem', 'key', 'getItem', 'removeItem', 'clear'];
const allowedKey = key => _disallowedKeys.indexOf(key) < 0;

const FakeStore = BaseClass.extend({
	constructor(){
		BaseClass.apply(this, arguments);
		this.store = {};
	},
	setItem(id, val) {
		if (!allowedKey(id)) return;
		return this.store[id] = String(val);
	},
	getItem(id) {
		if (!allowedKey(id)) return;
		return this.store[id];
	},
	removeItem(id) {
		if (!allowedKey(id)) return;
		delete this.store[id];
	},
	clear() {
		let keys = _(this).keys();
		_(keys).each(key => this.removeItem(key));
	}
});

let session = (typeof sessionStorage === 'undefined') 
	? new FakeStore() : sessionStorage;

let local = (typeof localStorage === 'undefined') 
	? new FakeStore() : localStorage;

const getStore = (opts = {}) => opts.local === true ? local : session;

const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;

var store$1 = {

	_normalizeValue(value) {
		var normValue = value;
		if (_.isObject(value) && _.isFunction(value.toJSON))
			normValue = value.toJSON();
		if (_.isDate(value) && !_.isNaN(value.valueOf()))
			normValue = 'date(' + normValue + ')';
		return normValue;
	},

	_createItem(value, expireAt) {
		return { expireAt: expireAt, value: value };
	},

	jsonParse(key, value) {
		var datePattern = /^date\((\d{4,4}-\d{2,2}-\d{2,2}([T\s]\d{2,2}:\d{2,2}:\d{2,2}(\.\d*)?Z?)?)\)$/;
		if (_.isString(value) && datePattern.test(value)) {
			var textDate = value.replace(datePattern, '$1');
			return new Date(textDate);
		}
		return value;
	},
	_jsonParse(key, value, context) {
		if (!key) return value;
		return this.jsonParse(key, value, context);
	},
	_parse(raw) {
		let _this = this;
		let item = JSON.parse(raw, function (key, value) { return _this._jsonParse(key, value, this); });
		if ('expireAt' in item && 'value' in item)
			return item;
		else
			return this._createItem(item, 0);
	},
	_get(key, opts) {
		let raw = getStore(opts).getItem(key);
		if (raw == null) return;
		return this._parse(raw);
	},
	get(key, opts = {}) {

		let { checkExpire = true } = opts;

		let item = this._get(key, opts);		
		if (item == null) return;

		let expired = this._isExpired(item);
		if (!expired || !checkExpire) {

			return item.value;
		}
		else if (expired) {
			this.remove(key, opts);
		}
	},
	set(key, value, opts = {}) {

		let expireAt = Date.now() + this.getExpireAt(opts);
		let normValue = this._normalizeValue(value);
		let item = this._createItem(normValue, expireAt);
		this._set(key, item, opts);
		
	},
	remove(key, opts) {
		getStore(opts).removeItem(key);
	},
	expire(key, opts) {
		let item = this._get(key, opts);
		if (!item) return;
		item.expireAt = 0;
		this._set(key, item, opts);
	},
	getExpireAt ({ expireAt, seconds, minutes, hours, days }) {
		if (expireAt != null)
			return expireAt;

		let offset = 0;

		_.isNumber(seconds) && (offset += seconds * SECONDS);
		_.isNumber(minutes) && (offset += minutes * MINUTES);
		_.isNumber(hours) && (offset += hours * HOURS);
		_.isNumber(days) && (offset += days * DAYS);

		offset === 0 && (offset += 10 * MINUTES);

		return offset;
	},
	_set(key, item, opts) {
		let text = JSON.stringify(item);
		getStore(opts).setItem(key, text);
	},
	isExpired(key, opts) {
		let item = this._get(key, opts);
		if (item == null) return true;
		return this._isExpired(item);
	},
	_isExpired(item) {
		return item.expireAt < Date.now();
	},
};

const NotifyModel = Model.extend({
	constructor(){
		Model.apply(this, arguments);
		if(!_.isDate(this.get('date')))
			this.set('date', new Date(), { silent: true });	

		this._setupDelays();		
	},
	_setupDelays(){
		this.on('change:viewedDelay', () => this._setDelay('viewed'));
		this.on('change:removedDelay', () => this._setDelay('removed'));
		this._setDelay('viewed');
		this._setDelay('removed');
		this.on('destroy', () => {
			this._clearTimeout('viewed');
			this._clearTimeout('removed');
		});
	},
	_clearTimeout(name){
		let timeoutKey = name + 'Timeout';
		clearTimeout(this[timeoutKey]);
	},
	_setTimeout(name){
		let delay = this.get(name + 'Delay');
		if (!_.isNumber(delay) || delay === 0) { return; }
		let timeoutKey = name + 'Timeout';
		this[timeoutKey] = setTimeout(() => {
			this[name]();
		}, delay * 1000);
	},
	_setDelay(name){
		this._clearTimeout(name);
		this._setTimeout(name);
	},


	//we need to use id but there is no any endpoint behind
	isNew(){
		return true;
	},
	isViewed(){
		return this.get('viewed') === true;
	},
	setViewed(){
		this.set({
			viewed:true,
			viewedDelay: undefined
		});
		if (this.get('store') === false) {
			this.destroy();
		}
	},	
	getDate(){
		return this.get('date');
	},
	removed(){
		this.trigger('removed');
	},
	viewed(){
		this.trigger('viewed');
	},
	getType(){
		return this.get('type');
	},
	getName(){
		return this.get('name');
	}
});

const Notifies = Collection.extend({
	model: NotifyModel,
	hasNotViewed(){
		let counts = this.getCount();
		return !!counts.notViewed;
	},
	getCount(){
		return this.reduce((memo, model) => {
			memo.total++;
			if(model.isViewed())
				memo.viewed++;
			else
				memo.notViewed++;

			return memo;
		}, { total: 0, viewed: 0, notViewed: 0});
	},
	getCountAsText(){
		let counts = this.getCount();
		if(!counts.total) {
			return '';
		}
		return counts.notViewed + '/' + counts.total;
	},
	toggle(){
		this.mode = this.mode != 'all' ? 'all' : 'notViewed';
		this.trigger('toggle', this.mode);
	}

});

var notifies = new Notifies([]);

function notify(hash){
	let model = notifies.get(hash);
	if(model) {
		model.wasShown = false;
		hash.viewed = false;
	}
	return notifies.add(hash, { merge: true, update: true});
}


function normalizeOptions(arg1){
	if(_.isString(arg1)) {
		return { text: arg1 };
	} else if(_.isObject(arg1)) {
		return arg1;
	}
}

notify.wait = function(arg){
	let options = _.extend({ 
		type: 'wait', id: _.uniqueId('waitNotify') 
	}, 
	normalizeOptions(arg));
	return notify(options);
};

notify.error = function(arg){
	let options = _.extend({ 
		type: 'error', id: _.uniqueId('waitNotify') 
	}, 
	normalizeOptions(arg));
	return notify(options);
};
notify.success = function(arg){
	let options = _.extend({ 
		type: 'success', id: _.uniqueId('waitNotify') 
	}, 
	normalizeOptions(arg));
	return notify(options);
};
notify.message = function(arg){
	let options = _.extend({ 
		type: 'message', 		
		id: _.uniqueId('waitNotify'),
		viewedDelay: 3,
		removedDelay: 600
	}, 
	normalizeOptions(arg));
	return notify(options);
};

const IconView = ExtView.extend({
	constructor(){
		ExtView.apply(this, arguments);
		this.addCssClassModifier('icon');
	},
	template: _.template('<i></i>'),	
});

const IconButtonView = ExtView.extend({
	tagName: 'button',
	constructor(){
		ExtView.apply(this, arguments);
		this.addCssClassModifier('icon-btn');
	},
	template: _.template('<i></i>'),	
});


const NotifyView = ExtCollectionVIew.extend({
	renderAllCustoms: true,
	cssClassModifiers:[
		() => 'notify',
		m => m.getType(),		
		m => m.getName(),
		m => m.isViewed() ? 'viewed' : 'not-viewed',
		m => m.wasShown ? '' : 'accent'
	],
	customs:[
		(v) => v.getTypeView(),
		(v) => v.getMessageView(),
		(v) => v.getStateView()
	],
	events:{
		'click .state':'changeModelState'
	},
	modelEvents:{
		'viewed': 'markAsViewed',
		'removed': 'destroyModel',
		'change:text': 'render',
	},
	changeModelState(){
		if(this.model.isViewed()) {
			this.destroyModel();
		} else {
			this.markAsViewed();
		}
	},
	destroyModel(){
		this.disappear().then(() => this.model.destroy());
	},
	markAsViewed(){
		if (this.getOption('mode') != 'all') {
			this.disappear().then(() => this.model.setViewed());
		} else {
			this.model.setViewed();
		}
	},
	disappear() {
		let promise = new Promise((resolve) => {
			if(this.isAttached()) {
				this.$el.animate({
					height: 'toggle',
					width: 'toggle',
				}, 500, resolve);
			} else {
				resolve();
			}
		});
		return promise;		
	},	
	onBeforeAttach(){
		this.$el.attr('style','');
	},
	onBeforeRender(){
		this.dismissAccent = false;
	},
	onRender(){
		if(!this.model.wasShown) {
			setTimeout(() => {
				this.model.wasShown = true;
				this.refreshCssClass();
			}, 2000);
		}
	},

	getTypeView(){
		return new IconView({ className: 'type-icon' });
	},
	getMessageView(){
		return AtomText.byModel(this.model, { className: 'message' });
	},
	getStateView(){
		return new IconButtonView({ className: 'state' });
	},



});

const Notifier = nextCollectionViewMixin(ExtCollectionVIew).extend({
	initialize(){
		this.setFilter(this.unviewedFilter, { preventRender: true });
		this.listenTo(this.collection, 'change:viewed', this.sort);
	},
	childView: NotifyView,
	collection: notifies,
	collectionEvents: {
		toggle() {
			let current = this.getFilter();
			if(current == this.allFilter) {
				this.setFilter(this.unviewedFilter, { preventRender: true });
			} else {
				this.setFilter(this.allFilter, { preventRender: true });
			}
			this.render();
		}
	},

	viewComparator(v1,v2){
		return v2.model.getDate() - v1.model.getDate();
	},
	allFilter(){
		return true;
	},
	unviewedFilter(v){
		return !v.model.isViewed();
	},
	childViewOptions(){
		return {
			mode: this.collection.mode
		};
	}
});

function convertOptionsToNotify(opts = {}){
	let defs =_.pick(opts, 'notifyId', 'notifyStore');
	defs = {
		id: defs.notifyId,
		store: defs.notifyStore
	};
	let raw = _.pick(opts, 'notifyWait', 'notifyError', 'notifySuccess');
	let result = _.reduce(raw, (memo, val, key) => {
		let parsedKey = key.replace(/^notify(\w)/, (match, letter) => { return letter.toLowerCase(); });
		if(_.isString(val)){
			val = {
				text: val
			};
		}
		memo[parsedKey] = val;
	}, {});
	if (!_.size(result)) {
		return;
	}
	return _.extend(defs, result);
}

var syncWithNotifyMixin = Base => Base.extend({
	getNotifyOptions(method, opts = {}){
		let notify$$1 = convertOptionsToNotify(opts);
		let schema = store.get(this);
		if (schema) {
			let notifies = schema.getOption('notifies') || {};
			let byMethod = notifies[method];
			notify$$1 = _.extend({}, byMethod, notify$$1);
		}

		if(!_.size(notify$$1)) {
			return;
		} else {
			return notify$$1;
		}


	},
	sync(method, model, options){
		let notifyOptions = this.getNotifyOptions(method, options);
		let note;
		if(notifyOptions && notifyOptions.wait){
			note = notify.wait(notifyOptions.wait);
		}
		let xhr = Base.prototype.sync.apply(this, arguments);
		if (!notifyOptions) {
			return xhr;
		}
		xhr.then(
			() => {
				if (!notifyOptions.success) {
					if (note) {
						note.removed();
					}
					return;
				}
				if (note) {
					notifyOptions.success.id = note.id;
				}
				notify.success(notifyOptions.success);
			},
			xhr => {
				if (!notify.error) {
					if (note) {
						note.removed();
					}
					return;
				}
				if (note) {
					notifyOptions.error.id = note.id;
					notifyOptions.error.xhr = xhr;
				}				
				notify.error(notifyOptions.error);				
			}
		);
		return xhr;
	}
});

function createExec(actionInstance, actionMethod){
	return function exec(instance, ...args){
		let decline = actionInstance.isNotAllowed(instance, args);
		if (decline) {
			return actionInstance.onExecuteNotAllowed(instance, decline, args);
		}
		
		if (_.isFunction(actionMethod)) {
			return instance ? actionMethod.apply(instance, args) : actionMethod(...args);
		}
		else {
			return actionInstance.onActionMissing(instance);
		}
	};
}


const ActionModel = Model.extend({
	constructor(attrs, options = {}){
		_.extend(this, _.pick(options, 'action','instance', 'order'));
		Model.apply(this, arguments);
	},
	defaults: {
		name: undefined,
		label: undefined,
		order: 0,
	},
	exec(){
		if (!this.action) {
			throw new Error('no action under the hood');			
		}
		// if(!this.instance) {
		// 	throw new Error('no instance defined');
		// }
		return this.action.exec(this.instance, ...arguments);
	}
});


const instanceProperties = ['name', 'label', 'order', 'hidden'];

const Action = BaseClass.extend({
	constructor(options = {}){
		let { action } = options;
		delete options.action;
		_.extend(this, _.pick(options, ...instanceProperties));
		
		this.options = _.omit(options, ...instanceProperties);
		
		BaseClass.apply(this, arguments);

		this.exec = createExec(this, action);
	},

	getOption(key){
		return getByPath(this.options, key);
	},

	getLabel(){ return this.label || this.name; },

	is (arg) { return this == arg || this.name == arg; },
	isVisible () { return this.hidden !== true; },
	isHidden () { return this.hidden == true; },
	
	isNotAllowed () { },
	onExecuteNotAllowed () { },
	onActionMissing () { },

	toModel(instance, attrs) {
		// if (instance == null)  {
		// 	throw new Error('instance undefined and action model must have one');
		// }
		let hash = _.extend({
			id: this.name, 
			label: this.getLabel(), 
			order: this.order 
		}, attrs);

		let options =  { 
			action: this, 
			order: this.order,
			instance
		};

		return new ActionModel(hash, options);
	}
});

const BaseActionStore = BaseClass.extend({
	constructor(options = {}){
		BaseClass.apply(this, arguments);
		_.extend(this, options);
		if(!_.isFunction(this.buildAction)){
			this.buildAction = i => i;
		}
		this.actions = [];
		this.actionsByNames = [];
	},
	buildAction: raw => raw,
	registerActions(raw){
		_.each(raw, item => this.registerAction(item));
	},
	registerAction(raw){
		let { actionsByNames, buildAction, Action: Action$$1 } = this;
		let options = _.pick(this, 'name', 'ctor', 'Action');

		let action = this.buildAction(raw, options);
		if(_.isFunction(buildAction)){
			action = buildAction(action, options);
		}
		if (!action.name) return;
		if(!(action instanceof Action$$1)){
			action = new Action$$1(action);
		}

		if (!(action.name in actionsByNames)) {
			actionsByNames[action.name] = action;
			this.actions.push(action);
		}
	}
});


const store$2 = new ClassStore({
	Action: Action,
	ctorNameKey: '__actionsStoreName',
	instanceNameKey: '__actionsStoreName',
	onExists: () => false,
	buildStore(context, actions = [], { Action: Action$$1, buildAction } = {}) {
		Action$$1 || (Action$$1 = this.Action);
		let { ctor, name } = context;
		let store = new BaseActionStore({ name, ctor, buildAction, Action: Action$$1 });
		store.registerActions(actions);		
		return store;
	},

	initialize(){
		let store = this.createStore(...arguments);
		return store.schema;
	},
	_preInit(arg, args){
		let store = this.getStore(arg);
		if(!store) {
			store = this.createStore(arg, [], ...args);
		}
		return store;
	},
	registerActions(arg, actions, ...createArguments){
		let store = this._preInit(arg, createArguments);
		store.registerActions(actions);
	},
	registerAction(arg, action, ...createArguments){
		let store = this._preInit(arg, createArguments);
		store.registerAction(action);
	},	

	getActions(arg, options = {}){
		let cache = this.getStore(arg);
		if(!cache) return [];
		var actions = _.filter(cache.actions, (action, index$$1) => this.filter(action, index$$1, options));
		let { asModels, instance } = options;
		if (asModels) {
			return _.map(actions, action => action.toModel(instance));
		}
		return actions;
	},
	getAction(store, action){
		let cache = this.getStore(store);
		if (!cache) return;
		let name = _.isString(action) ? action : action.name;
		return cache.actionsByNames[name];
	},
	exec(store, action, instance, ...args) {
		let found = this.getAction(store, action);
		if (!found) {
			throw new Error('action not found:' + action);
		} else {
			return found.exec(instance, ...args);
		}
	},
	filter: () => true,	
});

function getFromPrototypes(instance, property, { exclude, process } = {}) {
	if(exclude && !_.isArray(exclude)) {
		exclude = [exclude];
	}
	if(!_.isFunction(process)) {
		process = value => value;
	}
	let prototype = instance.__proto__;
	let result = [];
	while(prototype){
		let value = prototype[property];
		prototype = prototype.__proto__;

		if (value == null) { continue; }

		if(exclude && exclude.indexOf(value) > -1) { continue; }
		
		value = process(value);
		if(value != null) {
			result.push(value);
		}
	}
	return result;
}


function isProtoActionsRegistered(instance){
	return instance.constructor.__protoActionsTaked == true;
}
function setProtoActionsAsRegistered(instance) {
	instance.constructor.__protoActionsTaked = true;
}


var actionableMixin = Base => Base.extend({
	_actionableMixin: true,
	inheritActions: false,
	ActionClass: undefined,

	_initializeActionableActions(){
		let protoActionsTaked = isProtoActionsRegistered(this);
		if (protoActionsTaked) return;

		let instance = betterResult(this, 'actions', { args: [this], default: [] });
		let inherited = [];
		if (this.inheritActions) {
			let protoActions = getFromPrototypes(this, 'actions', {
				exclude: this.actions,
				process: actions => betterResult({ actions }, 'actions', { args: [this], default: [] })
			});
			inherited.push(..._.flatten(protoActions));
			inherited = _.filter(inherited, f => f != null);
		}
		let rawactions = [...inherited, ...instance];

		this.registerActions(rawactions);
		setProtoActionsAsRegistered(this);

	},

	buildStoreAction: action => action,
	getActions(options = {}){
		this._initializeActionableActions();
		let actions = store$2.getActions(this, _.extend({ instance: this }, options));
		return actions;
	},

	registerActions(actions){
		store$2.registerActions(this, actions, {
			Action: this.ActionClass,
			buildAction: raw => this.buildStoreAction(raw),				
		});
		// if(this._actionableActionsInitialized || this._isActionsRegistered()) {
		// 	ActionStore.registerActions(this, actions);
		// } else {
		// 	this._actionsWaitingForRegister || (this._actionsWaitingForRegister = []);
		// 	this._actionsWaitingForRegister.push(...actions);
		// }
	},
	registerAction(...action){
		if(!action) return;
		return this.registerActions(action);
	},
	hasAction(arg, options){
		let action = this.getAction(arg, options);
		return !!action;
	},
	getAction(arg, options){
		let actions = this.getActions(options);
		let iteratee = _.isString(arg) ? { name: arg } : { name: arg.name };
		return _.findWhere(actions, iteratee);
	},
	executeAction(action, ...rest){
		this._initializeActionableActions();
		return store$2.exec(this.actionsStoreName || this, action, this,  ...rest);
	},
}, { ActionableMixin: true });

function action(name, label, action, options = {}){
	// args: {}
	if (!_.isFunction(name) && _.isObject(name)) {
		return name;
	} 
	// args: "", ()
	else if (_.isFunction(label)) {
		let o = { name, action: label };
		return _.extend(o, action);
	} 
	// args: (), {}
	else if (_.isFunction(name) && _.isObject(label)) {

		return _.extend({ action: name }, label);

	}
	// args: "", "", (), {}
	return _.extend({}, options, { name, label, action });
}

const CloseButtonView = ExtView.extend({
	tagName: 'button',
	template: () => '<i></i>',
});

const ButtonView = ExtView.extend({
	tagName:'button',
	template: _.template('<i></i><span><%= text %></span><i></i>'),
	triggers:{
		'click':'click'
	},
	templateContext(){
		return {
			text: this.getOption('text')
		};
	}
});


const TextView$1 = ExtView.extend({
	template: _.template('<%= text %>'),
	templateContext(){
		return {
			text: this.getOption('text', { args: [ this ]})
		};
	}
});

const BaseModalView = mix(ExtCollectionVIew).with(destroyViewMixin);

const ModalView = BaseModalView.extend({
	constructor({ promise } = {}){
		BaseModalView.apply(this, arguments);
		if (promise) {
			this._isPromise = true;
			this.promise = new Promise((resolve, reject) => {
				this._resolve = resolve;
				this._reject = reject;
			});
		}
	},
	wrapContent: true,
	
	childViewContainer: '[data-modal-content]',
	renderAllCustoms: true,
	
	renderCollection: false,
	viewComparator: false,

	templateContext(){
		return {
			shouldWrapContent: this.getOption('wrapContent') === true,
		};
	},

	events:{
		'click'(event){
			if(this.getOption('preventRemove')) {
				return;
			}
			let $el = $(event.target);
			event.stopPropagation();
			if ($el.closest('[data-modal-content]').length) {
				return;
			}
			this.destroy();
		},
		'click [data-modal-close]'(event){
			event.stopPropagation();
			event.preventDefault();
			this.destroy();
		}
	},
	customs:[
		(v) => v.createCloseButton(),
		(v) => v.takeOptionsView('header'),
		(v) => v.takeOptionsView('content'),
		(v) => v.takeOptionsView('footer'),
	],
	createCloseButton(){
		if (this.getOption('closeButton') === false || this.getOption('preventRemove')) {
			return;
		}

		let Button = this.getOption('CloseButtonView');

		if (!isViewClass(Button)) {
			throw new Error('closeButtonView not defined, use `closeButton: false` or pass button view in options');
		}

		return new Button({ attributes: { 'data-modal-close':'' } });
	},
	defsOptionsForView(name, opts){
		let defs = {};
		if (name == 'footer' && this._isPromise) {
			defs = {
				resolve: this.getOption('confirmLabel'),
				rejectSoft: this.getOption('cancelLabel'),
			};
		}
		return _.extend({}, opts, defs);
	},
	takeOptionsView(key){
		let tagName = ['header','footer'].indexOf(key) > -1 ? key : 'div';
		let TextView$$1 = this.getOption('TextView');
		let options = this.defsOptionsForView(key,{ tagName });
		let view = buildViewByKey(this, key, { TextView: TextView$$1, options });

		if(key === 'footer' && !view){
			if (this.getOption('promiseBar')) {
				view = new FooterView(options);
				this.listenTo(view, {
					'resolve': () => {
						this.triggerMethod('resolve', this.modalChildren.content);
						this.destroy();
					},
					'reject': () => {
						this.triggerMethod('reject', this.modalChildren.content);
						this.destroy();
					},
				});
			}
		}

		!this.modalChildren && (this.modalChildren = {});
		this.modalChildren[key] = view;
		if (key === 'content') {
			this._initContentListeners(view);
		}
		if (this._isPromise && (key === 'footer' || key == 'content')) {
			this._initPromiseListeners(view);
		}
		return view;
	},
	_initPromiseListeners(view){
		this.listenTo(view, {
			'resolve': arg => this.resolve(arg),
			'reject': arg => this.reject(arg),			
		});
	},
	_initContentListeners(content){
		this.listenTo(content, {
			'destroy': () => this.destroy(),
			'done': () => this.destroy(),
		});
	},
	resolve(arg){
		this._resolve(arg);
		this.promiseState = 'fulfilled';
		if (!this._isDestroying && !this._isDestroyed){
			this.destroy();
		}
	},
	reject(arg){
		this._reject(arg);
		this.promiseState = 'rejected';
		if (!this._isDestroying && !this._isDestroyed){
			this.destroy();
		}
	},
	onDestroy(){
		if(this._isPromise && !this.promiseState) {
			this.reject();
		}
	},
	attributes:{
		'data-modal': ''
	},
});


const FooterView = ExtCollectionVIew.extend({
	renderAllCustoms: true,
	tagName:'footer',
	attributes:{
		'data-modal-content-footer':'confirm'
	},
	customs:[
		v => v.getResolveView(),
		v => v.getRejectView(),
	],
	getResolveView(){
		let text = this.getOption('resolveText');
		let view = new ButtonView({
			text,
			onClick: () => this.triggerClick(true)
		});
		return view;
	},
	getRejectView(){
		let text = this.getOption('rejectText');
		let view = new ButtonView({
			text,
			onClick: () => this.triggerClick(false)
		});
		return view;
	},
	triggerClick(resolve){
		let event = resolve ? 'resolve' : 'reject';
		let arg = this.getOption(event + 'With');
		this.trigger(event, arg);
	}
});

var config$1 = {
	
	template: _.template(`
<div data-modal-bg></div>
<% if(shouldWrapContent) {%><div data-modal-content-wrapper><%} %>
<section data-modal-content></section>
<% if(shouldWrapContent) {%></div><%} %>
`),

	confirmResolveText: 'confirm',
	confirmRejectText: 'cancel',
	TextView: TextView$1,
	ModalView,
	CloseButtonView,

	buildView(options, showOptions = {}){

		let ModalView$$1 = takeFirst('ModalView', options, showOptions, this);
		let TextView = takeFirst('TextView', options, showOptions, this);
		let CloseButtonView$$1 = takeFirst('CloseButtonView', options, showOptions, this);		
		
		options = _.extend({ 
			TextView, 
			CloseButtonView: CloseButtonView$$1,
			template: this.template,
		}, options);

		return new ModalView$$1(options);
	},

	render(view, stack, options = {}){

		let el = _.result(this, 'container');
		if(el && el.jquery){
			el = el.get(0);
		}
		options = _.extend({ 
			el, replaceElement: true, destroyOnEmpty: true,			
		}, options);

		renderInNode(view, options);

		if (stack) {
			let { preventRemove } = options;
			_.defer(() => stack.add(view, { preventRemove }));
		}
	},
	container: () => document.querySelector('body'),
	stackOptions: {
		removeOnEsc: true,
		removeOnOutsideClick: true,
	},
	getStack(options){
		if (!this.stack) {
			let stackOptions = this.stackOptions || options;
			this.stack = new Stack(stackOptions);
		}
		return this.stack;
	}
};

function show(opts = {}, showOptions = {}){
	if(isView(opts)){
		opts = {
			content: opts
		};
	}
	if(!opts.attributes){
		opts.attributes = {
			'data-modal': opts.modalType || ''
		};
	}

	let modal = config$1.buildView(opts, showOptions);


	config$1.render(modal, config$1.getStack(), showOptions);

	if (showOptions.returnAsPromise && opts.promise) {
		return modal.promise;
	} else {
		return modal;
	}


}


function normalizeConfirmFooter(opts = {}){
	if (!opts.footer) {
		opts.footer = FooterView;
	}

	if(!opts.footerOptions) {
		opts.footerOptions = {};
	}

	let fopts = opts.footerOptions;
	fopts.resolveWith = takeFirst('resolveWith', fopts, opts);
	fopts.rejectWith = takeFirst('rejectWith', fopts, opts);
	fopts.resolveText = takeFirst('resolveText', fopts, opts) || config$1.confirmResolveText;
	fopts.rejectText = takeFirst('rejectText', fopts, opts) || config$1.confirmRejectText;	
	return opts;
}

function confirm(arg, showOptions = {}) {
	if (_.isString(arg)) {
		arg = {
			content: arg
		};
	} else if (!_.isObject(arg)) {
		arg = {};
	}
	if(arg.text && !arg.content) {
		arg.content = arg.text;
	}
	arg.promise = true;
	if(showOptions.returnAsPromise == null) {
		showOptions.returnAsPromise = true;
	}
	arg.modalType = 'confirm';
	arg = normalizeConfirmFooter(arg);

	return show(arg, showOptions);
}


var modals = {
	config: config$1,
	show,
	confirm
};

const initSelectorMixin = Base => Base.extend({
	constructor(){
		Base.apply(this, arguments);
		this._initializeSelector();
	},
	getSelector(){
		return this.getOption('selector');
	},	
	buildChildView(child, ChildViewClass, childViewOptions = {}){
		let selector = this.getSelector();
		if(selector) {
			_.extend(childViewOptions, {
				selectable: true,
			});
		}
		let view = Base.prototype.buildChildView(child, ChildViewClass, childViewOptions);
		if(selector) {
			if (view.addCssClassModifier) {
				view.addCssClassModifier(m => selector.isSelected(m) ? 'selected' : '');
			}
			this.listenTo(view, 'toggle:select', this._handleChildviewToggleSelect);
		}
		return view;
	},
	_initializeSelector(){
		if (this._selectorMixinInitialized) return;
		let selector = this.getSelector();
		if(selector){
			this.listenTo(selector, 'change', changes => {
				_.invoke(changes.selected, 'trigger', 'change');
				_.invoke(changes.unselected, 'trigger', 'change');
				this.triggerMethod('selector:change');
			});
		}
		this._selectorMixinInitialized = true;
	},
	_handleChildviewToggleSelect(arg1, arg2) {
		let view = isView(arg1) ? arg1 : arg2;
		let event = isView(arg1) ? arg2 : arg1;
		
		event && event.stopPropagation && event.stopPropagation();

		let selector = this.getSelector();
		if (!selector.isMultiple() || !this.lastClickedModel || !event.shiftKey) {
			this.lastClickedModel = view.model;
			selector.toggle(view.model);
		} else {
			let lastclicked = this.lastClickedModel;
			delete this.lastClickedModel;
			selector.toggleRange(view.model, lastclicked);
		}
	}
});

const trueFilter = () => true;

const BaseSelector = mix(BaseClass).with(Events);

const Selector = BaseSelector.extend({
	constructor(options = {}){
		this.options = _.clone(options);
		mergeOptions.call(this, options, 'source', 'extractValue', 'sourceFilter');
		this._isMultiple = options.multiple === true;
		BaseSelector.apply(this, arguments);
		this._initializeSource();
		this._createCollections();
		this._setupModel();
	},
	sourceFilter: trueFilter,
	setSourceFilter(filter){
		if (!_.isFunction(filter)) {
			filter = trueFilter;
		}
		if(filter != this.sourceFilter){
			this.sourceFilter = filter;
			this._updateAll();
		}
	},
	setSourceModels(models){
		this._updateAll(models);
	},
	getSourceModels(){
		return this.source.filter(this.sourceFilter);
	},
	_initializeSource(){
		if (!_.isObject(this.source)) {
			this.source = new Collection();
			return;
		} else if(isCollection(this.source)) {
			return;
		}
		
		let models = _.map(this.source, (value, ind) => {
			if(_.isObject(value)) {
				return value;
			} else {
				return {id : ind, value };
			}
		});
		this.source = new Collection(models);
		if(this.options.extractValue == null) {
			this.extractValue = model => model.id;
		}
	},
	_createCollections(){
		let initialSelected = this.options.value == null ? [] : this.options.value;
		if(!_.isArray(initialSelected)) {
			initialSelected = [initialSelected];
		}
		let models = this.getSourceModels();
		this.all = new Collection(models);
		this.listenTo(this.source, 'update reset', this._updateAll);

		let selected = _.reduce(initialSelected, (memo, initial) => {
			let found = this.all.get(initial);
			if(found) {
				memo.push(found);
			}
			return memo;
		}, []);
		this.selected = new Collection(selected);
	},
	_updateAll(col){
		let models = col && col.models;
		if(!models) {
			models = this.getSourceModels();
		}
		this.all.set(models, { remove: true, add: true, merge: true});
	},
	_setupModel(){
		this.model = new Model();
		this.model.clear = () => this.clear();
		this.on('change', () => {
			this.model.set('count', this.getCount());
		});
	},

	isSelected(arg){
		return this.selected.has(arg);
	},	
	isMultiple(){
		return this._isMultiple;
	},
	getCount(){
		return this.selected.length;
	},
	getCollection(){
		return this.all;
	},
	getCollections(){
		return {
			collection: this.all,
			selected: this.selected
		};
	},

	_trigger(event, model, { silent, silentChange, changes } = {}){
		if (silent) { return; }
		let value = this.extractValue(model);
		this.trigger(event, value);
		if (!silentChange) {
			let mass = {
				[event]: [model]
			};
			if (changes && changes.unselected) {
				mass.unselected || (mass.unselected = []);
				mass.unselected.push(...changes.unselected);
			}
			if (changes && changes.selected) {
				mass.selected || (mass.selected = []);
				mass.selected.push(...changes.selected);
			}
			this._triggerChange(mass);
		}
	},
	_triggerChange({ selected = [], unselected = [] } = {}){
		if (selected.length + unselected.length) {
			this.trigger('change', { selected, unselected }, this.getCount());
		}
	},
	unselect(arg){		
		let model = this.all.get(arg);
		if(!model) return;
		return this._unselect(model);
	},
	_unselect(model, options){
		let exist = this.selected.has(model);
		if (!exist) return;
		let affected = this.selected.remove(model);
		this._trigger('unselected', model, options);
		return affected;
	},

	select(arg){
		let model = this.all.get(arg);
		if(!model) return;
		return this._select(model);
	},
	_select(model, options = {}){
		let exist = this.selected.has(model);
		if (exist) return;
		
		let affected;

		if (this.isMultiple()) {
			affected = this.selected.add(model);
		} else {
			let current = this.selected.first();
			let unselected = [];
			if (current == exist) { return; }

			if (current) {
				let uns = this._unselect(current, _.extend({}, options, { silentChange: false }));
				unselected.push(uns);
			}

			affected = this.selected.set(model, { remove: true, merge:true, add:true });
			options.changes || (options.changes = {});
			options.changes.unselected || (options.changes.unselected = []);
			options.changes.unselected.push(...unselected);
		}
		this._trigger('selected', model, options);
		return affected;
	},

	toggle(arg){
		let model = this.all.get(arg);
		if(!model) return;
		return this._toggle(model);
	},
	_toggle(model, options){
		let affected;
		let key;
		let result = { selected: [], unselected: [] };
		if(this.selected.has(model)){
			affected = this._unselect(model, options);
			key = 'unselected';
		} 
		else {
			affected = this._select(model, options);
			key = 'selected';
		}
		result[key].push(affected);
		return result;
	},

	_processRange(from, to, takeAction){
		from = this.all.get(from);
		to = this.all.get(to);
		if(!from || !to) return;
		let _toIndex = this.all.indexOf(to);
		let indexes = [this.all.indexOf(from), _toIndex];
		let fromIndex = _.min(indexes);		
		let toIndex = _.max(indexes);
		let processed = [];
		for(let x = fromIndex; x <= toIndex; x++){
			if(x === _toIndex) continue;

			let model = this.all.models[x];
			if(!model) continue;
			let affected = takeAction(model);
			processed.push(affected);
		}
		return processed;
	},

	selectRange(from, to) {
		let result = { selected: [], unselected: [] };
		let actionOptions = { silent: true };
		let action = model => {
			let affected = this._select(model, actionOptions);
			if (affected) {
				result.selected.push(affected);
			}
			return affected;
		};
		this._processRange(from, to, action);
		this._triggerChange(result);
		return result;
	},
	unselectRange(from, to) {
		let result = { selected: [], unselected: [] };
		let actionOptions = { silent: true };
		let action = model => {
			let affected = this._unselect(model, actionOptions);
			if (affected) {
				result.unselected.push(affected);
			}
			return affected;
		};
		this._processRange(from, to, action);
		this._triggerChange(result);
		return result;
	},
	toggleRange(from, to) {
		let result = { selected: [], unselected: [] };
		let actionOptions = { silent: true };
		let action = model => {
			let toggled = this._toggle(model, actionOptions);
			result.selected.push(...toggled.selected);
			result.unselected.push(...toggled.unselected);
			return toggled;
		};
		this._processRange(from, to, action);
		this._triggerChange(result);
		return result;
	},
	clear(){
		let result = {
			unselected: _.clone(this.selected.models),
		};
		this.selected.reset();
		this._triggerChange(result);
	},

	getValue(){
		let results = this.selected.map(model => this.extractValue(model));
		if (this.isMultiple()){
			return results;
		} 
		else {
			return results[0];
		}
	},

	extractValue(model) {
		return model;
	}

});

function get(router) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var key = arguments[2];
	var update = arguments[3];


	var value = betterResult(opts, key, { context: router, args: [router] });
	if (value == null) {
		value = router.getOption(key, { args: [router] });
		if (update) opts[key] = value;
	}
	return value;
}

// converts route method arguments to plain object;
// _normalizeRegisterRouteArguments
// { route, rawRoute, callback, name }
function routeArgumentsToObject(router, route, name, callback) {
	var opts = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};


	var context = {};

	if (_.isObject(route)) {
		context = route;

		//then second argument is probably options;
		_.extend(opts, name);
	} else if (_.isFunction(name)) {
		_.extend(context, { route: route, callback: name, name: _.uniqueId('routerAction') });
	} else {
		_.extend(context, { route: route, name: name, callback: callback });
	}

	var isRouterHoldsActions = get(router, opts, 'isRouterHoldsActions', true);

	// last chance to get callback from router instance by name
	// this behavior can be disabled through `isRouterHoldsActions` options
	if (!_.isFunction(context.callback) && isRouterHoldsActions && _.isFunction(router[context.name])) {

		context.callback = router[context.name];
	}

	//store original route
	context.rawRoute = context.route;

	!context.name && (context.name = _.uniqueId('routerAction'));

	//converts route to RegExp pattern
	if (!_.isRegExp(context.route)) context.route = router._routeToRegExp(context.route);

	// by default backbone router wraps every callback with own wrapper
	// which in turn call actual callback with correct arguments on route
	// this callback was inlined and can not be overrided, so now its possible	
	context.callbackWrapper = _.bind(router._processCallback, router, context);

	return context;
}

function createActionContext(router, routeContext, fragment) {
	var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


	var rawArgs = router._extractParameters(routeContext.route, fragment);

	var result = _.extend({}, routeContext, { fragment: fragment, rawArgs: rawArgs }, options, { options: options });

	var args = rawArgs.slice(0);
	var queryString = args.pop();

	_.extend(result, { qs: prepareActionQueryString(router, queryString) });
	_.extend(result, { args: prepareActionArguments(routeContext.rawRoute, args) });

	if (result.routeType == null) {
		result.routeType = 'route';
	}

	return result;
}

function prepareActionQueryString(router, queryString) {
	if (_.isString(queryString)) return router.queryStringParser(queryString);else return {};
}

function prepareActionArguments(rawRoute, args) {

	var params = rawRoute.match(/:([^/|)]+)/g) || [];

	var res = {};
	_(params).each(function (name, index$$1) {
		name = name.substring(1);

		if (args == null) return;

		if (name in res && _.isArray(res[name])) res[name].push(args[index$$1]);else if (name in res && !_.isArray(res[name])) res[name] = [res[name]].concat(args[index$$1]);else res[name] = args[index$$1];
	});
	return res;
}

function toPromise(arg) {
	var resolve = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

	if (arg instanceof Promise || arg && _.isFunction(arg.then)) return arg;else if (arg instanceof Error) return Promise.reject(arg);else return resolve ? Promise.resolve(arg) : Promise.reject(arg);
}

function getCallbackFunction(callback, executeResult) {
	return function () {
		try {
			executeResult.value = callback && callback.apply(undefined, arguments);
		} catch (exception) {
			executeResult.value = exception;
		}
		executeResult.promise = toPromise(executeResult.value);
		return executeResult.value;
	};
}

function processCallback(router, actionContext, routeType) {

	var args = router.getOption('classicMode') ? actionContext.rawArgs || [] : [actionContext];

	var asPromise = router.getOption('callbackAsPromises');
	var executeResult = {};
	var callback = getCallbackFunction(actionContext.callback, executeResult, asPromise);

	router.triggerEvent('before:' + routeType, actionContext);

	var shouldTriggerEvent = router.execute(callback, args);
	if (shouldTriggerEvent !== false) {
		router.triggerEvent(routeType, actionContext);
		if (routeType == 'route' || routeType == 'backroute') router.lastAttempt = actionContext;
		history.actionContext = actionContext;
	}

	executeResult.promise.then(function (arg) {
		router.triggerEvent('after:' + routeType, actionContext);
		return arg;
	}, function (error) {
		router.triggerEvent('error:' + routeType, error, actionContext);
		router.handleError(error, actionContext);
	});

	return executeResult.value;
}

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//import $ from 'jquery';

var routeErrorHandler = {
	handlers: {
		'js:error': function jsError(error) {
			throw error;
		}
	},
	handle: function handle(error, context, args) {
		var _this = this;

		var handlers = this._getHandleContext(error, context, args) || {};
		return _(handlers).some(function (options, key) {
			return _this.applyHandler(key, options);
		});
	},
	applyHandler: function applyHandler(key) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


		var handler = this.getHandler(key, options);
		if (!handler) return;
		var context = options.context,
		    args = options.args;

		return handler.apply(context, args);
	},
	getHandler: function getHandler(key) {
		if (_.isFunction(this.handlers[key])) return this.handlers[key];
	},
	setHandler: function setHandler(key, handler, bindTo) {
		if (!_.isString(key) || key === '') throw new Error('setHandler first argument must be a non empty string');

		if (!_.isFunction(handler)) {
			delete this.handlers[key];
		} else {
			if (bindTo) {
				handler = handler.bind(bindTo);
			}
			this.handlers[key] = handler;
		}
	},
	setHandlers: function setHandlers(hash, bindTo) {
		var _this2 = this;

		var nullable = hash === null;
		var items = nullable && this.handlers || hash;
		if (!_.isObject(items)) return;
		_(items).each(function (handler, key) {
			return _this2.setHandler(key, nullable || handler, bindTo);
		});
	},


	// should return hash: { 'handler_key': { context: handler_context, args: handler_arguments}}
	_getHandleContext: function _getHandleContext(error, context) {
		var _this3 = this;

		var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];


		if (_.isArray(error)) {
			return _(error).reduce(function (memo, item) {
				return _.extend(memo, _this3._getHandleContext(item, context, args));
			}, {});
		}

		if (_.isFunction(this.getHandleContext)) {
			var custom = this.getHandleContext(error, context, args);
			if (custom != null) return custom;
		}

		if (error instanceof Error) {
			args.unshift(error);
			return { 'js:error': { context: context, args: args } };
		} else if (_.isString(error)) {
			return _defineProperty({}, error, { context: context, args: args });
		} else if (error instanceof $.Deferred().constructor) {
			args.unshift(error);
			return { 'jq:xhr': { context: context, args: args } };
		}
	},


	// provide your own arguments processor
	// should return hash: { 'handler_key': { context: handler_context, args: handler_arguments}}
	getHandleContext: undefined

};

//import paramStringToObject from '../../../utils/params-to-object/index.js';
//import { Backbone, Router as BbRouter } from '../../../vendors/backbone.js';

var Router$1 = Router.extend({

	// for migrating from Mn.AppRoute
	// set to true. it will populate routes from { controller, appRoutes } structure.
	isMarionetteStyle: false,

	// by default Backbone.Router tries to lookup callback in router instance by name `callback = this[name]` if there is no callback provided
	// its recomend to turn this feature to false
	// default value is true for Backbone.Router compatability
	isRouterHoldsActions: true,

	// by default Backbone.Router `route` method returns router itself instead of just created routeContext for chaining purposes.
	// you can change this behavior turning this feature to false
	isRouteChaining: true,

	//in classic mode actions receive argument array
	//if you need actionContext instead turn this option to false
	classicMode: true,

	constructor: function constructor() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


		this.options = _.extend({}, _.result(this, 'options'), options);

		Router.apply(this, arguments);
	},
	getOption: function getOption$$1() {
		return getOption.apply(undefined, [this].concat(Array.prototype.slice.call(arguments)));
	},

	triggerMethod: triggerMethod,
	/*
 
 	initialize methods
 	"when a router initialized"
 
 */

	//by default router expects that routes will result in { route, callback } hash
	//we are extending this to provide more flexibility
	// - overrided
	_bindRoutes: function _bindRoutes() {

		var routes = this.getInitRoutes();
		if (!_.size(routes)) return;
		this.addRoutes(routes);
	},
	getInitRoutes: function getInitRoutes() {
		var routes = void 0;
		if (this.getOption('isMarionetteStyle')) {
			var controller = this.getOption('controller') || {};
			var approutes = this.getOption('appRoutes') || {};
			routes = _(approutes).map(function (name, route) {
				return {
					route: route, name: name,
					callback: controller[name]
				};
			});
		} else {
			routes = this.getOption('routes');
		}
		return routes;
	},


	/*
 	manipulating routes
 	adding
 */

	// refactored original route method
	// chain:true by default is for supporting default behavior
	// routerHoldsActions: true - backbone router tries to get callback from router itself if there is no callback provided. 
	// this options allow to support this behavior, but its recomended not to hold action inside router instance
	// - overrided
	route: function route(_route, name, callback) {
		var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


		//normalizing passed arguments and putting them into a context object
		//refactored from original route
		// let context = this._normalizeRegisterRouteArguments(route, name, callback, opts);

		// //extends context with result of `mergeWithRegisterRouteContext`
		// this._normalizeRegisterRouteContext(context);

		// //wrapping provided callback 
		// this._normalizeRegisterRouteCallback(context);

		var context = this._buildRouteContext(_route, name, callback, opts);

		//refactored for providing possibility to override
		//at this point context should be almost ready
		this.registerRouteContext(context);

		this._storeCreatedContext(context, opts);

		return opts.isRouteChaining === true ? this : context;
	},


	// provide more semantic alias for route
	addRoute: function addRoute(route, name, callback) {
		var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

		if (opts.isRouteChaining == null) opts.isRouteChaining = this.getOption('isRouteChaining');

		var context = this.route(route, name, callback, opts);
		return context;
	},


	//process many routes at once
	//accepts object { name, routeContext | handler }
	// or array of routeContexts
	addRoutes: function addRoutes(routes) {
		var _this = this;

		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


		if (opts.isRouteChaining == null) opts.isRouteChaining = this.getOption('isRouteChaining');

		var normalized = _(routes).chain().map(function (value, key) {
			return _this._normalizeRoutes(value, key);
		}).filter(function (f) {
			return _.isObject(f);
		}).value();

		if (opts.doNotReverse != true) normalized.reverse();

		var registered = _(normalized).map(function (route) {
			return route && _this.addRoute(route, _.extend({ massAdd: true }, opts));
		});

		if (opts.doNotReverse != true) registered.reverse();

		_(registered).each(function (c) {
			return _this._storeCreatedContext(c);
		});

		return registered;
	},


	// internal method called by `addRoutes` to normalize provided data
	_normalizeRoutes: function _normalizeRoutes(value, key) {
		//let route, name, callback;
		var context = void 0;
		if (_.isString(value)) {
			context = {
				route: key,
				name: value
			};
		} else if (_.isFunction(value)) {
			context = { route: key, callback: value };
		} else if (_.isObject(value)) {
			context = _.clone(value);
			if (!_.has(context, 'route')) context.route = key;else if (_.has(context, 'route') && !_.has(context, 'name')) context.name = key;
		} else {
			return;
		}
		return context;
	},
	_buildRouteContext: function _buildRouteContext(route, name, callback, opts) {

		var context = routeArgumentsToObject(this, route, name, callback, opts);

		return this.buildRouteContext(context);
	},


	//override this method if you need more information in route context
	// should return object wich will be merged with default context
	// be aware of providing reserved properties: route, name, callback
	// this will override context defaults
	buildRouteContext: function buildRouteContext(context) {
		return context;
	},

	//finally, putting handler to the backbone.history.handlers
	registerRouteContext: function registerRouteContext(context) {
		history.route(context.route, context.callbackWrapper, context);
	},


	//store registered context for further use
	_storeCreatedContext: function _storeCreatedContext(context) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		this.routeContexts || (this.routeContexts = {});
		if (!opts.massAdd) this.routeContexts[context.name] = context;
		return context;
	},


	/*
 
 	process route methods		
 	"when route happens"
 
 */

	//inner route handler
	//preparing actionContext and calls public processCallback
	_processCallback: function _processCallback(routeContext, fragment) {
		var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		var actionContext = createActionContext(this, routeContext, fragment, options);
		actionContext.restart = function () {
			return actionContext.callbackWrapper(fragment, options);
		};
		var result = this.processCallback(actionContext, actionContext.routeType, options);
		return result;
	},


	//by default behave as original router
	//override this method to process action by your own
	processCallback: function processCallback$$1(actionContext, routeType) {

		return processCallback(this, actionContext, routeType);
	},
	handleError: function handleError(error, action$$1) {
		routeErrorHandler.handle(error, this, [action$$1]);
	},


	//just triggers appropriate events
	// triggerRouteEvents(context, event, name, ...args) {
	// 	if (event == 'route') {
	// 		this.lastActionContext = context;
	// 	}
	// 	this.trigger(`${event}:${name}`, ...args);
	// 	this.trigger(event, name, ...args);
	// 	Backbone.history.trigger(event, this, name, ...args);
	// },

	triggerEvent: function triggerEvent(event, context) {
		this.trigger(event, context);
		history.trigger(event, context);
	},


	//converts string to object
	//default implementation, can be overriden by user
	queryStringParserOptions: { complex: true },
	queryStringParser: function queryStringParser(string, opts) {
		var options = _.extend({}, this.getOption('queryStringParserOptions'), opts);
		return paramsToObject$1(string, options);
	},


	// navigate(...args){
	// 	historyNavigate(...args);
	// 	return this;
	// },

	_routeToRegExp: function _routeToRegExp(route) {

		var optionalParam = /\((.*?)\)/g;
		var namedParam = /(\(\?)?:\w+/g;
		var splatParam = /\*\w+/g;
		var escapeRegExp = /[-{}[]+?.,\\\^$|#\s]/g;

		route = route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function (match, optional) {
			return optional ? match : '([^/?]+)';
		}).replace(splatParam, '([^?]*?)');
		var flags = this.getOption('routeCaseInsensitive') ? 'i' : '';
		return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$', flags);
	},


	/*
 	Some API methods
 */

	getContextByFragment: function getContextByFragment(fragment) {
		if (!_.isString(fragment)) return;
		//let contexts = this.routeContexts;
		//console.log('Router contexts', contexts);
		var result = _(this.routeContexts).find(function (cntx) {
			return cntx.route.test(fragment);
		});
		return result;
	}
});

var pathStripper = /#.*$/;

var historyApi = {
	decodeFragment: function decodeFragment(fragment) {
		fragment = history.getFragment(fragment || '');
		fragment = fragment.replace(pathStripper, '');
		return history.decodeFragment(fragment);
	},

	// supports passing options to the callback
	// by using new version of loadUrl	
	navigate: function navigate(fragment, opts) {

		var options = opts === true ? { trigger: true } : _.isObject(opts) ? _.clone(opts) : {};

		var trigger = options.trigger;

		delete options.trigger;

		var decodedFragment = this.decodeFragment(fragment);
		if (history.fragment == decodedFragment) {
			return;
		}

		history.navigate(fragment, options);

		if (trigger) {
			return historyApi.loadUrl(fragment, opts);
		}
	},
	execute: function execute(fragment, opts) {
		fragment = history.fragment = history.getFragment(fragment);

		var executed = historyApi.executeHandler(fragment, opts);
		if (!executed) {
			routeErrorHandler.handle('not:found', opts.context, [fragment]);
		}
		return executed;
	},


	// original loadUrl does not pass options to the callback
	// and this one does
	loadUrl: function loadUrl(fragment) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


		// If the root doesn't match, no routes can match either.
		if (!history.matchRoot()) return false;
		return historyApi.execute(fragment, opts);

		// fragment = history.fragment = history.getFragment(fragment);

		// let executed = historyApi.executeHandler(fragment, opts);
		// if (!executed) {
		// 	errorHandler.handle('not:found', opts.context, [fragment]);
		// }
		// return executed;
	},


	// default test handler
	//TODO: think about constraints check
	testHandler: function testHandler(handler, fragment) {
		return handler.route.test(fragment);
	},


	//also accepts test function, if you wish test handlers by your own
	findHandler: function findHandler(fragment, customTest) {
		var test = _.isFunction(customTest) ? customTest : historyApi.testHandler;
		fragment = history.getFragment(fragment);
		return _.filter(history.handlers || [], function (handler) {
			return test(handler, fragment);
		})[0];
	},
	executeHandler: function executeHandler(fragment) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		var resultContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


		var handler = historyApi.findHandler(fragment, opts.testHandler);

		handler && (resultContext.value = handler.callback(fragment, opts));

		return !!handler;
	},

	// this start replaces native history loadUrl and test handler
	start: function start(options) {

		if (history.loadUrl !== historyApi.loadUrl) history.loadUrl = historyApi.loadUrl;

		var result = history.start(options);

		return result;
	},
	isStarted: function isStarted() {
		return !!history.started;
	},
	getUrlPath: function getUrlPath() {
		return history.fragment.split('?')[0];
	},
	changeUrlQueryString: function changeUrlQueryString(qs) {
		var url = this.getUrlPath();
		if (qs) {
			url = [url, qs].join('?');
		}
		return this.navigate(url, { trigger: false });
	}
};

var Watcher = mix(BaseClass).with(Events).extend({
	constructor: function constructor() {
		BaseClass.apply(this, arguments);
		this.isWatching = false;
		this.entries = [];
	},
	start: function start() {
		if (this.isWatching) return;
		this.isWatching = true;
		this.listenTo(history, 'route', this.onRoute);
		this.listenTo(history, 'backroute', this.onBackRoute);
	},
	stop: function stop() {
		this.stopListening(history);
		this.entries.length = 0;
		this.isWatching = false;
	},

	isActionContext: function isActionContext(cntx) {
		return _.isObject(cntx) && _.isString(cntx.fragment);
	},
	hasElements: function hasElements() {
		return this.entries.length > 0;
	},
	canGoBack: function canGoBack() {
		return this.hasElements();
	},
	onRoute: function onRoute(actionContext) {

		if (!this.isActionContext(actionContext)) return;

		if (this.isActionContext(this.lastElement)) {
			this.entries.push(this.lastElement);
		}
		this.lastElement = actionContext;
	},
	onBackRoute: function onBackRoute(actionContext) {
		if (!this.isActionContext(actionContext) || !this.isActionContext(actionContext.gobackContext)) return;

		var lookFor = actionContext.gobackContext;
		var index$$1 = this.entries.indexOf(lookFor);
		if (index$$1 >= 0) {
			this.entries = this.entries.slice(0, index$$1);
			this.lastElement = lookFor;
		}
	},
	goBack: function goBack() {
		if (!this.canGoBack()) return;
		var last = _.last(this.entries);
		historyApi.navigate(last.fragment, { trigger: true, routeType: 'backroute', gobackContext: last });
	}
});

var historyWatcher = new Watcher();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var PageRouter = Router$1.extend({

	classicMode: false,
	isRouterHoldsActions: false,
	isRouteChaining: false,
	callbackAsPromises: true,
	routeCaseInsensitive: true,

	setTitleOnPageStart: true,

	registerPageRoutes: function registerPageRoutes(page) {
		var _this = this;

		var contexts = page.getRoutesContexts({ reverse: true });
		_.each(contexts, function (context) {
			var callback = function callback() {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				return _this.startPage.apply(_this, [page].concat(args));
			};
			_this.addRoute(context.route, context.name, callback);
		});
	},
	handleError: function handleError(process, action$$1) {
		var args = void 0,
		    error = void 0;

		if (process instanceof Process) {
			args = [].slice.call(process.errors);
			error = args.shift();
			args.push(action$$1);
		} else {
			error = process;
			args = [action$$1];
		}

		routeErrorHandler.handle(error, this, args);
	},
	startPage: function startPage(page) {
		var _this2 = this;

		for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
			args[_key2 - 1] = arguments[_key2];
		}

		return this._beforePageStart(page).then(function () {
			return page.start.apply(page, _toConsumableArray(args));
		}).then(function () {
			return _this2._afterPageStart.apply(_this2, [page].concat(_toConsumableArray(args)));
		});
	},
	_beforePageStart: function _beforePageStart() {
		this.beforePageStart();
		if (this.previousPage && this.previousPage.isStarted()) return this.previousPage.stop();else return Promise.resolve();
	},
	beforePageStart: function beforePageStart() {},
	_afterPageStart: function _afterPageStart(page) {
		this.previousPage = page;
		this.afterPageStart(page);
		this._setPageTitle(page);
	},
	afterPageStart: function afterPageStart() {},
	_setPageTitle: function _setPageTitle(page) {
		if (!this.getOption('setTitleOnPageStart')) {
			return;
		}
		var title = page.getTitle();
		this.setPageTitle(title, page);
	},


	//implement your set title logic here
	//accepts: title, page
	setPageTitle: function setPageTitle(title) {
		document.title = title;
	},
	restartLastAttempt: function restartLastAttempt() {
		if (this.lastAttempt) return this.lastAttempt.restart();
	}
});

var RoutesMixin = {
	initializeRoutes: function initializeRoutes() {
		if (this.initializeRouter()) {
			this._buildRoutesContexts();
		}
	},
	initializeRouter: function initializeRouter() {
		if (this.getOption('shouldCreateRouter') && !this.router) {
			this.router = this._createRouter();
			this._shouldRegisterAllRoutes = true;
		}

		if (this.getOption('shouldRegisterAllRoutes')) {
			this._shouldRegisterAllRoutes = true;
		}

		return !!this.router;
	},
	_createRouter: function _createRouter() {
		var Router$$1 = this.getOption('Router') || PageRouter;
		var options = _.extend({}, this.getOption('routerOptions'));
		return new Router$$1(options);
	},
	registerAllRoutes: function registerAllRoutes() {
		if (!this._shouldRegisterAllRoutes) return;

		var pages = this.getAllChildren({ reverse: true, includeSelf: true, force: true });

		var router = this.router;
		_(pages).each(function (page) {
			return router.registerPageRoutes(page);
		});
	},
	_buildRoutesContexts: function _buildRoutesContexts() {
		var _this = this;

		var routes = this.getOption('routes', { args: [this] });
		if (routes == null) return;
		if (_.isString(routes)) routes = [routes];

		var result = [];
		var config = this.getRoutesConfig();
		_(routes).each(function (route, index$$1) {
			var context = _this._normalizeRoutesContextRoute(route, index$$1, config);
			_.isObject(context) && result.push(context);
		});
		this.routesContext = result;
		return this.routesContext;
	},
	_normalizeRoutesContextRoute: function _normalizeRoutesContextRoute(arg, index$$1) {
		var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		if (arguments.length < 2) {
			config = this.getRoutesConfig();
		}
		var context = { page: this };
		if (arg == null) return;
		if (_.isString(arg)) {
			_.extend(context, { route: arg, rawRoute: arg });
		} else if (_.isFunction(arg)) {
			arg = arg.call(this, this, index$$1);
			return this._normalizeRoutesContextRoute(arg, index$$1);
		} else {
			_.extend(context, arg);
		}
		var name = _.isString(index$$1) && index$$1 || context.name || context.route || _.uniqueId('route');
		context.name = name;

		if (_.isNumber(index$$1) && context.order == null) context.order = index$$1;

		if (!context.rawRoute) context.rawRoute = context.route;

		if (config.relative && config.parentContext && config.parentContext.route) context.route = config.parentContext.route + '/' + context.route;

		context.getUrl = function () {
			var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			return this.route.replace(/:([^/?]+)/, function (found, group) {
				return data[group];
			});
		};

		return context;
	},
	getRoutesConfig: function getRoutesConfig() {
		var config = _.extend({
			relative: this.getOption('relativeRoutes', { args: [this] }),
			parent: this.parent,
			parentContext: this.parent && _.isFunction(this.parent.getMainRouteContext) && this.parent.getMainRouteContext()
		}, this.getOption('routesConfig', { args: [this] }));

		return config;
	},
	getRoutesContexts: function getRoutesContexts() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var clone = opts.clone,
		    reverse = opts.reverse;

		var result = this.routesContext || [];
		if (clone || reverse) result = [].slice.call(result);
		if (reverse) result.reverse();
		return result;
	},
	getMainRouteContext: function getMainRouteContext() {

		if (this.mainRouteContext) return this.mainRouteContext;
		this.mainRouteContext = _(this.getRoutesContexts()).chain().sortBy(function (a, b) {
			return comparator([[b, a, function (c) {
				return c.main;
			}], [a, b, function (c) {
				return c.order;
			}]]);
		}).take(1).value()[0];

		return this.mainRouteContext;
	}
};

function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var BasePage = mix(newObject).with(childrenableMixin, startableMixin, RoutesMixin);

var Page = BasePage.extend({
	constructor: function constructor() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		BasePage.apply(this, arguments);

		//root and parent is childrenable options
		this.mergeOptions(opts, ['app', 'router', 'canNotStart', 'onStart', 'onBeginStart', 'onBeforeStart', 'onEndStart', 'onStop', 'onBeginStop', 'onBeforeStop', 'onEndStop']);

		// resides in routes-mixin
		this.initializeRoutes();

		// resides in ChildrenableMixin
		this.initializeChildren();

		// resides in routes-mixin
		this.registerAllRoutes();

		this.initializeEvents();
	},
	getOption: function getOption$$1() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return getOption.apply(undefined, [this].concat(_toConsumableArray$1(args)));
	},
	getLabel: function getLabel(data) {
		var result = this.getOption('label', { args: [this, data] });
		return result;
	},
	getTitle: function getTitle(data) {
		var result = this.getOption('title', { args: [this, data] });
		return result || this.getLabel(data);
	},
	getMenuLabel: function getMenuLabel(data) {
		var result = this.getOption('menuLabel', { args: [this, data], default: this.getLabel(data) });
		return result;
	},
	buildChildOptions: function buildChildOptions(options) {
		var root = this.getRoot();
		var defs = {
			root: root,
			parent: this.parent,
			router: this.router,
			app: this.app
		};
		var result = _.extend(defs, options);
		return result;
	},
	getSiblings: function getSiblings() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


		var parent = this.getParent();
		var options = _.extend({ exclude: [this] }, opts);
		return parent && parent.getChildren(options) || [];
	},
	getHashes: function getHashes(data) {
		var page = this;
		var parentHash = false;
		if (this.isEntityPage) {
			page = page.getParent();
			parentHash = true;
		}
		return this._getPageHashes(page, data, parentHash);
	},
	_getPageHashes: function _getPageHashes(page, data, isParentHash) {
		var parent = page.getParent();
		var root = page.getRoot();

		return {
			isParentHash: isParentHash,
			path: page.getPathHash(data),
			this: page.getHash(data),
			root: root && root.getHash && root.getHash(data) || undefined,
			parent: parent && parent.getHash && parent.getHash(data) || undefined,
			children: page.getChildrenHashes(data),
			siblings: page.getSiblingsHashes(data)
		};
	},
	getPathHash: function getPathHash(data) {
		var self = this.getHash(data);
		var path = [self];
		var parent = this.getParent();
		if (parent && _.isFunction(parent.getPathHash)) {
			path.unshift.apply(path, _toConsumableArray$1(parent.getPathHash(data)));
		}
		return path;
	},
	getChildrenHashes: function getChildrenHashes(data) {
		return this.getChildren({ map: function map(i) {
				return i.getHash(data);
			}, visible: true });
	},
	getSiblingsHashes: function getSiblingsHashes(data) {
		return this.getSiblings({ map: function map(i) {
				return i.getHash(data);
			}, visible: true });
	},
	getRoot: function getRoot() {
		if (this.root === true) {
			return this;
		} else {
			return this.root;
		}
	},
	getAllPages: function getAllPages() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


		var options = _.extend({}, opts, { includeSelf: true });
		delete options.map;
		var pages = this.getRoot().getAllChildren(options);

		if (_.isFunction(opts.map)) {
			return _(pages).chain().map(opts.map).filter(function (f) {
				return !!f;
			}).value();
		} else {
			return pages;
		}
	},
	getAllHashes: function getAllHashes() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var options = _.extend({ map: function map(i) {
				return i.getHash();
			}, visible: true }, opts);
		return this.getAllPages(options);
	},
	getHash: function getHash(data) {
		var context = this.getMainRouteContext();

		if (!_.isObject(context)) return;

		var parent = this.getParent();
		var parentCid = parent && parent.cid || undefined;
		return {
			cid: this.cid,
			parentCid: parentCid,
			label: this.getMenuLabel(data),
			order: this.order,
			route: context.route,
			url: data ? context.getUrl(data) : context.route
		};
	},
	_childFilter: function _childFilter(item, index$$1) {
		var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		var base = BasePage.prototype._childFilter;
		if (base && !base.apply(this, arguments)) return;

		var visible = opts.visible;


		if (item.isEntityPage) return;

		if (visible && (item.visible === false || item.hidden === true)) return;

		return item;
	},
	initializeEvents: function initializeEvents() {
		var _this = this;

		if (this._triggerOnParentInitiallized) return;

		var triggersOn = [];
		if (this.app) {
			triggersOn.push(this.app);
		}
		if (this.router) {
			triggersOn.push(this.router);
		}
		var events = ['start', 'stop'];
		_.each(events, function (event) {
			_this.on(event, function () {
				for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
					args[_key2] = arguments[_key2];
				}

				_.each(triggersOn, function (parent) {
					parent.triggerMethod.apply(parent, ['page:' + event, _this].concat(args));
				});
			});
		});

		this._triggerOnParentInitiallized = true;
	},
	getView: function getView(opts) {
		var options = _.extend({ model: this.model, collection: this.collection, page: this }, opts);
		return this.buildView(options);
	},

	//good place to override build options, or build itself
	buildView: function buildView(options) {
		return this._buildViewByKey(options);
	},
	_buildViewByKey: function _buildViewByKey(options) {
		var view = buildViewByKey(this, 'Layout', { options: options });
		if (!view) {
			view = buildViewByKey(this, 'layout', { defaultOptions: options });
		}
		return view;
	},
	getStartPromises: function getStartPromises() {
		var _this2 = this;

		var promises = this.getOption('startPromises', { args: [this] });
		if (!promises) return;

		return _.map(promises, function (item) {
			if (_.isFunction(item)) {
				return item.call(_this2, _this2);
			} else {
				return item;
			}
		});
	},
	getStopPromises: function getStopPromises() {
		var _this3 = this;

		var promises = this.getOption('stopPromises', { args: [this] });
		if (!promises) return;

		return _.map(promises, function (item) {
			if (_.isFunction(item)) {
				return item.call(_this3, _this3);
			} else {
				return item;
			}
		});
	}
});

var PagedApp = App.extend({
	historyWatcher: false,
	Router: PageRouter,

	constructor: function constructor() {

		this._pages = [];
		App.apply(this, arguments);
		this._initRouteErrors();
		this._initPageListeners();
	},
	_initRouteErrors: function _initRouteErrors() {
		var handlers = this.getOption('routeErrors', { args: [this] });
		if (!_.isObject(handlers)) return;
		routeErrorHandler.setHandlers(handlers, this);
	},
	_initPageListeners: function _initPageListeners() {
		this.on('start', this._buildPages);
		this.on('pages:ready', this._startHistory);
		this.on('page:start', this._onPageStart);
		this.on('page:stop', this._onPageStop);
	},
	_startHistoryWatcher: function _startHistoryWatcher() {
		if (!this.getOption('historyWatcher')) return;
		historyWatcher.start();
	},
	_startHistory: function _startHistory() {
		if (historyApi.isStarted()) return;

		this._startHistoryWatcher();

		var options = this.getOption('startHistory');
		if (!options) {
			return;
		}
		if (options === true) {
			options = { pushState: false };
		} else if (!_.isObject(options)) {
			return;
		}

		this.triggerMethod('before:history:start', result);

		var result = historyApi.start(options);

		this.triggerMethod('history:start', result);
	},
	_buildPages: function _buildPages() {
		this.triggerMethod('before:pages:ready');
		this.buildPages();
		this.triggerMethod('pages:ready');
	},
	buildPages: function buildPages() {

		if (this.rootPage instanceof Page) return;

		this.triggerMethod('before:router:create');
		this.router = this.buildRouter();
		this.triggerMethod('router:create', this.router);

		var RootPage = this.getOption('RootPage');
		if (isClass(RootPage, Page)) {
			this.rootPage = new RootPage({ router: this.router, shouldRegisterAllRoutes: true, app: this });
		}
	},
	buildRouter: function buildRouter() {
		if (this.router instanceof PageRouter) return this.router;
		return buildByKey(this, 'Router', { ctor: PageRouter });
	},
	_onPageStart: function _onPageStart() {
		this.showPage.apply(this, arguments);
	},

	showPage: _.noop,
	_onPageStop: function _onPageStop() {
		this.hidePage.apply(this, arguments);
	},

	hidePage: _.noop
});

var buttonMixin = Base => {
	if (Base == null) {
		Base = View$1;
	}
	return Base.extend({

		triggerNameEvent: true,
		stopEvent: true,
		leftIcon: true,
		rightIcon: true,
		forceText: true,
		beforeClickIsAlwaysPromise: true,
		constructor(options){
			Base.apply(this, arguments);
			this.mergeOptions(options, ['name']);
		},

		tagName:'button',
		//template: _.template('<i></i><span><%= text %></span><i></i>'),
		getTemplate(){
			let html = [];
			let icon = '<i></i>';
			
			if (this.getOption('leftIcon')) {
				html.push(icon);
			}
			
			let forceText = this.getOption('forceText');
			if (this.getText() || forceText) {
				html.push('<span><%= text %></span>');
			}

			if (this.getOption('rightIcon')) {
				html.push(icon);
			}
			return _.template(html.join(''));
		},
		events(){
			if(this.getOption('noevent')){
				return;
			}
			return {
				'click'(e) {
					let stop = this.getOption('stopEvent');
					if (stop) {
						e.stopPropagation();
						e.preventDefault();
					}

					let before = this.beforeClick();
					if (before && before.then) {
						before.then(
							data => this.triggerClick(data, event),
							error => this.triggerError(error, event)
						);
					} else {
						this.triggerClick(before, event);
					}
					/*
					this.beforeClick().then(
						data => {
							this.triggerMethod('click', data, e, this.name, this);
							if (this.name) {
								this.triggerMethod('click:' + this.name, data, e, this);
							}
						},
						error => {
							this.triggerMethod('click:fail', error, this.name, e, this);
							if (this.name) {
								this.triggerMethod('click:'+this.name+':fail', error, e, this);
							}
						}
					);
					*/
				}
			};
		},
		beforeClick(){
			let result = this.triggerMethod('before:click');
			if(result && _.isFunction(result.then) ) {
				return result;
			} else {
				if (this.getOption('beforeClickIsAlwaysPromise')) {
					return Promise.resolve(result);
				} else {
					return result;
				}
			}
		},
		triggerClick(data, event){
			let options = {
				event,
				name: this.name,
				buttonView: this,
			};
			this.triggerMethod('click', data, options);
			if (this.name) {
				this.triggerMethod('click:' + this.name, data, options);
			}
		},
		triggerError(error, event){
			let options = {
				event,
				name: this.name,
				buttonView: this,
			};			
			this.triggerMethod('click:fail', error, options);
			if (this.name) {
				this.triggerMethod('click:'+this.name+':fail', error, options);
			}
		},
		getText(){
			return this.getOption('text');
		},
		templateContext(){
			return {
				text: this.getText()
			};
		},
		disable(){
			this.$el.prop('disabled', true);
		},
		enable(){
			this.$el.prop('disabled', false);
		},
	});
};

var buttonMixin$1 = buttonMixin(ExtView);

function getTriggerMethod(context){
	if(!context) { return () => {}; }
	return _.isFunction(context.triggerMethod) ? context.triggerMethod
		: _.isFunction(context.trigger) ? context.trigger
			: () => {};
}

function ensureError(error, value){
	if(error instanceof Error){
		throw error;
	}
	return arguments.length > 1 ? value : error;
}


var ControlMixin = Base => Base.extend({

	isControl: true,
	validateOnReady: false,

	constructor(options){		
		this._initControl(options);
		Base.apply(this, arguments);
		if (this.getOption('validateOnReady')) {
			this.once('control:ready', () => {
				this.validate().catch(() => {});
			});
		}

		this.valueOptions = this.getOption('valueOptions') || {};
	},



	_onControlDestroy(){
		let parent = this.getParentControl();
		if (parent && _.isFunction(parent._removeChildControl)) {
			parent._removeChildControl(this);
		}
		let children = this.getChildrenControls();
		if (children) {
			_.each(children, child => child._removeParentControl());
			children.length = 0;
		}
		delete this._cntrl;
	},
	_removeChildControl(control){
		this.off(control);
		let children = this.getChildrenControls();
		if (!children.length) { return; }
		let index = children.indexOf(control);
		if (index === -1) return;
		children.splice(index, 1);
	},
	_addChildControl(control){
		let controlName = control.getControlName();
		let children = this.getChildrenControls();
		let found = _.find(children, child => child.getControlName() === controlName);
		!found && children.push(control);
	},
	_removeParentControl(){
		delete this._cntrl.parent;
	},



	_initControl(options = {}){
		if (this._controlInitialized) { return; }

		this._cntrl = {};
		let name = takeFirst('controlName', options, this) || 'control';
		this._cntrl.name = name;

		let value = takeFirst('value', options, this);
		value = this._clone(value);
		this.initControlValue(value);
		this.initParentControl(options);

		this.once('destroy', this._onControlDestroy);

		this._controlInitialized = true;
	},
	initParentControl(options){
		let parent = takeFirst('proxyTo', options, this) || takeFirst('parentControl', options, this);
		this.setParentControl(parent);
	},
	setParentControl(parent){
		this._cntrl.parent = parent;
		if (parent && _.isFunction(parent._addChildControl)) {
			parent._addChildControl(this);
		}
	},
	initControlValue(value){
		this._cntrl.initial = value;
		this._cntrl.value = value;
	},
	getControlName(){
		return this._cntrl.name;
	},

	isSameControlValue(value){
		let current = this.getControlValue();
		return this.isValid() && compareObjects(current, value);
	},

	getControlValue(key, options = {}){
		
		if(_.isObject(key)) {
			options = key;
			key = undefined;
		}
		let { notValidated, clone } = options;
		let valueKey = notValidated ? 'notValidated' : 'value';
		let value = this._cntrl[valueKey];
		if (key != null) {
			value = getByPath(value, key);
		} else {
			value = clone ? this._clone(value) : value;
		}
		if (_.isFunction(options.transform)){
			value = options.transform.call(this, value);
		}
		return value;
	},

	setControlValue(value, options = {}){
		let  { key, notValidated } = options;
		value = this._prepareValueBeforeSet(value, { key });
		const resolve = Promise.resolve(value);
		if (this.isSameControlValue(value)) { return resolve; }

		this._cntrl.notValidated = value;

		if (notValidated) { return resolve; }
		return this._setControlValue(value, options);
	},

	_prepareValueBeforeSet(value, { key } = {}){
		value = this.prepareValueBeforeSet(value);
		if (key == null) { return value; }

		let current = this.getControlValue({ notValidated: true, clone: true }) || {};
		setByPath(current, key, value);
		return current;
	},

	//override this if you need to modify value before set
	prepareValueBeforeSet: value => value,

	_setControlValue(value, options = {}) {
		let { skipValidation } = options;
		if (skipValidation) {
			return this._onSetControlValueValidateSuccess(value, options);
		}
		return this._validate(value, options)
			.then(
				() => this._onSetControlValueValidateSuccess(value, options), 
				error => this._onSetControlValueValidateFail(error, value, options)
			);
	},
	_onSetControlValueValidateSuccess(value, options){
		this._cntrl.previous = this._cntrl.value;
		this._cntrl.value = value;
		this._cntrl.isDone = false;
		this._tryTriggerEvent('change', [value], options);
		return Promise.resolve(value);
	},

	_onSetControlValueValidateFail(error, value, options){
		this._tryTriggerEvent('change:fail', [value, error], options);
		return ensureError(error, value);
	},

	isValid(){
		return this._cntrl.isValid !== false;
	},

	validate(options = {}){

		let notValidated = !this.isValid();
		let value = this.getControlValue({ notValidated });
		let promise = this._validate(value, options);
		let _catch = options.catch;

		if (_catch === false) {
			return promise;
		} else if(_.isFunction(_catch)) {
			return promise.catch(_catch);
		} else {
			return promise.catch(ensureError);
		}
	},
	_validate(value, options){

		let validate = this._validatePromise(value, options);

		return validate.then(
			() => this._onControlValidateSuccess(value, options),
			error => this._onControlValidateFail(error, value, options)
		);
	},
	_validatePromise(value, options){
		
		const { skipChildValidate } = options;
		const isControlWrapper = betterResult(this, 'isControlWrapper', { args:[this]});

		
		return new Promise((resolve, reject) => {
			let childrenErrors = {
				children: {}
			};
			let childrenPromise = this._validateChildrenControlsPromise({ skipChildValidate, isControlWrapper }, childrenErrors);

			childrenPromise.then(() => {

				if (_.size(childrenErrors.children)) {
					reject(childrenErrors.children);
					return;
				} else if (childrenErrors.wrapped) {
					reject(childrenErrors.wrapped);
					return;
				}
			
				let promise = this._validateControlPromise(value, options);

				promise.then(
					() => {
						resolve(value);
					},
					error => {
						reject(error);
					}
				);

			});
		});		
	},
	_validateControlPromise(value, options){
		let validate = this.getOption('controlValidate', { force: false });
				
		//if there is no validation defined, resolve
		if (!_.isFunction(validate)) {
			
			return Promise.resolve(value);
		}

		let values = this.getParentControlValue({ notValidated: true });
		let validateResult = validate.call(this, value, values, options);

		let promise = Promise.resolve(value);
		if (validateResult && validateResult.then) {
			promise = validateResult;
		} else if (validateResult) {
			promise = Promise.reject(validateResult);
		}
		return promise;
	},
	_validateChildrenControlsPromise({ isControlWrapper, skipChildValidate} = {}, errors = {}){

		let children = this.getChildrenControls();
		let childrenPromise = Promise.resolve();
		if (!children.length) return childrenPromise;

		return _.reduce(children, (finaly, child) => {
			let control = child.getControlName();

			finaly = finaly.then(() => {

				if (!child.validate || (skipChildValidate && control == skipChildValidate)) {
					return Promise.resolve();
				}
				let validateResult = child.validate({ stopPropagation: true, catch: false });

				return validateResult;
			}).catch(error => {

				if(isControlWrapper){
					errors.wrapped = error;
				} else {
					errors.children[control] = error;
				}
				return Promise.resolve();
			});
			return finaly;
		}, childrenPromise);		

	},

	_onControlValidateSuccess(value, options){
		this.makeValid(value, _.extend(options, { noSet: true }));
		return Promise.resolve(value);
	},
	makeValid(value, options = {}){
		this._cntrl.isValid = true;
		if(!options.noSet && !this.isSameControlValue(value)){
			this._setControlValue(value, { silent: true, skipValidation: true });
		}
		this._tryTriggerEvent('valid', [value], options);
	},
	_onControlValidateFail(error, value, options){
		this.makeInvalid(error, value, options);
		return Promise.reject(error);
	},
	makeInvalid(error, value, options){
		this._cntrl.isValid = false;
		this._tryTriggerEvent('invalid', [value, error], options);
	},










	getParentControl() {
		return this._cntrl.parent;
	},
	getParentControlValue(options) {

		let parent = this.getParentControl();
		if (!parent || !_.isFunction(parent.getControlValue)) {
			return this.getOption('allValues');
		}
		if (betterResult(parent, 'isControlWrapper', { args:[this]})) {
			return parent.getParentControlValue(options);
		} else {
			return parent.getControlValue(options);
		}
	},

	getChildrenControls(){
		if(!this._cntrl.children) {
			this._cntrl.children = [];
		}
		return this._cntrl.children;
	},
	handleChildControlEvent(event, controlName, ...args) {
		let childEvent = controlName + ':' + event;
		let trigger = getTriggerMethod(this);

		let cce = this.getOption('childControlEvents', { args: [this] }) || {};
		let def = this.defaultChildControlEvents || {};
		if(!this._debouncedChildControlEvents) {
			this._debouncedChildControlEvents = {};
		}
		let dcce = this._debouncedChildControlEvents;

		let defHandler = def[event];
		let handler = cce[childEvent];
		let handlerArguments = [];
		let handlerName;
		if (_.isFunction(handler)) {
			handlerArguments = args;
			handlerName = childEvent;
		} else if(_.isFunction(defHandler)){
			handlerName = '_default:' + event;
			handler = defHandler;
			handlerArguments = [controlName, ...args];
		} else {
			if (controlName != 'control') {
				trigger.call(this, childEvent, ...args);
			}
			return;
		}
		
		let delay = this.getOption('debounceChildControlEvents');
		if(_.isNumber(delay) && delay > 0){
			if(!dcce[handlerName]){
				dcce[handlerName] = _.debounce(handler, delay);
			}
			handler = dcce[handlerName];
		}

		let handlerResult = handler.apply(this, handlerArguments);
		if(handlerResult && handlerResult.then) {
			handlerResult.then(() => {
				controlName != 'control' && trigger.call(this, childEvent, ...args);
			});
		}
		
	},

	defaultChildControlEvents:{
		'change'(controlName, value){
			let isControlWraper = this.getOption('isControlWrapper');
			isControlWraper && (controlName = undefined);
			this.setControlValue(value, { key: controlName, skipChildValidate: controlName });
		},
		'done'(controlName, value){
			let isControlWraper = this.getOption('isControlWrapper');
			isControlWraper && (controlName = undefined);
			let setPromise = this.setControlValue(value, { key: controlName, skipChildValidate: controlName });
			if (isControlWraper) {
				setPromise = setPromise.then(() => {
					this.controlDone();
					return Promise.resolve();
				});
			}
			return setPromise;
		},
		'invalid'(controlName, value, error){
			if(this.getOption('isControlWrapper')){
				controlName = undefined;
			}
			this.setControlValue(value, { key: controlName, silent: true, notValidated: true });
			this.makeInvalid(error, this.getControlValue({ notValidated: true }));
		},
	},

	controlDone(){
		if (!this._cntrl.isValid || this._cntrl.isDone) { return; }
		let value = this.getControlValue();
		this._cntrl.isDone = true;
		this._tryTriggerEvent('done', [value]);
	},


	/*
		helpers
	*/
	_clone(value){
		if(_.isArray(value))
			return value.slice(0);
		else if(_.isObject(value)) {
			return cloneValue(value);
		} else
			return value;
	},
	_tryTriggerEvent(name, args = [], { silent, stopPropagation } = {}){
		if (silent) { return; }
		let controlName = this.getControlName();
		let event = 'control:' + name;
		let namedEvent = controlName + ':' + name;

		let trigger = getTriggerMethod(this);
		let parent = this.getParentControl();
		
		if (stopPropagation || !parent) { 
			trigger.call(this, event, ...args);
			return; 
		}

		if (_.isFunction(parent.handleChildControlEvent)) {
			parent.handleChildControlEvent(name, controlName, ...args);
		} else {
			let parentTrigger = getTriggerMethod(parent);
			parentTrigger.call(parent, namedEvent, ...args);
		}

		trigger.call(this, event, ...args);
	},
	makeControlReady(){
		let trigger = getTriggerMethod(this);
		trigger.call(this, 'control:ready');
	},

}, { ControlMixin: true });

var controlViewMixin = Base => {
	if (Base == null) {
		Base = CollectionView;
	}

	if (!isClass(Base, CollectionView)) {
		throw new Error('controlView mixin can be applied only on marionette CollectionView');
	}

	let Mixed = Base;

	if (Mixed.ControlViewMixin) {
		return Mixed;
	}

	if (!Mixed.ControlMixin) {
		Mixed = ControlMixin(Mixed);
	}

	if (!Mixed.CssClassModifiersMixin) {
		Mixed = cssClassModifiersMixin(Mixed);
	}

	if (!Mixed.CustomsMixin) {
		Mixed = customsMixin(Mixed);
	}


	return Mixed.extend({

		renderAllCustoms: true,
		isControlWrapper: true,
		skipFirstValidationError: true,
		shouldShowError: false,
		validateOnReady: false,
		
		constructor(){
			Mixed.apply(this, arguments);
			this._setControlValidInvalidListeners();
			this.addCssClassModifier('control-wrapper');
		},

		_setControlValidInvalidListeners(){
			if(this._controlValidInvalidListeners) { return true; }

			this.on({
				'control:valid': this._onControlValid,
				'control:invalid': this._onControlInvalid
			});
			if(this.getOption('validateOnReady')){
				this.once('customs:render', () => this.makeControlReady());
			}			

			this._controlValidInvalidListeners = true;
		},

		getCustoms(){
			let customs = [];
			if (this.getOption('isControlWrapper')) {
				customs.push(this.getControlView());
			} else {
				customs.push(...this._customs);
			}
			customs = this.injectSystemViews(customs);
			return customs; 
			//this._prepareCustoms(customs);
		},

		_setupCustom(view){
			this._setupChildControl(view);
			this.setupCustom(view);
		},
		_setupChildControl(view){
			if(_.isFunction(view.setParentControl)) {
				view.setParentControl(this);
			}
			this.setupChildControl(view);
		},
		setupChildControl: _.noop,
		injectSystemViews(customs = []){
			customs.unshift(this.getHeaderView());
			customs.push(
				this.getErrorView(),
				this.getFooterView()	
			);
			return customs;
		},




		getErrorView(){
			if (!this.getOption('shouldShowError')) { return; }
			if (this.getOption('showValidateError', {force:false})) { return; }
			this._errorView = this.buildErrorView();
			return this._errorView;
		},
		buildErrorView(){
			return buildViewByKey(this, 'errorView');
		},



		getHeaderView(){			
			return this.buildHeaderView({ tagName: 'header' });
		},
		buildHeaderView(options){
			return this._buildNestedTextView('header', options);
		},
		_buildNestedTextView(key, options){
			let TextView = this.getOption('TextView');
			let buildText;
			if (!TextView) {
				buildText = (text, opts) => new View$1(_.extend({}, opts, { template: () => text }));
			}
			return buildViewByKey(this, key, { TextView, buildText, options });
		},


		getFooterView(){
			if (this.getOption('buttonsInFooter')) {
				return this.buildButtonsView();
			} else {
				return this.buildFooterView();
			}
		},

		buildFooterView(){
			return this._buildNestedTextView('footer', { tagName: 'footer' });
		},

		buildButtonsView(){
			if (this._buttonsView) {
				this.stopListening(this._buttonsView);
			}

			let options = this.buildButtonsOptions();
			let view = buildViewByKey(this, 'buttonsView', { options });
			if (!view) { return; }

			this._buttonsView = view;
			this.settleButtonsListeners(view);

			return [view, Infinity];
		},
		buildButtonsOptions(){
			let btns = this.getOption('buttons');
			if(btns) {
				return _.reduce(btns, (hash, b) => {
					let item = this.buildButton(b, this);
					hash[item.name] = item;
					return hash;
				}, {});
			}		
		},
		buildButton(value){
			if (_.isString(value)) {
				return this.buildButton({ text: value, className: value, name: value });
			} else if(_.isFunction(value)) {
				return this.buildButton(value.call(this));
			} else if(_.isObject(value)) {
				return this.fixButton(value);
			}
		},
		fixButton(button){
			return button;
		},
		settleButtonsListeners(buttonsView){
			this.on({
				// 'control:valid': () => {
				// 	buttonsView.enableButton('resolve');
				// },
				// 'control:invalid': () => {
				// 	buttonsView.disableButton('resolve');
				// },
				'control:done': (value) => {
					this._fulfill('resolve', value);
				}
			});

			this.listenTo(buttonsView, {
				'resolve'(){
					let value = this.getControlValue();
					this._fulfill('resolve', value);
					//this.triggerMethod('resolve', this.getControlValue());
				},
				'reject'(){
					this._fulfill('reject');
					//this.triggerMethod('reject');
				},
				'reject:soft'(){
					this._fulfill('reject:soft');
					//this.triggerMethod('reject:soft');
				},
				'reject:hard'(){
					this._fulfill('reject:hard');
					//this.triggerMethod('reject:hard');
				},
			});
		},
		_fulfill(type, ...rest){
			this.triggerMethod(type, ...rest);
		},

		getControlView(){
			this.control = buildViewByKey(this, 'controlView', { options: { parentControl: this, value: this.getControlValue() } });
			return this.control;
		},


		_onControlInvalid(value, error){
			this.disableButtons();
			this._showValidateError(error);
		},
		_onControlValid(){
			this.enableButtons();
			this._hideValidateError();
		},
		
		disableButtons(){
			if(this._buttonsView && _.isFunction(this._buttonsView.disableButton)) {
				this._buttonsView.disableButton('resolve');
			}
		},
		enableButtons(){
			if(this._buttonsView && _.isFunction(this._buttonsView.enableButton)) {
				this._buttonsView.enableButton('resolve');
			}
		},
		_showValidateError(error){
			
			let shouldShow = this.getOption('shouldShowError');
			let skipFirstValidationError = this.getOption('skipFirstValidationError');

			if (skipFirstValidationError && !this._firstValidationErrorSkipped) {
				this._firstValidationErrorSkipped = true;
				return;
			}

			if (!shouldShow) return;

			let show = this.getOption('showValidateError', { force: false });
			if (_.isFunction(show)) {
				show.call(this, error);
			} else {
				if (!this._errorView) return;
				this._errorView.showError(error);
			}		
		},
		_hideValidateError(){
			let hide = this.getOption('hideValidateError', { force: false });
			if (_.isFunction(hide)) {
				hide.call(this);
			} else {
				if (!this._errorView) return;
				this._errorView.hideError();
			}		
		},
	}, { ControlViewMixin: true });


};

var promiseBarMixin = Base => {
	if (Base == null) {
		Base = CollectionView;
	}

	if(!isClass(Base, CollectionView)){
		throw new Error('promiseBar mixin can be applied only on CollectionView');
	}

	let Mixed = Base;

	if (!Mixed.CssClassModifiersMixin) {
		Mixed = cssClassModifiersMixin(Mixed);
	}

	return Mixed.extend({
		constructor(options){
			this._buttons = {};
			Base.apply(this, arguments);
			this.addPromiseBarCssClass();
			this.mergeOptions(options, ['promise', 'reject', 'resolve', 'beforeRejectSoft', 'beforeRejectHard', 'beforeResolve']);
		},
		tagName: 'footer',
		resolve:'ok',
		triggerNameEvent: true,
		addPromiseBarCssClass(){
			this.addCssClassModifier('promise-bar');
		},
		onRender(){
			this.addButtons();
		},
		addButtons(){
			let buttons = this.buildButtons() || [];
			while (buttons.length){
				let button = buttons.pop();
				let preventRender = !!buttons.length;
				this.addChildView(button, { preventRender });
			}
		},
		buildButtons(){
			let names = ['resolve','rejectSoft','rejectHard'];
			return _.reduce(names, (buttons, name) => {
				let button = this.buildButton(name);
				button && buttons.push(button);
				return buttons;
			}, []);
		},
		buildButton(name){
			let options = this.getButtonOptions(name);
			if (!options) return;
			let Button = this.getOption('buttonView');
			if (!Button) {
				Button = this.buttonView = buttonMixin$1(View$1);
			}
			let btn = new Button(options);
			this._buttons[name] = btn;
			return btn;
		},
		getButtonOptions(name){
			let options = this.getOption(name);
			if ( !options ) return;
			if( _.isString(options) ) {
				options = { text: options };
			} else if(!_.isObject(options)) {
				return;
			}
			let defs = { 
				className: name, 
				name, 
				triggerNameEvent: this.getOption('triggerNameEvent'), 
				stopEvent: true,
				text: options.text || name,
			};
			options = _.extend(defs, options);
			return options;
		},
		childViewEvents:{
			'click:resolve'(data){
				this.triggerMethod('resolve', data);
			},
			'click:rejectSoft'(value){ 
				this.triggerMethod('reject', { type: 'soft', value });
				this.triggerMethod('reject:soft', value);
			},
			'click:rejectHard'(value){ 
				this.triggerMethod('reject', { type: 'hard', value });
				this.triggerMethod('reject:hard', value);
			},
			'click:fail'(error, name, event, view) {
				this.triggerMethod('click:fail', error, name, event, view);
				if (name) {
					this.triggerMethod(`click:${name}:fail`, error, event, view);
				}
			}
		},

		disableButton(name){
			let btn = this._buttons[name];
			btn && btn.disable();
		},
		enableButton(name){
			let btn = this._buttons[name];
			btn && btn.enable();
		},

	});

};

var PromiseBar = promiseBarMixin(ExtCollectionVIew).extend({
	buttonView: buttonMixin$1
});

const textView = ExtView.extend({
	template: _.template('<%= text %>'),
	templateContext(){		
		return {
			text: this.getOption('text')
		};
	}
});

const ControlView = controlViewMixin(ExtCollectionVIew).extend({
	renderAllCustoms: true,
	buttonsView: PromiseBar,
	textView,
	fixButton(btn){
		if (btn.name != btn.text) { return btn; }

		if (btn.text === 'rejectSoft') {
			btn.text = 'cancel';
		}

		return btn;
	}
});

var common = {
	_createSchema(){
		let schema = this.getOption('schema', { args: [ this.model, this ] });
		let Schema = this.getSchemaClass();

		if(schema instanceof Schema){
			return schema;
		}

		
		if(schema == null || _.isObject(schema)) {
			return this.createSchema(Schema, schema);
		}
		
	},
	getSchema(){
		if(this._schema) { return this._schema; }
		
		this._schema = this._createSchema();
		return this._schema;
	},
	createSchema(Schema, options = {}){
		return new Schema(options);
	},
	getSchemaClass(){
		return this.getOption('schemaClass');
	},
};

var propertyErrorView = ExtView.extend({
	className:'control-validate-wrapper',
	cssClassModifiers:[
		(m,v) => v.errorMessage ? 'error' : ''
	],
	getTemplate(){		
		return () => this.errorMessage;
	},
	showError(error){
		if(_.isArray(error)){
			error = error.join(', ').trim();
		}
		this.errorMessage = error;
		this.render();
	},
	hideError(){
		this.errorMessage = '';
		this.render();
	}
});

var EditProperty = Base => {
	const Mixed = mix(Base).with(controlViewMixin, common);

	return Mixed.extend({
		
		shouldShowError: false,
		errorView: propertyErrorView,
		className:'edit-model-property',
		schemaClass: PropertySchema,
		debounceChildControlEvents: 0,


		getDefaultValidateRule(options){
			let schema = this.getSchema();
			let rule = _.extend({}, schema.getType(options), schema.getValidation(options));
			return rule;
		},
		getValidateRule(options = {}){
			let rule = this.getDefaultValidateRule(options);
			return rule;
		},
		
		getHeaderView(){
			return this._getHeaderView();
		},
		_getHeaderView(){
			let TextView$$1 = this.getOption('textView');
			let buildText;
			if (!TextView$$1) {
				buildText = (text, opts) => new View$1(_.extend({}, opts, { template: () => text }));
			}
			let view = buildViewByKey(this, 'header', { TextView: TextView$$1, buildText, options: { tagName: 'header' } });
			if(view) { return view; }

			if(this.getOption('propertyLabelAsHeader')) {
				let label = this.getSchema().getLabel();
				if(TextView$$1) {
					return new TextView$$1({ text: label, tagName: 'header'});
				} else {
					return new View$1({ template: () => label, tagName: 'header'});
				}
			}
		},
		getSchemaOptions(opts){
			let options = {
				value: this.getControlValue(),
				allValues: this.getParentControlValue(),
				model: this.model			
			};
			return _.extend(options, opts);
		},
		getControlView(){
			let options = this.getSchemaOptions();
			let editOptions = this.getSchema().getEdit(options);
			return this.buildPropertyView(editOptions);
		},
		controlValidate(value, allValues){
			let rule = this.getValidateRule({ value, allValues });
			if(!rule || !_.size(rule)) return;
			return validator.validate(value, rule, { allValues });
		},
		
		// must be overrided
		// accepts:	options arguments.
		// returns:	should return Control instance
		buildPropertyView(){
			throw new Error('buildPropertyView not implemented. You should build view by your own');
		},

	});
};

var editModelMixin = Base => {
	let Mixed = mix(Base).with(controlViewMixin, common);

	return Mixed.extend({

		shouldShowError: false,
		shouldShowPropertyError: true,
		propertyErrorView,
		validateOnReady: true,
		buttonsInFooter: true,
		isControlWrapper: false,
		schemaClass: ModelSchema,
		editPropertyClass: EditProperty,

		propertyLabelAsHeader: true,

		className:'edit-model-control',

		getCustoms(){
			let customs = [];
			customs.push(...this.getPropertiesViews());
			customs.push(...this._customs);
			customs = this.injectSystemViews(customs);
			return customs;
		},
		getPropertiesViews(){
			let modelSchema = this.getSchema();
			let propertiesToShow = this.getOption('propertiesToShow', { args: [ this.model, this ]}) || [];
			if(!propertiesToShow.length) {
				propertiesToShow = modelSchema.getPropertiesNames();
			}
			return _.map(propertiesToShow, name => this._createEditProperty(name, modelSchema));
		},
		_createEditProperty(name, modelSchema){
			let schema = modelSchema.getProperty(name, { create: true });
			let EditProperty$$1 = this.getEditPropertyClass();
			const def = {
				controlName: name,
				schema,
				value: this.getPropertyValue(name),
				allValues: this.getControlValue({ notValidated: true }),
				propertyLabelAsHeader: this.getOption('propertyLabelAsHeader')
			};
			if(this.getOption('shouldShowPropertyError')) {
				def.shouldShowError = true;
				def.errorView = this.getOption('propertyErrorView');
			}
			let options = this.getEditPropertyOptions(def);
			return this.createEditProperty(EditProperty$$1, options);
		},
		getPropertyValue(property){
			return this.getControlValue(property);
		},
		getEditPropertyClass(){
			return this.getOption('editPropertyClass');
		},
		getEditPropertyOptions(defaultOptions){
			return _.extend({}, defaultOptions, this.getOption('editPropertyOptions'));
		},
		createEditProperty(EditProperty$$1, options){
			return new EditProperty$$1(options);
		},

	});
};

const controls = {

};

function guesControl(arg) {
	if(!_.isObject(arg)) {
		return;
	}
	let control = getControlByName(arg.control);

	if(!control){
		control = getControlByName(arg.type);
	}

	if (!control && !!arg.sourceValues) {
		control = getControlByName('select');
	}

	return control;
}

function getControlByName(name){
	return controls[name];
}

function getControlBySchema(schema, opts){
	let value = schema.getType(opts);
	let control = getControlByName(value.control);
	if (!control) {
		control = getControlByName(value.type);		
	}
	if (!control && !!value.sourceValues) {
		control = getControlByName('select');
	}
	return control;
}

function getControl(arg, opts){
	let control;
	if(_.isString(arg)){
		control = getControlByName(arg, opts);
	} else if(arg instanceof PropertySchema) {
		control = getControlBySchema(arg, opts);
	} else {
		control = guesControl(arg, opts);
	}
	return control || controls.default;
}

function defineControl(name, Control){
	if(!_.isString(name)) {
		throw new Error('name must be a string');
	}
	controls[name] = Control;
}

const BaseEditProperty = mix(ControlView).with(EditProperty);

const EditProperty$1 = BaseEditProperty.extend({
	getEditControl(){
		return getControl(this.getSchema(), this.getSchemaOptions());
	},
	getEditControlOptions(editOptions){
		return editOptions;
	},
	buildPropertyView(editOptions){
		let Control = this.getEditControl();
		let options = this.getEditControlOptions(editOptions);
		return new Control(options);
	},
});

const EditModel = mix(ControlView).with(editModelMixin).extend({
	editPropertyClass: EditProperty$1
});

const _getOption = (context, key, checkAlso) => getOption(context, key, { args:[context], checkAlso });

function getInputType(inputView, opts = {}){
	
	let valueType = _getOption(inputView, 'valueType', opts);
	if (valueType == null) {
		let value = inputView.getControlValue();
		if ( value == null) {
			valueType = 'string';
		} else {
			if(_.isNumber(value))
				valueType = 'number';
			else if(_.isDate(value))
				valueType = 'datetime';
			else
				valueType = 'string';
		}		
	}

	if (valueType == 'number') {
		inputView._valueIsNumber = true;
	}

	let type = _getOption(inputView, 'inputType', opts);
	if(type == null){
		type = _getOption(inputView.valueOptions, 'inputType', opts.valueOptions);
	}
	if (!type) {
		if (inputView._valueIsNumber) {
			type = _getOption(inputView, 'inputNumberType', opts) || 'number';
		} else if (valueType == 'string') {
			type = 'text';
		} else if (valueType == 'datetime') {
			type = 'datetime';
		} else {
			type = 'text';
		}
	}
	inputView.inputType = type;
	inputView.valueType = valueType;
	return type;
}

function fixAttributes(attrs, view, opts)
{
	let tagName = getOption(view, opts, 'tagName');
	if(['select', 'textarea'].indexOf(tagName) > -1) {
		delete attrs.value;
		delete attrs.type;
	}
	return attrs;
}

function setInputAttributes(inputView, opts = {}) {

	let attributes = getOption(inputView, opts, 'attributes');

	let check = _.extend({}, inputView, opts, inputView.valueOptions, opts.valueOptions);

	let restrictionKeys = {
		'maxLength':'maxlength', 
		'minLength':'minlength',
		'minValue':'min', 
		'maxValue':'max', 
		'valuePattern':'pattern',
		'required':'required',
		'value':'value'
	};

	let restrictions = {};
	_(restrictionKeys).each((key2, key) => {
		let value = check[key];
		if (value != null)
			restrictions[key2] = value;
	});

	let newattributes = _.extend({
		value: inputView.value,
		type: getInputType(inputView, opts),
	}, restrictions, attributes);
	
	inputView.attributes = fixAttributes(newattributes, inputView, opts);

	if(opts.attributes)
		delete opts.attributes;
}

var getOption$1 = (context, key, ifNull) => getOption(context, key, { args:[context], default: ifNull });

function isChar(event){
	return event.key && event.key.length == 1 && !event.ctrlKey;
}

function keydown(eventContext) {
	let { context, event } = eventContext;

	if (context.triggerMethod('keydown', event) === false) { return; }


	let prevent = false;
	let stop = false;

	if (isChar(event)) {
		if (!context.isEnteredCharValid(event.key)) {
			prevent = true;
		}
	}
	if(event.keyCode == 13 && getOption$1(context, 'doneOnEnter', true)){
		prevent = true;
		stop = true;
	}

	stop && event.stopPropagation();
	prevent && event.preventDefault();
}

function keyup(eventContext) {
	let { context, event } = eventContext;

	if (context.triggerMethod('keyup', event) === false) { return; }

	if (event.keyCode == 13) {
		
		let shouldDone = getOption$1(context, 'doneOnEnter', true);
		if (shouldDone) {

			event.stopPropagation();
			event.preventDefault();
			context.controlDone();

		}

	}


}

function paste(eventContext) {
	let { context, event } = eventContext;

	
	if (context.triggerMethod('paste', event) === false) { return; }


	let text = event.originalEvent.clipboardData.getData('text/plain');
	if (!text) return;
	if (!context.isValueValid(text)) {
		event.preventDefault();
		event.stopPropagation();
	}
}

function blur(eventContext) {
	let { context, event } = eventContext;

	if (context.triggerMethod('blur', event) === false) { return; }


	if (getOption$1(context, 'doneOnBlur', true)) {
		context.controlDone();
	}
}

function focus(eventContext) {
	let { context, input, event } = eventContext;

	if (context.triggerMethod('focus', event) === false) { return; }

	if (getOption$1(context, 'selectOnFocus', true)) {
		input.select();
	}
}

function input(eventContext) {

	let { context, input, event } = eventContext;

	if (context.triggerMethod('input', event) === false) { return; }


	context.setControlValue(event.target.value).then(newvalue => {
		if (event.target.value != (newvalue || '').toString()) {
			input.value = newvalue;
		}
	});

}

var events = {
	keydown, 
	//keypress,
	keyup,
	paste,
	blur,
	focus,
	input,
	//'js:change': jsChange
};

function handleInputEvent(control, eventName, event) {
	let options = _.extend({
		context: control,
		input: control.el,
		restrictions: control.restrictions,
		eventName,
		event
	});


	let method = camelCase(`on:dom:${eventName}`);

	if (_.isFunction(events[eventName])) {
		events[eventName].call(control, options);
	} 
	
	if (_.isFunction(control[method])) {
		control[method](event, options);
	} 
}

const _getOption$1 = (context, key, checkAlso) => 
	getOption(context, key, { args:[context], checkAlso });

function setInputEvents(inputView, opts = {}) {

	let passedEvents = _getOption$1(inputView, 'events', opts);	

	let eventsArray = _(events).keys();	
	let events$$1 = _.reduce(eventsArray, (Memo, eventName) => {
		Memo[eventName] = function(event){ 
			handleInputEvent(this, eventName, event); 
		};
		return Memo;
	}, {});
	inputView.events = _.extend(events$$1, passedEvents);
}

//import { convertString as convert, getOption } from '../../../utils/index.js';
var inputMixin = Base => {
	let Mixin = Base.ControlMixin ? Base : ControlMixin(Base);
	return Mixin.extend({
		constructor(opts){
			
			this._initControl(opts);

			setInputAttributes(this, opts);
			setInputEvents(this, opts);
			Mixin.apply(this, arguments);

			if (!_.isFunction(this.getOption)) {
				this.getOption = (...args) => getOption(this, ...args);
			}

			this.buildRestrictions();
			let value = this.getOption('value');
			value == null && (value = '');
			this.el.value = value;
			//this.setControlValue(value, { trigger: false, silent: true });
		},
		tagName:'input',
		template: false,
		doneOnEnter: true,
		doneOnBlur: true,
		buildRestrictions(){
			let attrs = _.result(this, 'attributes');
			let pickNumbers = ['maxlength', 'minlength', 'min', 'max'];
			let pickStrings = ['pattern'];
			let pickBools = ['required'];
			let restrictions = {};
			_(attrs).each((value, key) => {
				let pick = false;
				key = key.toLowerCase();
				if (pickNumbers.indexOf(key) > -1) {
					value = convertString(value, 'number');
					pick = true;
				} else if (pickStrings.indexOf(key) > -1) {
					pick = true;
				} else if (pickBools.indexOf(key) > -1) {
					pick = true;
					value = convertString(value, 'boolean', { returnNullAndEmptyAs: true, returnOtherAs: true });
				}
				pick && (restrictions[key] = value);
			});
			this.restrictions = restrictions;		
		},
		prepareValueBeforeSet(value){
			if (value == null || value === '') return value;
			
			let len = this.getMaxLength();
			if (len > 0) {
				value = value.toString().substring(0, len);
			}
			if (this._valueIsNumber) {
				let num = convertString(value, 'number');
				if(isNaN(num))
					return;
				let min = this.restrictions.min;
				let max = this.restrictions.max;
				!isNaN(min) && num < min && (num = min);
				!isNaN(max) && num > max && (num = max);
				return num;
			}
			return value;
		},
		getValueType(){
			return this.valueType;
		},
		convertValue(value){
			return convertString(value, this.getValueType());
		},		
		getMaxLength()
		{
			return this.restrictions.maxlength;

		},
		isLengthValid(){
			let value = this.getControlValue();
			let len = this.getMaxLength();
			return len == null || value.length < len;
		},
		isEnteredCharValid(char) {
			let type = this.getValueType();

			if (type == 'number') {
				return ['.','-'].indexOf(char) > -1 || !isNaN(parseInt(char, 10));
			} else {
				return true;
			}
		},
		isValueValid(value){
			let type = this.getValueType();
			if (type == 'number') {
				return !isNaN(parseFloat(value, 10));
			} else {
				return true;
			}
		},
		controlValidate(value){
			if (value == null || value === '') {
				if(this.restrictions.required)
					return 'required';
				else if (this.restrictions.minLength > 0) {
					return 'length:small';
				}
				else
					return;
			}
			let strValue = value.toString();
			if (_.isNumber(this.restrictions.maxlength) && strValue.length > this.restrictions.maxlength)
				return 'length:big';
			if (this._valueIsNumber) {
				if (!_.isNumber(value))
					return 'not:number';
				if (_.isNumber(this.restrictions.min) && value < this.restrictions.min)
					return 'less:than:min';
				if (_.isNumber(this.restrictions.max) && value > this.restrictions.max)
					return 'greater:than:max';
			}
			if (this.restrictions.pattern) {
				let pattern = RegExp(this.restrictions.pattern);
				if (pattern.test(strValue)) {
					return 'pattern:mismatch';
				}
			}
		}
	});
};

const InputControl = inputMixin(ExtView);

defineControl('default', InputControl);
defineControl('text', InputControl);
defineControl('number', InputControl);

const TextArea = inputMixin(ExtView).extend({
	doneOnEnter: false,
	tagName:'textarea',
	template: data => data.value,
	templateContext(){
		return {
			value: this.getControlValue()
		};
	}
});


const inputEvents = ['focus','blur','input','keyup','keydown'];

const TextAreaControl = ControlView.extend({
	
	constructor(){
		ControlView.apply(this, arguments);
		this.addCssClassModifier('control-textarea');
	},
	controlView: TextArea,
	controlViewOptions(){
		let attributes = this.getOption('inputAttributes');

		let options = {
			valueOptions: this.getOption('valueOptions'),			
		};
		if (attributes) {
			options.attributes = attributes;			
		}
		return _.extend(options, this._delegateInputEvents());
	},
	_delegateInputEvents(){
		let delegatedHandlers = {};
		_.each(inputEvents, name => {
			let handlerName = camelCase('on', name);
			let handler = this.getOption(handlerName, { force: false });
			if(_.isFunction(handler)) {
				delegatedHandlers[handlerName] = (...args) => {
					return this.triggerMethod(name, ...args);
				};
			}
		});
		return delegatedHandlers;
	}
});

defineControl('textarea:simple', TextArea);
defineControl('bigtext', TextAreaControl);
defineControl('textarea', TextAreaControl);

const common$1 = {
	isSelected(){
		let selector = this.getOption('selector');
		return selector && selector.isSelected(this.model);
	},
	getText(){
		let text = this.getOption('text', { args: [this.model, this] });
		if (!text) {
			text = _.isFunction(this.model.getLabel) && this.model.getLabel() || undefined;
		}
		if (!text) {
			text = this.model.get('value');
		}
		if (!text) {
			text = this.model.id;
		}
		return text;
	},
	triggerSelect(event){
		this.triggerMethod('toggle:select', this, event);
	},

	_addSelectCssModifiers(){
		this.addCssClassModifier('select-item');
		this.addCssClassModifier((m,v) => v.isSelected() ? 'selected':'');
	},
};
var mixin = Base => Base.extend({
	constructor(){
		Base.apply(this, arguments);
		common$1._addSelectCssModifiers.call(this);
	},	
	isSelected: common$1.isSelected,
	triggerSelect: common$1.triggerSelect,
}, { SelectableViewMixin: true });

var DefaultChildView = mix(ExtView).with(mixin).extend({
	renderOnModelChange: true,
	template:_.template('<i></i><span><%= text %></span><i></i>'),
	templateContext(){
		return {
			text: this.getText()
		};
	},
	triggers:{
		'click':'toggle:select'
	},
	// events:{
	// 	'click'(event){
	// 		event.stopPropagation();
	// 		this.triggerMethod('toggle:select', this, event);
	// 	}
	// },
	// triggers: {
	// 	'click':{name:'toggle:select', stopPropagation: true}
	// },
	getText: common$1.getText
});

//import { Collection } from 'bbmn-core';
const BaseSelectControl = initSelectorMixin(ControlView);
const SelectControl = BaseSelectControl.extend({
	className: 'regular-select',
	renderCollection: true,
	doneOnSelect: true,
	cssClassModifiers:[
		'select-control',
		(m,v) => v.isMultiple() ? 'multiple' : '',
	],	
	constructor(){
		BaseSelectControl.apply(this, arguments);
		this.collection = this.selector.getCollection();
	},
	childView: DefaultChildView,
	getSelector(){
		if(!this.selector) {
			let selectorOptions = this._getSelectorOptions();
			this.selector = new Selector(selectorOptions);
		}
		return this.selector;
	},

	onSelectorChange(){
		let setPromise = this.setControlValue(this.selector.getValue());
		if (!this.isMultiple() && this.getOption('doneOnSelect')) {
			setPromise.then(() => {
				this.controlDone();
			});
		}	
	},
	_getSelectorOptions(){
		let source = this.getSource();
		
		let type = this.valueOptions.type;
		let extractValue = this.getOption('extractValue', { force: false});
		if (type == 'boolean') {
			source = _.map(source, (value, ind) => ({id: convertToBoolean(ind), value }));
			!extractValue && (extractValue = model => model.id);
		}
		let value = this.getControlValue();
		if (this.isMultiple() && type === 'enum' && _.isString(value)) {
			value = value.split(/\s*,\s*/g);
		}
		let opts = {
			value,
			source,
			multiple: this.isMultiple(),
		};
		if(extractValue) {
			opts.extractValue = extractValue;
		}

		return opts;
	},

	setFilter(filter){
		this.selector.setSourceFilter(filter);
	},
	isMultiple(){
		return this.valueOptions.multiple === true;
	},
	prepareValueBeforeSet(value){
		let type = this.valueOptions.type;
		if (type == 'text') {
			return value != null ? value.toString() : value;
		} else if (type == 'boolean') {
			return convertToBoolean(value);
		} else if(_.isString(value)){
			return convertString(value, this.valueOptions.type);
		} else if(_.isArray(value)) {
			if(this.valueOptions.type == 'enum') {
				return value.join(', ');
			} else {
				return _.map(value, val => convertString(val, this.valueOptions.type));
			}
		} else {
			return value;
		}
	},
	getSource(){
		let src = this.valueOptions.sourceValues;
		if(_.isFunction(src)){
			src = src();
		}
		return src;
	},
});

defineControl('select', SelectControl);

var BooleanSwitchControl = ControlView.extend({
	template:_.template('<i></i><small></small>'),
	constructor(){
		ControlView.apply(this, arguments);
		this.addCssClassModifier((m,v) => v.getState());
		this.addCssClassModifier('boolean-switch');
		this._initClickHandler();
		this.on('control:change', this.refreshStateLabel);
		this.refreshStateLabel();
	},
	ui:{
		label:'span'
	},
	getState(){
		let val = this.getControlValue({ transform: convertToBoolean });
		if (val == null) {
			val = false;
		}
		return 'is-' + val.toString();
	},
	clickSelector: '',
	_initClickHandler(){
		let event = ('click ' + this.getOption('clickSelector')).trim();
		this.delegateEvents({
			[event]:'clickHandler'
		});
	},
	clickHandler(event){
		event.stopPropagation();
		let val = this.getControlValue();
		this.setControlValue(!val);
	},
	refreshStateLabel(){
		if (!this.model) {
			this.refreshCssClass();
		}

		let labels = this.getOption('labels');
		if(!_.isObject(labels)){
			return;
		}
		let val = this.getControlValue() === true;
		let label = labels[val];
		if (isEmptyValue(label)) {
			return;
		}
		this.ui.label.html(label);

	},
	prepareValueBeforeSet(value){
		return convertToBoolean(value);
	}
});

export { version as VERSION, newObject as MnObject, BaseClass, betterResult, camelCase, takeFirst, comparator, compareAB, convertString, toNumber, extend, flattenObject as flat, getByPath, getOption, instanceGetOption, hasFlag, getFlag, isKnownCtor, ctors as knownCtors, isEmptyValue, mix, paramsToObject$1 as paramsToObject, setByPath, convertToBoolean as toBool, unFlat as unflat, compareObjects, mergeObjects$$1 as mergeObjects, cloneValue as clone, triggerMethod, triggerMethodOn, mergeOptions, buildByKey, buildViewByKey, enums, enumsStore, skipTake, renderInNode, isClass, isModel, isModelClass, isCollection, isCollectionClass, isView, isViewClass, emptyFetchMixin, index$2 as emptyViewMixin, improvedIndexesMixin, nextCollectionViewMixin, customsMixin, index$3 as fetchNextMixin, optionsMixin, index$4 as improvedFetchMixin, childrenableMixin, index$5 as nestedEntitiesMixin, index$6 as urlPatternMixin, index$7 as smartGetMixin, index$8 as saveAsPromiseMixin, cssClassModifiersMixin, index$a as nestedViewsMixin, destroyViewMixin, index$9 as buildViewByKeyMixin, index$b as scrollHandlerMixin, index$c as createAsPromiseMixin, Process, startableMixin, App, store as ModelSchemas, ModelSchema, PropertySchema, modelSchemaMixin, validator, User, Token as BearerToken, Stack as ViewStack, store$1 as store, ExtView as View, ExtCollectionVIew as CollectionView, AtomText as AtomTextView, TextView, notify, notifies, Notifier, syncWithNotifyMixin, Action, store$2 as ActionStore, actionableMixin, action, modals, Selector, initSelectorMixin, ClassStore, routeErrorHandler, PagedApp, PageRouter, Page, historyApi, historyWatcher, buttonMixin$1 as Button, buttonMixin, ControlMixin as controlMixin, ControlView, controlViewMixin, EditProperty$1 as EditProperty, EditProperty as editPropertyMixin, EditModel, editModelMixin, propertyErrorView as SchemaErrorView, InputControl as Input, inputMixin, TextAreaControl, PromiseBar, promiseBarMixin, controls, defineControl, getControl, SelectControl, mixin as selectableViewMixin, BooleanSwitchControl };
//# sourceMappingURL=bbmn.esm.js.map
