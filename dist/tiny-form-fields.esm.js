// -- (function(scope){
// -- 'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.bl.aL === region.bN.aL)
	{
		return 'on line ' + region.bl.aL;
	}
	return 'on lines ' + region.bl.aL + ' through ' + region.bN.aL;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.ds,
		impl.dV,
		impl.dS,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


/*
function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}

*/

/*
function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}
*/


/*
function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}

*/

/*
function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}
*/




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		ai: func(record.ai),
		bm: record.bm,
		bh: record.bh
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.ai;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.bm;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.bh) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.ds,
		impl.dV,
		impl.dS,
		function(sendToApp, initialModel) {
			var view = impl.dW;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.ds,
		impl.dV,
		impl.dS,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.bj && impl.bj(sendToApp)
			var view = impl.dW;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.c7);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.cV) && (_VirtualDom_doc.title = title = doc.cV);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.dJ;
	var onUrlRequest = impl.dK;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		bj: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.cC === next.cC
							&& curr.b1 === next.b1
							&& curr.cw.a === next.cw.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		ds: function(flags)
		{
			return A3(impl.ds, flags, _Browser_getUrl(), key);
		},
		dW: impl.dW,
		dV: impl.dV,
		dS: impl.dS
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { dp: 'hidden', db: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { dp: 'mozHidden', db: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { dp: 'msHidden', db: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { dp: 'webkitHidden', db: 'webkitvisibilitychange' }
		: { dp: 'hidden', db: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		cL: _Browser_getScene(),
		cZ: {
			c0: _Browser_window.pageXOffset,
			c1: _Browser_window.pageYOffset,
			c$: _Browser_doc.documentElement.clientWidth,
			b$: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		c$: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		b$: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			cL: {
				c$: node.scrollWidth,
				b$: node.scrollHeight
			},
			cZ: {
				c0: node.scrollLeft,
				c1: node.scrollTop,
				c$: node.clientWidth,
				b$: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			cL: _Browser_getScene(),
			cZ: {
				c0: x,
				c1: y,
				c$: _Browser_doc.documentElement.clientWidth,
				b$: _Browser_doc.documentElement.clientHeight
			},
			di: {
				c0: x + rect.left,
				c1: y + rect.top,
				c$: rect.width,
				b$: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});
var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.s) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.x),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.x);
		} else {
			var treeLen = builder.s * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.y) : builder.y;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.s);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.x) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.x);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{y: nodeList, s: (len / $elm$core$Array$branchFactor) | 0, x: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {bX: fragment, b1: host, z: path, cw: port_, cC: protocol, cD: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$element = _Browser_element;
var $author$project$Main$Editor = function (a) {
	return {$: 0, a: a};
};
var $author$project$Main$PortOutgoingFormFields = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $author$project$Main$Config = F4(
	function (viewMode, formFields, formValues, shortTextTypeList) {
		return {g: formFields, a7: formValues, al: shortTextTypeList, ac: viewMode};
	});
var $elm_community$json_extra$Json$Decode$Extra$andMap = $elm$json$Json$Decode$map2($elm$core$Basics$apR);
var $author$project$Main$FormField = F6(
	function (label, name, presence, description, type_, visibilityRule) {
		return {S: description, d: label, Q: name, w: presence, a: type_, m: visibilityRule};
	});
var $author$project$Main$AttributeNotNeeded = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $author$project$Main$AttributeGiven = function (a) {
	return {$: 2, a: a};
};
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $author$project$Main$decodeAttributeOptional = F2(
	function (maybeNotNeeded, decodeValue) {
		return $elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					$elm$json$Json$Decode$null(
					$author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing)),
					A2(
					$elm$json$Json$Decode$map,
					function (a) {
						return _Utils_eq(
							$elm$core$Maybe$Just(a),
							maybeNotNeeded) ? $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing) : $author$project$Main$AttributeGiven(a);
					},
					decodeValue)
				]));
	});
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Main$decodeFormFieldDescription = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$json$Json$Decode$at,
			_List_fromArray(
				['presence', 'description']),
			A2(
				$author$project$Main$decodeAttributeOptional,
				$elm$core$Maybe$Just(''),
				$elm$json$Json$Decode$string)),
			A2(
			$elm$json$Json$Decode$field,
			'description',
			A2(
				$author$project$Main$decodeAttributeOptional,
				$elm$core$Maybe$Just(''),
				$elm$json$Json$Decode$string)),
			$elm$json$Json$Decode$succeed(
			$author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing))
		]));
var $author$project$Main$decodeFormFieldMaybeName = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$json$Json$Decode$map,
			$elm$core$Maybe$Just,
			A2(
				$elm$json$Json$Decode$at,
				_List_fromArray(
					['presence', 'name']),
				$elm$json$Json$Decode$string)),
			A2(
			$elm$json$Json$Decode$map,
			$elm$core$Maybe$Just,
			A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string)),
			$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
		]));
var $author$project$Main$ChooseMultiple = function (a) {
	return {$: 4, a: a};
};
var $author$project$Main$ChooseOne = function (a) {
	return {$: 3, a: a};
};
var $author$project$Main$Dropdown = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$LongText = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$ShortText = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $author$project$Main$choiceDelimiter = ' | ';
var $elm$core$String$trim = _String_trim;
var $author$project$Main$choiceFromString = function (s) {
	var _v0 = A2($elm$core$String$split, $author$project$Main$choiceDelimiter, s);
	if (_v0.b) {
		if (!_v0.b.b) {
			var value = _v0.a;
			return {
				d: value,
				j: $elm$core$String$trim(value)
			};
		} else {
			if (!_v0.b.b.b) {
				var value = _v0.a;
				var _v1 = _v0.b;
				var label = _v1.a;
				return {
					d: label,
					j: $elm$core$String$trim(value)
				};
			} else {
				var value = _v0.a;
				var labels = _v0.b;
				return {
					d: A2($elm$core$String$join, $author$project$Main$choiceDelimiter, labels),
					j: $elm$core$String$trim(value)
				};
			}
		}
	} else {
		return {
			d: s,
			j: $elm$core$String$trim(s)
		};
	}
};
var $author$project$Main$decodeChoice = A2($elm$json$Json$Decode$map, $author$project$Main$choiceFromString, $elm$json$Json$Decode$string);
var $author$project$Main$FilterContainsFieldValueOf = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$FilterStartsWithFieldValueOf = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$fail = _Json_fail;
var $author$project$Main$decodeChoiceFilter = A2(
	$elm$json$Json$Decode$andThen,
	function (type_) {
		switch (type_) {
			case 'FilterStartsWith':
				return A2(
					$elm$json$Json$Decode$map,
					$author$project$Main$FilterStartsWithFieldValueOf,
					A2($elm$json$Json$Decode$field, 'fieldName', $elm$json$Json$Decode$string));
			case 'FilterContains':
				return A2(
					$elm$json$Json$Decode$map,
					$author$project$Main$FilterContainsFieldValueOf,
					A2($elm$json$Json$Decode$field, 'fieldName', $elm$json$Json$Decode$string));
			default:
				return $elm$json$Json$Decode$fail('Unknown choice filter type: ' + type_);
		}
	},
	A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string));
var $author$project$Main$RawCustomElement = F3(
	function (inputType, inputTag, attributes) {
		return {p: attributes, N: inputTag, B: inputType};
	});
var $author$project$Main$defaultInputTag = 'input';
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $author$project$Main$AttributeInvalid = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$filter = F2(
	function (isGood, dict) {
		return A3(
			$elm$core$Dict$foldl,
			F3(
				function (k, v, d) {
					return A2(isGood, k, v) ? A3($elm$core$Dict$insert, k, v, d) : d;
				}),
			$elm$core$Dict$empty,
			dict);
	});
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Basics$neq = _Utils_notEqual;
var $author$project$Main$fromRawCustomElement = function (ele) {
	return {
		p: A2(
			$elm$core$Dict$filter,
			F2(
				function (k, _v0) {
					return k !== 'list';
				}),
			ele.p),
		ae: function () {
			var _v1 = A2($elm$core$Dict$get, 'list', ele.p);
			if (!_v1.$) {
				var s = _v1.a;
				var _v2 = A2(
					$elm$core$String$split,
					'\n',
					$elm$core$String$trim(s));
				if (!_v2.b) {
					return $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
				} else {
					var list = _v2;
					return $author$project$Main$AttributeGiven(
						A2($elm$core$List$map, $author$project$Main$choiceFromString, list));
				}
			} else {
				return $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
			}
		}(),
		N: ele.N,
		B: ele.B,
		aq: function () {
			var _v3 = A2($elm$core$Dict$get, 'max', ele.p);
			if (!_v3.$) {
				if (_v3.a === '') {
					return $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
				} else {
					var value = _v3.a;
					return $author$project$Main$AttributeGiven(value);
				}
			} else {
				return $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
			}
		}(),
		ah: function () {
			var _v4 = A2($elm$core$Dict$get, 'maxlength', ele.p);
			if (!_v4.$) {
				if (_v4.a === '') {
					return $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
				} else {
					var value = _v4.a;
					var _v5 = $elm$core$String$toInt(value);
					if (!_v5.$) {
						var _int = _v5.a;
						return $author$project$Main$AttributeGiven(_int);
					} else {
						return $author$project$Main$AttributeInvalid(value);
					}
				}
			} else {
				return $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
			}
		}(),
		ar: function () {
			var _v6 = A2($elm$core$Dict$get, 'min', ele.p);
			if (!_v6.$) {
				if (_v6.a === '') {
					return $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
				} else {
					var value = _v6.a;
					return $author$project$Main$AttributeGiven(value);
				}
			} else {
				return $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
			}
		}(),
		aM: function () {
			var _v7 = A2($elm$core$Dict$get, 'multiple', ele.p);
			if (!_v7.$) {
				switch (_v7.a) {
					case '':
						return $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
					case 'true':
						return $author$project$Main$AttributeGiven(true);
					case 'false':
						return $author$project$Main$AttributeGiven(false);
					default:
						var value = _v7.a;
						return $author$project$Main$AttributeInvalid(value);
				}
			} else {
				return $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
			}
		}()
	};
};
var $elm$json$Json$Decode$keyValuePairs = _Json_decodeKeyValuePairs;
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $elm_community$json_extra$Json$Decode$Extra$optionalField = F2(
	function (fieldName, decoder) {
		var finishDecoding = function (json) {
			var _v0 = A2(
				$elm$json$Json$Decode$decodeValue,
				A2($elm$json$Json$Decode$field, fieldName, $elm$json$Json$Decode$value),
				json);
			if (!_v0.$) {
				var val = _v0.a;
				return A2(
					$elm$json$Json$Decode$map,
					$elm$core$Maybe$Just,
					A2($elm$json$Json$Decode$field, fieldName, decoder));
			} else {
				return $elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing);
			}
		};
		return A2($elm$json$Json$Decode$andThen, finishDecoding, $elm$json$Json$Decode$value);
	});
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Main$decodeCustomElement = A2(
	$elm$json$Json$Decode$map,
	$author$project$Main$fromRawCustomElement,
	A2(
		$elm_community$json_extra$Json$Decode$Extra$andMap,
		A2(
			$elm$json$Json$Decode$map,
			$elm$core$Dict$fromList,
			A2(
				$elm$json$Json$Decode$map,
				$elm$core$Maybe$withDefault(_List_Nil),
				A2(
					$elm_community$json_extra$Json$Decode$Extra$optionalField,
					'attributes',
					$elm$json$Json$Decode$keyValuePairs($elm$json$Json$Decode$string)))),
		A2(
			$elm_community$json_extra$Json$Decode$Extra$andMap,
			A2(
				$elm$json$Json$Decode$map,
				$elm$core$Maybe$withDefault($author$project$Main$defaultInputTag),
				A2($elm_community$json_extra$Json$Decode$Extra$optionalField, 'inputTag', $elm$json$Json$Decode$string)),
			A2(
				$elm_community$json_extra$Json$Decode$Extra$andMap,
				A2($elm$json$Json$Decode$field, 'inputType', $elm$json$Json$Decode$string),
				$elm$json$Json$Decode$succeed($author$project$Main$RawCustomElement)))));
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $elm$json$Json$Decode$list = _Json_decodeList;
var $elm$json$Json$Decode$maybe = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			]));
};
var $author$project$Main$decodeInputField = A2(
	$elm$json$Json$Decode$andThen,
	function (type_) {
		switch (type_) {
			case 'ShortText':
				return A2($elm$json$Json$Decode$map, $author$project$Main$ShortText, $author$project$Main$decodeCustomElement);
			case 'LongText':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					A2(
						$elm$json$Json$Decode$field,
						'maxLength',
						A2($author$project$Main$decodeAttributeOptional, $elm$core$Maybe$Nothing, $elm$json$Json$Decode$int)),
					$elm$json$Json$Decode$succeed($author$project$Main$LongText));
			case 'Dropdown':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					$elm$json$Json$Decode$maybe(
						A2($elm$json$Json$Decode$field, 'filter', $author$project$Main$decodeChoiceFilter)),
					A2(
						$elm_community$json_extra$Json$Decode$Extra$andMap,
						A2(
							$elm$json$Json$Decode$field,
							'choices',
							$elm$json$Json$Decode$list($author$project$Main$decodeChoice)),
						$elm$json$Json$Decode$succeed(
							F2(
								function (choices, filter) {
									return $author$project$Main$Dropdown(
										{k: choices, e: filter});
								}))));
			case 'ChooseOne':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					$elm$json$Json$Decode$maybe(
						A2($elm$json$Json$Decode$field, 'filter', $author$project$Main$decodeChoiceFilter)),
					A2(
						$elm_community$json_extra$Json$Decode$Extra$andMap,
						A2(
							$elm$json$Json$Decode$field,
							'choices',
							$elm$json$Json$Decode$list($author$project$Main$decodeChoice)),
						$elm$json$Json$Decode$succeed(
							F2(
								function (choices, filter) {
									return $author$project$Main$ChooseOne(
										{k: choices, e: filter});
								}))));
			case 'ChooseMultiple':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					$elm$json$Json$Decode$maybe(
						A2($elm$json$Json$Decode$field, 'filter', $author$project$Main$decodeChoiceFilter)),
					A2(
						$elm_community$json_extra$Json$Decode$Extra$andMap,
						$elm$json$Json$Decode$maybe(
							A2($elm$json$Json$Decode$field, 'maxAllowed', $elm$json$Json$Decode$int)),
						A2(
							$elm_community$json_extra$Json$Decode$Extra$andMap,
							$elm$json$Json$Decode$maybe(
								A2($elm$json$Json$Decode$field, 'minRequired', $elm$json$Json$Decode$int)),
							A2(
								$elm_community$json_extra$Json$Decode$Extra$andMap,
								A2(
									$elm$json$Json$Decode$field,
									'choices',
									$elm$json$Json$Decode$list($author$project$Main$decodeChoice)),
								$elm$json$Json$Decode$succeed(
									F4(
										function (choices, minRequired, maxAllowed, filter) {
											return $author$project$Main$ChooseMultiple(
												{k: choices, e: filter, T: maxAllowed, P: minRequired});
										}))))));
			default:
				return $elm$json$Json$Decode$fail('Unknown input field type: ' + type_);
		}
	},
	A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string));
var $author$project$Main$Optional = 1;
var $author$project$Main$System = 2;
var $author$project$Main$Required = 0;
var $author$project$Main$decodePresenceString = A2(
	$elm$json$Json$Decode$andThen,
	function (str) {
		switch (str) {
			case 'Required':
				return $elm$json$Json$Decode$succeed(0);
			case 'Optional':
				return $elm$json$Json$Decode$succeed(1);
			case 'System':
				return $elm$json$Json$Decode$succeed(2);
			default:
				return $elm$json$Json$Decode$fail('Unknown presence: ' + str);
		}
	},
	$elm$json$Json$Decode$string);
var $author$project$Main$decodePresence = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			$author$project$Main$decodePresenceString,
			A2(
			$elm$json$Json$Decode$andThen,
			function (type_) {
				switch (type_) {
					case 'System':
						return $elm$json$Json$Decode$succeed(2);
					case 'SystemRequired':
						return $elm$json$Json$Decode$succeed(2);
					case 'SystemOptional':
						return $elm$json$Json$Decode$succeed(1);
					default:
						return $elm$json$Json$Decode$fail('Unknown presence type: ' + type_);
				}
			},
			A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string))
		]));
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $author$project$Main$decodeRequired = A2(
	$elm$json$Json$Decode$map,
	function (b) {
		return b ? 0 : 1;
	},
	A2($elm$json$Json$Decode$field, 'required', $elm$json$Json$Decode$bool));
var $author$project$Main$HideWhen = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$ShowWhen = function (a) {
	return {$: 0, a: a};
};
var $author$project$Main$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $author$project$Main$EndsWith = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$Equals = function (a) {
	return {$: 0, a: a};
};
var $author$project$Main$EqualsField = function (a) {
	return {$: 4, a: a};
};
var $author$project$Main$GreaterThan = function (a) {
	return {$: 3, a: a};
};
var $author$project$Main$StringContains = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$decodeComparison = A2(
	$elm$json$Json$Decode$andThen,
	function (str) {
		switch (str) {
			case 'Equals':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					A2($elm$json$Json$Decode$field, 'value', $elm$json$Json$Decode$string),
					$elm$json$Json$Decode$succeed($author$project$Main$Equals));
			case 'StringContains':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					A2($elm$json$Json$Decode$field, 'value', $elm$json$Json$Decode$string),
					$elm$json$Json$Decode$succeed($author$project$Main$StringContains));
			case 'EndsWith':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					A2($elm$json$Json$Decode$field, 'value', $elm$json$Json$Decode$string),
					$elm$json$Json$Decode$succeed($author$project$Main$EndsWith));
			case 'GreaterThan':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					A2($elm$json$Json$Decode$field, 'value', $elm$json$Json$Decode$string),
					$elm$json$Json$Decode$succeed($author$project$Main$GreaterThan));
			case 'EqualsField':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					A2($elm$json$Json$Decode$field, 'value', $elm$json$Json$Decode$string),
					$elm$json$Json$Decode$succeed($author$project$Main$EqualsField));
			default:
				return $elm$json$Json$Decode$fail('Unknown comparison type: ' + str);
		}
	},
	A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string));
var $author$project$Main$decodeCondition = A2(
	$elm$json$Json$Decode$andThen,
	function (str) {
		if (str === 'Field') {
			return A2(
				$elm_community$json_extra$Json$Decode$Extra$andMap,
				A2($elm$json$Json$Decode$field, 'comparison', $author$project$Main$decodeComparison),
				A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					A2($elm$json$Json$Decode$field, 'fieldName', $elm$json$Json$Decode$string),
					$elm$json$Json$Decode$succeed($author$project$Main$Field)));
		} else {
			return $elm$json$Json$Decode$fail('Unknown condition type: ' + str);
		}
	},
	A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string));
var $author$project$Main$decodeVisibilityRule = A2(
	$elm$json$Json$Decode$andThen,
	function (str) {
		switch (str) {
			case 'ShowWhen':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					A2(
						$elm$json$Json$Decode$field,
						'conditions',
						$elm$json$Json$Decode$list($author$project$Main$decodeCondition)),
					$elm$json$Json$Decode$succeed($author$project$Main$ShowWhen));
			case 'HideWhen':
				return A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					A2(
						$elm$json$Json$Decode$field,
						'conditions',
						$elm$json$Json$Decode$list($author$project$Main$decodeCondition)),
					$elm$json$Json$Decode$succeed($author$project$Main$HideWhen));
			default:
				return $elm$json$Json$Decode$fail('Unknown visibility rule: ' + str);
		}
	},
	A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string));
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$json$Json$Decode$nullable = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder)
			]));
};
var $elm_community$json_extra$Json$Decode$Extra$optionalNullableField = F2(
	function (fieldName, decoder) {
		return A2(
			$elm$json$Json$Decode$map,
			$elm$core$Maybe$andThen($elm$core$Basics$identity),
			A2(
				$elm_community$json_extra$Json$Decode$Extra$optionalField,
				fieldName,
				$elm$json$Json$Decode$nullable(decoder)));
	});
var $author$project$Main$decodeFormField = A2(
	$elm_community$json_extra$Json$Decode$Extra$andMap,
	A2(
		$elm$json$Json$Decode$map,
		$elm$core$Maybe$withDefault(_List_Nil),
		A2(
			$elm_community$json_extra$Json$Decode$Extra$optionalNullableField,
			'visibilityRule',
			$elm$json$Json$Decode$list($author$project$Main$decodeVisibilityRule))),
	A2(
		$elm_community$json_extra$Json$Decode$Extra$andMap,
		A2($elm$json$Json$Decode$field, 'type', $author$project$Main$decodeInputField),
		A2(
			$elm_community$json_extra$Json$Decode$Extra$andMap,
			$author$project$Main$decodeFormFieldDescription,
			A2(
				$elm_community$json_extra$Json$Decode$Extra$andMap,
				$elm$json$Json$Decode$oneOf(
					_List_fromArray(
						[
							A2($elm$json$Json$Decode$field, 'presence', $author$project$Main$decodePresence),
							$author$project$Main$decodeRequired
						])),
				A2(
					$elm_community$json_extra$Json$Decode$Extra$andMap,
					$author$project$Main$decodeFormFieldMaybeName,
					A2(
						$elm_community$json_extra$Json$Decode$Extra$andMap,
						A2($elm$json$Json$Decode$field, 'label', $elm$json$Json$Decode$string),
						$elm$json$Json$Decode$succeed($author$project$Main$FormField)))))));
var $elm$core$Array$fromListHelp = F3(
	function (list, nodeList, nodeListSize) {
		fromListHelp:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, list);
			var jsArray = _v0.a;
			var remainingItems = _v0.b;
			if (_Utils_cmp(
				$elm$core$Elm$JsArray$length(jsArray),
				$elm$core$Array$branchFactor) < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					true,
					{y: nodeList, s: nodeListSize, x: jsArray});
			} else {
				var $temp$list = remainingItems,
					$temp$nodeList = A2(
					$elm$core$List$cons,
					$elm$core$Array$Leaf(jsArray),
					nodeList),
					$temp$nodeListSize = nodeListSize + 1;
				list = $temp$list;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue fromListHelp;
			}
		}
	});
var $elm$core$Array$fromList = function (list) {
	if (!list.b) {
		return $elm$core$Array$empty;
	} else {
		return A3($elm$core$Array$fromListHelp, list, _List_Nil, 0);
	}
};
var $author$project$Main$decodeFormFields = A2(
	$elm$json$Json$Decode$map,
	$elm$core$Array$fromList,
	$elm$json$Json$Decode$list($author$project$Main$decodeFormField));
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm$json$Json$Decode$dict = function (decoder) {
	return A2(
		$elm$json$Json$Decode$map,
		$elm$core$Dict$fromList,
		$elm$json$Json$Decode$keyValuePairs(decoder));
};
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $author$project$Main$decodeShortTextTypeList = function () {
	var decodeInputTagAttributes = A2(
		$elm_community$json_extra$Json$Decode$Extra$andMap,
		A2(
			$elm$json$Json$Decode$map,
			$elm$core$Dict$fromList,
			A2(
				$elm$json$Json$Decode$field,
				'attributes',
				$elm$json$Json$Decode$keyValuePairs($elm$json$Json$Decode$string))),
		A2(
			$elm_community$json_extra$Json$Decode$Extra$andMap,
			A2(
				$elm$json$Json$Decode$map,
				$elm$core$Maybe$withDefault($author$project$Main$defaultInputTag),
				A2($elm_community$json_extra$Json$Decode$Extra$optionalField, 'inputTag', $elm$json$Json$Decode$string)),
			$elm$json$Json$Decode$succeed($elm$core$Tuple$pair)));
	var decodeAttributes = A2(
		$elm$json$Json$Decode$map,
		function (attributes) {
			return _Utils_Tuple2($author$project$Main$defaultInputTag, attributes);
		},
		$elm$json$Json$Decode$dict($elm$json$Json$Decode$string));
	var customElementsFrom = function (dict) {
		return A2(
			$elm$core$List$map,
			function (_v0) {
				var inputType = _v0.a;
				var _v1 = _v0.b;
				var inputTag = _v1.a;
				var attributes = _v1.b;
				return $author$project$Main$fromRawCustomElement(
					{p: attributes, N: inputTag, B: inputType});
			},
			$elm$core$Dict$toList(dict));
	};
	return A2(
		$elm$json$Json$Decode$map,
		$elm$core$List$concatMap(customElementsFrom),
		$elm$json$Json$Decode$list(
			$elm$json$Json$Decode$dict(
				$elm$json$Json$Decode$oneOf(
					_List_fromArray(
						[decodeInputTagAttributes, decodeAttributes])))));
}();
var $elm_community$json_extra$Json$Decode$Extra$fromMaybe = F2(
	function (error, val) {
		if (!val.$) {
			var v = val.a;
			return $elm$json$Json$Decode$succeed(v);
		} else {
			return $elm$json$Json$Decode$fail(error);
		}
	});
var $author$project$Main$CollectData = {$: 1};
var $author$project$Main$viewModeFromString = function (str) {
	switch (str) {
		case 'Editor':
			return $elm$core$Maybe$Just(
				$author$project$Main$Editor(
					{aB: $elm$core$Maybe$Nothing}));
		case 'CollectData':
			return $elm$core$Maybe$Just($author$project$Main$CollectData);
		default:
			return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Main$decodeViewMode = A2(
	$elm$json$Json$Decode$andThen,
	$elm_community$json_extra$Json$Decode$Extra$fromMaybe('Invalid viewMode: Editor | Preview | CollectData'),
	A2($elm$json$Json$Decode$map, $author$project$Main$viewModeFromString, $elm$json$Json$Decode$string));
var $elm$json$Json$Encode$null = _Json_encodeNull;
var $author$project$Main$decodeConfig = A2(
	$elm_community$json_extra$Json$Decode$Extra$andMap,
	A2(
		$elm$json$Json$Decode$map,
		$elm$core$Maybe$withDefault(
			_List_fromArray(
				[
					$author$project$Main$fromRawCustomElement(
					{
						p: $elm$core$Dict$fromList(
							_List_fromArray(
								[
									_Utils_Tuple2('type', 'text')
								])),
						N: $author$project$Main$defaultInputTag,
						B: 'Single-line free text'
					})
				])),
		A2($elm_community$json_extra$Json$Decode$Extra$optionalNullableField, 'shortTextTypeList', $author$project$Main$decodeShortTextTypeList)),
	A2(
		$elm_community$json_extra$Json$Decode$Extra$andMap,
		A2(
			$elm$json$Json$Decode$map,
			$elm$core$Maybe$withDefault($elm$json$Json$Encode$null),
			A2($elm_community$json_extra$Json$Decode$Extra$optionalNullableField, 'formValues', $elm$json$Json$Decode$value)),
		A2(
			$elm_community$json_extra$Json$Decode$Extra$andMap,
			A2(
				$elm$json$Json$Decode$map,
				$elm$core$Maybe$withDefault($elm$core$Array$empty),
				A2($elm_community$json_extra$Json$Decode$Extra$optionalNullableField, 'formFields', $author$project$Main$decodeFormFields)),
			A2(
				$elm_community$json_extra$Json$Decode$Extra$andMap,
				A2(
					$elm$json$Json$Decode$map,
					$elm$core$Maybe$withDefault(
						$author$project$Main$Editor(
							{aB: $elm$core$Maybe$Nothing})),
					A2($elm_community$json_extra$Json$Decode$Extra$optionalNullableField, 'viewMode', $author$project$Main$decodeViewMode)),
				$elm$json$Json$Decode$succeed($author$project$Main$Config)))));
var $elm$core$List$singleton = function (value) {
	return _List_fromArray(
		[value]);
};
var $author$project$Main$decodeListOrSingleton = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$elm$json$Json$Decode$list(decoder),
				A2($elm$json$Json$Decode$map, $elm$core$List$singleton, decoder)
			]));
};
var $author$project$Main$encodeAttributeOptional = F2(
	function (encodeValue, attributeOptional) {
		switch (attributeOptional.$) {
			case 0:
				return $elm$json$Json$Encode$null;
			case 1:
				return $elm$json$Json$Encode$null;
			default:
				var value = attributeOptional.a;
				return encodeValue(value);
		}
	});
var $author$project$Main$choiceToString = function (choice) {
	return _Utils_eq(
		$elm$core$String$trim(choice.d),
		$elm$core$String$trim(choice.j)) ? choice.d : _Utils_ap(
		choice.j,
		_Utils_ap($author$project$Main$choiceDelimiter, choice.d));
};
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Main$encodeChoice = function (choice) {
	return $elm$json$Json$Encode$string(
		$author$project$Main$choiceToString(choice));
};
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(0),
			pairs));
};
var $author$project$Main$encodeChoiceFilter = function (filter) {
	if (!filter.$) {
		var fieldName = filter.a;
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'type',
					$elm$json$Json$Encode$string('FilterStartsWith')),
					_Utils_Tuple2(
					'fieldName',
					$elm$json$Json$Encode$string(fieldName))
				]));
	} else {
		var fieldName = filter.a;
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'type',
					$elm$json$Json$Encode$string('FilterContains')),
					_Utils_Tuple2(
					'fieldName',
					$elm$json$Json$Encode$string(fieldName))
				]));
	}
};
var $elm$core$Tuple$mapSecond = F2(
	function (func, _v0) {
		var x = _v0.a;
		var y = _v0.b;
		return _Utils_Tuple2(
			x,
			func(y));
	});
var $author$project$Main$encodePairsFromRawCustomElements = function (customElement) {
	var inputTagAttrs = _Utils_eq(customElement.N, $author$project$Main$defaultInputTag) ? _List_Nil : _List_fromArray(
		[
			_Utils_Tuple2(
			'inputTag',
			$elm$json$Json$Encode$string(customElement.N))
		]);
	var encodedAttrs = function () {
		var _v0 = A2(
			$elm$core$List$map,
			$elm$core$Tuple$mapSecond($elm$json$Json$Encode$string),
			$elm$core$Dict$toList(customElement.p));
		if (!_v0.b) {
			return _List_Nil;
		} else {
			var pairs = _v0;
			return _List_fromArray(
				[
					_Utils_Tuple2(
					'attributes',
					$elm$json$Json$Encode$object(pairs))
				]);
		}
	}();
	return A2(
		$elm$core$List$cons,
		_Utils_Tuple2(
			'inputType',
			$elm$json$Json$Encode$string(customElement.B)),
		_Utils_ap(inputTagAttrs, encodedAttrs));
};
var $author$project$Main$toRawCustomElement = function (ele) {
	var addMultipleIfGiven = function (dict) {
		var _v7 = ele.aM;
		if (_v7.$ === 2) {
			if (_v7.a) {
				return A3($elm$core$Dict$insert, 'multiple', 'true', dict);
			} else {
				return A3($elm$core$Dict$insert, 'multiple', 'false', dict);
			}
		} else {
			return A2(
				$elm$core$Dict$filter,
				F2(
					function (k, _v8) {
						return k !== 'multiple';
					}),
				dict);
		}
	};
	var addMinIfGiven = function (dict) {
		var _v5 = ele.ar;
		if (_v5.$ === 2) {
			var value = _v5.a;
			return A3($elm$core$Dict$insert, 'min', value, dict);
		} else {
			return A2(
				$elm$core$Dict$filter,
				F2(
					function (k, _v6) {
						return k !== 'min';
					}),
				dict);
		}
	};
	var addMaxLengthIfGiven = function (dict) {
		var _v3 = ele.ah;
		if (_v3.$ === 2) {
			var _int = _v3.a;
			return A3(
				$elm$core$Dict$insert,
				'maxlength',
				$elm$core$String$fromInt(_int),
				dict);
		} else {
			return A2(
				$elm$core$Dict$filter,
				F2(
					function (k, _v4) {
						return k !== 'maxlength';
					}),
				dict);
		}
	};
	var addMaxIfGiven = function (dict) {
		var _v1 = ele.aq;
		if (_v1.$ === 2) {
			var value = _v1.a;
			return A3($elm$core$Dict$insert, 'max', value, dict);
		} else {
			return A2(
				$elm$core$Dict$filter,
				F2(
					function (k, _v2) {
						return k !== 'max';
					}),
				dict);
		}
	};
	var addDatalistIfGiven = function (dict) {
		var _v0 = ele.ae;
		switch (_v0.$) {
			case 2:
				var list = _v0.a;
				return A3(
					$elm$core$Dict$insert,
					'list',
					A2(
						$elm$core$String$join,
						'\n',
						A2($elm$core$List$map, $author$project$Main$choiceToString, list)),
					dict);
			case 1:
				return dict;
			default:
				return dict;
		}
	};
	return {
		p: addMaxIfGiven(
			addMinIfGiven(
				addDatalistIfGiven(
					addMultipleIfGiven(
						addMaxLengthIfGiven(ele.p))))),
		N: ele.N,
		B: ele.B
	};
};
var $author$project$Main$encodePairsFromCustomElement = function (customElement) {
	return $author$project$Main$encodePairsFromRawCustomElements(
		$author$project$Main$toRawCustomElement(customElement));
};
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $elm$json$Json$Encode$int = _Json_wrap;
var $elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				$elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(0),
				entries));
	});
var $author$project$Main$encodeInputField = function (inputField) {
	switch (inputField.$) {
		case 0:
			var customElement = inputField.a;
			return $elm$json$Json$Encode$object(
				A2(
					$elm$core$List$cons,
					_Utils_Tuple2(
						'type',
						$elm$json$Json$Encode$string('ShortText')),
					$author$project$Main$encodePairsFromCustomElement(customElement)));
		case 1:
			var optionalMaxLength = inputField.a;
			return $elm$json$Json$Encode$object(
				_List_fromArray(
					[
						_Utils_Tuple2(
						'type',
						$elm$json$Json$Encode$string('LongText')),
						_Utils_Tuple2(
						'maxLength',
						A2($author$project$Main$encodeAttributeOptional, $elm$json$Json$Encode$int, optionalMaxLength))
					]));
		case 2:
			var choices = inputField.a.k;
			var filter = inputField.a.e;
			return $elm$json$Json$Encode$object(
				_Utils_ap(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'type',
							$elm$json$Json$Encode$string('Dropdown')),
							_Utils_Tuple2(
							'choices',
							A2(
								$elm$json$Json$Encode$list,
								$author$project$Main$encodeChoice,
								A2(
									$elm$core$List$filter,
									function (_v1) {
										var value = _v1.j;
										return $elm$core$String$trim(value) !== '';
									},
									choices)))
						]),
					function () {
						if (!filter.$) {
							var f = filter.a;
							return _List_fromArray(
								[
									_Utils_Tuple2(
									'filter',
									$author$project$Main$encodeChoiceFilter(f))
								]);
						} else {
							return _List_Nil;
						}
					}()));
		case 3:
			var choices = inputField.a.k;
			var filter = inputField.a.e;
			return $elm$json$Json$Encode$object(
				_Utils_ap(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'type',
							$elm$json$Json$Encode$string('ChooseOne')),
							_Utils_Tuple2(
							'choices',
							A2(
								$elm$json$Json$Encode$list,
								$author$project$Main$encodeChoice,
								A2(
									$elm$core$List$filter,
									function (_v3) {
										var value = _v3.j;
										return $elm$core$String$trim(value) !== '';
									},
									choices)))
						]),
					function () {
						if (!filter.$) {
							var f = filter.a;
							return _List_fromArray(
								[
									_Utils_Tuple2(
									'filter',
									$author$project$Main$encodeChoiceFilter(f))
								]);
						} else {
							return _List_Nil;
						}
					}()));
		default:
			var choices = inputField.a.k;
			var minRequired = inputField.a.P;
			var maxAllowed = inputField.a.T;
			var filter = inputField.a.e;
			return $elm$json$Json$Encode$object(
				_Utils_ap(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'type',
							$elm$json$Json$Encode$string('ChooseMultiple')),
							_Utils_Tuple2(
							'choices',
							A2(
								$elm$json$Json$Encode$list,
								$author$project$Main$encodeChoice,
								A2(
									$elm$core$List$filter,
									function (_v5) {
										var value = _v5.j;
										return $elm$core$String$trim(value) !== '';
									},
									choices)))
						]),
					_Utils_ap(
						function () {
							if (!minRequired.$) {
								var min = minRequired.a;
								return _List_fromArray(
									[
										_Utils_Tuple2(
										'minRequired',
										$elm$json$Json$Encode$int(min))
									]);
							} else {
								return _List_Nil;
							}
						}(),
						_Utils_ap(
							function () {
								if (!maxAllowed.$) {
									var max = maxAllowed.a;
									return _List_fromArray(
										[
											_Utils_Tuple2(
											'maxAllowed',
											$elm$json$Json$Encode$int(max))
										]);
								} else {
									return _List_Nil;
								}
							}(),
							function () {
								if (!filter.$) {
									var f = filter.a;
									return _List_fromArray(
										[
											_Utils_Tuple2(
											'filter',
											$author$project$Main$encodeChoiceFilter(f))
										]);
								} else {
									return _List_Nil;
								}
							}()))));
	}
};
var $author$project$Main$encodePresence = function (presence) {
	switch (presence) {
		case 0:
			return $elm$json$Json$Encode$string('Required');
		case 1:
			return $elm$json$Json$Encode$string('Optional');
		default:
			return $elm$json$Json$Encode$string('System');
	}
};
var $author$project$Main$encodeComparison = function (comparison) {
	switch (comparison.$) {
		case 0:
			var value = comparison.a;
			return $elm$json$Json$Encode$object(
				_List_fromArray(
					[
						_Utils_Tuple2(
						'type',
						$elm$json$Json$Encode$string('Equals')),
						_Utils_Tuple2(
						'value',
						$elm$json$Json$Encode$string(value))
					]));
		case 1:
			var value = comparison.a;
			return $elm$json$Json$Encode$object(
				_List_fromArray(
					[
						_Utils_Tuple2(
						'type',
						$elm$json$Json$Encode$string('StringContains')),
						_Utils_Tuple2(
						'value',
						$elm$json$Json$Encode$string(value))
					]));
		case 2:
			var value = comparison.a;
			return $elm$json$Json$Encode$object(
				_List_fromArray(
					[
						_Utils_Tuple2(
						'type',
						$elm$json$Json$Encode$string('EndsWith')),
						_Utils_Tuple2(
						'value',
						$elm$json$Json$Encode$string(value))
					]));
		case 3:
			var value = comparison.a;
			return $elm$json$Json$Encode$object(
				_List_fromArray(
					[
						_Utils_Tuple2(
						'type',
						$elm$json$Json$Encode$string('GreaterThan')),
						_Utils_Tuple2(
						'value',
						$elm$json$Json$Encode$string(value))
					]));
		default:
			var fieldName = comparison.a;
			return $elm$json$Json$Encode$object(
				_List_fromArray(
					[
						_Utils_Tuple2(
						'type',
						$elm$json$Json$Encode$string('EqualsField')),
						_Utils_Tuple2(
						'value',
						$elm$json$Json$Encode$string(fieldName))
					]));
	}
};
var $author$project$Main$encodeCondition = function (condition) {
	var fieldName = condition.a;
	var comparison = condition.b;
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'type',
				$elm$json$Json$Encode$string('Field')),
				_Utils_Tuple2(
				'fieldName',
				$elm$json$Json$Encode$string(fieldName)),
				_Utils_Tuple2(
				'comparison',
				$author$project$Main$encodeComparison(comparison))
			]));
};
var $author$project$Main$encodeVisibilityRule = function (rule) {
	if (!rule.$) {
		var conditions = rule.a;
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'type',
					$elm$json$Json$Encode$string('ShowWhen')),
					_Utils_Tuple2(
					'conditions',
					A2($elm$json$Json$Encode$list, $author$project$Main$encodeCondition, conditions))
				]));
	} else {
		var conditions = rule.a;
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'type',
					$elm$json$Json$Encode$string('HideWhen')),
					_Utils_Tuple2(
					'conditions',
					A2($elm$json$Json$Encode$list, $author$project$Main$encodeCondition, conditions))
				]));
	}
};
var $author$project$Main$encodeFormFields = function (formFields) {
	return A2(
		$elm$json$Json$Encode$list,
		$elm$core$Basics$identity,
		A2(
			$elm$core$List$map,
			function (formField) {
				return $elm$json$Json$Encode$object(
					A2(
						$elm$core$List$filter,
						function (_v1) {
							var v = _v1.b;
							return !_Utils_eq(v, $elm$json$Json$Encode$null);
						},
						_List_fromArray(
							[
								_Utils_Tuple2(
								'label',
								$elm$json$Json$Encode$string(formField.d)),
								_Utils_Tuple2(
								'name',
								function () {
									var _v0 = formField.Q;
									if (!_v0.$) {
										var name = _v0.a;
										return $elm$json$Json$Encode$string(name);
									} else {
										return $elm$json$Json$Encode$null;
									}
								}()),
								_Utils_Tuple2(
								'presence',
								$author$project$Main$encodePresence(formField.w)),
								_Utils_Tuple2(
								'description',
								A2($author$project$Main$encodeAttributeOptional, $elm$json$Json$Encode$string, formField.S)),
								_Utils_Tuple2(
								'type',
								$author$project$Main$encodeInputField(formField.a)),
								_Utils_Tuple2(
								'visibilityRule',
								A2($elm$json$Json$Encode$list, $author$project$Main$encodeVisibilityRule, formField.m))
							])));
			},
			$elm$core$Array$toList(formFields)));
};
var $author$project$Main$encodePortOutgoingValue = function (value) {
	if (!value.$) {
		var formFields = value.a;
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'type',
					$elm$json$Json$Encode$string('formFields')),
					_Utils_Tuple2(
					'formFields',
					$author$project$Main$encodeFormFields(formFields))
				]));
	} else {
		var formValues = value.a;
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'type',
					$elm$json$Json$Encode$string('formValues')),
					_Utils_Tuple2('formValues', formValues)
				]));
	}
};
var $author$project$Main$fieldNameOf = function (formField) {
	return A2($elm$core$Maybe$withDefault, formField.d, formField.Q);
};
var $elm$core$Array$filter = F2(
	function (isGood, array) {
		return $elm$core$Array$fromList(
			A3(
				$elm$core$Array$foldr,
				F2(
					function (x, xs) {
						return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
					}),
				_List_Nil,
				array));
	});
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $author$project$Main$filterValuesByFieldChoices = F2(
	function (field, values) {
		var _v0 = field.a;
		switch (_v0.$) {
			case 2:
				var choices = _v0.a.k;
				var validChoiceValues = A2(
					$elm$core$List$map,
					function ($) {
						return $.j;
					},
					choices);
				return A2(
					$elm$core$List$filter,
					function (value) {
						return A2($elm$core$List$member, value, validChoiceValues);
					},
					values);
			case 3:
				var choices = _v0.a.k;
				var validChoiceValues = A2(
					$elm$core$List$map,
					function ($) {
						return $.j;
					},
					choices);
				return A2(
					$elm$core$List$filter,
					function (value) {
						return A2($elm$core$List$member, value, validChoiceValues);
					},
					values);
			case 4:
				var choices = _v0.a.k;
				var validChoiceValues = A2(
					$elm$core$List$map,
					function ($) {
						return $.j;
					},
					choices);
				return A2(
					$elm$core$List$filter,
					function (value) {
						return A2($elm$core$List$member, value, validChoiceValues);
					},
					values);
			default:
				return values;
		}
	});
var $elm$core$Array$isEmpty = function (_v0) {
	var len = _v0.a;
	return !len;
};
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Main$isUsingFilter = function (formField) {
	var _v0 = formField.a;
	switch (_v0.$) {
		case 0:
			return false;
		case 1:
			return false;
		case 4:
			var filter = _v0.a.e;
			return !_Utils_eq(filter, $elm$core$Maybe$Nothing);
		case 3:
			var filter = _v0.a.e;
			return !_Utils_eq(filter, $elm$core$Maybe$Nothing);
		default:
			var filter = _v0.a.e;
			return !_Utils_eq(filter, $elm$core$Maybe$Nothing);
	}
};
var $elm$core$Array$length = function (_v0) {
	var len = _v0.a;
	return len;
};
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$Result$toMaybe = function (result) {
	if (!result.$) {
		var v = result.a;
		return $elm$core$Maybe$Just(v);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Main$maybeDecode = F3(
	function (key, decoder, jsonValue) {
		return A2(
			$elm$core$Maybe$andThen,
			$elm$core$Basics$identity,
			$elm$core$Result$toMaybe(
				A2(
					$elm$json$Json$Decode$decodeValue,
					A2($elm_community$json_extra$Json$Decode$Extra$optionalField, key, decoder),
					jsonValue)));
	});
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $elm$core$Basics$not = _Basics_not;
var $author$project$Main$outgoing = _Platform_outgoingPort('outgoing', $elm$core$Basics$identity);
var $author$project$Main$init = function (flags) {
	var defaultShortTextTypeList = _List_fromArray(
		[
			$author$project$Main$fromRawCustomElement(
			{
				p: $elm$core$Dict$fromList(
					_List_fromArray(
						[
							_Utils_Tuple2('type', 'text')
						])),
				N: $author$project$Main$defaultInputTag,
				B: 'Single-line free text'
			})
		]);
	var defaultShortTextTypeListWithout = function (shortTextTypeList) {
		return A2(
			$elm$core$List$filter,
			function (a) {
				return !A2($elm$core$List$member, a, shortTextTypeList);
			},
			defaultShortTextTypeList);
	};
	var _v0 = A2($elm$json$Json$Decode$decodeValue, $author$project$Main$decodeConfig, flags);
	if (!_v0.$) {
		var config = _v0.a;
		var initialTrackedFormValues = $elm$core$Dict$fromList(
			A2(
				$elm$core$List$map,
				function (field) {
					var fieldName = $author$project$Main$fieldNameOf(field);
					var rawValues = function () {
						var _v1 = field.a;
						if (_v1.$ === 4) {
							return A2(
								$elm$core$Maybe$withDefault,
								_List_Nil,
								A3(
									$author$project$Main$maybeDecode,
									fieldName,
									$author$project$Main$decodeListOrSingleton($elm$json$Json$Decode$string),
									config.a7));
						} else {
							return A2(
								$elm$core$Maybe$withDefault,
								_List_Nil,
								A2(
									$elm$core$Maybe$map,
									$elm$core$List$singleton,
									A3($author$project$Main$maybeDecode, fieldName, $elm$json$Json$Decode$string, config.a7)));
						}
					}();
					var filteredValues = A2($author$project$Main$filterValuesByFieldChoices, field, rawValues);
					return _Utils_Tuple2(fieldName, filteredValues);
				},
				$elm$core$Array$toList(config.g)));
		var effectiveShortTextTypeList = _Utils_ap(
			defaultShortTextTypeListWithout(config.al),
			config.al);
		return _Utils_Tuple2(
			{
				q: $elm$core$Maybe$Nothing,
				g: config.g,
				aW: $elm$core$Maybe$Nothing,
				_: !$elm$core$Array$isEmpty(
					A2(
						$elm$core$Array$filter,
						function (f) {
							return $author$project$Main$isUsingFilter(f) || (!$elm$core$List$isEmpty(f.m));
						},
						config.g)),
				aa: $elm$core$Array$length(config.g) + 1,
				F: $elm$core$Maybe$Nothing,
				ak: $elm$core$Dict$fromList(
					A2(
						$elm$core$List$map,
						function (customElement) {
							return _Utils_Tuple2(customElement.B, customElement);
						},
						effectiveShortTextTypeList)),
				al: effectiveShortTextTypeList,
				u: initialTrackedFormValues,
				ac: config.ac
			},
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						$author$project$Main$outgoing(
						$author$project$Main$encodePortOutgoingValue(
							$author$project$Main$PortOutgoingFormFields(config.g)))
					])));
	} else {
		var err = _v0.a;
		return _Utils_Tuple2(
			{
				q: $elm$core$Maybe$Nothing,
				g: $elm$core$Array$empty,
				aW: $elm$core$Maybe$Just(
					$elm$json$Json$Decode$errorToString(err)),
				_: false,
				aa: 1,
				F: $elm$core$Maybe$Nothing,
				ak: $elm$core$Dict$empty,
				al: _List_Nil,
				u: $elm$core$Dict$empty,
				ac: $author$project$Main$Editor(
					{aB: $elm$core$Maybe$Nothing})
			},
			$elm$core$Platform$Cmd$none);
	}
};
var $author$project$Main$OnPortIncoming = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$incoming = _Platform_incomingPort('incoming', $elm$json$Json$Decode$value);
var $author$project$Main$subscriptions = function (_v0) {
	return $author$project$Main$incoming($author$project$Main$OnPortIncoming);
};
var $author$project$Main$AnimateYellowFade = 0;
var $author$project$Main$DoSleepDo = F2(
	function (a, b) {
		return {$: 14, a: a, b: b};
	});
var $author$project$Main$DragExisting = function (a) {
	return {$: 0, a: a};
};
var $author$project$Main$DragNew = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$Drop = function (a) {
	return {$: 13, a: a};
};
var $author$project$Main$PortOutgoingFormValues = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$SetEditorAnimate = function (a) {
	return {$: 7, a: a};
};
var $elm$core$Basics$always = F2(
	function (a, _v0) {
		return a;
	});
var $author$project$Main$animateFadeDuration = 500;
var $author$project$Main$decodePortIncomingValue = A2(
	$elm$json$Json$Decode$andThen,
	function (type_) {
		return $elm$json$Json$Decode$fail('Unknown port event type: ' + type_);
	},
	A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string));
var $elm$json$Json$Encode$dict = F3(
	function (toKey, toValue, dictionary) {
		return _Json_wrap(
			A3(
				$elm$core$Dict$foldl,
				F3(
					function (key, value, obj) {
						return A3(
							_Json_addField,
							toKey(key),
							toValue(value),
							obj);
					}),
				_Json_emptyObject(0),
				dictionary));
	});
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$Elm$JsArray$foldl = _JsArray_foldl;
var $elm$core$Elm$JsArray$indexedMap = _JsArray_indexedMap;
var $elm$core$Bitwise$shiftLeftBy = _Bitwise_shiftLeftBy;
var $elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $elm$core$Array$tailIndex = function (len) {
	return (len >>> 5) << 5;
};
var $elm$core$Array$indexedMap = F2(
	function (func, _v0) {
		var len = _v0.a;
		var tree = _v0.c;
		var tail = _v0.d;
		var initialBuilder = {
			y: _List_Nil,
			s: 0,
			x: A3(
				$elm$core$Elm$JsArray$indexedMap,
				func,
				$elm$core$Array$tailIndex(len),
				tail)
		};
		var helper = F2(
			function (node, builder) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldl, helper, builder, subTree);
				} else {
					var leaf = node.a;
					var offset = builder.s * $elm$core$Array$branchFactor;
					var mappedLeaf = $elm$core$Array$Leaf(
						A3($elm$core$Elm$JsArray$indexedMap, func, offset, leaf));
					return {
						y: A2($elm$core$List$cons, mappedLeaf, builder.y),
						s: builder.s + 1,
						x: builder.x
					};
				}
			});
		return A2(
			$elm$core$Array$builderToArray,
			true,
			A3($elm$core$Elm$JsArray$foldl, helper, initialBuilder, tree));
	});
var $author$project$Main$mustBeOptional = function (inputField) {
	switch (inputField.$) {
		case 0:
			return false;
		case 1:
			return false;
		case 2:
			return false;
		case 3:
			return false;
		default:
			return true;
	}
};
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Array$bitMask = 4294967295 >>> (32 - $elm$core$Array$shiftStep);
var $elm$core$Basics$ge = _Utils_ge;
var $elm$core$Elm$JsArray$unsafeGet = _JsArray_unsafeGet;
var $elm$core$Array$getHelp = F3(
	function (shift, index, tree) {
		getHelp:
		while (true) {
			var pos = $elm$core$Array$bitMask & (index >>> shift);
			var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (!_v0.$) {
				var subTree = _v0.a;
				var $temp$shift = shift - $elm$core$Array$shiftStep,
					$temp$index = index,
					$temp$tree = subTree;
				shift = $temp$shift;
				index = $temp$index;
				tree = $temp$tree;
				continue getHelp;
			} else {
				var values = _v0.a;
				return A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, values);
			}
		}
	});
var $elm$core$Array$get = F2(
	function (index, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? $elm$core$Maybe$Nothing : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? $elm$core$Maybe$Just(
			A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, tail)) : $elm$core$Maybe$Just(
			A3($elm$core$Array$getHelp, startShift, index, tree)));
	});
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $elm_community$list_extra$List$Extra$splitAt = F2(
	function (n, xs) {
		return _Utils_Tuple2(
			A2($elm$core$List$take, n, xs),
			A2($elm$core$List$drop, n, xs));
	});
var $author$project$Main$onDropped = F2(
	function (targetIndex, model) {
		var _v0 = model.q;
		if (!_v0.$) {
			if (!_v0.a.$) {
				var dragIndex = _v0.a.a.a6;
				var dropIndex = _v0.a.a.G;
				if (targetIndex.$ === 1) {
					return _Utils_update(
						model,
						{q: $elm$core$Maybe$Nothing});
				} else {
					var index = targetIndex.a;
					if (!dropIndex.$) {
						var _v3 = dropIndex.a;
						var dropTargetIndex = _v3.a;
						if (_Utils_eq(dragIndex, index) || (!_Utils_eq(index, dropTargetIndex))) {
							return _Utils_update(
								model,
								{q: $elm$core$Maybe$Nothing});
						} else {
							var newFormFields = $elm$core$Array$fromList(
								function (list) {
									var draggedField = A2($elm$core$Array$get, dragIndex, model.g);
									var _v5 = A2($elm_community$list_extra$List$Extra$splitAt, index, list);
									var before = _v5.a;
									var after = _v5.b;
									if (!draggedField.$) {
										var field = draggedField.a;
										return $elm$core$List$concat(
											_List_fromArray(
												[
													before,
													_List_fromArray(
													[field]),
													after
												]));
									} else {
										return list;
									}
								}(
									A2(
										$elm$core$List$map,
										$elm$core$Tuple$second,
										A2(
											$elm$core$List$filter,
											function (_v4) {
												var i = _v4.a;
												return !_Utils_eq(i, dragIndex);
											},
											A2(
												$elm$core$List$indexedMap,
												$elm$core$Tuple$pair,
												$elm$core$Array$toList(model.g))))));
							return _Utils_update(
								model,
								{q: $elm$core$Maybe$Nothing, g: newFormFields});
						}
					} else {
						return _Utils_update(
							model,
							{q: $elm$core$Maybe$Nothing});
					}
				}
			} else {
				var field = _v0.a.a.bU;
				var dropIndex = _v0.a.a.G;
				if (targetIndex.$ === 1) {
					return _Utils_update(
						model,
						{q: $elm$core$Maybe$Nothing});
				} else {
					var index = targetIndex.a;
					if (!dropIndex.$) {
						var _v9 = dropIndex.a;
						var dropTargetIndex = _v9.a;
						if (!_Utils_eq(index, dropTargetIndex)) {
							return _Utils_update(
								model,
								{q: $elm$core$Maybe$Nothing});
						} else {
							var newFormFields = $elm$core$Array$fromList(
								function (list) {
									var _v10 = A2($elm_community$list_extra$List$Extra$splitAt, index, list);
									var before = _v10.a;
									var after = _v10.b;
									return _Utils_ap(
										before,
										A2($elm$core$List$cons, field, after));
								}(
									$elm$core$Array$toList(model.g)));
							return _Utils_update(
								model,
								{q: $elm$core$Maybe$Nothing, g: newFormFields, aa: model.aa + 1});
						}
					} else {
						return _Utils_update(
							model,
							{q: $elm$core$Maybe$Nothing});
					}
				}
			}
		} else {
			return _Utils_update(
				model,
				{q: $elm$core$Maybe$Nothing});
		}
	});
var $elm$core$Elm$JsArray$push = _JsArray_push;
var $elm$core$Elm$JsArray$singleton = _JsArray_singleton;
var $elm$core$Elm$JsArray$unsafeSet = _JsArray_unsafeSet;
var $elm$core$Array$insertTailInTree = F4(
	function (shift, index, tail, tree) {
		var pos = $elm$core$Array$bitMask & (index >>> shift);
		if (_Utils_cmp(
			pos,
			$elm$core$Elm$JsArray$length(tree)) > -1) {
			if (shift === 5) {
				return A2(
					$elm$core$Elm$JsArray$push,
					$elm$core$Array$Leaf(tail),
					tree);
			} else {
				var newSub = $elm$core$Array$SubTree(
					A4($elm$core$Array$insertTailInTree, shift - $elm$core$Array$shiftStep, index, tail, $elm$core$Elm$JsArray$empty));
				return A2($elm$core$Elm$JsArray$push, newSub, tree);
			}
		} else {
			var value = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (!value.$) {
				var subTree = value.a;
				var newSub = $elm$core$Array$SubTree(
					A4($elm$core$Array$insertTailInTree, shift - $elm$core$Array$shiftStep, index, tail, subTree));
				return A3($elm$core$Elm$JsArray$unsafeSet, pos, newSub, tree);
			} else {
				var newSub = $elm$core$Array$SubTree(
					A4(
						$elm$core$Array$insertTailInTree,
						shift - $elm$core$Array$shiftStep,
						index,
						tail,
						$elm$core$Elm$JsArray$singleton(value)));
				return A3($elm$core$Elm$JsArray$unsafeSet, pos, newSub, tree);
			}
		}
	});
var $elm$core$Array$unsafeReplaceTail = F2(
	function (newTail, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		var originalTailLen = $elm$core$Elm$JsArray$length(tail);
		var newTailLen = $elm$core$Elm$JsArray$length(newTail);
		var newArrayLen = len + (newTailLen - originalTailLen);
		if (_Utils_eq(newTailLen, $elm$core$Array$branchFactor)) {
			var overflow = _Utils_cmp(newArrayLen >>> $elm$core$Array$shiftStep, 1 << startShift) > 0;
			if (overflow) {
				var newShift = startShift + $elm$core$Array$shiftStep;
				var newTree = A4(
					$elm$core$Array$insertTailInTree,
					newShift,
					len,
					newTail,
					$elm$core$Elm$JsArray$singleton(
						$elm$core$Array$SubTree(tree)));
				return A4($elm$core$Array$Array_elm_builtin, newArrayLen, newShift, newTree, $elm$core$Elm$JsArray$empty);
			} else {
				return A4(
					$elm$core$Array$Array_elm_builtin,
					newArrayLen,
					startShift,
					A4($elm$core$Array$insertTailInTree, startShift, len, newTail, tree),
					$elm$core$Elm$JsArray$empty);
			}
		} else {
			return A4($elm$core$Array$Array_elm_builtin, newArrayLen, startShift, tree, newTail);
		}
	});
var $elm$core$Array$push = F2(
	function (a, array) {
		var tail = array.d;
		return A2(
			$elm$core$Array$unsafeReplaceTail,
			A2($elm$core$Elm$JsArray$push, a, tail),
			array);
	});
var $elm$core$Process$sleep = _Process_sleep;
var $author$project$Main$stringFromInputField = function (inputField) {
	switch (inputField.$) {
		case 0:
			var inputType = inputField.a.B;
			return inputType;
		case 1:
			return 'Multi-line description';
		case 2:
			return 'Dropdown';
		case 3:
			return 'Radio buttons';
		default:
			return 'Checkboxes';
	}
};
var $elm$core$Array$setHelp = F4(
	function (shift, index, value, tree) {
		var pos = $elm$core$Array$bitMask & (index >>> shift);
		var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
		if (!_v0.$) {
			var subTree = _v0.a;
			var newSub = A4($elm$core$Array$setHelp, shift - $elm$core$Array$shiftStep, index, value, subTree);
			return A3(
				$elm$core$Elm$JsArray$unsafeSet,
				pos,
				$elm$core$Array$SubTree(newSub),
				tree);
		} else {
			var values = _v0.a;
			var newLeaf = A3($elm$core$Elm$JsArray$unsafeSet, $elm$core$Array$bitMask & index, value, values);
			return A3(
				$elm$core$Elm$JsArray$unsafeSet,
				pos,
				$elm$core$Array$Leaf(newLeaf),
				tree);
		}
	});
var $elm$core$Array$set = F3(
	function (index, value, array) {
		var len = array.a;
		var startShift = array.b;
		var tree = array.c;
		var tail = array.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? array : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? A4(
			$elm$core$Array$Array_elm_builtin,
			len,
			startShift,
			tree,
			A3($elm$core$Elm$JsArray$unsafeSet, $elm$core$Array$bitMask & index, value, tail)) : A4(
			$elm$core$Array$Array_elm_builtin,
			len,
			startShift,
			A4($elm$core$Array$setHelp, startShift, index, value, tree),
			tail));
	});
var $author$project$Main$swapArrayIndex = F3(
	function (i, j, arr) {
		var maybeJ = A2($elm$core$Array$get, j, arr);
		var maybeI = A2($elm$core$Array$get, i, arr);
		var _v0 = _Utils_Tuple2(maybeI, maybeJ);
		if ((!_v0.a.$) && (!_v0.b.$)) {
			var iVal = _v0.a.a;
			var jVal = _v0.b.a;
			return A3(
				$elm$core$Array$set,
				i,
				jVal,
				A3($elm$core$Array$set, j, iVal, arr));
		} else {
			return arr;
		}
	});
var $elm$core$Array$toIndexedList = function (array) {
	var len = array.a;
	var helper = F2(
		function (entry, _v0) {
			var index = _v0.a;
			var list = _v0.b;
			return _Utils_Tuple2(
				index - 1,
				A2(
					$elm$core$List$cons,
					_Utils_Tuple2(index, entry),
					list));
		});
	return A3(
		$elm$core$Array$foldr,
		helper,
		_Utils_Tuple2(len - 1, _List_Nil),
		array).b;
};
var $author$project$Main$updateDragged = F2(
	function (maybeDroppable, dragged) {
		if (maybeDroppable.$ === 1) {
			return dragged;
		} else {
			var _v1 = maybeDroppable.a;
			var targetField = _v1.b;
			if (!dragged.$) {
				var details = dragged.a;
				var _v3 = details.G;
				if (!_v3.$) {
					var _v4 = _v3.a;
					var existingField = _v4.b;
					return _Utils_eq(existingField, targetField) ? dragged : $author$project$Main$DragExisting(
						_Utils_update(
							details,
							{G: maybeDroppable}));
				} else {
					return $author$project$Main$DragExisting(
						_Utils_update(
							details,
							{G: maybeDroppable}));
				}
			} else {
				var details = dragged.a;
				var _v5 = details.G;
				if (!_v5.$) {
					var _v6 = _v5.a;
					var existingField = _v6.b;
					return _Utils_eq(existingField, targetField) ? dragged : $author$project$Main$DragNew(
						_Utils_update(
							details,
							{G: maybeDroppable}));
				} else {
					return $author$project$Main$DragNew(
						_Utils_update(
							details,
							{G: maybeDroppable}));
				}
			}
		}
	});
var $author$project$Main$getPreviousFieldNameOrLabel = F2(
	function (index, formFields) {
		return (index > 0) ? A2(
			$elm$core$Maybe$withDefault,
			'',
			A2(
				$elm$core$Maybe$map,
				$author$project$Main$fieldNameOf,
				A2($elm$core$Array$get, index - 1, formFields))) : '';
	});
var $elm$core$String$lines = _String_lines;
var $elm_community$list_extra$List$Extra$removeAt = F2(
	function (index, l) {
		if (index < 0) {
			return l;
		} else {
			var _v0 = A2($elm$core$List$drop, index, l);
			if (!_v0.b) {
				return l;
			} else {
				var rest = _v0.b;
				return _Utils_ap(
					A2($elm$core$List$take, index, l),
					rest);
			}
		}
	});
var $author$project$Main$toggleAttributeOptional = F2(
	function (toggle, attributeOptional) {
		switch (attributeOptional.$) {
			case 0:
				if (attributeOptional.a.$ === 1) {
					var _v1 = attributeOptional.a;
					return toggle ? $author$project$Main$AttributeInvalid('') : attributeOptional;
				} else {
					var a = attributeOptional.a.a;
					return toggle ? $author$project$Main$AttributeGiven(a) : attributeOptional;
				}
			case 1:
				return toggle ? attributeOptional : $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing);
			default:
				var a = attributeOptional.a;
				return toggle ? $author$project$Main$AttributeGiven(a) : $author$project$Main$AttributeNotNeeded(
					$elm$core$Maybe$Just(a));
		}
	});
var $author$project$Main$updateComparison = F2(
	function (comparisonType, comparison) {
		switch (comparisonType) {
			case 'Equals':
				switch (comparison.$) {
					case 0:
						var str = comparison.a;
						return $author$project$Main$Equals(str);
					case 1:
						var str = comparison.a;
						return $author$project$Main$Equals(str);
					case 2:
						var str = comparison.a;
						return $author$project$Main$Equals(str);
					case 3:
						var str = comparison.a;
						return $author$project$Main$Equals(str);
					default:
						var str = comparison.a;
						return $author$project$Main$Equals(str);
				}
			case 'StringContains':
				switch (comparison.$) {
					case 0:
						var str = comparison.a;
						return $author$project$Main$StringContains(str);
					case 1:
						var str = comparison.a;
						return $author$project$Main$StringContains(str);
					case 2:
						var str = comparison.a;
						return $author$project$Main$StringContains(str);
					case 3:
						var str = comparison.a;
						return $author$project$Main$StringContains(str);
					default:
						var str = comparison.a;
						return $author$project$Main$StringContains(str);
				}
			case 'EndsWith':
				switch (comparison.$) {
					case 0:
						var str = comparison.a;
						return $author$project$Main$EndsWith(str);
					case 1:
						var str = comparison.a;
						return $author$project$Main$EndsWith(str);
					case 2:
						var str = comparison.a;
						return $author$project$Main$EndsWith(str);
					case 3:
						var str = comparison.a;
						return $author$project$Main$EndsWith(str);
					default:
						var str = comparison.a;
						return $author$project$Main$EndsWith(str);
				}
			case 'GreaterThan':
				switch (comparison.$) {
					case 0:
						var str = comparison.a;
						return $author$project$Main$GreaterThan(str);
					case 1:
						var str = comparison.a;
						return $author$project$Main$GreaterThan(str);
					case 2:
						var str = comparison.a;
						return $author$project$Main$GreaterThan(str);
					case 3:
						var str = comparison.a;
						return $author$project$Main$GreaterThan(str);
					default:
						var str = comparison.a;
						return $author$project$Main$GreaterThan(str);
				}
			case 'EqualsField':
				switch (comparison.$) {
					case 0:
						var str = comparison.a;
						return $author$project$Main$EqualsField(str);
					case 1:
						var str = comparison.a;
						return $author$project$Main$EqualsField(str);
					case 2:
						var str = comparison.a;
						return $author$project$Main$EqualsField(str);
					case 3:
						var str = comparison.a;
						return $author$project$Main$EqualsField(str);
					default:
						var str = comparison.a;
						return $author$project$Main$EqualsField(str);
				}
			default:
				return comparison;
		}
	});
var $author$project$Main$updateComparisonInCondition = F2(
	function (updater, condition) {
		var fieldName = condition.a;
		var comparison = condition.b;
		return A2(
			$author$project$Main$Field,
			fieldName,
			updater(comparison));
	});
var $author$project$Main$updateComparisonValue = F2(
	function (newValue, comparison) {
		switch (comparison.$) {
			case 0:
				return $author$project$Main$Equals(newValue);
			case 1:
				return $author$project$Main$StringContains(newValue);
			case 2:
				return $author$project$Main$EndsWith(newValue);
			case 3:
				return $author$project$Main$GreaterThan(newValue);
			default:
				return $author$project$Main$EqualsField(newValue);
		}
	});
var $author$project$Main$updateConditions = F3(
	function (conditionIndex, updater, conditions) {
		return A2(
			$elm$core$List$indexedMap,
			F2(
				function (i, condition) {
					return _Utils_eq(i, conditionIndex) ? updater(condition) : condition;
				}),
			conditions);
	});
var $author$project$Main$updateConditionsInRule = F2(
	function (updater, rule) {
		if (!rule.$) {
			var conditions = rule.a;
			return $author$project$Main$ShowWhen(
				updater(conditions));
		} else {
			var conditions = rule.a;
			return $author$project$Main$HideWhen(
				updater(conditions));
		}
	});
var $author$project$Main$updateFieldnameInCondition = F2(
	function (updater, condition) {
		var fieldName = condition.a;
		var comparison = condition.b;
		return A2(
			$author$project$Main$Field,
			updater(fieldName),
			comparison);
	});
var $author$project$Main$updateVisibilityRuleAt = F3(
	function (targetIndex, updater, rules) {
		return A2(
			$elm$core$List$indexedMap,
			F2(
				function (i, rule) {
					return _Utils_eq(i, targetIndex) ? updater(rule) : rule;
				}),
			rules);
	});
var $author$project$Main$visibilityRuleCondition = function (rule) {
	if (!rule.$) {
		var conditions = rule.a;
		return conditions;
	} else {
		var conditions = rule.a;
		return conditions;
	}
};
var $author$project$Main$updateFormField = F5(
	function (msg, fieldIndex, string, formFields, formField) {
		switch (msg.$) {
			case 0:
				return _Utils_update(
					formField,
					{d: string});
			case 1:
				return (string === '') ? _Utils_update(
					formField,
					{
						S: $author$project$Main$AttributeInvalid('')
					}) : _Utils_update(
					formField,
					{
						S: $author$project$Main$AttributeGiven(string)
					});
			case 2:
				var bool = msg.a;
				return _Utils_update(
					formField,
					{
						S: A2($author$project$Main$toggleAttributeOptional, bool, formField.S)
					});
			case 3:
				var bool = msg.a;
				return bool ? _Utils_update(
					formField,
					{w: 0}) : _Utils_update(
					formField,
					{w: 1});
			case 16:
				var minStr = msg.a;
				var _v1 = formField.a;
				if (_v1.$ === 4) {
					var settings = _v1.a;
					var newMinRequired = $elm$core$String$isEmpty(minStr) ? $elm$core$Maybe$Nothing : $elm$core$String$toInt(minStr);
					var adjustedMinRequired = function () {
						var _v3 = _Utils_Tuple2(newMinRequired, settings.T);
						if ((!_v3.a.$) && (!_v3.b.$)) {
							var min = _v3.a.a;
							var max = _v3.b.a;
							return (_Utils_cmp(min, max) > 0) ? $elm$core$Maybe$Just(max) : $elm$core$Maybe$Just(min);
						} else {
							var minValue = _v3.a;
							return minValue;
						}
					}();
					var finalMinRequired = function () {
						if (!adjustedMinRequired.$) {
							var min = adjustedMinRequired.a;
							return (_Utils_cmp(
								min,
								$elm$core$List$length(settings.k)) > 0) ? $elm$core$Maybe$Just(
								$elm$core$List$length(settings.k)) : $elm$core$Maybe$Just(min);
						} else {
							return $elm$core$Maybe$Nothing;
						}
					}();
					return _Utils_update(
						formField,
						{
							a: $author$project$Main$ChooseMultiple(
								_Utils_update(
									settings,
									{P: finalMinRequired}))
						});
				} else {
					return formField;
				}
			case 17:
				var maxStr = msg.a;
				var _v4 = formField.a;
				if (_v4.$ === 4) {
					var settings = _v4.a;
					var newMaxAllowed = $elm$core$String$isEmpty(maxStr) ? $elm$core$Maybe$Nothing : $elm$core$String$toInt(maxStr);
					var adjustedMaxAllowed = function () {
						var _v6 = _Utils_Tuple2(newMaxAllowed, settings.P);
						if ((!_v6.a.$) && (!_v6.b.$)) {
							var max = _v6.a.a;
							var min = _v6.b.a;
							return (_Utils_cmp(max, min) < 0) ? $elm$core$Maybe$Just(min) : $elm$core$Maybe$Just(max);
						} else {
							var maxValue = _v6.a;
							return maxValue;
						}
					}();
					var finalMaxAllowed = function () {
						if (!adjustedMaxAllowed.$) {
							var max = adjustedMaxAllowed.a;
							return (_Utils_cmp(
								max,
								$elm$core$List$length(settings.k)) > 0) ? $elm$core$Maybe$Just(
								$elm$core$List$length(settings.k)) : $elm$core$Maybe$Just(max);
						} else {
							return $elm$core$Maybe$Nothing;
						}
					}();
					return _Utils_update(
						formField,
						{
							a: $author$project$Main$ChooseMultiple(
								_Utils_update(
									settings,
									{T: finalMaxAllowed}))
						});
				} else {
					return formField;
				}
			case 20:
				var minStr = msg.a;
				var _v7 = formField.a;
				if (!_v7.$) {
					var customElement = _v7.a;
					var newCustomElement = _Utils_update(
						customElement,
						{
							ar: $elm$core$String$isEmpty(minStr) ? $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing) : $author$project$Main$AttributeGiven(minStr)
						});
					return _Utils_update(
						formField,
						{
							a: $author$project$Main$ShortText(newCustomElement)
						});
				} else {
					return formField;
				}
			case 21:
				var maxStr = msg.a;
				var _v8 = formField.a;
				if (!_v8.$) {
					var customElement = _v8.a;
					var newCustomElement = _Utils_update(
						customElement,
						{
							aq: $elm$core$String$isEmpty(maxStr) ? $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing) : $author$project$Main$AttributeGiven(maxStr)
						});
					return _Utils_update(
						formField,
						{
							a: $author$project$Main$ShortText(newCustomElement)
						});
				} else {
					return formField;
				}
			case 4:
				var _v9 = formField.a;
				switch (_v9.$) {
					case 0:
						return formField;
					case 1:
						return formField;
					case 2:
						var settings = _v9.a;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$Dropdown(
									_Utils_update(
										settings,
										{
											k: A2(
												$elm$core$List$map,
												$author$project$Main$choiceFromString,
												$elm$core$String$lines(string))
										}))
							});
					case 3:
						var settings = _v9.a;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ChooseOne(
									_Utils_update(
										settings,
										{
											k: A2(
												$elm$core$List$map,
												$author$project$Main$choiceFromString,
												$elm$core$String$lines(string))
										}))
							});
					default:
						var settings = _v9.a;
						var newChoices = A2(
							$elm$core$List$map,
							$author$project$Main$choiceFromString,
							$elm$core$String$lines(string));
						var newChoicesCount = $elm$core$List$length(newChoices);
						var newMaxAllowed = function () {
							var _v11 = settings.T;
							if (!_v11.$) {
								var max = _v11.a;
								return (_Utils_cmp(max, newChoicesCount) > 0) ? ((newChoicesCount > 0) ? $elm$core$Maybe$Just(newChoicesCount) : $elm$core$Maybe$Nothing) : $elm$core$Maybe$Just(max);
							} else {
								return $elm$core$Maybe$Nothing;
							}
						}();
						var newMinRequired = function () {
							var _v10 = settings.P;
							if (!_v10.$) {
								var min = _v10.a;
								return (_Utils_cmp(min, newChoicesCount) > 0) ? ((newChoicesCount > 0) ? $elm$core$Maybe$Just(newChoicesCount) : $elm$core$Maybe$Nothing) : $elm$core$Maybe$Just(min);
							} else {
								return $elm$core$Maybe$Nothing;
							}
						}();
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ChooseMultiple(
									_Utils_update(
										settings,
										{k: newChoices, T: newMaxAllowed, P: newMinRequired}))
							});
				}
			case 5:
				var bool = msg.a;
				var _v12 = formField.a;
				switch (_v12.$) {
					case 0:
						var customElement = _v12.a;
						var newCustomElement = _Utils_update(
							customElement,
							{
								aM: $author$project$Main$AttributeGiven(bool)
							});
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ShortText(newCustomElement)
							});
					case 1:
						return formField;
					case 2:
						return formField;
					case 3:
						return formField;
					default:
						return formField;
				}
			case 6:
				var bool = msg.a;
				var _v13 = formField.a;
				switch (_v13.$) {
					case 0:
						var customElement = _v13.a;
						var newCustomElement = _Utils_update(
							customElement,
							{
								ah: A2($author$project$Main$toggleAttributeOptional, bool, customElement.ah)
							});
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ShortText(newCustomElement)
							});
					case 1:
						var maxlength = _v13.a;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$LongText(
									A2($author$project$Main$toggleAttributeOptional, bool, maxlength))
							});
					case 2:
						return formField;
					case 3:
						return formField;
					default:
						return formField;
				}
			case 7:
				var _v14 = formField.a;
				switch (_v14.$) {
					case 0:
						var customElement = _v14.a;
						var newCustomElement = _Utils_update(
							customElement,
							{
								ah: function () {
									var _v15 = $elm$core$String$toInt(string);
									if (!_v15.$) {
										var i = _v15.a;
										return $author$project$Main$AttributeGiven(i);
									} else {
										return $author$project$Main$AttributeInvalid(string);
									}
								}()
							});
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ShortText(newCustomElement)
							});
					case 1:
						var newMaxlength = function () {
							var _v16 = $elm$core$String$toInt(string);
							if (!_v16.$) {
								var i = _v16.a;
								return $author$project$Main$AttributeGiven(i);
							} else {
								return $author$project$Main$AttributeInvalid(string);
							}
						}();
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$LongText(newMaxlength)
							});
					case 2:
						return formField;
					case 3:
						return formField;
					default:
						return formField;
				}
			case 18:
				var bool = msg.a;
				var _v17 = formField.a;
				if (!_v17.$) {
					var customElement = _v17.a;
					var newCustomElement = _Utils_update(
						customElement,
						{
							ar: A2($author$project$Main$toggleAttributeOptional, bool, customElement.ar)
						});
					return _Utils_update(
						formField,
						{
							a: $author$project$Main$ShortText(newCustomElement)
						});
				} else {
					return formField;
				}
			case 19:
				var bool = msg.a;
				var _v18 = formField.a;
				if (!_v18.$) {
					var customElement = _v18.a;
					var newCustomElement = _Utils_update(
						customElement,
						{
							aq: A2($author$project$Main$toggleAttributeOptional, bool, customElement.aq)
						});
					return _Utils_update(
						formField,
						{
							a: $author$project$Main$ShortText(newCustomElement)
						});
				} else {
					return formField;
				}
			case 8:
				var bool = msg.a;
				var _v19 = formField.a;
				switch (_v19.$) {
					case 0:
						var customElement = _v19.a;
						var newCustomElement = _Utils_update(
							customElement,
							{
								ae: A2($author$project$Main$toggleAttributeOptional, bool, customElement.ae)
							});
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ShortText(newCustomElement)
							});
					case 1:
						return formField;
					case 2:
						return formField;
					case 3:
						return formField;
					default:
						return formField;
				}
			case 9:
				var _v20 = formField.a;
				switch (_v20.$) {
					case 0:
						var customElement = _v20.a;
						var newCustomElement = _Utils_update(
							customElement,
							{
								ae: function () {
									var _v21 = A2($elm$core$String$split, '\n', string);
									if (!_v21.b) {
										return $author$project$Main$AttributeInvalid(string);
									} else {
										var list = _v21;
										return $author$project$Main$AttributeGiven(
											A2($elm$core$List$map, $author$project$Main$choiceFromString, list));
									}
								}()
							});
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ShortText(newCustomElement)
							});
					case 1:
						return formField;
					case 2:
						return formField;
					case 3:
						return formField;
					default:
						return formField;
				}
			case 10:
				if (msg.b === '\n') {
					var ruleIndex = msg.a;
					return _Utils_update(
						formField,
						{
							m: A2($elm_community$list_extra$List$Extra$removeAt, ruleIndex, formField.m)
						});
				} else {
					var ruleIndex = msg.a;
					var str = msg.b;
					return _Utils_update(
						formField,
						{
							m: A3(
								$author$project$Main$updateVisibilityRuleAt,
								ruleIndex,
								function (rule) {
									switch (str) {
										case 'ShowWhen':
											return $author$project$Main$ShowWhen(
												$author$project$Main$visibilityRuleCondition(rule));
										case 'HideWhen':
											return $author$project$Main$HideWhen(
												$author$project$Main$visibilityRuleCondition(rule));
										default:
											return rule;
									}
								},
								formField.m)
						});
				}
			case 11:
				var ruleIndex = msg.a;
				var conditionIndex = msg.b;
				var str = msg.c;
				return _Utils_update(
					formField,
					{
						m: A3(
							$author$project$Main$updateVisibilityRuleAt,
							ruleIndex,
							$author$project$Main$updateConditionsInRule(
								A2(
									$author$project$Main$updateConditions,
									conditionIndex,
									$author$project$Main$updateComparisonInCondition(
										$author$project$Main$updateComparison(str)))),
							formField.m)
					});
			case 12:
				if (msg.c === '\n') {
					var ruleIndex = msg.a;
					var conditionIndex = msg.b;
					return _Utils_update(
						formField,
						{
							m: A3(
								$author$project$Main$updateVisibilityRuleAt,
								ruleIndex,
								$author$project$Main$updateConditionsInRule(
									$elm_community$list_extra$List$Extra$removeAt(conditionIndex)),
								formField.m)
						});
				} else {
					var ruleIndex = msg.a;
					var conditionIndex = msg.b;
					var newFieldName = msg.c;
					return _Utils_update(
						formField,
						{
							m: A3(
								$author$project$Main$updateVisibilityRuleAt,
								ruleIndex,
								$author$project$Main$updateConditionsInRule(
									A2(
										$author$project$Main$updateConditions,
										conditionIndex,
										$author$project$Main$updateFieldnameInCondition(
											$elm$core$Basics$always(newFieldName)))),
								formField.m)
						});
				}
			case 13:
				var ruleIndex = msg.a;
				var conditionIndex = msg.b;
				var newValue = msg.c;
				return _Utils_update(
					formField,
					{
						m: A3(
							$author$project$Main$updateVisibilityRuleAt,
							ruleIndex,
							$author$project$Main$updateConditionsInRule(
								A2(
									$author$project$Main$updateConditions,
									conditionIndex,
									$author$project$Main$updateComparisonInCondition(
										$author$project$Main$updateComparisonValue(newValue)))),
							formField.m)
					});
			case 14:
				return _Utils_update(
					formField,
					{
						m: _Utils_ap(
							formField.m,
							_List_fromArray(
								[
									$author$project$Main$ShowWhen(
									_List_fromArray(
										[
											A2(
											$author$project$Main$Field,
											A2($author$project$Main$getPreviousFieldNameOrLabel, fieldIndex, formFields),
											$author$project$Main$Equals(''))
										]))
								]))
					});
			case 15:
				var ruleIndex = msg.a;
				var newCondition = function (conditions) {
					var _v24 = $elm$core$List$reverse(conditions);
					if (_v24.b) {
						var last = _v24.a;
						return A2(
							$author$project$Main$updateComparisonInCondition,
							$author$project$Main$updateComparisonValue(''),
							last);
					} else {
						return A2(
							$author$project$Main$Field,
							A2($author$project$Main$getPreviousFieldNameOrLabel, fieldIndex, formFields),
							$author$project$Main$Equals(''));
					}
				};
				return _Utils_update(
					formField,
					{
						m: A3(
							$author$project$Main$updateVisibilityRuleAt,
							ruleIndex,
							function (rule) {
								if (!rule.$) {
									var conditions = rule.a;
									return $author$project$Main$ShowWhen(
										_Utils_ap(
											conditions,
											_List_fromArray(
												[
													newCondition(conditions)
												])));
								} else {
									var conditions = rule.a;
									return $author$project$Main$HideWhen(
										_Utils_ap(
											conditions,
											_List_fromArray(
												[
													newCondition(conditions)
												])));
								}
							},
							formField.m)
					});
			case 22:
				var checked = msg.a;
				var _v25 = formField.a;
				switch (_v25.$) {
					case 2:
						var settings = _v25.a;
						var newFilter = checked ? $elm$core$Maybe$Just(
							$author$project$Main$FilterStartsWithFieldValueOf('')) : $elm$core$Maybe$Nothing;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$Dropdown(
									_Utils_update(
										settings,
										{e: newFilter}))
							});
					case 3:
						var settings = _v25.a;
						var newFilter = checked ? $elm$core$Maybe$Just(
							$author$project$Main$FilterStartsWithFieldValueOf('')) : $elm$core$Maybe$Nothing;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ChooseOne(
									_Utils_update(
										settings,
										{e: newFilter}))
							});
					case 4:
						var settings = _v25.a;
						var newFilter = checked ? $elm$core$Maybe$Just(
							$author$project$Main$FilterStartsWithFieldValueOf('')) : $elm$core$Maybe$Nothing;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ChooseMultiple(
									_Utils_update(
										settings,
										{e: newFilter}))
							});
					default:
						return formField;
				}
			case 23:
				var filterType = msg.a;
				var updateFilter = function (existingFilter) {
					if (!existingFilter.$) {
						if (!existingFilter.a.$) {
							var fieldName = existingFilter.a.a;
							return (filterType === 'contains') ? $elm$core$Maybe$Just(
								$author$project$Main$FilterContainsFieldValueOf(fieldName)) : existingFilter;
						} else {
							var fieldName = existingFilter.a.a;
							return (filterType === 'startswith') ? $elm$core$Maybe$Just(
								$author$project$Main$FilterStartsWithFieldValueOf(fieldName)) : existingFilter;
						}
					} else {
						return (filterType === 'startswith') ? $elm$core$Maybe$Just(
							$author$project$Main$FilterStartsWithFieldValueOf('')) : ((filterType === 'contains') ? $elm$core$Maybe$Just(
							$author$project$Main$FilterContainsFieldValueOf('')) : $elm$core$Maybe$Nothing);
					}
				};
				var _v26 = formField.a;
				switch (_v26.$) {
					case 2:
						var settings = _v26.a;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$Dropdown(
									_Utils_update(
										settings,
										{
											e: updateFilter(settings.e)
										}))
							});
					case 3:
						var settings = _v26.a;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ChooseOne(
									_Utils_update(
										settings,
										{
											e: updateFilter(settings.e)
										}))
							});
					case 4:
						var settings = _v26.a;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ChooseMultiple(
									_Utils_update(
										settings,
										{
											e: updateFilter(settings.e)
										}))
							});
					default:
						return formField;
				}
			default:
				var fieldName = msg.a;
				var updateSourceField = function (existingFilter) {
					if (!existingFilter.$) {
						if (!existingFilter.a.$) {
							return $elm$core$Maybe$Just(
								$author$project$Main$FilterStartsWithFieldValueOf(fieldName));
						} else {
							return $elm$core$Maybe$Just(
								$author$project$Main$FilterContainsFieldValueOf(fieldName));
						}
					} else {
						return $elm$core$Maybe$Just(
							$author$project$Main$FilterStartsWithFieldValueOf(fieldName));
					}
				};
				var _v28 = formField.a;
				switch (_v28.$) {
					case 2:
						var settings = _v28.a;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$Dropdown(
									_Utils_update(
										settings,
										{
											e: updateSourceField(settings.e)
										}))
							});
					case 3:
						var settings = _v28.a;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ChooseOne(
									_Utils_update(
										settings,
										{
											e: updateSourceField(settings.e)
										}))
							});
					case 4:
						var settings = _v28.a;
						return _Utils_update(
							formField,
							{
								a: $author$project$Main$ChooseMultiple(
									_Utils_update(
										settings,
										{
											e: updateSourceField(settings.e)
										}))
							});
					default:
						return formField;
				}
		}
	});
var $author$project$Main$when = F2(
	function (bool, condition) {
		return bool ? condition.a1 : condition.aV;
	});
var $author$project$Main$update = F2(
	function (msg, model) {
		update:
		while (true) {
			switch (msg.$) {
				case 0:
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				case 1:
					var value = msg.a;
					var _v1 = A2($elm$json$Json$Decode$decodeValue, $author$project$Main$decodePortIncomingValue, value);
					if (!_v1.$) {
						var _v2 = _v1.a;
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 2:
					var fieldType = msg.a;
					var newFormField = {
						S: $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing),
						d: $author$project$Main$stringFromInputField(fieldType) + (' question ' + $elm$core$String$fromInt(model.aa)),
						Q: $elm$core$Maybe$Nothing,
						w: A2(
							$author$project$Main$when,
							$author$project$Main$mustBeOptional(fieldType),
							{aV: 0, a1: 1}),
						a: fieldType,
						m: _List_Nil
					};
					var newFormFields = A2($elm$core$Array$push, newFormField, model.g);
					var newIndex = $elm$core$Array$length(newFormFields) - 1;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{g: newFormFields, aa: model.aa + 1}),
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									$author$project$Main$outgoing(
									$author$project$Main$encodePortOutgoingValue(
										$author$project$Main$PortOutgoingFormFields(newFormFields))),
									A2(
									$elm$core$Task$perform,
									$elm$core$Basics$identity,
									$elm$core$Task$succeed(
										A2(
											$author$project$Main$DoSleepDo,
											$author$project$Main$animateFadeDuration,
											_List_fromArray(
												[
													$author$project$Main$SetEditorAnimate(
													$elm$core$Maybe$Just(
														_Utils_Tuple2(newIndex, 0))),
													$author$project$Main$SetEditorAnimate($elm$core$Maybe$Nothing)
												]))))
								])));
				case 3:
					var fieldIndex = msg.a;
					var newFormFields = $elm$core$Array$fromList(
						A2(
							$elm$core$List$map,
							$elm$core$Tuple$second,
							A2(
								$elm$core$List$filter,
								function (_v3) {
									var i = _v3.a;
									return !_Utils_eq(i, fieldIndex);
								},
								$elm$core$Array$toIndexedList(model.g))));
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{g: newFormFields, F: $elm$core$Maybe$Nothing}),
						$author$project$Main$outgoing(
							$author$project$Main$encodePortOutgoingValue(
								$author$project$Main$PortOutgoingFormFields(newFormFields))));
				case 4:
					var fieldIndex = msg.a;
					var newFormFields = A3($author$project$Main$swapArrayIndex, fieldIndex, fieldIndex - 1, model.g);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								g: newFormFields,
								F: $elm$core$Maybe$Just(fieldIndex - 1)
							}),
						$author$project$Main$outgoing(
							$author$project$Main$encodePortOutgoingValue(
								$author$project$Main$PortOutgoingFormFields(newFormFields))));
				case 5:
					var fieldIndex = msg.a;
					var newFormFields = A3($author$project$Main$swapArrayIndex, fieldIndex, fieldIndex + 1, model.g);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								g: newFormFields,
								F: $elm$core$Maybe$Just(fieldIndex + 1)
							}),
						$author$project$Main$outgoing(
							$author$project$Main$encodePortOutgoingValue(
								$author$project$Main$PortOutgoingFormFields(newFormFields))));
				case 6:
					var fmsg = msg.a;
					var fieldIndex = msg.b;
					var string = msg.c;
					var newFormFields = A2(
						$elm$core$Array$indexedMap,
						F2(
							function (i, formField) {
								return _Utils_eq(i, fieldIndex) ? A5($author$project$Main$updateFormField, fmsg, fieldIndex, string, model.g, formField) : formField;
							}),
						model.g);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{g: newFormFields}),
						$author$project$Main$outgoing(
							$author$project$Main$encodePortOutgoingValue(
								$author$project$Main$PortOutgoingFormFields(newFormFields))));
				case 7:
					var maybeAnimate = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								ac: $author$project$Main$Editor(
									{aB: maybeAnimate})
							}),
						$elm$core$Platform$Cmd$none);
				case 8:
					var fieldIndex = msg.a;
					var _v4 = _Utils_Tuple2(model.F, fieldIndex);
					if ((!_v4.a.$) && (_v4.b.$ === 1)) {
						var prevIndex = _v4.a.a;
						var _v5 = _v4.b;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									F: $elm$core$Maybe$Nothing,
									ac: $author$project$Main$Editor(
										{
											aB: $elm$core$Maybe$Just(
												_Utils_Tuple2(prevIndex, 0))
										})
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{F: fieldIndex}),
							$elm$core$Platform$Cmd$none);
					}
				case 9:
					var fieldIndex = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								q: $elm$core$Maybe$Just(
									$author$project$Main$DragExisting(
										{a6: fieldIndex, G: $elm$core$Maybe$Nothing})),
								F: $elm$core$Maybe$Nothing
							}),
						$elm$core$Platform$Cmd$none);
				case 10:
					var fieldIndex = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								q: $elm$core$Maybe$Just(
									$author$project$Main$DragNew(
										{
											G: $elm$core$Maybe$Just(
												_Utils_Tuple2(0, $elm$core$Maybe$Nothing)),
											bU: fieldIndex
										}))
							}),
						$elm$core$Platform$Cmd$none);
				case 11:
					var _v6 = model.q;
					if (!_v6.$) {
						if (!_v6.a.$) {
							var dropIndex = _v6.a.a.G;
							var $temp$msg = $author$project$Main$Drop(
								A2($elm$core$Maybe$map, $elm$core$Tuple$first, dropIndex)),
								$temp$model = model;
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						} else {
							var dropIndex = _v6.a.a.G;
							var $temp$msg = $author$project$Main$Drop(
								A2($elm$core$Maybe$map, $elm$core$Tuple$first, dropIndex)),
								$temp$model = model;
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						}
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{q: $elm$core$Maybe$Nothing}),
							$elm$core$Platform$Cmd$none);
					}
				case 12:
					var maybeDroppable = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								q: A2(
									$elm$core$Maybe$map,
									$author$project$Main$updateDragged(maybeDroppable),
									model.q)
							}),
						$elm$core$Platform$Cmd$none);
				case 13:
					var targetFieldIndex = msg.a;
					var newModel = A2($author$project$Main$onDropped, targetFieldIndex, model);
					return _Utils_Tuple2(
						newModel,
						(!_Utils_eq(newModel.g, model.g)) ? $author$project$Main$outgoing(
							$author$project$Main$encodePortOutgoingValue(
								$author$project$Main$PortOutgoingFormFields(newModel.g))) : $elm$core$Platform$Cmd$none);
				case 14:
					if (!msg.b.b) {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						var duration = msg.a;
						var _v7 = msg.b;
						var thisMsg = _v7.a;
						var nextMsgs = _v7.b;
						var _v8 = A2($author$project$Main$update, thisMsg, model);
						var newModel = _v8.a;
						var newCmd = _v8.b;
						return _Utils_Tuple2(
							newModel,
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										newCmd,
										A2(
										$elm$core$Task$perform,
										$elm$core$Basics$always(
											A2($author$project$Main$DoSleepDo, duration, nextMsgs)),
										$elm$core$Process$sleep(duration))
									])));
					}
				default:
					var fieldName = msg.a;
					var value = msg.b;
					var formField = $elm$core$List$head(
						A2(
							$elm$core$List$filter,
							function (f) {
								return _Utils_eq(
									$author$project$Main$fieldNameOf(f),
									fieldName);
							},
							$elm$core$Array$toList(model.g)));
					var currentValues = A2(
						$elm$core$Maybe$withDefault,
						_List_Nil,
						A2($elm$core$Dict$get, fieldName, model.u));
					var newValues = function () {
						if (!formField.$) {
							var field = formField.a;
							var _v11 = field.a;
							if (_v11.$ === 4) {
								return A2($elm$core$List$member, value, currentValues) ? A2(
									$elm$core$List$filter,
									$elm$core$Basics$neq(value),
									currentValues) : A2($elm$core$List$cons, value, currentValues);
							} else {
								return _List_fromArray(
									[value]);
							}
						} else {
							return _List_fromArray(
								[value]);
						}
					}();
					var newTrackedFormValues = A3($elm$core$Dict$insert, fieldName, newValues, model.u);
					var formValues = A3(
						$elm$json$Json$Encode$dict,
						$elm$core$Basics$identity,
						$elm$core$Basics$identity,
						$elm$core$Dict$fromList(
							A2(
								$elm$core$List$map,
								function (_v9) {
									var key = _v9.a;
									var values = _v9.b;
									return _Utils_Tuple2(
										key,
										A2($elm$json$Json$Encode$list, $elm$json$Json$Encode$string, values));
								},
								$elm$core$Dict$toList(newTrackedFormValues))));
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{u: newTrackedFormValues}),
						$author$project$Main$outgoing(
							$author$project$Main$encodePortOutgoingValue(
								$author$project$Main$PortOutgoingFormValues(formValues))));
			}
		}
	});
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$h3 = _VirtualDom_node('h3');
var $elm$html$Html$pre = _VirtualDom_node('pre');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $elm$html$Html$input = _VirtualDom_node('input');
var $elm$html$Html$Attributes$name = $elm$html$Html$Attributes$stringProperty('name');
var $author$project$Main$stringFromViewMode = function (viewMode) {
	if (!viewMode.$) {
		return 'Editor';
	} else {
		return 'CollectData';
	}
};
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$Main$DragEnd = {$: 11};
var $author$project$Main$NoOp = {$: 0};
var $author$project$Main$SelectField = function (a) {
	return {$: 8, a: a};
};
var $author$project$Main$allInputField = _List_fromArray(
	[
		$author$project$Main$Dropdown(
		{
			k: A2(
				$elm$core$List$map,
				$author$project$Main$choiceFromString,
				_List_fromArray(
					['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'])),
			e: $elm$core$Maybe$Nothing
		}),
		$author$project$Main$ChooseOne(
		{
			k: A2(
				$elm$core$List$map,
				$author$project$Main$choiceFromString,
				_List_fromArray(
					['Yes', 'No'])),
			e: $elm$core$Maybe$Nothing
		}),
		$author$project$Main$ChooseMultiple(
		{
			k: A2(
				$elm$core$List$map,
				$author$project$Main$choiceFromString,
				_List_fromArray(
					['Apple', 'Banana', 'Cantaloupe', 'Durian'])),
			e: $elm$core$Maybe$Nothing,
			T: $elm$core$Maybe$Nothing,
			P: $elm$core$Maybe$Nothing
		}),
		$author$project$Main$LongText(
		$author$project$Main$AttributeGiven(160))
	]);
var $elm$html$Html$Attributes$classList = function (classes) {
	return $elm$html$Html$Attributes$class(
		A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$map,
				$elm$core$Tuple$first,
				A2($elm$core$List$filter, $elm$core$Tuple$second, classes))));
};
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $author$project$Main$fieldsWithPlaceholder = F2(
	function (fields, dragged) {
		if (dragged.$ === 1) {
			return A2($elm$core$List$map, $elm$core$Maybe$Just, fields);
		} else {
			if (!dragged.a.$) {
				var dragIndex = dragged.a.a.a6;
				var dropIndex = dragged.a.a.G;
				if (dropIndex.$ === 1) {
					return A2($elm$core$List$map, $elm$core$Maybe$Just, fields);
				} else {
					var _v2 = dropIndex.a;
					var index = _v2.a;
					var withoutDragged = A2(
						$elm$core$List$filterMap,
						$elm$core$Basics$identity,
						A2(
							$elm$core$List$indexedMap,
							F2(
								function (i, formField) {
									return _Utils_eq(i, dragIndex) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(formField);
								}),
							fields));
					return $elm$core$List$concat(
						_List_fromArray(
							[
								A2(
								$elm$core$List$take,
								index,
								A2($elm$core$List$map, $elm$core$Maybe$Just, withoutDragged)),
								_List_fromArray(
								[$elm$core$Maybe$Nothing]),
								A2(
								$elm$core$List$drop,
								index,
								A2($elm$core$List$map, $elm$core$Maybe$Just, withoutDragged))
							]));
				}
			} else {
				var dropIndex = dragged.a.a.G;
				if (dropIndex.$ === 1) {
					return A2($elm$core$List$map, $elm$core$Maybe$Just, fields);
				} else {
					var _v4 = dropIndex.a;
					var index = _v4.a;
					var fieldsWithJust = A2($elm$core$List$map, $elm$core$Maybe$Just, fields);
					return $elm$core$List$concat(
						_List_fromArray(
							[
								A2($elm$core$List$take, index, fieldsWithJust),
								_List_fromArray(
								[$elm$core$Maybe$Nothing]),
								A2($elm$core$List$drop, index, fieldsWithJust)
							]));
				}
			}
		}
	});
var $elm$html$Html$h2 = _VirtualDom_node('h2');
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$virtual_dom$VirtualDom$MayPreventDefault = function (a) {
	return {$: 2, a: a};
};
var $elm$html$Html$Events$preventDefaultOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayPreventDefault(decoder));
	});
var $author$project$Main$DragStart = function (a) {
	return {$: 9, a: a};
};
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$svg$Svg$Attributes$class = _VirtualDom_attribute('class');
var $elm$svg$Svg$Attributes$fill = _VirtualDom_attribute('fill');
var $elm$svg$Svg$Attributes$height = _VirtualDom_attribute('height');
var $elm$svg$Svg$trustedNode = _VirtualDom_nodeNS('http://www.w3.org/2000/svg');
var $elm$svg$Svg$rect = $elm$svg$Svg$trustedNode('rect');
var $elm$svg$Svg$svg = $elm$svg$Svg$trustedNode('svg');
var $elm$svg$Svg$Attributes$viewBox = _VirtualDom_attribute('viewBox');
var $elm$svg$Svg$Attributes$width = _VirtualDom_attribute('width');
var $elm$svg$Svg$Attributes$x = _VirtualDom_attribute('x');
var $elm$svg$Svg$Attributes$y = _VirtualDom_attribute('y');
var $author$project$Main$dragHandleIcon = A2(
	$elm$svg$Svg$svg,
	_List_fromArray(
		[
			$elm$svg$Svg$Attributes$viewBox('0 0 16 16'),
			$elm$svg$Svg$Attributes$fill('currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true'),
			$elm$svg$Svg$Attributes$class('tff-drag-handle-icon')
		]),
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$rect,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$x('4'),
					$elm$svg$Svg$Attributes$y('4'),
					$elm$svg$Svg$Attributes$width('8'),
					$elm$svg$Svg$Attributes$height('1.5')
				]),
			_List_Nil),
			A2(
			$elm$svg$Svg$rect,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$x('4'),
					$elm$svg$Svg$Attributes$y('7.25'),
					$elm$svg$Svg$Attributes$width('8'),
					$elm$svg$Svg$Attributes$height('1.5')
				]),
			_List_Nil),
			A2(
			$elm$svg$Svg$rect,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$x('4'),
					$elm$svg$Svg$Attributes$y('10.5'),
					$elm$svg$Svg$Attributes$width('8'),
					$elm$svg$Svg$Attributes$height('1.5')
				]),
			_List_Nil)
		]));
var $author$project$Main$DragOver = function (a) {
	return {$: 12, a: a};
};
var $author$project$Main$dragOverDecoder = F2(
	function (index, maybeFormField) {
		return $elm$json$Json$Decode$succeed(
			_Utils_Tuple2(
				$author$project$Main$DragOver(
					$elm$core$Maybe$Just(
						_Utils_Tuple2(index, maybeFormField))),
				true));
	});
var $author$project$Main$isConditionReferencingField = F2(
	function (fieldName, condition) {
		var conditionFieldName = condition.a;
		return _Utils_eq(conditionFieldName, fieldName);
	});
var $author$project$Main$isFieldUsedInChoiceFilter = F2(
	function (fieldName, maybeFilter) {
		if (!maybeFilter.$) {
			if (!maybeFilter.a.$) {
				var sourceField = maybeFilter.a.a;
				return _Utils_eq(sourceField, fieldName);
			} else {
				var sourceField = maybeFilter.a.a;
				return _Utils_eq(sourceField, fieldName);
			}
		} else {
			return false;
		}
	});
var $author$project$Main$isFieldUsedInFilter = F2(
	function (fieldName, inputField) {
		switch (inputField.$) {
			case 2:
				var filter = inputField.a.e;
				return A2($author$project$Main$isFieldUsedInChoiceFilter, fieldName, filter);
			case 3:
				var filter = inputField.a.e;
				return A2($author$project$Main$isFieldUsedInChoiceFilter, fieldName, filter);
			case 4:
				var filter = inputField.a.e;
				return A2($author$project$Main$isFieldUsedInChoiceFilter, fieldName, filter);
			default:
				return false;
		}
	});
var $author$project$Main$isFieldReferencedBy = F2(
	function (fieldName, formFields) {
		var fieldList = $elm$core$Array$toList(formFields);
		var isUsedInChoiceFilters = A2(
			$elm$core$List$any,
			function (field) {
				return A2($author$project$Main$isFieldUsedInFilter, fieldName, field.a);
			},
			fieldList);
		var isUsedInVisibilityRules = A2(
			$elm$core$List$any,
			function (field) {
				return A2(
					$elm$core$List$any,
					function (rule) {
						if (!rule.$) {
							var conditions = rule.a;
							return A2(
								$elm$core$List$any,
								$author$project$Main$isConditionReferencingField(fieldName),
								conditions);
						} else {
							var conditions = rule.a;
							return A2(
								$elm$core$List$any,
								$author$project$Main$isConditionReferencingField(fieldName),
								conditions);
						}
					},
					field.m);
			},
			fieldList);
		return {a3: isUsedInChoiceFilters, a4: isUsedInVisibilityRules};
	});
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $elm$html$Html$Attributes$for = $elm$html$Html$Attributes$stringProperty('htmlFor');
var $elm$html$Html$label = _VirtualDom_node('label');
var $author$project$Main$maybeMaxLengthOf = function (formField) {
	var _v0 = formField.a;
	switch (_v0.$) {
		case 0:
			var maxlength = _v0.a.ah;
			switch (maxlength.$) {
				case 2:
					var i = maxlength.a;
					return $elm$core$Maybe$Just(i);
				case 1:
					return $elm$core$Maybe$Nothing;
				default:
					return $elm$core$Maybe$Nothing;
			}
		case 1:
			var maxlength = _v0.a;
			switch (maxlength.$) {
				case 2:
					var i = maxlength.a;
					return $elm$core$Maybe$Just(i);
				case 1:
					return $elm$core$Maybe$Nothing;
				default:
					return $elm$core$Maybe$Nothing;
			}
		case 2:
			return $elm$core$Maybe$Nothing;
		case 3:
			return $elm$core$Maybe$Nothing;
		default:
			return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Main$requiredData = function (presence) {
	switch (presence) {
		case 0:
			return true;
		case 1:
			return false;
		default:
			return true;
	}
};
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$multiple = $elm$html$Html$Attributes$boolProperty('multiple');
var $author$project$Main$attributesFromTuple = function (_v0) {
	var k = _v0.a;
	var v = _v0.b;
	var _v1 = _Utils_Tuple2(k, v);
	_v1$2:
	while (true) {
		if (_v1.a === 'multiple') {
			switch (_v1.b) {
				case 'true':
					return $elm$core$Maybe$Just(
						$elm$html$Html$Attributes$multiple(true));
				case 'false':
					return $elm$core$Maybe$Nothing;
				default:
					break _v1$2;
			}
		} else {
			break _v1$2;
		}
	}
	return $elm$core$Maybe$Just(
		A2($elm$html$Html$Attributes$attribute, k, v));
};
var $author$project$Main$isOptionalTemporalInput = function (formField) {
	var _v0 = _Utils_Tuple2(formField.w, formField.a);
	if ((_v0.a === 1) && (!_v0.b.$)) {
		var _v1 = _v0.a;
		var customElement = _v0.b.a;
		var inputType = A2(
			$elm$core$Maybe$withDefault,
			'',
			A2($elm$core$Dict$get, 'type', customElement.p));
		return A2(
			$elm$core$List$member,
			inputType,
			_List_fromArray(
				['date', 'time', 'datetime-local']));
	} else {
		return false;
	}
};
var $author$project$Main$buildInputClassString = F3(
	function (formField, fieldName, trackedFormValues) {
		var isEmpty = A2(
			$elm$core$Maybe$withDefault,
			true,
			A2(
				$elm$core$Maybe$map,
				$elm$core$String$isEmpty,
				A2(
					$elm$core$Maybe$andThen,
					$elm$core$List$head,
					A2($elm$core$Dict$get, fieldName, trackedFormValues))));
		var needsEmptyOptionalClass = $author$project$Main$isOptionalTemporalInput(formField) && isEmpty;
		var baseClass = 'tff-text-field';
		return needsEmptyOptionalClass ? (baseClass + ' tff-empty-optional') : baseClass;
	});
var $elm$html$Html$Attributes$checked = $elm$html$Html$Attributes$boolProperty('checked');
var $elm$html$Html$datalist = _VirtualDom_node('datalist');
var $elm$html$Html$Attributes$selected = $elm$html$Html$Attributes$boolProperty('selected');
var $author$project$Main$defaultSelected = function (bool) {
	return $elm$html$Html$Attributes$selected(bool);
};
var $author$project$Main$defaultValue = function (str) {
	return $elm$html$Html$Attributes$value(str);
};
var $elm$core$String$toLower = _String_toLower;
var $author$project$Main$filterChoices = F3(
	function (maybeFilter, formValues, choices) {
		if (!maybeFilter.$) {
			if (!maybeFilter.a.$) {
				var fieldName = maybeFilter.a.a;
				var _v1 = A2(
					$elm$core$Maybe$andThen,
					$elm$core$List$head,
					A2($elm$core$Dict$get, fieldName, formValues));
				if (!_v1.$) {
					var filterValue = _v1.a;
					return $elm$core$String$isEmpty(filterValue) ? _List_Nil : A2(
						$elm$core$List$filter,
						function (choice) {
							return A2(
								$elm$core$String$startsWith,
								$elm$core$String$toLower(filterValue),
								$elm$core$String$toLower(choice.j)) || A2(
								$elm$core$String$startsWith,
								$elm$core$String$toLower(filterValue),
								$elm$core$String$toLower(choice.d));
						},
						choices);
				} else {
					return _List_Nil;
				}
			} else {
				var fieldName = maybeFilter.a.a;
				var _v2 = A2(
					$elm$core$Maybe$andThen,
					$elm$core$List$head,
					A2($elm$core$Dict$get, fieldName, formValues));
				if (!_v2.$) {
					var filterValue = _v2.a;
					return $elm$core$String$isEmpty(filterValue) ? _List_Nil : A2(
						$elm$core$List$filter,
						function (choice) {
							return A2(
								$elm$core$String$contains,
								$elm$core$String$toLower(filterValue),
								$elm$core$String$toLower(choice.j)) || A2(
								$elm$core$String$contains,
								$elm$core$String$toLower(filterValue),
								$elm$core$String$toLower(choice.d));
						},
						choices);
				} else {
					return _List_Nil;
				}
			}
		} else {
			return choices;
		}
	});
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $elm$html$Html$Attributes$maxlength = function (n) {
	return A2(
		_VirtualDom_attribute,
		'maxlength',
		$elm$core$String$fromInt(n));
};
var $elm$virtual_dom$VirtualDom$node = function (tag) {
	return _VirtualDom_node(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$node = $elm$virtual_dom$VirtualDom$node;
var $elm$html$Html$option = _VirtualDom_node('option');
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $elm$html$Html$Attributes$required = $elm$html$Html$Attributes$boolProperty('required');
var $elm$html$Html$select = _VirtualDom_node('select');
var $elm$svg$Svg$Attributes$clipRule = _VirtualDom_attribute('clip-rule');
var $elm$svg$Svg$Attributes$d = _VirtualDom_attribute('d');
var $elm$svg$Svg$Attributes$fillRule = _VirtualDom_attribute('fill-rule');
var $elm$svg$Svg$path = $elm$svg$Svg$trustedNode('path');
var $author$project$Main$selectArrowDown = A2(
	$elm$svg$Svg$svg,
	_List_fromArray(
		[
			$elm$svg$Svg$Attributes$class('tff-selectarrow-icon'),
			$elm$svg$Svg$Attributes$viewBox('0 0 16 16'),
			$elm$svg$Svg$Attributes$fill('currentColor'),
			A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true'),
			A2($elm$html$Html$Attributes$attribute, 'data-slot', 'icon')
		]),
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$fillRule('evenodd'),
					$elm$svg$Svg$Attributes$d('M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z'),
					$elm$svg$Svg$Attributes$clipRule('evenodd')
				]),
			_List_Nil)
		]));
var $elm$html$Html$Attributes$tabindex = function (n) {
	return A2(
		_VirtualDom_attribute,
		'tabIndex',
		$elm$core$String$fromInt(n));
};
var $elm$html$Html$textarea = _VirtualDom_node('textarea');
var $author$project$Main$textarea = F2(
	function (attrs, children) {
		return A2(
			$elm$html$Html$textarea,
			A2(
				$elm$core$List$cons,
				A2($elm$html$Html$Attributes$attribute, 'data-gramm_editor', 'false'),
				A2(
					$elm$core$List$cons,
					A2($elm$html$Html$Attributes$attribute, 'data-enable-grammarly', 'false'),
					attrs)),
			children);
	});
var $author$project$Main$viewFormFieldOptionsPreview = F3(
	function (config, fieldID, formField) {
		var fieldName = $author$project$Main$fieldNameOf(formField);
		var disabledMode = A2(
			$elm$core$List$member,
			A2($elm$html$Html$Attributes$attribute, 'disabled', 'disabled'),
			config.Y);
		var chosenForYou = function (choices) {
			var _v10 = formField.w;
			switch (_v10) {
				case 1:
					return false;
				case 0:
					return $elm$core$List$length(choices) === 1;
				default:
					return $elm$core$List$length(choices) === 1;
			}
		};
		var _v0 = formField.a;
		switch (_v0.$) {
			case 0:
				var customElement = _v0.a;
				var extraAttrs = A2(
					$elm$core$List$filterMap,
					$elm$core$Basics$identity,
					A2(
						$elm$core$List$cons,
						A2(
							$elm$core$Maybe$map,
							function (s) {
								return $author$project$Main$defaultValue(s);
							},
							A2(
								$elm$core$Maybe$andThen,
								$elm$core$List$head,
								A2($elm$core$Dict$get, fieldName, config.u))),
						A2(
							$elm$core$List$map,
							$author$project$Main$attributesFromTuple,
							$elm$core$Dict$toList(customElement.p))));
				var extraAttrKeys = $elm$core$Dict$keys(customElement.p);
				var shortTextAttrs = A2(
					$elm$core$List$filterMap,
					$author$project$Main$attributesFromTuple,
					A2(
						$elm$core$List$filter,
						function (_v3) {
							var k = _v3.a;
							return !A2($elm$core$List$member, k, extraAttrKeys);
						},
						$elm$core$Dict$toList(
							A2(
								$elm$core$Maybe$withDefault,
								$elm$core$Dict$empty,
								A2(
									$elm$core$Maybe$map,
									function ($) {
										return $.p;
									},
									A2($elm$core$Dict$get, customElement.B, config.ak))))));
				var _v1 = function () {
					var _v2 = customElement.ae;
					switch (_v2.$) {
						case 2:
							var list = _v2.a;
							return _Utils_Tuple2(
								_List_fromArray(
									[
										A2($elm$html$Html$Attributes$attribute, 'list', fieldID + '-datalist')
									]),
								A2(
									$elm$html$Html$datalist,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$id(fieldID + '-datalist')
										]),
									A2(
										$elm$core$List$map,
										function (choice) {
											return A2(
												$elm$html$Html$option,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$value(choice.j)
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(choice.d)
													]));
										},
										list)));
						case 0:
							return _Utils_Tuple2(
								_List_Nil,
								$elm$html$Html$text(''));
						default:
							return _Utils_Tuple2(
								_List_Nil,
								$elm$html$Html$text(''));
					}
				}();
				var dataListAttrs = _v1.a;
				var dataListElement = _v1.b;
				return A2(
					$elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							A3(
							$elm$html$Html$node,
							customElement.N,
							_Utils_ap(
								_List_fromArray(
									[
										A2(
										$elm$html$Html$Attributes$attribute,
										'class',
										A3($author$project$Main$buildInputClassString, formField, fieldName, config.u)),
										$elm$html$Html$Attributes$name(fieldName),
										$elm$html$Html$Attributes$id(fieldID),
										$elm$html$Html$Attributes$required(
										$author$project$Main$requiredData(formField.w))
									]),
								_Utils_ap(
									dataListAttrs,
									_Utils_ap(
										shortTextAttrs,
										_Utils_ap(
											extraAttrs,
											_Utils_ap(
												config.Y,
												config.aO(fieldName)))))),
							_List_Nil),
							dataListElement
						]));
			case 1:
				var extraAttrs = A2(
					$elm$core$List$filterMap,
					$elm$core$Basics$identity,
					_List_fromArray(
						[
							A2(
							$elm$core$Maybe$map,
							function (maxLength) {
								return $elm$html$Html$Attributes$maxlength(maxLength);
							},
							$author$project$Main$maybeMaxLengthOf(formField)),
							A2(
							$elm$core$Maybe$map,
							function (s) {
								return $elm$html$Html$Attributes$value(s);
							},
							A2(
								$elm$core$Maybe$andThen,
								$elm$core$List$head,
								A2($elm$core$Dict$get, fieldName, config.u)))
						]));
				return A2(
					$author$project$Main$textarea,
					_Utils_ap(
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-text-field'),
								$elm$html$Html$Attributes$name(fieldName),
								$elm$html$Html$Attributes$id(fieldID),
								$elm$html$Html$Attributes$required(
								$author$project$Main$requiredData(formField.w)),
								$elm$html$Html$Attributes$placeholder(' ')
							]),
						_Utils_ap(
							extraAttrs,
							_Utils_ap(
								config.Y,
								config.aO(fieldName)))),
					_List_Nil);
			case 2:
				var choices = _v0.a.k;
				var filter = _v0.a.e;
				var valueString = A2(
					$elm$core$Maybe$withDefault,
					'',
					A2(
						$elm$core$Maybe$andThen,
						$elm$core$List$head,
						A2($elm$core$Dict$get, fieldName, config.u)));
				var filteredChoices = disabledMode ? choices : A3($author$project$Main$filterChoices, filter, config.u, choices);
				var noChoicesAfterFiltering = (!$elm$core$List$isEmpty(choices)) && $elm$core$List$isEmpty(filteredChoices);
				return (noChoicesAfterFiltering && config._) ? A2($elm$html$Html$div, _List_Nil, _List_Nil) : A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-dropdown-group')
						]),
					_List_fromArray(
						[
							$author$project$Main$selectArrowDown,
							A2(
							$elm$html$Html$select,
							_Utils_ap(
								_List_fromArray(
									[
										$elm$html$Html$Attributes$name(fieldName),
										$elm$html$Html$Attributes$id(fieldID),
										disabledMode ? $elm$html$Html$Attributes$class('tff-select-disabled') : $elm$html$Html$Attributes$required(
										$author$project$Main$requiredData(formField.w))
									]),
								config.bf(fieldName)),
							A2(
								$elm$core$List$cons,
								A2(
									$elm$html$Html$option,
									_Utils_ap(
										_List_fromArray(
											[
												A2($elm$html$Html$Attributes$attribute, 'disabled', 'disabled'),
												$author$project$Main$defaultSelected(
												(valueString === '') && (!chosenForYou(filteredChoices))),
												A2($elm$html$Html$Attributes$attribute, 'value', '')
											]),
										config.Y),
									_List_fromArray(
										[
											$elm$html$Html$text('-- Select an option --')
										])),
								A2(
									$elm$core$List$map,
									function (choice) {
										return A2(
											$elm$html$Html$option,
											A2(
												$elm$core$List$cons,
												$elm$html$Html$Attributes$value(choice.j),
												A2(
													$elm$core$List$cons,
													$author$project$Main$defaultSelected(
														_Utils_eq(valueString, choice.j) || chosenForYou(filteredChoices)),
													config.Y)),
											_List_fromArray(
												[
													$elm$html$Html$text(choice.d)
												]));
									},
									filteredChoices)))
						]));
			case 3:
				var choices = _v0.a.k;
				var filter = _v0.a.e;
				var valueString = A2(
					$elm$core$Maybe$withDefault,
					'',
					A2(
						$elm$core$Maybe$andThen,
						$elm$core$List$head,
						A2($elm$core$Dict$get, fieldName, config.u)));
				var filteredChoices = disabledMode ? choices : A3($author$project$Main$filterChoices, filter, config.u, choices);
				var noChoicesAfterFiltering = (!$elm$core$List$isEmpty(choices)) && $elm$core$List$isEmpty(filteredChoices);
				return (noChoicesAfterFiltering && config._) ? A2($elm$html$Html$div, _List_Nil, _List_Nil) : A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-chooseone-group')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tff-chooseone-radiobuttons')
								]),
							A2(
								$elm$core$List$map,
								function (choice) {
									return A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('tff-radiobuttons-group')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$label,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('tff-field-label')
													]),
												_List_fromArray(
													[
														A2(
														$elm$html$Html$input,
														_Utils_ap(
															_List_fromArray(
																[
																	$elm$html$Html$Attributes$type_('radio'),
																	$elm$html$Html$Attributes$tabindex(0),
																	$elm$html$Html$Attributes$name(fieldName),
																	$elm$html$Html$Attributes$value(choice.j),
																	$elm$html$Html$Attributes$checked(
																	_Utils_eq(valueString, choice.j) || chosenForYou(filteredChoices)),
																	$elm$html$Html$Attributes$required(
																	$author$project$Main$requiredData(formField.w))
																]),
															_Utils_ap(
																config.Y,
																config.aO(fieldName))),
														_List_Nil),
														$elm$html$Html$text(' '),
														$elm$html$Html$text(choice.d)
													]))
											]));
								},
								filteredChoices))
						]));
			default:
				var choices = _v0.a.k;
				var minRequired = _v0.a.P;
				var maxAllowed = _v0.a.T;
				var filter = _v0.a.e;
				var values = A2(
					$elm$core$Maybe$withDefault,
					_List_Nil,
					A2($elm$core$Dict$get, fieldName, config.u));
				var selectedCount = $elm$core$List$length(values);
				var validationElement = ((!disabledMode) && ((!_Utils_eq(minRequired, $elm$core$Maybe$Nothing)) || (!_Utils_eq(maxAllowed, $elm$core$Maybe$Nothing)))) ? _List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('number'),
								$elm$html$Html$Attributes$required(true),
								A2(
								$elm$html$Html$Attributes$attribute,
								'value',
								$elm$core$String$fromInt(selectedCount)),
								A2(
								$elm$html$Html$Attributes$attribute,
								'min',
								A2(
									$elm$core$Maybe$withDefault,
									'',
									A2($elm$core$Maybe$map, $elm$core$String$fromInt, minRequired))),
								A2(
								$elm$html$Html$Attributes$attribute,
								'max',
								A2(
									$elm$core$Maybe$withDefault,
									'',
									A2($elm$core$Maybe$map, $elm$core$String$fromInt, maxAllowed))),
								A2($elm$html$Html$Attributes$attribute, 'class', 'tff-visually-hidden')
							]),
						_List_Nil)
					]) : _List_Nil;
				var isValid = function () {
					var _v5 = _Utils_Tuple2(minRequired, maxAllowed);
					if (!_v5.a.$) {
						if (!_v5.b.$) {
							var min = _v5.a.a;
							var max = _v5.b.a;
							return (_Utils_cmp(selectedCount, min) > -1) && (_Utils_cmp(selectedCount, max) < 1);
						} else {
							var min = _v5.a.a;
							var _v6 = _v5.b;
							return _Utils_cmp(selectedCount, min) > -1;
						}
					} else {
						if (!_v5.b.$) {
							var _v7 = _v5.a;
							var max = _v5.b.a;
							return _Utils_cmp(selectedCount, max) < 1;
						} else {
							var _v8 = _v5.a;
							var _v9 = _v5.b;
							return true;
						}
					}
				}();
				var filteredChoices = disabledMode ? choices : A3($author$project$Main$filterChoices, filter, config.u, choices);
				var noChoicesAfterFiltering = (!$elm$core$List$isEmpty(choices)) && $elm$core$List$isEmpty(filteredChoices);
				return (noChoicesAfterFiltering && config._) ? A2($elm$html$Html$div, _List_Nil, _List_Nil) : A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(
							'tff-choosemany-group' + (((!disabledMode) && (((!_Utils_eq(minRequired, $elm$core$Maybe$Nothing)) || (!_Utils_eq(maxAllowed, $elm$core$Maybe$Nothing))) && (!isValid))) ? ' tff-invalid-checkbox' : ''))
						]),
					_Utils_ap(
						validationElement,
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-choosemany-checkboxes')
									]),
								A2(
									$elm$core$List$map,
									function (choice) {
										var alreadyFull = function () {
											if (!maxAllowed.$) {
												var m = maxAllowed.a;
												return _Utils_cmp(selectedCount, m) > -1;
											} else {
												return false;
											}
										}();
										var shouldDisable = alreadyFull && (!A2($elm$core$List$member, choice.j, values));
										return A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('tff-checkbox-group')
												]),
											_List_fromArray(
												[
													A2(
													$elm$html$Html$label,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('tff-field-label')
														]),
													_List_fromArray(
														[
															A2(
															$elm$html$Html$input,
															_Utils_ap(
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$type_('checkbox'),
																		$elm$html$Html$Attributes$tabindex(0),
																		$elm$html$Html$Attributes$name(fieldName),
																		$elm$html$Html$Attributes$value(choice.j),
																		$elm$html$Html$Attributes$checked(
																		A2($elm$core$List$member, choice.j, values) || chosenForYou(filteredChoices))
																	]),
																_Utils_ap(
																	shouldDisable ? _List_fromArray(
																		[
																			A2($elm$html$Html$Attributes$attribute, 'disabled', 'disabled')
																		]) : _List_Nil,
																	_Utils_ap(
																		config.Y,
																		A2(config.bg, fieldName, choice)))),
															_List_Nil),
															$elm$html$Html$text(' '),
															$elm$html$Html$text(choice.d)
														]))
												]));
									},
									filteredChoices))
							])));
		}
	});
var $author$project$Main$viewFormFieldPreview = F3(
	function (config, index, formField) {
		var fieldID = 'tff-field-input-' + $elm$core$String$fromInt(index);
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(
							'tff-field-group' + A2(
								$author$project$Main$when,
								$author$project$Main$requiredData(formField.w),
								{aV: '', a1: ' tff-required'}))
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$label,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tff-field-label'),
									$elm$html$Html$Attributes$for(fieldID)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(formField.d),
									function () {
									var _v0 = formField.w;
									switch (_v0) {
										case 0:
											return $elm$html$Html$text('');
										case 1:
											var _v1 = formField.a;
											if (_v1.$ === 4) {
												var minRequired = _v1.a.P;
												return (!_Utils_eq(minRequired, $elm$core$Maybe$Nothing)) ? $elm$html$Html$text('') : $elm$html$Html$text(' (optional)');
											} else {
												return $elm$html$Html$text(' (optional)');
											}
										default:
											return $elm$html$Html$text('');
									}
								}()
								])),
							A3($author$project$Main$viewFormFieldOptionsPreview, config, fieldID, formField),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tff-field-description')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									function () {
										var _v2 = formField.S;
										switch (_v2.$) {
											case 0:
												return '';
											case 1:
												var s = _v2.a;
												return s;
											default:
												var s = _v2.a;
												return s;
										}
									}()),
									function () {
									var _v3 = $author$project$Main$maybeMaxLengthOf(formField);
									if (!_v3.$) {
										var maxLength = _v3.a;
										return $elm$html$Html$text(
											' (max ' + ($elm$core$String$fromInt(maxLength) + ' characters)'));
									} else {
										return $elm$html$Html$text('');
									}
								}()
								]))
						]))
				]));
	});
var $author$project$Main$renderFormBuilderField = F4(
	function (maybeAnimate, model, index, maybeFormField) {
		if (maybeFormField.$ === 1) {
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tff-field-container'),
						A2(
						$elm$html$Html$Events$on,
						'click',
						$elm$json$Json$Decode$succeed($author$project$Main$DragEnd)),
						A2(
						$elm$html$Html$Events$preventDefaultOn,
						'dragover',
						A2($author$project$Main$dragOverDecoder, index, $elm$core$Maybe$Nothing))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-field-placeholder')
							]),
						_List_Nil)
					]));
		} else {
			var formField = maybeFormField.a;
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tff-field-container'),
						A2(
						$elm$html$Html$Attributes$attribute,
						'data-input-field',
						$author$project$Main$stringFromInputField(formField.a)),
						A2(
						$elm$html$Html$Events$preventDefaultOn,
						'dragover',
						A2(
							$author$project$Main$dragOverDecoder,
							index,
							$elm$core$Maybe$Just(formField)))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-field-wrapper')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-field-preview'),
										$elm$html$Html$Attributes$classList(
										_List_fromArray(
											[
												_Utils_Tuple2(
												'tff-animate-fadeOut',
												function () {
													if ((!maybeAnimate.$) && (maybeAnimate.a.b === 1)) {
														var _v2 = maybeAnimate.a;
														var i = _v2.a;
														var _v3 = _v2.b;
														return _Utils_eq(i, index);
													} else {
														return false;
													}
												}()),
												_Utils_Tuple2(
												'tff-animate-yellowFade',
												function () {
													if ((!maybeAnimate.$) && (!maybeAnimate.a.b)) {
														var _v5 = maybeAnimate.a;
														var i = _v5.a;
														var _v6 = _v5.b;
														return _Utils_eq(i, index);
													} else {
														return false;
													}
												}())
											])),
										A2(
										$elm$html$Html$Events$stopPropagationOn,
										'click',
										$elm$json$Json$Decode$succeed(
											_Utils_Tuple2(
												$author$project$Main$SelectField(
													$elm$core$Maybe$Just(index)),
												true))),
										A2(
										$elm$html$Html$Attributes$attribute,
										'data-selected',
										_Utils_eq(
											model.F,
											$elm$core$Maybe$Just(index)) ? 'true' : 'false'),
										A2($elm$html$Html$Attributes$attribute, 'draggable', 'true'),
										A2(
										$elm$html$Html$Events$on,
										'dragstart',
										$elm$json$Json$Decode$succeed(
											$author$project$Main$DragStart(index))),
										A2(
										$elm$html$Html$Events$on,
										'dragend',
										$elm$json$Json$Decode$succeed($author$project$Main$DragEnd))
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('tff-drag-handle')
											]),
										_List_fromArray(
											[$author$project$Main$dragHandleIcon])),
										function () {
										var hasVisibilityRules = !$elm$core$List$isEmpty(formField.m);
										var hasFilterChoices = function () {
											var _v7 = formField.a;
											switch (_v7.$) {
												case 2:
													var filter = _v7.a.e;
													return !_Utils_eq(filter, $elm$core$Maybe$Nothing);
												case 3:
													var filter = _v7.a.e;
													return !_Utils_eq(filter, $elm$core$Maybe$Nothing);
												case 4:
													var filter = _v7.a.e;
													return !_Utils_eq(filter, $elm$core$Maybe$Nothing);
												default:
													return false;
											}
										}();
										var fieldName = $author$project$Main$fieldNameOf(formField);
										var referencedInfo = A2($author$project$Main$isFieldReferencedBy, fieldName, model.g);
										return A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('tff-logic-indicators-container')
												]),
											_List_fromArray(
												[
													(hasVisibilityRules || referencedInfo.a4) ? A2(
													$elm$html$Html$div,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class(
															hasVisibilityRules ? 'tff-logic-indicator tff-logic-indicator-blue' : 'tff-logic-indicator tff-logic-indicator-gray'),
															$elm$html$Html$Attributes$title(
															(hasVisibilityRules && referencedInfo.a4) ? 'This field has visibility logic and other fields\' visibility depends on it' : (hasVisibilityRules ? 'This field has visibility logic' : 'Other fields\' visibility depends on this field\'s value'))
														]),
													_List_fromArray(
														[
															$elm$html$Html$text(
															(hasVisibilityRules && referencedInfo.a4) ? 'Contains & affects logic' : (hasVisibilityRules ? 'Contains logic' : 'Affects logic'))
														])) : $elm$html$Html$text(''),
													(hasFilterChoices || referencedInfo.a3) ? A2(
													$elm$html$Html$div,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class(
															hasFilterChoices ? 'tff-logic-indicator tff-logic-indicator-orange' : 'tff-logic-indicator tff-logic-indicator-gray'),
															$elm$html$Html$Attributes$title(
															(hasFilterChoices && referencedInfo.a3) ? 'This field filters choices and other fields\' choices depend on it' : (hasFilterChoices ? 'This field filters choices based on another field' : 'Other fields\' choices depend on this field\'s value'))
														]),
													_List_fromArray(
														[
															$elm$html$Html$text(
															(hasFilterChoices && referencedInfo.a3) ? 'Filters & affects choices' : (hasFilterChoices ? 'Filters choices' : 'Affects choices'))
														])) : $elm$html$Html$text('')
												]));
									}(),
										A3(
										$author$project$Main$viewFormFieldPreview,
										{
											Y: _List_fromArray(
												[
													A2($elm$html$Html$Attributes$attribute, 'disabled', 'disabled')
												]),
											g: model.g,
											_: false,
											bf: function (_v8) {
												return _List_Nil;
											},
											bg: F2(
												function (_v9, _v10) {
													return _List_Nil;
												}),
											aO: function (_v11) {
												return _List_Nil;
											},
											ak: model.ak,
											u: model.u
										},
										index,
										formField)
									]))
							]))
					]));
		}
	});
var $author$project$Main$AddFormField = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$DragStartNew = function (a) {
	return {$: 10, a: a};
};
var $author$project$Main$viewAddQuestionsList = F2(
	function (nextQuestionNumber, inputFields) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('tff-field-list')
				]),
			A2(
				$elm$core$List$map,
				function (inputField) {
					return A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-field-list-item'),
								A2($elm$html$Html$Attributes$attribute, 'role', 'button'),
								$elm$html$Html$Events$onClick(
								$author$project$Main$AddFormField(inputField)),
								A2($elm$html$Html$Attributes$attribute, 'draggable', 'true'),
								A2(
								$elm$html$Html$Events$on,
								'dragstart',
								$elm$json$Json$Decode$succeed(
									$author$project$Main$DragStartNew(
										{
											S: $author$project$Main$AttributeNotNeeded($elm$core$Maybe$Nothing),
											d: $author$project$Main$stringFromInputField(inputField) + (' question ' + $elm$core$String$fromInt(nextQuestionNumber)),
											Q: $elm$core$Maybe$Nothing,
											w: A2(
												$author$project$Main$when,
												$author$project$Main$mustBeOptional(inputField),
												{aV: 0, a1: 1}),
											a: inputField,
											m: _List_Nil
										}))),
								A2(
								$elm$html$Html$Events$on,
								'dragend',
								$elm$json$Json$Decode$succeed($author$project$Main$DragEnd))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								$author$project$Main$stringFromInputField(inputField))
							]));
				},
				inputFields));
	});
var $elm$html$Html$button = _VirtualDom_node('button');
var $author$project$Main$AnimateFadeOut = 1;
var $author$project$Main$DeleteFormField = function (a) {
	return {$: 3, a: a};
};
var $author$project$Main$MoveFormFieldDown = function (a) {
	return {$: 5, a: a};
};
var $author$project$Main$MoveFormFieldUp = function (a) {
	return {$: 4, a: a};
};
var $author$project$Main$OnDescriptionInput = {$: 1};
var $author$project$Main$OnDescriptionToggle = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$OnFormField = F3(
	function (a, b, c) {
		return {$: 6, a: a, b: b, c: c};
	});
var $author$project$Main$OnLabelInput = {$: 0};
var $author$project$Main$OnMultipleToggle = function (a) {
	return {$: 5, a: a};
};
var $author$project$Main$OnRequiredInput = function (a) {
	return {$: 3, a: a};
};
var $author$project$Main$allowsTogglingMultiple = function (inputField) {
	switch (inputField.$) {
		case 0:
			var attributes = inputField.a.p;
			return A2(
				$elm$core$List$member,
				A2($elm$core$Dict$get, 'multiple', attributes),
				_List_fromArray(
					[
						$elm$core$Maybe$Just('true'),
						$elm$core$Maybe$Just('false')
					]));
		case 1:
			return false;
		case 2:
			return false;
		case 3:
			return false;
		default:
			return false;
	}
};
var $author$project$Main$hasDuplicateLabel = F3(
	function (currentIndex, newLabel, formFields) {
		return A2(
			$elm$core$List$any,
			function (_v1) {
				var f = _v1.b;
				return _Utils_eq(f.d, newLabel);
			},
			A2(
				$elm$core$List$filter,
				function (_v0) {
					var i = _v0.a;
					return !_Utils_eq(i, currentIndex);
				},
				A2(
					$elm$core$List$indexedMap,
					F2(
						function (i, f) {
							return _Utils_Tuple2(i, f);
						}),
					$elm$core$Array$toList(formFields))));
	});
var $elm$html$Html$Events$targetChecked = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'checked']),
	$elm$json$Json$Decode$bool);
var $elm$html$Html$Events$onCheck = function (tagger) {
	return A2(
		$elm$html$Html$Events$on,
		'change',
		A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetChecked));
};
var $author$project$Main$inputAttributeOptional = F2(
	function (options, attributeOptional) {
		switch (attributeOptional.$) {
			case 0:
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-toggle-group')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$label,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tff-field-label')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$input,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$type_('checkbox'),
											$elm$html$Html$Attributes$tabindex(0),
											$elm$html$Html$Attributes$checked(false),
											$elm$html$Html$Events$onCheck(options.ab)
										]),
									_List_Nil),
									$elm$html$Html$text(' '),
									$elm$html$Html$text(options.d)
								]))
						]));
			case 1:
				var str = attributeOptional.a;
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-toggle-group')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$label,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tff-field-label')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$input,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$type_('checkbox'),
											$elm$html$Html$Attributes$tabindex(0),
											$elm$html$Html$Attributes$checked(true),
											$elm$html$Html$Events$onCheck(options.ab)
										]),
									_List_Nil),
									$elm$html$Html$text(' '),
									$elm$html$Html$text(options.d)
								])),
							options.af(
							$elm$core$Result$Err(str))
						]));
			default:
				var a = attributeOptional.a;
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-toggle-group')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$label,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tff-field-label')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$input,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$type_('checkbox'),
											$elm$html$Html$Attributes$tabindex(0),
											$elm$html$Html$Attributes$checked(true),
											$elm$html$Html$Events$onCheck(options.ab)
										]),
									_List_Nil),
									$elm$html$Html$text(' '),
									$elm$html$Html$text(options.d)
								])),
							options.af(
							$elm$core$Result$Ok(a))
						]));
		}
	});
var $author$project$Main$maybeMultipleOf = function (formField) {
	var _v0 = formField.a;
	switch (_v0.$) {
		case 0:
			var multiple = _v0.a.aM;
			switch (multiple.$) {
				case 2:
					var i = multiple.a;
					return $elm$core$Maybe$Just(i);
				case 1:
					return $elm$core$Maybe$Nothing;
				default:
					return $elm$core$Maybe$Nothing;
			}
		case 1:
			return $elm$core$Maybe$Nothing;
		case 2:
			return $elm$core$Maybe$Nothing;
		case 3:
			return $elm$core$Maybe$Nothing;
		default:
			return $elm$core$Maybe$Nothing;
	}
};
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Attributes$pattern = $elm$html$Html$Attributes$stringProperty('pattern');
var $author$project$Main$OnCheckboxMaxAllowedInput = function (a) {
	return {$: 17, a: a};
};
var $author$project$Main$OnCheckboxMinRequiredInput = function (a) {
	return {$: 16, a: a};
};
var $author$project$Main$OnChoicesInput = {$: 4};
var $author$project$Main$OnDatalistInput = {$: 9};
var $author$project$Main$OnDatalistToggle = function (a) {
	return {$: 8, a: a};
};
var $author$project$Main$OnDateMaxInput = function (a) {
	return {$: 21, a: a};
};
var $author$project$Main$OnDateMaxToggle = function (a) {
	return {$: 19, a: a};
};
var $author$project$Main$OnDateMinInput = function (a) {
	return {$: 20, a: a};
};
var $author$project$Main$OnDateMinToggle = function (a) {
	return {$: 18, a: a};
};
var $author$project$Main$OnFilterSourceFieldSelect = function (a) {
	return {$: 24, a: a};
};
var $author$project$Main$OnFilterToggle = function (a) {
	return {$: 22, a: a};
};
var $author$project$Main$OnFilterTypeSelect = function (a) {
	return {$: 23, a: a};
};
var $author$project$Main$OnMaxLengthInput = {$: 7};
var $author$project$Main$OnMaxLengthToggle = function (a) {
	return {$: 6, a: a};
};
var $elm$html$Html$Attributes$max = $elm$html$Html$Attributes$stringProperty('max');
var $elm$html$Html$Attributes$min = $elm$html$Html$Attributes$stringProperty('min');
var $elm$html$Html$Attributes$minlength = function (n) {
	return A2(
		_VirtualDom_attribute,
		'minLength',
		$elm$core$String$fromInt(n));
};
var $author$project$Main$onChange = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'change',
		A2($elm$json$Json$Decode$map, msg, $elm$html$Html$Events$targetValue));
};
var $author$project$Main$otherQuestionTitles = F2(
	function (formFields, currentIndex) {
		return A2(
			$elm$core$List$map,
			function (_v1) {
				var f = _v1.b;
				return {d: f.d, Q: f.Q};
			},
			A2(
				$elm$core$List$filter,
				function (_v0) {
					var i = _v0.a;
					return !_Utils_eq(i, currentIndex);
				},
				A2(
					$elm$core$List$indexedMap,
					F2(
						function (i, f) {
							return _Utils_Tuple2(i, f);
						}),
					$elm$core$Array$toList(formFields))));
	});
var $elm$html$Html$Attributes$readonly = $elm$html$Html$Attributes$boolProperty('readOnly');
var $author$project$Main$viewFormFieldOptionsBuilder = F4(
	function (shortTextTypeList, index, formFields, formField) {
		var idSuffix = $elm$core$String$fromInt(index);
		var filterSettings = function (filter) {
			if (!_Utils_eq(filter, $elm$core$Maybe$Nothing)) {
				var sourceFieldName = function () {
					if (!filter.$) {
						if (!filter.a.$) {
							var name = filter.a.a;
							return name;
						} else {
							var name = filter.a.a;
							return name;
						}
					} else {
						return '';
					}
				}();
				var otherFields = A2($author$project$Main$otherQuestionTitles, formFields, index);
				var filterType = function () {
					if (!filter.$) {
						if (!filter.a.$) {
							return 'startswith';
						} else {
							return 'contains';
						}
					} else {
						return 'startswith';
					}
				}();
				return _List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-field-rule')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-field-group')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('tff-dropdown-group')
											]),
										_List_fromArray(
											[
												$author$project$Main$selectArrowDown,
												A2(
												$elm$html$Html$select,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('tff-select'),
														$author$project$Main$onChange(
														function (newFilterType) {
															return A3(
																$author$project$Main$OnFormField,
																$author$project$Main$OnFilterTypeSelect(newFilterType),
																index,
																'');
														}),
														$elm$html$Html$Attributes$value(filterType)
													]),
												_List_fromArray(
													[
														A2(
														$elm$html$Html$option,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$value('startswith')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text('Show choices that starts with')
															])),
														A2(
														$elm$html$Html$option,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$value('contains')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text('Show choices that contains')
															]))
													]))
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-field-group mb-0')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('tff-dropdown-group')
											]),
										_List_fromArray(
											[
												$author$project$Main$selectArrowDown,
												A2(
												$elm$html$Html$select,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('tff-select'),
														$author$project$Main$onChange(
														function (fieldName) {
															return A3(
																$author$project$Main$OnFormField,
																$author$project$Main$OnFilterSourceFieldSelect(fieldName),
																index,
																'');
														}),
														$elm$html$Html$Attributes$value(sourceFieldName)
													]),
												A2(
													$elm$core$List$cons,
													A2(
														$elm$html$Html$option,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$value(''),
																$elm$html$Html$Attributes$selected(
																$elm$core$String$isEmpty(sourceFieldName))
															]),
														_List_fromArray(
															[
																$elm$html$Html$text('-- Select a field --')
															])),
													A2(
														$elm$core$List$map,
														function (field) {
															var fieldValue = A2($elm$core$Maybe$withDefault, field.d, field.Q);
															var isSelected = _Utils_eq(fieldValue, sourceFieldName);
															return A2(
																$elm$html$Html$option,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$value(fieldValue),
																		$elm$html$Html$Attributes$selected(isSelected)
																	]),
																_List_fromArray(
																	[
																		$elm$html$Html$text(
																		'value of ' + A2(
																			$elm$json$Json$Encode$encode,
																			0,
																			$elm$json$Json$Encode$string(field.d)))
																	]));
														},
														otherFields)))
											]))
									]))
							]))
					]);
			} else {
				return _List_Nil;
			}
		};
		var filterCheckbox = function (filter) {
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tff-field-group')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-field-label'),
								$elm$html$Html$Attributes$for('filter-' + idSuffix)
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$id('filter-' + idSuffix),
										$elm$html$Html$Attributes$type_('checkbox'),
										$elm$html$Html$Attributes$tabindex(0),
										$elm$html$Html$Attributes$checked(
										!_Utils_eq(filter, $elm$core$Maybe$Nothing)),
										$elm$html$Html$Events$onCheck(
										function (b) {
											return A3(
												$author$project$Main$OnFormField,
												$author$project$Main$OnFilterToggle(b),
												index,
												'');
										})
									]),
								_List_Nil),
								$elm$html$Html$text(' '),
								$elm$html$Html$text('Filter choices')
							]))
					]));
		};
		var choicesTextarea = function (choices) {
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tff-field-group')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-field-label'),
								$elm$html$Html$Attributes$for('choices-' + idSuffix)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Choices')
							])),
						A2(
						$author$project$Main$textarea,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$id('choices-' + idSuffix),
								$elm$html$Html$Attributes$value(
								A2(
									$elm$core$String$join,
									'\n',
									A2($elm$core$List$map, $author$project$Main$choiceToString, choices))),
								$elm$html$Html$Attributes$required(true),
								$elm$html$Html$Attributes$readonly(
								function () {
									var _v8 = formField.w;
									switch (_v8) {
										case 0:
											return false;
										case 1:
											return false;
										default:
											return true;
									}
								}()),
								$elm$html$Html$Events$onInput(
								A2($author$project$Main$OnFormField, $author$project$Main$OnChoicesInput, index)),
								$elm$html$Html$Attributes$minlength(1),
								$elm$html$Html$Attributes$class('tff-text-field'),
								$elm$html$Html$Attributes$placeholder('Enter one choice per line')
							]),
						_List_Nil)
					]));
		};
		var _v0 = formField.a;
		switch (_v0.$) {
			case 0:
				var customElement = _v0.a;
				var maybeShortTextTypeMaxLength = A2(
					$elm$core$Maybe$andThen,
					$elm$core$String$toInt,
					A2(
						$elm$core$Maybe$andThen,
						$elm$core$Dict$get('maxlength'),
						A2(
							$elm$core$Maybe$map,
							function ($) {
								return $.p;
							},
							$elm$core$List$head(
								A2(
									$elm$core$List$filter,
									function (_v6) {
										var inputType = _v6.B;
										return _Utils_eq(inputType, customElement.B);
									},
									shortTextTypeList)))));
				return _Utils_ap(
					_List_fromArray(
						[
							function () {
							if (maybeShortTextTypeMaxLength.$ === 1) {
								return A2(
									$author$project$Main$inputAttributeOptional,
									{
										af: function (result) {
											var valueString = function () {
												if (!result.$) {
													var i = result.a;
													return $elm$core$String$fromInt(i);
												} else {
													var err = result.a;
													return err;
												}
											}();
											return A2(
												$elm$html$Html$input,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('tff-text-field'),
														$elm$html$Html$Attributes$required(true),
														$elm$html$Html$Attributes$type_('number'),
														$elm$html$Html$Attributes$min('1'),
														$elm$html$Html$Attributes$value(valueString),
														$elm$html$Html$Events$onInput(
														A2($author$project$Main$OnFormField, $author$project$Main$OnMaxLengthInput, index))
													]),
												_List_Nil);
										},
										d: 'Limit number of characters',
										ab: function (b) {
											return A3(
												$author$project$Main$OnFormField,
												$author$project$Main$OnMaxLengthToggle(b),
												index,
												'');
										}
									},
									customElement.ah);
							} else {
								var i = maybeShortTextTypeMaxLength.a;
								return A2(
									$elm$html$Html$input,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$type_('hidden'),
											$elm$html$Html$Attributes$name('maxlength-' + idSuffix),
											$elm$html$Html$Attributes$value(
											$elm$core$String$fromInt(i))
										]),
									_List_Nil);
							}
						}(),
							A2(
							$author$project$Main$inputAttributeOptional,
							{
								af: function (result) {
									if (!result.$) {
										var a = result.a;
										return A2(
											$author$project$Main$textarea,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$required(true),
													$elm$html$Html$Attributes$pattern('.+'),
													$elm$html$Html$Attributes$class('tff-text-field'),
													$elm$html$Html$Attributes$placeholder('Enter one suggestion per line'),
													$elm$html$Html$Attributes$value(
													A2(
														$elm$core$String$join,
														'\n',
														A2($elm$core$List$map, $author$project$Main$choiceToString, a))),
													$elm$html$Html$Events$onInput(
													A2($author$project$Main$OnFormField, $author$project$Main$OnDatalistInput, index))
												]),
											_List_Nil);
									} else {
										var err = result.a;
										return A2(
											$author$project$Main$textarea,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$required(true),
													$elm$html$Html$Attributes$pattern('.+'),
													$elm$html$Html$Attributes$class('tff-text-field'),
													$elm$html$Html$Attributes$placeholder('Enter one suggestion per line'),
													$elm$html$Html$Attributes$value(err),
													$elm$html$Html$Events$onInput(
													A2($author$project$Main$OnFormField, $author$project$Main$OnDatalistInput, index))
												]),
											_List_Nil);
									}
								},
								d: 'Suggested values',
								ab: function (b) {
									return A3(
										$author$project$Main$OnFormField,
										$author$project$Main$OnDatalistToggle(b),
										index,
										'');
								}
							},
							customElement.ae)
						]),
					((customElement.B === 'date') || (A2(
						$elm$core$Maybe$withDefault,
						'',
						A2($elm$core$Dict$get, 'type', customElement.p)) === 'date')) ? _List_fromArray(
						[
							A2(
							$author$project$Main$inputAttributeOptional,
							{
								af: function (result) {
									if (!result.$) {
										var dateStr = result.a;
										return A2(
											$elm$html$Html$input,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('tff-text-field'),
													$elm$html$Html$Attributes$required(true),
													$elm$html$Html$Attributes$type_('date'),
													$elm$html$Html$Attributes$value(dateStr),
													$elm$html$Html$Events$onInput(
													function (val) {
														return A3(
															$author$project$Main$OnFormField,
															$author$project$Main$OnDateMinInput(val),
															index,
															'');
													})
												]),
											_List_Nil);
									} else {
										var err = result.a;
										return A2(
											$elm$html$Html$input,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('tff-text-field'),
													$elm$html$Html$Attributes$required(true),
													$elm$html$Html$Attributes$type_('date'),
													$elm$html$Html$Attributes$value(err),
													$elm$html$Html$Events$onInput(
													function (val) {
														return A3(
															$author$project$Main$OnFormField,
															$author$project$Main$OnDateMinInput(val),
															index,
															'');
													})
												]),
											_List_Nil);
									}
								},
								d: 'Minimum date',
								ab: function (b) {
									return A3(
										$author$project$Main$OnFormField,
										$author$project$Main$OnDateMinToggle(b),
										index,
										'');
								}
							},
							customElement.ar),
							A2(
							$author$project$Main$inputAttributeOptional,
							{
								af: function (result) {
									if (!result.$) {
										var dateStr = result.a;
										return A2(
											$elm$html$Html$input,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('tff-text-field'),
													$elm$html$Html$Attributes$required(true),
													$elm$html$Html$Attributes$type_('date'),
													$elm$html$Html$Attributes$value(dateStr),
													$elm$html$Html$Events$onInput(
													function (val) {
														return A3(
															$author$project$Main$OnFormField,
															$author$project$Main$OnDateMaxInput(val),
															index,
															'');
													})
												]),
											_List_Nil);
									} else {
										var err = result.a;
										return A2(
											$elm$html$Html$input,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('tff-text-field'),
													$elm$html$Html$Attributes$required(true),
													$elm$html$Html$Attributes$type_('date'),
													$elm$html$Html$Attributes$value(err),
													$elm$html$Html$Events$onInput(
													function (val) {
														return A3(
															$author$project$Main$OnFormField,
															$author$project$Main$OnDateMaxInput(val),
															index,
															'');
													})
												]),
											_List_Nil);
									}
								},
								d: 'Maximum date',
								ab: function (b) {
									return A3(
										$author$project$Main$OnFormField,
										$author$project$Main$OnDateMaxToggle(b),
										index,
										'');
								}
							},
							customElement.aq)
						]) : _List_Nil);
			case 1:
				var optionalMaxLength = _v0.a;
				return _List_fromArray(
					[
						A2(
						$author$project$Main$inputAttributeOptional,
						{
							af: function (result) {
								if (!result.$) {
									var i = result.a;
									return A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('tff-text-field'),
												$elm$html$Html$Attributes$required(true),
												$elm$html$Html$Attributes$type_('number'),
												$elm$html$Html$Attributes$min('1'),
												$elm$html$Html$Attributes$value(
												$elm$core$String$fromInt(i)),
												$elm$html$Html$Events$onInput(
												A2($author$project$Main$OnFormField, $author$project$Main$OnMaxLengthInput, index))
											]),
										_List_Nil);
								} else {
									var err = result.a;
									return A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('tff-text-field'),
												$elm$html$Html$Attributes$required(true),
												$elm$html$Html$Attributes$type_('number'),
												$elm$html$Html$Attributes$min('1'),
												$elm$html$Html$Attributes$value(err),
												$elm$html$Html$Events$onInput(
												A2($author$project$Main$OnFormField, $author$project$Main$OnMaxLengthInput, index))
											]),
										_List_Nil);
								}
							},
							d: 'Limit number of characters',
							ab: function (b) {
								return A3(
									$author$project$Main$OnFormField,
									$author$project$Main$OnMaxLengthToggle(b),
									index,
									'');
							}
						},
						optionalMaxLength)
					]);
			case 2:
				var choices = _v0.a.k;
				var filter = _v0.a.e;
				return _Utils_ap(
					_List_fromArray(
						[
							choicesTextarea(choices),
							filterCheckbox(filter)
						]),
					filterSettings(filter));
			case 3:
				var choices = _v0.a.k;
				var filter = _v0.a.e;
				return _Utils_ap(
					_List_fromArray(
						[
							choicesTextarea(choices),
							filterCheckbox(filter)
						]),
					filterSettings(filter));
			default:
				var choices = _v0.a.k;
				var minRequired = _v0.a.P;
				var maxAllowed = _v0.a.T;
				var filter = _v0.a.e;
				return _Utils_ap(
					_List_fromArray(
						[
							choicesTextarea(choices),
							filterCheckbox(filter)
						]),
					_Utils_ap(
						filterSettings(filter),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-field-group')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$label,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('tff-field-label')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Minimum required')
											])),
										A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$type_('number'),
												$elm$html$Html$Attributes$class('tff-text-field'),
												$elm$html$Html$Attributes$value(
												A2(
													$elm$core$Maybe$withDefault,
													'',
													A2($elm$core$Maybe$map, $elm$core$String$fromInt, minRequired))),
												$elm$html$Html$Attributes$min('0'),
												A2(
												$elm$core$Maybe$withDefault,
												$elm$html$Html$Attributes$max(
													$elm$core$String$fromInt(
														$elm$core$List$length(choices))),
												A2(
													$elm$core$Maybe$map,
													function (max) {
														return $elm$html$Html$Attributes$max(
															$elm$core$String$fromInt(max));
													},
													maxAllowed)),
												$elm$html$Html$Events$onInput(
												function (val) {
													return A3(
														$author$project$Main$OnFormField,
														$author$project$Main$OnCheckboxMinRequiredInput(val),
														index,
														'');
												})
											]),
										_List_Nil)
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-field-group')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$label,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('tff-field-label')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Maximum allowed')
											])),
										A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$type_('number'),
												$elm$html$Html$Attributes$class('tff-text-field'),
												$elm$html$Html$Attributes$value(
												A2(
													$elm$core$Maybe$withDefault,
													'',
													A2($elm$core$Maybe$map, $elm$core$String$fromInt, maxAllowed))),
												A2(
												$elm$core$Maybe$withDefault,
												$elm$html$Html$Attributes$min('0'),
												A2(
													$elm$core$Maybe$map,
													function (min) {
														return $elm$html$Html$Attributes$min(
															$elm$core$String$fromInt(min));
													},
													minRequired)),
												$elm$html$Html$Attributes$max(
												$elm$core$String$fromInt(
													$elm$core$List$length(choices))),
												$elm$html$Html$Events$onInput(
												function (val) {
													return A3(
														$author$project$Main$OnFormField,
														$author$project$Main$OnCheckboxMaxAllowedInput(val),
														index,
														'');
												})
											]),
										_List_Nil)
									]))
							])));
		}
	});
var $author$project$Main$OnAddVisibilityRule = {$: 14};
var $elm$core$List$intersperse = F2(
	function (sep, xs) {
		if (!xs.b) {
			return _List_Nil;
		} else {
			var hd = xs.a;
			var tl = xs.b;
			var step = F2(
				function (x, rest) {
					return A2(
						$elm$core$List$cons,
						sep,
						A2($elm$core$List$cons, x, rest));
				});
			var spersed = A3($elm$core$List$foldr, step, _List_Nil, tl);
			return A2($elm$core$List$cons, hd, spersed);
		}
	});
var $author$project$Main$OnVisibilityConditionDuplicate = function (a) {
	return {$: 15, a: a};
};
var $author$project$Main$OnVisibilityConditionFieldInput = F3(
	function (a, b, c) {
		return {$: 12, a: a, b: b, c: c};
	});
var $author$project$Main$OnVisibilityConditionTypeInput = F3(
	function (a, b, c) {
		return {$: 11, a: a, b: b, c: c};
	});
var $author$project$Main$OnVisibilityConditionValueInput = F3(
	function (a, b, c) {
		return {$: 13, a: a, b: b, c: c};
	});
var $author$project$Main$OnVisibilityRuleTypeInput = F2(
	function (a, b) {
		return {$: 10, a: a, b: b};
	});
var $author$project$Main$comparisonOf = function (condition) {
	var comparison = condition.b;
	return comparison;
};
var $author$project$Main$isComparingWith = F2(
	function (expected, given) {
		switch (expected.$) {
			case 0:
				if (!given.$) {
					return true;
				} else {
					return false;
				}
			case 1:
				if (given.$ === 1) {
					return true;
				} else {
					return false;
				}
			case 2:
				if (given.$ === 2) {
					return true;
				} else {
					return false;
				}
			case 3:
				if (given.$ === 3) {
					return true;
				} else {
					return false;
				}
			default:
				if (given.$ === 4) {
					return true;
				} else {
					return false;
				}
		}
	});
var $author$project$Main$isHideWhen = function (rule) {
	if (!rule.$) {
		return false;
	} else {
		return true;
	}
};
var $author$project$Main$isShowWhen = function (rule) {
	if (!rule.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $author$project$Main$selectInputGroup = function (_v0) {
	var selectAttrs = _v0.cN;
	var options = _v0.cs;
	var inputNode = _v0.b5;
	var optionToNode = function (opt) {
		return A2(
			$elm$html$Html$option,
			A2(
				$elm$core$List$filterMap,
				$elm$core$Basics$identity,
				_List_fromArray(
					[
						$elm$core$Maybe$Just(
						$elm$html$Html$Attributes$value(opt.j)),
						opt.bi ? $elm$core$Maybe$Just(
						$elm$html$Html$Attributes$selected(true)) : $elm$core$Maybe$Nothing,
						opt.bL ? $elm$core$Maybe$Just(
						A2($elm$html$Html$Attributes$attribute, 'disabled', 'disabled')) : $elm$core$Maybe$Nothing
					])),
			_List_fromArray(
				[
					$elm$html$Html$text(opt.d)
				]));
	};
	var calculatedAttrs = A2(
		$elm$core$List$append,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('tff-selectinput-select')
			]),
		A2(
			$elm$core$List$map,
			A2(
				$elm$core$Basics$composeR,
				function ($) {
					return $.j;
				},
				$elm$html$Html$Attributes$value),
			A2(
				$elm$core$List$filter,
				function ($) {
					return $.bi;
				},
				options)));
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('tff-selectinput-wrapper')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tff-selectinput-group')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-selectinput-select-wrapper')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$select,
								_Utils_ap(calculatedAttrs, selectAttrs),
								A2($elm$core$List$map, optionToNode, options)),
								$author$project$Main$selectArrowDown
							])),
						inputNode
					]))
			]));
};
var $author$project$Main$visibilityRuleSection = F4(
	function (fieldIndex, formFields, ruleIndex, visibilityRule) {
		var ruleHtml = F2(
			function (conditionIndex, rule) {
				var selectedFieldName = function () {
					var fieldName = rule.a;
					return fieldName;
				}();
				var selectedField = $elm$core$List$head(
					A2(
						$elm$core$List$filter,
						function (f) {
							return _Utils_eq(
								$author$project$Main$fieldNameOf(f),
								selectedFieldName);
						},
						$elm$core$Array$toList(formFields)));
				var datalistId = 'datalist-' + ($elm$core$String$fromInt(fieldIndex) + ('-' + ($elm$core$String$fromInt(ruleIndex) + ('-' + $elm$core$String$fromInt(conditionIndex)))));
				var datalistElement = function () {
					if (!selectedField.$) {
						var field = selectedField.a;
						var _v7 = field.a;
						switch (_v7.$) {
							case 2:
								var choices = _v7.a.k;
								return $elm$core$Maybe$Just(
									A2(
										$elm$html$Html$datalist,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$id(datalistId)
											]),
										A2(
											$elm$core$List$map,
											function (c) {
												return A2(
													$elm$html$Html$option,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$value(c.j)
														]),
													_List_Nil);
											},
											choices)));
							case 3:
								var choices = _v7.a.k;
								return $elm$core$Maybe$Just(
									A2(
										$elm$html$Html$datalist,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$id(datalistId)
											]),
										A2(
											$elm$core$List$map,
											function (c) {
												return A2(
													$elm$html$Html$option,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$value(c.j)
														]),
													_List_Nil);
											},
											choices)));
							case 4:
								var choices = _v7.a.k;
								return $elm$core$Maybe$Just(
									A2(
										$elm$html$Html$datalist,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$id(datalistId)
											]),
										A2(
											$elm$core$List$map,
											function (c) {
												return A2(
													$elm$html$Html$option,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$value(c.j)
														]),
													_List_Nil);
											},
											choices)));
							default:
								return $elm$core$Maybe$Nothing;
						}
					} else {
						return $elm$core$Maybe$Nothing;
					}
				}();
				var datalistAttr = function () {
					if (!datalistElement.$) {
						return _List_fromArray(
							[
								A2($elm$html$Html$Attributes$attribute, 'list', datalistId)
							]);
					} else {
						return _List_Nil;
					}
				}();
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-field-group tff-field-rule-condition')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tff-dropdown-group')
								]),
							_List_fromArray(
								[
									$author$project$Main$selectArrowDown,
									A2(
									$elm$html$Html$select,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('tff-text-field tff-question-title'),
											$elm$html$Html$Attributes$required(true),
											$author$project$Main$onChange(
											function (str) {
												return A3(
													$author$project$Main$OnFormField,
													A3($author$project$Main$OnVisibilityConditionFieldInput, ruleIndex, conditionIndex, str),
													fieldIndex,
													'');
											}),
											$elm$html$Html$Attributes$required(true),
											$elm$html$Html$Attributes$value(
											function () {
												var fieldName = rule.a;
												return fieldName;
											}())
										]),
									A2(
										$elm$core$List$cons,
										A2(
											$elm$html$Html$option,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$value('\n')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(' -- Remove this condition -- ')
												])),
										A2(
											$elm$core$List$map,
											function (field) {
												var fieldName = $author$project$Main$fieldNameOf(field);
												return A2(
													$elm$html$Html$option,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$value(fieldName),
															$elm$html$Html$Attributes$selected(
															_Utils_eq(
																fieldName,
																function () {
																	var givenName = rule.a;
																	return givenName;
																}()))
														]),
													_List_fromArray(
														[
															$elm$html$Html$text(
															'value of ' + A2(
																$elm$json$Json$Encode$encode,
																0,
																$elm$json$Json$Encode$string(field.d)))
														]));
											},
											A2($author$project$Main$otherQuestionTitles, formFields, fieldIndex))))
								])),
							function () {
							var optionRecord = F4(
								function (value, label, selected, disabled) {
									return {bL: disabled, d: label, bi: selected, j: value};
								});
							var comparisonValueString = function () {
								switch (rule.b.$) {
									case 0:
										var v = rule.b.a;
										return v;
									case 1:
										var v = rule.b.a;
										return v;
									case 2:
										var v = rule.b.a;
										return v;
									case 3:
										var v = rule.b.a;
										return v;
									default:
										var v = rule.b.a;
										return v;
								}
							}();
							var textInputNode = A2(
								$elm$html$Html$input,
								_Utils_ap(
									_List_fromArray(
										[
											$elm$html$Html$Attributes$type_('text'),
											$elm$html$Html$Attributes$value(comparisonValueString),
											$elm$html$Html$Events$onInput(
											function (str) {
												return A3(
													$author$project$Main$OnFormField,
													A3($author$project$Main$OnVisibilityConditionValueInput, ruleIndex, conditionIndex, str),
													fieldIndex,
													'');
											}),
											$elm$html$Html$Attributes$required(true),
											$elm$html$Html$Attributes$class('tff-comparison-value')
										]),
									datalistAttr),
								_List_Nil);
							var candidateFields = A2($author$project$Main$otherQuestionTitles, formFields, fieldIndex);
							var candidateFieldsExceptSelf = A2(
								$elm$core$List$filter,
								function (f) {
									var fn = A2($elm$core$Maybe$withDefault, f.d, f.Q);
									return !_Utils_eq(fn, selectedFieldName);
								},
								candidateFields);
							var equalsFieldDisabled = $elm$core$List$isEmpty(candidateFieldsExceptSelf);
							var optionsList = _List_fromArray(
								[
									A4(
									optionRecord,
									'Equals',
									'Equals',
									A2(
										$author$project$Main$isComparingWith,
										$author$project$Main$Equals('something'),
										$author$project$Main$comparisonOf(rule)),
									false),
									A4(
									optionRecord,
									'StringContains',
									'Contains',
									A2(
										$author$project$Main$isComparingWith,
										$author$project$Main$StringContains('something'),
										$author$project$Main$comparisonOf(rule)),
									false),
									A4(
									optionRecord,
									'EndsWith',
									'Ends with',
									A2(
										$author$project$Main$isComparingWith,
										$author$project$Main$EndsWith('something'),
										$author$project$Main$comparisonOf(rule)),
									false),
									A4(
									optionRecord,
									'GreaterThan',
									'Greater than',
									A2(
										$author$project$Main$isComparingWith,
										$author$project$Main$GreaterThan('something'),
										$author$project$Main$comparisonOf(rule)),
									false),
									A4(
									optionRecord,
									'EqualsField',
									'Equals (field)',
									A2(
										$author$project$Main$isComparingWith,
										$author$project$Main$EqualsField('something'),
										$author$project$Main$comparisonOf(rule)),
									equalsFieldDisabled)
								]);
							var otherFields = A2(
								$elm$core$List$filter,
								function (f) {
									var fn = A2($elm$core$Maybe$withDefault, f.d, f.Q);
									return !_Utils_eq(fn, selectedFieldName);
								},
								candidateFields);
							var fieldSelectNode = A2(
								$elm$html$Html$select,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-text-field tff-question-title'),
										$author$project$Main$onChange(
										function (str) {
											return A3(
												$author$project$Main$OnFormField,
												A3($author$project$Main$OnVisibilityConditionValueInput, ruleIndex, conditionIndex, str),
												fieldIndex,
												'');
										}),
										$elm$html$Html$Attributes$value(comparisonValueString)
									]),
								A2(
									$elm$core$List$cons,
									A2(
										$elm$html$Html$option,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$value('')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('-- Select a field --')
											])),
									A2(
										$elm$core$List$map,
										function (f) {
											var fn = A2($elm$core$Maybe$withDefault, f.d, f.Q);
											return A2(
												$elm$html$Html$option,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$value(fn),
														$elm$html$Html$Attributes$selected(
														_Utils_eq(fn, comparisonValueString))
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(
														'value of ' + A2(
															$elm$json$Json$Encode$encode,
															0,
															$elm$json$Json$Encode$string(f.d)))
													]));
										},
										otherFields)));
							var inputNode = function () {
								var _v3 = $author$project$Main$comparisonOf(rule);
								if (_v3.$ === 4) {
									return equalsFieldDisabled ? A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$type_('text'),
												$elm$html$Html$Attributes$value(''),
												A2($elm$html$Html$Attributes$attribute, 'disabled', 'disabled'),
												$elm$html$Html$Attributes$class('tff-comparison-value')
											]),
										_List_Nil) : fieldSelectNode;
								} else {
									return textInputNode;
								}
							}();
							return $author$project$Main$selectInputGroup(
								{
									b5: inputNode,
									cs: optionsList,
									cN: _List_fromArray(
										[
											$author$project$Main$onChange(
											function (str) {
												return A3(
													$author$project$Main$OnFormField,
													A3($author$project$Main$OnVisibilityConditionTypeInput, ruleIndex, conditionIndex, str),
													fieldIndex,
													'');
											}),
											$elm$html$Html$Attributes$class('tff-comparison-type')
										])
								});
						}()
						]));
			});
		var rulesHtml = A2(
			$elm$core$List$indexedMap,
			ruleHtml,
			$author$project$Main$visibilityRuleCondition(visibilityRule));
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('tff-field-rule')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-field-group tff-field-rule-type')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tff-dropdown-group')
								]),
							_List_fromArray(
								[
									$author$project$Main$selectArrowDown,
									A2(
									$elm$html$Html$select,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('tff-text-field tff-show-or-hide'),
											$author$project$Main$onChange(
											function (str) {
												return A3(
													$author$project$Main$OnFormField,
													A2($author$project$Main$OnVisibilityRuleTypeInput, ruleIndex, str),
													fieldIndex,
													'');
											}),
											$elm$html$Html$Attributes$required(true),
											$elm$html$Html$Attributes$value(
											function () {
												if (!visibilityRule.$) {
													return 'ShowWhen';
												} else {
													return 'HideWhen';
												}
											}())
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$option,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$value('\n')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(' -- Remove this field logic -- ')
												])),
											A2(
											$elm$html$Html$option,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$selected(
													$author$project$Main$isShowWhen(visibilityRule)),
													$elm$html$Html$Attributes$value('ShowWhen')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Show this question when')
												])),
											A2(
											$elm$html$Html$option,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$selected(
													$author$project$Main$isHideWhen(visibilityRule)),
													$elm$html$Html$Attributes$value('HideWhen')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Hide this question when')
												]))
										]))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-field-rule-conditions')
						]),
					_Utils_ap(
						A2(
							$elm$core$List$intersperse,
							A2(
								$elm$html$Html$label,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-field-label')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('AND')
									])),
							rulesHtml),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('button'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick(
										A3(
											$author$project$Main$OnFormField,
											$author$project$Main$OnVisibilityConditionDuplicate(ruleIndex),
											fieldIndex,
											''))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Add condition')
									]))
							])))
				]));
	});
var $author$project$Main$visibilityRulesSection = F3(
	function (index, formFields, formField) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('tff-toggle-group')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$label,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-field-label')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Field logic')
						])),
					A2(
					$elm$html$Html$div,
					_List_Nil,
					A2(
						$elm$core$List$intersperse,
						A2(
							$elm$html$Html$label,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tff-field-label')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('OR')
								])),
						A2(
							$elm$core$List$indexedMap,
							A2($author$project$Main$visibilityRuleSection, index, formFields),
							formField.m))),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-button-group')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('button'),
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Events$onClick(
									A3($author$project$Main$OnFormField, $author$project$Main$OnAddVisibilityRule, index, ''))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Add field logic')
								]))
						]))
				]));
	});
var $author$project$Main$viewFormFieldBuilder = F5(
	function (shortTextTypeList, index, totalLength, formFields, formField) {
		var isDuplicateLabel = A3($author$project$Main$hasDuplicateLabel, index, formField.d, formFields);
		var patternAttr = isDuplicateLabel ? _List_fromArray(
			[
				$elm$html$Html$Attributes$pattern('^$')
			]) : _List_fromArray(
			[
				$elm$html$Html$Attributes$pattern('.*')
			]);
		var idSuffix = $elm$core$String$fromInt(index);
		var deleteFieldButton = A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('tff-delete'),
					$elm$html$Html$Attributes$type_('button'),
					$elm$html$Html$Attributes$tabindex(0),
					$elm$html$Html$Attributes$title('Delete field'),
					$elm$html$Html$Events$onClick(
					A2(
						$author$project$Main$DoSleepDo,
						$author$project$Main$animateFadeDuration,
						_List_fromArray(
							[
								$author$project$Main$SetEditorAnimate(
								$elm$core$Maybe$Just(
									_Utils_Tuple2(index, 1))),
								$author$project$Main$DeleteFormField(index)
							])))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('⨯ Delete')
				]));
		var configureRequiredCheckbox = A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('tff-field-group')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$label,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-field-label'),
							$elm$html$Html$Attributes$for('required-' + idSuffix)
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$id('required-' + idSuffix),
									$elm$html$Html$Attributes$type_('checkbox'),
									$elm$html$Html$Attributes$tabindex(0),
									$elm$html$Html$Attributes$checked(
									$author$project$Main$requiredData(formField.w)),
									$elm$html$Html$Events$onCheck(
									function (b) {
										return A3(
											$author$project$Main$OnFormField,
											$author$project$Main$OnRequiredInput(b),
											index,
											'');
									})
								]),
							_List_Nil),
							$elm$html$Html$text(' '),
							$elm$html$Html$text('Required field')
						]))
				]));
		var configureMultipleCheckbox = A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('tff-field-group')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$label,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tff-field-label'),
							$elm$html$Html$Attributes$for('multiple-' + idSuffix)
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$id('multiple-' + idSuffix),
									$elm$html$Html$Attributes$type_('checkbox'),
									$elm$html$Html$Attributes$tabindex(0),
									$elm$html$Html$Attributes$checked(
									_Utils_eq(
										$author$project$Main$maybeMultipleOf(formField),
										$elm$core$Maybe$Just(true))),
									$elm$html$Html$Events$onCheck(
									function (b) {
										return A3(
											$author$project$Main$OnFormField,
											$author$project$Main$OnMultipleToggle(b),
											index,
											'');
									})
								]),
							_List_Nil),
							$elm$html$Html$text(' '),
							$elm$html$Html$text(
							'Accept multiple ' + $elm$core$String$toLower(
								$author$project$Main$stringFromInputField(formField.a)))
						]))
				]));
		var buildFieldClass = 'tff-build-field';
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(buildFieldClass)
				]),
			_Utils_ap(
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-field-group')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$label,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-field-label'),
										$elm$html$Html$Attributes$for('label-' + idSuffix)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										$author$project$Main$stringFromInputField(formField.a) + ' question title')
									])),
								A2(
								$elm$html$Html$input,
								_Utils_ap(
									_List_fromArray(
										[
											$elm$html$Html$Attributes$type_('text'),
											$elm$html$Html$Attributes$id('label-' + idSuffix),
											$elm$html$Html$Attributes$value(formField.d),
											$elm$html$Html$Attributes$required(true),
											$elm$html$Html$Events$onInput(
											A2($author$project$Main$OnFormField, $author$project$Main$OnLabelInput, index)),
											$elm$html$Html$Attributes$class('tff-text-field')
										]),
									patternAttr),
								_List_Nil),
								isDuplicateLabel ? A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-error-text')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Question titles must be unique in a form')
									])) : $elm$html$Html$text('')
							])),
						function () {
						if ($author$project$Main$mustBeOptional(formField.a)) {
							return $elm$html$Html$text('');
						} else {
							var _v0 = formField.w;
							switch (_v0) {
								case 0:
									return configureRequiredCheckbox;
								case 1:
									return configureRequiredCheckbox;
								default:
									return $elm$html$Html$text('');
							}
						}
					}(),
						$author$project$Main$allowsTogglingMultiple(formField.a) ? configureMultipleCheckbox : $elm$html$Html$text(''),
						A2(
						$author$project$Main$inputAttributeOptional,
						{
							af: function (result) {
								var valueString = function () {
									if (!result.$) {
										var a = result.a;
										return a;
									} else {
										var err = result.a;
										return err;
									}
								}();
								return A2(
									$elm$html$Html$input,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$required(true),
											$elm$html$Html$Attributes$class('tff-text-field'),
											$elm$html$Html$Attributes$value(valueString),
											$elm$html$Html$Events$onInput(
											A2($author$project$Main$OnFormField, $author$project$Main$OnDescriptionInput, index))
										]),
									_List_Nil);
							},
							d: 'Question description',
							ab: function (b) {
								return A3(
									$author$project$Main$OnFormField,
									$author$project$Main$OnDescriptionToggle(b),
									index,
									'');
							}
						},
						formField.S)
					]),
				_Utils_ap(
					A4($author$project$Main$viewFormFieldOptionsBuilder, shortTextTypeList, index, formFields, formField),
					_List_fromArray(
						[
							A3($author$project$Main$visibilityRulesSection, index, formFields, formField),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tff-build-field-buttons')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('tff-move')
										]),
									_List_fromArray(
										[
											(!index) ? $elm$html$Html$text('') : A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$type_('button'),
													$elm$html$Html$Attributes$tabindex(0),
													$elm$html$Html$Attributes$title('Move field up'),
													$elm$html$Html$Events$onClick(
													$author$project$Main$MoveFormFieldUp(index))
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('↑')
												])),
											_Utils_eq(index, totalLength - 1) ? $elm$html$Html$text('') : A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$type_('button'),
													$elm$html$Html$Attributes$tabindex(0),
													$elm$html$Html$Attributes$title('Move field down'),
													$elm$html$Html$Events$onClick(
													$author$project$Main$MoveFormFieldDown(index))
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('↓')
												]))
										])),
									function () {
									var _v2 = formField.w;
									switch (_v2) {
										case 0:
											return deleteFieldButton;
										case 1:
											return deleteFieldButton;
										default:
											return $elm$html$Html$text('');
									}
								}()
								]))
						]))));
	});
var $author$project$Main$viewRightPanel = function (modelData) {
	var rightPanelClasses = A2(
		$elm$core$String$join,
		' ',
		A2(
			$elm$core$List$cons,
			'tff-right-panel',
			(!_Utils_eq(modelData.F, $elm$core$Maybe$Nothing)) ? _List_fromArray(
				['tff-panel-visible']) : _List_Nil));
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(rightPanelClasses)
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tff-panel-header')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h3,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Field Settings')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-close-button'),
								$elm$html$Html$Attributes$type_('button'),
								$elm$html$Html$Events$onClick(
								$author$project$Main$SelectField($elm$core$Maybe$Nothing))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('×')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tff-settings-content')
					]),
				_List_fromArray(
					[
						function () {
						var _v0 = modelData.F;
						if (!_v0.$) {
							var index = _v0.a;
							var _v1 = A2($elm$core$Array$get, index, modelData.g);
							if (!_v1.$) {
								var formField = _v1.a;
								return A5(
									$author$project$Main$viewFormFieldBuilder,
									modelData.al,
									index,
									$elm$core$Array$length(modelData.g),
									modelData.g,
									formField);
							} else {
								return $elm$html$Html$text('Select a field to edit its settings');
							}
						} else {
							return $elm$html$Html$text('Select a field to edit its settings');
						}
					}()
					]))
			]));
};
var $author$project$Main$viewFormBuilder = F2(
	function (maybeAnimate, model) {
		var maybeFieldsList = A2(
			$author$project$Main$fieldsWithPlaceholder,
			$elm$core$Array$toList(model.g),
			model.q);
		var extraOptions = A2(
			$elm$core$List$map,
			function (customElement) {
				return $author$project$Main$ShortText(customElement);
			},
			model.al);
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tff-editor-layout'),
						A2(
						$elm$html$Html$Events$preventDefaultOn,
						'dragover',
						$elm$json$Json$Decode$succeed(
							_Utils_Tuple2($author$project$Main$NoOp, true)))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-left-panel'),
								$elm$html$Html$Attributes$classList(
								_List_fromArray(
									[
										_Utils_Tuple2(
										'tff-panel-hidden',
										!_Utils_eq(model.F, $elm$core$Maybe$Nothing))
									]))
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h2,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-panel-header')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Add Form Field')
									])),
								A2(
								$author$project$Main$viewAddQuestionsList,
								model.aa,
								_Utils_ap($author$project$Main$allInputField, extraOptions))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tff-center-panel'),
								$elm$html$Html$Attributes$classList(
								_List_fromArray(
									[
										_Utils_Tuple2(
										'tff-panel-hidden',
										!_Utils_eq(model.F, $elm$core$Maybe$Nothing))
									])),
								$elm$html$Html$Events$onClick(
								$author$project$Main$SelectField($elm$core$Maybe$Nothing))
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tff-fields-container'),
										A2(
										$elm$html$Html$Events$on,
										'drop',
										$elm$json$Json$Decode$succeed($author$project$Main$DragEnd))
									]),
								A2(
									$elm$core$List$indexedMap,
									A2($author$project$Main$renderFormBuilderField, maybeAnimate, model),
									maybeFieldsList))
							])),
						$author$project$Main$viewRightPanel(model)
					]))
			]);
	});
var $author$project$Main$OnFormValuesUpdated = F2(
	function (a, b) {
		return {$: 15, a: a, b: b};
	});
var $author$project$Main$fieldHasEmptyFilter = F2(
	function (formField, trackedFormValues) {
		var isFilterFieldEmpty = function (fieldName) {
			return A2(
				$elm$core$Maybe$withDefault,
				true,
				A2(
					$elm$core$Maybe$map,
					$elm$core$String$isEmpty,
					A2(
						$elm$core$Maybe$andThen,
						$elm$core$List$head,
						A2($elm$core$Dict$get, fieldName, trackedFormValues))));
		};
		var getFilterField = function (filter) {
			if (!filter.$) {
				if (!filter.a.$) {
					var fieldName = filter.a.a;
					return $elm$core$Maybe$Just(fieldName);
				} else {
					var fieldName = filter.a.a;
					return $elm$core$Maybe$Just(fieldName);
				}
			} else {
				return $elm$core$Maybe$Nothing;
			}
		};
		var _v0 = formField.a;
		switch (_v0.$) {
			case 2:
				var filter = _v0.a.e;
				return A2(
					$elm$core$Maybe$withDefault,
					false,
					A2(
						$elm$core$Maybe$map,
						isFilterFieldEmpty,
						getFilterField(filter)));
			case 3:
				var filter = _v0.a.e;
				return A2(
					$elm$core$Maybe$withDefault,
					false,
					A2(
						$elm$core$Maybe$map,
						isFilterFieldEmpty,
						getFilterField(filter)));
			case 4:
				var filter = _v0.a.e;
				return A2(
					$elm$core$Maybe$withDefault,
					false,
					A2(
						$elm$core$Maybe$map,
						isFilterFieldEmpty,
						getFilterField(filter)));
			default:
				return false;
		}
	});
var $author$project$Main$isChooseManyUsingMinMax = function (formField) {
	var _v0 = formField.a;
	switch (_v0.$) {
		case 0:
			return false;
		case 1:
			return false;
		case 4:
			var minRequired = _v0.a.P;
			var maxAllowed = _v0.a.T;
			return (!_Utils_eq(minRequired, $elm$core$Maybe$Nothing)) || (!_Utils_eq(maxAllowed, $elm$core$Maybe$Nothing));
		case 3:
			return false;
		default:
			return false;
	}
};
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			$elm$core$List$any,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, isOkay),
			list);
	});
var $elm$core$String$endsWith = _String_endsWith;
var $elm$core$String$toFloat = _String_toFloat;
var $author$project$Main$evaluateCondition = F2(
	function (trackedFormValues, condition) {
		var fieldName = condition.a;
		var comparison = condition.b;
		switch (comparison.$) {
			case 0:
				var givenValue = comparison.a;
				return A2(
					$elm$core$List$member,
					givenValue,
					A2(
						$elm$core$Maybe$withDefault,
						_List_Nil,
						A2($elm$core$Dict$get, fieldName, trackedFormValues)));
			case 1:
				var givenValue = comparison.a;
				return A2(
					$elm$core$List$any,
					$elm$core$String$contains(givenValue),
					A2(
						$elm$core$Maybe$withDefault,
						_List_Nil,
						A2($elm$core$Dict$get, fieldName, trackedFormValues)));
			case 2:
				var givenValue = comparison.a;
				return A2(
					$elm$core$List$any,
					$elm$core$String$endsWith(givenValue),
					A2(
						$elm$core$Maybe$withDefault,
						_List_Nil,
						A2($elm$core$Dict$get, fieldName, trackedFormValues)));
			case 3:
				var givenValue = comparison.a;
				return A2(
					$elm$core$List$any,
					function (formValue) {
						var _v2 = $elm$core$String$toFloat(givenValue);
						if (!_v2.$) {
							var givenFloat = _v2.a;
							return A2(
								$elm$core$Maybe$withDefault,
								false,
								A2(
									$elm$core$Maybe$map,
									function (formFloat) {
										return _Utils_cmp(formFloat, givenFloat) > 0;
									},
									$elm$core$String$toFloat(formValue)));
						} else {
							return _Utils_cmp(formValue, givenValue) > 0;
						}
					},
					A2(
						$elm$core$Maybe$withDefault,
						_List_Nil,
						A2($elm$core$Dict$get, fieldName, trackedFormValues)));
			default:
				var otherFieldName = comparison.a;
				var otherValues = A2(
					$elm$core$Maybe$withDefault,
					_List_Nil,
					A2($elm$core$Dict$get, otherFieldName, trackedFormValues));
				return A2(
					$elm$core$List$any,
					function (v) {
						return A2($elm$core$List$member, v, otherValues);
					},
					A2(
						$elm$core$Maybe$withDefault,
						_List_Nil,
						A2($elm$core$Dict$get, fieldName, trackedFormValues)));
		}
	});
var $author$project$Main$isVisibilityRuleSatisfied = F2(
	function (rules, trackedFormValues) {
		return $elm$core$List$isEmpty(rules) || A2(
			$elm$core$List$any,
			function (rule) {
				if (!rule.$) {
					var conditions = rule.a;
					return A2(
						$elm$core$List$all,
						$author$project$Main$evaluateCondition(trackedFormValues),
						conditions);
				} else {
					var conditions = rule.a;
					return !A2(
						$elm$core$List$all,
						$author$project$Main$evaluateCondition(trackedFormValues),
						conditions);
				}
			},
			rules);
	});
var $author$project$Main$viewFormPreview = F2(
	function (customAttrs, _v0) {
		var formFields = _v0.g;
		var needsFormLogic = _v0._;
		var trackedFormValues = _v0.u;
		var shortTextTypeDict = _v0.ak;
		var onInputAttrs = function (fieldName) {
			return _List_fromArray(
				[
					A2(
					$elm$html$Html$Events$on,
					'input',
					A2(
						$elm$json$Json$Decode$map,
						$author$project$Main$OnFormValuesUpdated(fieldName),
						$elm$html$Html$Events$targetValue))
				]);
		};
		var onChooseManyAttrs = F2(
			function (fieldName, choice) {
				return _List_fromArray(
					[
						$elm$html$Html$Events$onCheck(
						function (_v5) {
							return A2($author$project$Main$OnFormValuesUpdated, fieldName, choice.j);
						})
					]);
			});
		var onChangeAttrs = function (fieldName) {
			return _List_fromArray(
				[
					$author$project$Main$onChange(
					$author$project$Main$OnFormValuesUpdated(fieldName))
				]);
		};
		var isAnyChooseManyUsingMinMax = A2(
			$elm$core$List$any,
			$author$project$Main$isChooseManyUsingMinMax,
			$elm$core$Array$toList(formFields));
		var hasOptionalTemporalInputs = A2(
			$elm$core$List$any,
			$author$project$Main$isOptionalTemporalInput,
			$elm$core$Array$toList(formFields));
		var needsEventHandlers = needsFormLogic || (isAnyChooseManyUsingMinMax || hasOptionalTemporalInputs);
		var config = {
			Y: customAttrs,
			g: formFields,
			_: needsFormLogic,
			bf: needsEventHandlers ? onChangeAttrs : function (_v1) {
				return _List_Nil;
			},
			bg: needsEventHandlers ? onChooseManyAttrs : F2(
				function (_v2, _v3) {
					return _List_Nil;
				}),
			aO: needsEventHandlers ? onInputAttrs : function (_v4) {
				return _List_Nil;
			},
			ak: shortTextTypeDict,
			u: trackedFormValues
		};
		return $elm$core$Array$toList(
			A2(
				$elm$core$Array$indexedMap,
				$author$project$Main$viewFormFieldPreview(config),
				A2(
					$elm$core$Array$filter,
					function (formField) {
						return A2($author$project$Main$isVisibilityRuleSatisfied, formField.m, trackedFormValues) && (!A2($author$project$Main$fieldHasEmptyFilter, formField, trackedFormValues));
					},
					formFields)));
	});
var $author$project$Main$viewMain = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				'tff tff-container tff-mode-' + $author$project$Main$stringFromViewMode(model.ac))
			]),
		function () {
			var _v0 = model.ac;
			if (!_v0.$) {
				var editorAttr = _v0.a;
				return A2(
					$elm$core$List$cons,
					A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('hidden'),
								$elm$html$Html$Attributes$name('tiny-form-fields'),
								$elm$html$Html$Attributes$value(
								A2(
									$elm$json$Json$Encode$encode,
									0,
									$author$project$Main$encodeFormFields(model.g)))
							]),
						_List_Nil),
					A2($author$project$Main$viewFormBuilder, editorAttr.aB, model));
			} else {
				return A2($author$project$Main$viewFormPreview, _List_Nil, model);
			}
		}());
};
var $author$project$Main$view = function (model) {
	var _v0 = model.aW;
	if (!_v0.$) {
		var errString = _v0.a;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('tff-error')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$h3,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('This form could not be initialized: ')
						])),
					A2(
					$elm$html$Html$pre,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(errString)
						]))
				]));
	} else {
		return $author$project$Main$viewMain(model);
	}
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{ds: $author$project$Main$init, dS: $author$project$Main$subscriptions, dV: $author$project$Main$update, dW: $author$project$Main$view});
/*
_Platform_export({'Main':{'init':$author$project$Main$main($elm$json$Json$Decode$value)(0)}});}(this));
*/
export const Elm = {'Main':{'init':$author$project$Main$main($elm$json$Json$Decode$value)(0)}};
  