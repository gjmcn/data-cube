Notes:

* subcube setters do not change the keys or labels of the calling array

* [[where|Query#method_where]] can also be used to get a subcube

---

<a id="method_subcube" href="#method_subcube">#</a> **subcube:** `Array.prototype.subcube(r = null, c = null, p = null, ret = 'full')`

Get the specified rows (`r`), columns (`c`) and pages (`p`).

Pass `null` (or `undefined` or omit the argument) to indicate that all indices/keys of a given dimension should be used.

`ret` specifies what to return:

* `'full'`: cube with keys and labels inherited from the calling array

* `'core'`: as `'full'`, but the returned cube does not have keys or labels

* `'array'`: standard array; entries of the selected rows, columns and pages


Example:

```
x = [3, 4].rand(100);
```
```
x.subcube([0, -1], [1, 2]);
```

---

<a id="method_set_subcube" href="#method_set_subcube">#</a> **$subcube:** `Array.prototype.$subcube(r = null, c = null, p = null, val)`

Set the corresponding subcube (see `subcube`) to `val`.

`val` is broadcast.

Returns the modified cube.

Example:

```
x = [3, 4].rand(100);
```
```
x.$subcube([0, -1], [1, 2], null, [200, 300, 400, 500]);
```

---

<a id="method_set_set_subcube" href="#method_set_set_subcube">#</a> **$$subcube:** `Array.prototype.$$subcube(r = null, c = null, p = null, f)`

Set the corresponding subcube (see `subcube`) using the function `f`.

`x.$$subcube(r, c, p, f)` is equivalent to `x.$subcube(r, c, p, f(x.subcube(r, c, p, 'full'), x))`.

Returns the modified cube.

Example:

```
x = [3, 4].rand(100);
```
```
x.$$subcube([0, -1], [1, 2], null, sc => sc.add(100));
```

---

<a id="method_row" href="#method_row">#</a><br>
**row:** `Array.prototype.row(j, ret = 'full')`<br>
**col:** `Array.prototype.col(j, ret = 'full')`<br>
**page:** `Array.prototype.page(j, ret = 'full')`

* `x.row(j, ret)` is equivalent to `x.subcube(j, null, null, ret)`

* `x.col(j, ret)` is equivalent to `x.subcube(null, j, null, ret)`

* `x.page(j, ret)` is equivalent to `x.subcube(null, null, j, ret)`

---

<a id="method_set_row" href="#method_set_row">#</a><br>
**$row:** `Array.prototype.$row(j, val)`<br>
**$col:** `Array.prototype.$col(j, val)`<br>
**$page:** `Array.prototype.$page(j, val)`

* `x.$row(j, val)` is equivalent to `x.$subcube(j, null, null, val)`

* `x.$col(j, val)` is equivalent to `x.$subcube(null, j, null, val)`

* `x.$page(j, val)` is equivalent to `x.$subcube(null, null, j, val)`

---

<a id="method_set_set_row" href="#method_set_set_row">#</a><br>
**$$row:** `Array.prototype.$$row(j, f)`<br>
**$$col:** `Array.prototype.$$col(j, f)`<br>
**$$page:** `Array.prototype.$$page(j, f)`

`f` must be a function.

* `x.$$row(j, f)` is equivalent to `x.$row(j, f(x.row(j), x))`

* `x.$$col(j, f)` is equivalent to `x.$col(j, f(x.col(j), x))`

* `x.$$page(j, f)` is equivalent to `x.$page(j, f(x.page(j), x))`

---

<a id="method_row_slice" href="#method_row_slice">#</a><br>
**rowSlice:** `Array.prototype.rowSlice(s = null, e = null, ret)`<br>
**colSlice:** `Array.prototype.colSlice(s = null, e = null, ret)`<br>
**pageSlice:** `Array.prototype.pageSlice(s = null, e = null, ret)`

Get rows, columns or pages from index/key `s` to `e` inclusive.

Pass `null` or `undefined` as `s` or omit `s` to begin from the start of the relevant dimension.

Pass `null` or `undefined` as `e` or omit `e` to finish at the end of the relevant dimension.

`ret` behaves as in `subcube`.

---

<a id="method_set_row_slice" href="#method_set_row_slice">#</a><br>
**$rowSlice:** `Array.prototype.$rowSlice(s = null, e = null, val)`<br>
**$colSlice:** `Array.prototype.$colSlice(s = null, e = null, val)`<br>
**$pageSlice:** `Array.prototype.$pageSlice(s = null, e = null, val)`

Set the selected rows, columns or pages (see `rowSlice`, `colSlice` and `pageSlice`) to `val`.

`val` is broadcast.

Returns the modified cube.

---

<a id="method_set_set_row_slice" href="#method_set_set_row_slice">#</a><br>
**$$rowSlice:** `Array.prototype.$$rowSlice(s = null, e = null, f)`<br>
**$$colSlice:** `Array.prototype.$$colSlice(s = null, e = null, f)`<br>
**$$pageSlice:** `Array.prototype.$$pageSlice(s = null, e = null, f)`

Set the corresponding subcube (see `rowSlice`, `colSlice` and `pageSlice`) using the function `f`.

* `x.$$rowSlice(s, e, f)` is equivalent to `x.$rowSlice(s, e, f(x.rowSlice(s, e), x))`

* `x.$$colSlice(s, e, f)` is equivalent to `x.$colSlice(s, e, f(x.colSlice(s, e), x))`

* `x.$$pageSlice(s, e, f)` is equivalent to `x.$pageSlice(s, e, f(x.pageSlice(s, e), x))`

Returns the modified cube.

---

<a id="method_head" href="#method_head">#</a> **head:** `Array.prototype.head(nr = null, nc = null, np = null, ret = 'full')`

Get the first `nr` rows, `nc` columns and `np` pages.

Each argument should be a non-negative integer. Pass `null`, `undefined` or omit an argument to get all rows/columns/pages.

If a dimension length is less than the corresponding argument, `head` gets all rows/columns/pages (in contrast to methods that are passed indices/keys and throw an error if an index/key does not exist).

`ret` behaves as in `subcube`.

---