
## Get-Set Entries

---

### Individual Entry

---

<a id="method_ent" href="#method_ent">#</a> **ent:** `Array.prototype.ent(i)`

Returns the entry at vector index `i`.

A negative index counts back from the largest valid vector index.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.ent(2);
```

---

<a id="method_set_ent" href="#method_set_ent">#</a> **$ent:** `Array.prototype.$ent(i, val)`

Set the corresponding entry (see [`ent`](#method_ent)) to `val`.

Returns the modified cube.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.$ent(2, 'Z');
```

---

<a id="method_set_set_ent" href="#method_set_set_ent">#</a> **$$ent:** `Array.prototype.$$ent(i, f)`

Set the corresponding entry (see [`ent`](#method_ent)) using the function `f`.

`x.$$ent(i, f)` is equivalent to `x.$ent(i, f(x.ent(i), x))`.

Returns the modified cube.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.$$ent(2, val => val + '!');
```

---

<a id="method_at" href="#method_at">#</a> **at:** `Array.prototype.at(r = null, c = null, p = null)`

Returns the entry at row `r`, column `c` and page `p`.

Pass `null` (or `undefined` or omit the argument) to specify the first row/column/page, regardless of whether the corresponding dimension has indices or keys.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.at(0, 1);
```

---

<a id="method_set_at" href="#method_set_at">#</a> **$at:** `Array.prototype.$at(r = null, c = null, p = null, val)`

Set the corresponding entry (see [`at`](#method_at)) to `val`.

Returns the modified cube.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.$at(0, 1, null, 'Z');
```

---

<a id="method_set_set_at" href="#method_set_set_at">#</a> **$$at:** `Array.prototype.$$at(r = null, c = null, p = null, f)`

Set the corresponding entry (see [`at`](#method_at)) using the function `f`.

`x.$$at(r, c, p, f)` is equivalent to `x.$at(r, c, p, f(x.at(r, c, p), x))`.

Returns the modified cube.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.$$at(0, 1, null, val => val + '!');
```

---

### Multiple Entries

---

<a id="method_vec" href="#method_vec">#</a> **vec:** `Array.prototype.vec(i = null)`

Get entries at vector indices `i`.

Negative indices count back from the largest valid vector index. 

Pass `null` (or `undefined` or omit the argument) to get all entries in the same order as they appear in the calling array.

Returns a new array.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.vec([0, -2]);
```

---

<a id="method_set_vec" href="#method_set_vec">#</a> **$vec:** `Array.prototype.$vec(i = null, val)`

Set selected entries (see [`vec`](#method_vec)) to `val`.

`val` is broadcast.

Note that `$vec` can be used to set every entry of a cube without affecting its shape, keys or labels. E.g. `x.$vec(null, y)`.

Returns the modified cube.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.$vec([0, -2], ['Y', 'Z']);
```

---

<a id="method_set_set_vec" href="#method_set_set_vec">#</a> **$$vec:** `Array.prototype.$$vec(i = null, f)`

Set selected entries (see [`vec`](#method_vec)) using the function `f`.

`x.$$vec(i, f)` is equivalent to `x.$vec(i, f(x.vec(i), x))`.

Returns the modified cube.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.$$vec([0, -2], vals => vals.add('!'));
```

---

<a id="method_rcp" href="#method_rcp">#</a> **rcp:** `Array.prototype.rcp(r = null, c = null, p = null)`

Get entries that correspond to the given row (`r`), column (`c`) and page (`p`) indices/keys.

Omit an argument (or pass `null` or `undefined`) to use the first row/column/page.

All arguments are broadcast.

Returns a new array.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.rcp([1, 0], [0, 2]);
```

---

<a id="method_set_rcp" href="#method_set_rcp">#</a> **$rcp:** `Array.prototype.$rcp(r = null, c = null, p = null, val)`

Set selected entries (see [`rcp`](#method_rcp)) to `val`.

All arguments are broadcast &mdash; though if `r`, `c` and `p` are all singletons, `val` must also be a singleton.

Returns the modified cube.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.$rcp([1, 0], [0, 2], null, ['Y', 'Z']);
```

---

<a id="method_set_set_rcp" href="#method_set_set_rcp">#</a> **$$rcp:** `Array.prototype.$$rcp(r = null, c = null, p = null, f)`

Set selected entries (see [`rcp`](#method_rcp)) using the function `f`.

`x.$$rcp(r, c, p, f)` is equivalent to `x.$rcp(r, c, p, f(x.rcp(r, c, p), x))`.

Returns the modified cube.

Example:

```
x = ['a', 'f'].seq().$shape(2);
```
```
x.$$rcp([1, 0], [0, 2], null, vals => vals.add('!'));
```

---

<a id="method_set_autoType" href="#method_set_autoType">#</a> **$autoType:** `Array.prototype.$autoType(empty)`

Convert string entries to another type where appropriate:

1. empty string &#8594; `empty`
2. `'undefined'` &#8594; `undefined`
3. `'null'` &#8594; `null`
4. `'true'` &#8594; `true`
5. `'false'` &#8594; `false`
6. `'NaN'` &#8594; `NaN`
7. if conversion to number does not give `NaN`, use the number

Note: the conversion rules are similar to [d3.autoType](https://github.com/d3/d3-dsv#autoType), but not identical. 

Returns the modified cube.

Example:

```
x = ['', 'undefined', 'null', 'true', 'false', 'NaN', '123', 'abc'].tp();
```
```
x.$autoType(null);
```

---

```{.no-input .no-output}
deleteVariables('x');
```