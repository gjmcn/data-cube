
---

<a name="method_shape" href="#method_shape">#</a> **shape:** `Array.prototype.shape()`

Returns a 3-entry array: the number of rows, columns and pages.

---

<a name="method_set_shape" href="#method_set_shape">#</a> **$shape:** `Array.prototype.$shape(shp)`

Set the shape (see `shape`). The number of entries must not change.

`shp` can be:

* omitted (or `undefined`): the number of rows is set to the number of entries; the number of columns and number of pages are set to `1`

* a singleton: the number of rows is set to the value of `shp`; the number of pages is set to `1`; the number of columns is set automatically (to ensure that the number of entries does not change)

* 2-entry array: the number of rows and columns are set to the entries of `shp`; the number of pages is set automatically

* 3-entry array: the number of rows, columns and pages are set to the entries of `shp` 

`$shape` removes all keys and labels and returns the modified cube.

---

<a name="method_set_set_shape" href="#method_set_set_shape">#</a> **$$shape:** `Array.prototype.$$shape(f)`

Set the shape using the function `f`.

`x.$$shape(f)` is equivalent to `x.$shape(f(x.shape(), x))`.

`$$shape` removes all keys and labels and returns the modified cube.

---

<a name="method_n" href="#method_n">#</a> **n:** `Array.prototype.n(dim = 0)`

Length of dimension `dim`.

Returns a non-negative integer.

(Note: use the `length` property as normal to get the total number of entries.)

---


<a name="method_set_squeeze" href="#method_set_squeeze">#</a> **$squeeze:** `Array.prototype.$squeeze()`

Move dimensions of length greater than 1 'to the front'.

Dimensions that are moved take their keys and labels with them (unlike `$shape` which removes keys and labels).

Returns the modified cube.

---

