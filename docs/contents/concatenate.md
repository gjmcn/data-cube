
---

<a name="method_concatenate" href="#method_concatenate">#</a><br>
**vert:** `Array.prototype.vert(arg0, arg1, arg2, ...)`<br>
**horiz:** `Array.prototype.horiz(arg0, arg1, arg2, ...)`<br>
**depth:** `Array.prototype.depth(arg0, arg1, arg2, ...)`

Concatenate vertically (`vert`), horizontally (`horiz`) or 'depthwise' (`depth`).

The calling array and all of the arguments must have the same shape except on the 'concatenating dimension'. For example, when concatenating matrices with `horiz`, the matrices must have the same number of rows, but need not have the same number of columns.

None of the arguments are broadcast.

Returns a new cube.

Notes:

* It is more efficient to call `vert`, `horiz` or `depth` once with multiple arguments rather than multiple times with a single argument. For example, `a.horiz(b,c,d)` is more efficient than `a.horiz(b).horiz(c).horiz(d)`.

* Use the native array method [concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat) to ignore the shape, keys and labels of the calling array and all arguments.

---

<a name="method_tile" href="#method_tile">#</a> **tile:** `Array.prototype.tile(dim = 0, n = 2, ret = 'full')`


Repeat along dimension `dim` `n` times.

`ret` specifies what to return:

* `'full'`: cube with keys and labels inherited from the calling array except on dimension `dim` which has no keys or label

* `'core'`: cube with no keys or labels

Returns a new cube.

---

<a name="method_tile_to" href="#method_tile_to">#</a> **tileTo:** `Array.prototype.tileTo(y, ret = 'full')`

Repeat calling array as required so that the returned cube has the same shape as `y`.

On each dimension, the required number of 'tiles' must be a non-negative integer.

`ret` specifies what to return:

* `'full'`: on dimensions where the calling array and `y` are the same length, the returned cube inherits the keys and labels from the calling array; the returned cube has no keys or labels on other dimensions

* `'core'`: cube with no keys or labels

Returns a new cube.

---

<a name="method_unpack" href="#method_unpack">#</a> **unpack:** `Array.prototype.unpack()`

The calling array must have at least two dimensions of length 1 (i.e. must be a 'column vector', 'row vector' or 'page vector') and have array/cube entries.

`unpack` concatenates the inner arrays along the 'long dimension' of the calling array.

Returns a new cube.

Notes:

* currently, the calling array (i.e. the outer array) cannot have more than 65536 entries &mdash; `unpack` will throw an error if this limit is exceeded

* [[unbox|Entrywise#method_ew_no_arg]] is typically used to unpack 1-entry arrays

---

### Related Methods

---

<a name="method_pack" href="#method_pack">#</a> **pack** `Array.prototype.pack(dim = 0, sc = 'full')`

Pack rows, columns or pages.

Example: `y = x.pack(1)` packs the columns, returning a cube with 1 row, 1 page and the same number of columns as `x`. Each entry of `y` is the corresponding column (subcube) of `x`.

Internally, `pack` uses [[subcube|Get-and-Set-Subcubes#method_subcube]]. `sc` is used as the `ret` argument for `subcube`.
 
Returns a new cube.

---