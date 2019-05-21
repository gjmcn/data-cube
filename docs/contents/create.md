## Create, Copy and Convert

---

__Notes:__

* These methods *do not* convert the calling array to a cube (except for [`toCube`](#method_to_cube)).

* These methods can be called as standard functions. The [`dc`](?exported) function exported by Data-Cube is equivalent to the [`toCube`](#method_to_cube) method; other methods can be called as properties of `dc`. For example:
  ``` {.no-exec}
  dc([2, 3]);          //equivalent to [2, 3].toCube()
  dc.cube([2, 3], 7);  //equivalent to [2, 3].cube(7)
  dc.rand([2, 3], 7);  //equivalent to [2, 3].rand(7)
  dc.copy(x);          //equivalent to x.copy()
  ```
  When the function approach is used, a non-array first argument and a 1-entry array first argument are equivalent. For example, `dc.cube(5)` is equivalent to `dc.cube([5])`.

---

### Create

---

<a id="method_cube" href="#method_cube">#</a> **cube:** `Array.prototype.cube(val)`

Returns a new cube with shape specified by the calling array: `[nRows, nColumns, nPages]`. If a dimension length is omitted or `undefined`, it defaults to 1.

The entries of the returned cube are set to `val`. If `val` is omitted or `undefined`, the returned cube is sparse.

`val` is broadcast.

Example:

```
[2, 3].cube(5);
```

---

<a id="method_rand" href="#method_rand">#</a> **rand:** `Array.prototype.rand(mx)`

Returns a new cube with shape specified by the calling array: `[nRows, nColumns, nPages]`. If a dimension length is omitted or `undefined`, it defaults to 1.

If `mx` is omitted, each entry of the returned cube is a sample from a uniform distribution: *x &isin; [0,1)*.

If passed, `mx` must be a positive integer. Each entry of the returned cube is a sample from a _discrete_ uniform distribution: *x &isin; {0, 1, ..., mx}*.

Example:

```
[2, 3].rand(10);
```

---

<a id="method_normal" href="#method_normal">#</a> **normal:** `Array.prototype.normal(mu = 0, sigma = 1)`

Returns a new cube with shape specified by the calling array: `[nRows, nColumns, nPages]`. If a dimension length is omitted or `undefined`, it defaults to 1.

Each entry of the returned cube is a sample from a normal distribution with mean `mu` and standard deviation `sigma`.

Example:

```
[2, 3].normal();
```

---

<a id="method_seq" href="#method_seq">#</a> **seq:** `Array.prototype.seq(step = 1, unit)`

The calling array is interpreted as `[start, limit]`. The `seq` method returns a new array with entries ranging from `start` to `limit` in steps of `step`. 

If `unit` is omitted (or `undefined`), `start` and `limit` must be of the same type and can be numbers or 1-character strings in `'A'`, `'B'`, ..., `'Y'`, `'Z'`, `'a'`, `'b'`, ..., `'y'`, `'z'`.

If `unit` is passed, the returned array contains dates.  In this case, `start` and `limit` must be dates (or strings/numbers that convert to valid dates) and `unit` must be `'year'`, `'month'`, `'week'`, `'day'`, `'hour'`, `'minute'`, `'second'` or `'milli'`. `step` is in units of `unit`.

Note: when computing a numeric sequence, `limit + 1e-15` is used (or `limit - 1e-15` if `start > limit`) to avoid floating point issues. 

Examples:

```
[0, 2].seq();
```
```
[1, -4].seq(-1.5);
```

---

<a id="method_lin" href="#method_lin">#</a> **lin:** `Array.prototype.lin(n = 10, ret = 'point')`

The calling array is interpreted as `[start, end]`. The `lin` method creates an array of `n` &ge; 2 linearly spaced points from `start` to `end` inclusive.

`ret` specifies what to return:

* `'point'`: the array of linearly spaced points

* `'step'`: a 2-entry array; the first entry is the array of linearly spaced points, the second entry is the step (the distance between points, but negative when `start > end`)

Unlike [seq](#method_seq), `lin` always computes a numeric sequence. `start` and `end` are automatically converted to numbers, so a date sequence can be created using e.g. `[date1, date2].lin().date()`.

Examples:

```
[1.5, 2.4].lin(4);
```
```
[2, -4].lin(4);
```

---

<a id="method_grid" href="#method_grid">#</a> **grid:** `Array.prototype.grid(y, ret = 'value')`

All pairs from the calling array and `y`.

Each row of the returned cube represents a 'pair'; the number of columns and what they contain depends on `ret`:

* `'index'`: 2 columns; vector indices of calling array, vector indices of `y`

* `'value'`: 2 columns; entries of calling array, entries of `y`

* `'both'`: 4 columns; vector indices of calling array, entries of calling array, vector indices of `y`, entries of `y`

The order of the pairs is intuitive: `grid` iterates over the calling array for the first index/entry of `y`, then over the calling array for the second index/entry of `y` ...

Example

```
[2, 3, 4].grid([8, 9]);
```

---

<a id="method_matrix" href="#method_matrix">#</a> **matrix:** `Array.prototype.matrix(delim, name = true)`

Create a matrix (i.e. a 1-page cube) from a string or an array of arrays/objects.

If `delim` is omitted or falsy, the calling array should be an array of arrays/objects; each inner array/object will correspond to a row of the returned cube.  When the first entry of the calling array is an object, its property names are used as the column keys of the returned cube. The shape, keys and labels of the calling array are ignored.

If `delim` is truthy, it is assumed to be a delimiter character and the calling array should contain a single entry: a string of delimiter-separated values (DSV). Typically, the string will have been loaded from a file. For example, a _.csv_ file if the delimiter is a comma. If `name` is truthy, the first line of the DSV string is assumed to represent column names; these are used as the column keys of the returned cube.

Notes:

* The number of columns in the returned cube is computed from the first inner array/object or first line of the DSV string.

* When used, `delim` must be a single character (i.e. a single 16-bit code unit).

* `name` is ignored when `delim` is not used.

* A byte order mark (BOM) at the start of a DSV string is ignored.

* The values contained in a DSV string are assumed to be strings &mdash; so the entries (and keys) of the returned cube will be strings. [`$autoType`](?entries#method_set_autoType) can be used to convert strings to other basic types.

Example:

```
[{a: 5, b: true}, {a: 6, b: false}].matrix();
```

---

<a id="method_dict" href="#method_dict">#</a> **dict:** `Array.prototype.dict(dim = 0)`

Create a 'dictionary'.

The entries of the calling array are interpreted as _key_, _value_,  _key_, _value_, ... The returned cube has dimensions of length 1 except on `dim` and has keys on dimension `dim`.

Example:

```
['a', 5, 'b', true].dict(1);
```

---

<a id="method_parse" href="#method_parse">#</a> **parse:** `Array.prototype.parse()`

Create a cube or a standard array from a JSON string.

The calling array should contain a single entry &mdash; the JSON string.

Note: use the cube method [`stringify`](#method_stringify) to serialize a cube to a JSON string. `stringify` or the native method [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) can be used to serialize a standard array.

Example:

```
x = [2, 3].rand(10);
```
```
s = x.stringify();
```
```
[s].parse();
```

---

### Copy

---

<a id="method_copy" href="#method_copy">#</a> **copy:** `Array.prototype.copy(ret = 'full')`

Shallow copy.

Both entries and keys are shallow copied.

`ret` specifies what to return:

* `'full'`: cube with the same entries, shape, keys and labels as the calling array

* `'core'`: cube with the same entries and shape as the calling array, but no keys or labels

* `'shell'`: cube with the same shape, keys and labels as the calling array; the cube is a [sparse array](?gotchas#sparse-arrays)

* `'array'`: standard array; only the entries are copied

Example:

```
x = [2, 3].rand(10);
```
```
x.copy('array');
```

---

### Convert

---

<a id="method_to_cube" href="#method_to_cube">#</a> **toCube:** `Array.prototype.toCube()`

Convert a standard array to a cube (does nothing if already a cube).

Returns the cube.

The [`dc`](?exported) function exported by the Data-Cube module is equivalent to the `toCube` method. For example, `dc([2, 3])` is equivalent to `[2, 3].toCube()`. If a non-array is passed to `dc`, it returns a 1-entry cube with the passed value as the entry. 

Example:

```
x = [3, 4]
```
```
x.stringify();
```
```
x.toCube();
```
```
x.stringify();
```

---

<a id="method_to_array" href="#method_to_array">#</a> **toArray:** `Array.prototype.toArray()`

Convert a cube to a standard array (does nothing if already a standard array).

Returns the array.

Example:

```
x = [2, 3].rand(10);
```
```
x.toArray();
```

---

### Alternative data formats

---

<a id="method_ar_ar" href="#method_ar_ar">#</a> **arAr:** `Array.prototype.arAr()`

'array of arrays'. Create an array of arrays from a 1-page cube or a standard array.

The keys and labels of the calling array are ignored.

Returns a new array with the same number of entries as the calling array has rows.

Example:

```
x = [2, 3].rand(10);
```
```
y = x.arAr();
```
```
y.stringify();
```

---

<a id="method_ar_obj" href="#method_ar_obj">#</a> **arObj:** `Array.prototype.arObj()`

'array of objects'. Create an array of objects from a 1-page cube.

The calling array must have column keys. These are converted to strings and used as property names. All other keys and labels of the calling array are ignored.

Returns a new array with the same number of entries as the calling array has rows.

Example:

```
x = [2, 3].rand(10).$key(1, ['a', 'b', 'c']);
```
```
y = x.arObj();
```
```
y.stringify();
```

Also see: [vble](?other#method_vble).

---

<a id="method_dsv" href="#method_dsv">#</a> **dsv:** `Array.prototype.dsv(delim = ',')`

'delimiter-separated values'. Create a string of delimiter-separated values (DSV) from a 1-page cube or a standard array.

`delim` is the delimiter.

Entries of the calling array are converted to strings.  `undefined` and `null` entries are converted to empty strings. Strings that contain `delim`, a double-quote (`"`) or a newline are escaped using double-quotes.

If the calling array has column keys, they are converted to strings and used as the first line of the DSV string. All other keys and labels of the calling array are ignored.

Returns a string.

---

<a id="method_stringify" href="#method_stringify">#</a> **stringify:** `Array.prototype.stringify()`

Returns a (JSON) string.

`stringify` uses the same rules as the native method [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) to represent array entries. In particular: functions, symbols, `Infinity`, `NaN`, `undefined` and `null` all become `null`; dates are converted to strings. The same rules are applied to keys.

Note: use the cube method [`parse`](#method_parse) to reconstruct a cube from a JSON string. ` parse` or the native method [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) can be used to reconstruct a standard array.

Example:

```
x = [2, 3].rand(10);
```
```
x.stringify();
```

---

### Fetch

Notes:

* Fetch methods call the `fetch` function. In the browser, this will be [`window.fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). In Node.js, load [`node-fetch`](https://www.npmjs.com/package/node-fetch) before using the fetch methods.

* The calling array should contain a single entry that is a url (a string).

* The `init` argument of fetch methods is an options object that is passed to the `fetch` function.

* Fetch methods return a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

Example usage with [`fetchMatrix`](#method_fetch_matrix):

  ``` {.no-exec}
  //pass matrix to the function f
  [url].fetchMatrix()
    .then(f);

  //equivalent to above
  dc.fetchMatrix(url)
    .then(f);

  //use await
  (async () => {
    let x = await dc.fetchMatrix(url);
    //use x here
  })();

  //three matrices
  (async () => {
    let [x, y, z] = await Promise.all([xUrl, yUrl, zUrl].call(dc.fetchMatrix));
    //use x, y and z here
  })();
  ```

---

<a id="method_fetch" href="#method_fetch">#</a> **fetch:** `Array.prototype.fetch(method = 'text', init)`

Fetch a resource and call the method with name `method` on the response object.

---

<a id="method_fetch_matrix" href="#method_fetch_matrix">#</a> **fetchMatrix:** `Array.prototype.fetchMatrix(name = true, init)`

Fetch data and convert the result to a matrix (i.e. a 1-page cube).

If the file extension is _csv_/_tsv_, the file is assumed to contain comma/tab-separated values and `name` indicates if the first row contains column keys. Otherwise, the data is assumed to be JSON and `name` is ignored (see [`matrix`](#method_matrix)).

---

<a id="method_fetch_parse" href="#method_fetch_parse">#</a> **fetchParse:** `Array.prototype.fetchParse(init)`

Fetch data and parse the result to a cube or a standard array.

`fetchParse` should only be used to load JSON created by Data-Cube's [`stringify`](#method_stringify) method or JSON that represents a standard array. 

---

```{.no-input .no-output}
deleteVariables('s', 'x', 'y');
```