
## Entrywise

---

Unless otherwise stated, entrywise methods return a new cube with the same shape, keys and labels as the calling array.

---

<a id="method_ew_no_arg" href="#method_ew_no_arg">#</a> **Methods that take no arguments:**

Name | Function
|:--|:--|
`neg` | `x => -x`
`sqrt` | `Math.sqrt`
`cbrt` | `Math.cbrt`
`abs` | `Math.abs`
`round` | `Math.round`
`floor` | `Math.floor`
`ceil` | `Math.ceil`
`trunc` | `Math.trunc`
`sign` | `Math.sign`
`exp` | `Math.exp`
`expm1` | `Math.expm1`
`log` | `Math.log`
`log10` | `Math.log10`
`log2` |`Math.log2`
`log1p` |`Math.log1p`
`sin` | `Math.sin`
`cos` | `Math.cos`
`tan` | `Math.tan`
`asin` | `Math.asin`
`acos` | `Math.acos`
`atan` | `Math.atan`
`sinh` | `Math.sinh`
`cosh` | `Math.cosh`
`tanh` | `Math.tanh`
`asinh` | `Math.asinh`
`acosh` | `Math.acosh`
`atanh` | `Math.atanh`
`number` | `x => +x`
`string` | `x => '' + x`
`boolean` | `x => !!x`
`date` | `x => new Date(x)`
`isInteger` | `Number.isInteger`
`isFinite` | `Number.isFinite`
`isNaN` | `Number.isNaN`
`toLowerCase` | `String.prototype.toLowerCase`
`toUpperCase` | `String.prototype.toUpperCase`
`trim`  | `String.prototype.trim`
`not` | `x => !x`
`typeof` | `typeof`
`box` | `x => Array.isArray(x) ? x : [x]`
`unbox` | `x => Array.isArray(x) ? x[0] : x` {.table .table-sm .list}

Example:

```
x = [5, '6'];
```
```
x.typeof();
```

---

<a id="method_op_like" href="#method_op_like">#</a> **Operator-like methods; take one argument:**

Name | Operator/Function
|:--|:--|
`add` | `+`
`sub` | `-`
`mul` | `*`
`div` | `/`
`rem` | `%`
`pow` | `Math.pow`
`atan2` | `Math.atan2`
`hypot` | `Math.hypot`
`eq`  | `===`
`neq` | `!==`
`lt` | `<`
`lte` | `<=`
`gt` | `>`
`gte` | `>=`
`lof` | `Math.min`
`gof` | `Math.max`
`toExponential` | `Number.prototype.toExponential`
`toFixed` | `Number.prototype.toFixed`
`toPrecision` | `Number.prototype.toPrecision`
`charAt` | `String.prototype.charAt`
`repeat` | `String.prototype.repeat`
`search` | `String.prototype.search`
`test` | `RegExp.prototype.test`
`and` | `&&`
`or` | `||` {.table .table-sm .list}

The argument is broadcast. However, operator-like methods are special in that the calling array is also broadcast &mdash; i.e. the calling array can be a singleton when the argument is not. In this case, the returned cube has the same shape, keys and labels as the argument.

Despite the special behavior of broadcasting, the normal cube conversion rules apply. Specifically, the calling array is converted to a cube (if it is not one already) and the argument is left unchanged.

Multiple arguments can be passed to operator-like methods as a shorthand way of chaining the same method. For example, `x.add(y, z)` is equivalent to `x.add(y).add(z)`.

Note: unlike direct application of `&&` or `||`, `and` and `or` do not use short-circuit evaluation.

Example:

```
x = [5, 6];
```
```
x.add(10);
```

---

<a id="method_cond" href="#method_cond">#</a> **cond:** `Array.prototype.cond(a, b)`

Apply the conditional operator `?:` entrywise.

If an entry of the calling array is truthy, the returned cube contains the corresponding entry of `a`; otherwise, it contains the corresponding entry of `b`.

`a` and `b` are broadcast.

Note: unlike direct application of `?:`, `cond` does not use short-circuit evaluation.

Example:

```
x = [false, true, false];
```
```
x.cond('!', ['a', 'b', 'c']);
```

---

<a id="method_prop" href="#method_prop">#</a> **prop:** `Array.prototype.prop(name)`

Get property `name` of each entry.

Example:

```
[{a: 5, b: 6}, {a: 10, b: 20}].prop('a');
```

---

<a id="method_set_prop" href="#method_set_prop">#</a> **$prop:** `Array.prototype.$prop(name, val)`

For each entry, set property `name` to `val`.

If property `name` does not exist, it is created.

`val` is broadcast.

Returns the modified cube.

Note: if `$prop` throws an error when attempting to set a property of an entry (e.g. because the entry is `undefined`), any already-made changes will persist.

Example:

```
[{a: 5, b: 6}, {a: 10, b: 20}]
  .$prop('a', [88, 99])
  .prop('a');
```

---

<a id="method_set_set_prop" href="#method_set_set_prop">#</a> **$$prop:** `Array.prototype.$$prop(name, f)`

Set property `name` using the function `f`.

`x.$$prop(name, f)` sets the property `name` of each entry `xi` to `f(xi, x)`.

Note: the new values (the `f(xi, x)`) are computed first, then the `name` properties are set using `$prop`. 

Returns the modified cube.

Example:

```
[{a: 5, b: 6}, {a: 10, b: 20}]
  .$$prop('a', obj => obj.a + obj.b)
  .prop('a');
```

---

<a id="method_method" href="#method_method">#</a> **method:** `Array.prototype.method(name, arg1, arg2, arg3, ...)`

Call method `name` of each entry of the calling array. The corresponding entries of `arg1`, `arg2`, `arg3`, ... are passed to the method.

`name` must be a singleton; all other arguments are broadcast.

Example:

```
x = [2, 3].rand();
```
```
x.method('toFixed', 2);
```

---

<a id="method_call" href="#method_call">#</a> **call:** `Array.prototype.call(f, arg1, arg2, arg3, ...)`

Apply function `f` to each entry of the calling array. The corresponding entries of `arg1`, `arg2`, `arg3`, ... are passed as additional arguments.

`f` must be a singleton; all other arguments are broadcast.

`call` is similar to the native array method [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), but `call`:

* does not skip holes in the calling array

* accepts additional arguments for `f` (whereas `map` passes `f` the entry's index and the calling array)

* cannot be passed an alternative `this` value

* returns a cube with the same shape, keys and labels as the calling array

Example:

```
x = [2, 3].rand(100);
```
```
x.call(val => val + 100);
```

---

<a id="method_set_set_call" href="#method_set_set_call">#</a> **$$call:** `Array.prototype.$$call(f, arg1, arg2, arg3, ...)`

Set entries using their current values and the function `f`.

`x.$$call(f, arg1, arg2, arg3, ...)` calls `x.call(f, arg1, arg2, arg3, ...)` and uses the result as the new entry values of `x`.

Returns the modified cube.

Example:

```
x = [2, 3].rand(100);
```
```
x.$$call(val => val + 100);
```

---

<a id="method_apply" href="#method_apply">#</a> **apply:** `Array.prototype.apply(arg0, arg1, arg2, ...)`

Each entry of the calling array must be a function. Each function is passed the corresponding entries of `arg0`, `arg1`, `arg2`, ...

All arguments are broadcast.

Example:

```
f = [(a, b) => a + b, (a, b) => a * b];
```
```
f.apply(10, [20, 30]);
```

---

<a id="method_loop" href="#method_loop">#</a> **loop:** `Array.prototype.loop(args0, args1, args2, ...)`

Each of `args0`, `args1`, `args2`, ... contains a function or a property/method name followed by arguments/values associated with it. `loop` is mostly used to draw on the canvas with [data-cube-html](https://github.com/gjmcn/data-cube-html) and its behavior is demonstrated in this [sketch example](https://github.com/gjmcn/data-cube-html#method_sketch). 


Each function or property/method name must be a singleton. The other entries of `args0`, `args1`, `args2` ... as well as the calling array are broadcast.

Returns the calling array (converted to a cube).

---

```{.no-input .no-output}
deleteVariables('f', 'x');
```