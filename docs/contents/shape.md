
## Get-Set Shape

---

<a id="method_shape" href="#method_shape">#</a> **shape:** `Array.prototype.shape()`

Returns a 3-entry array: the number of rows, columns and pages.

Example:

```
x = [2, 3].cube(5);
```
```
x.shape();
```

---

<a id="method_set_shape" href="#method_set_shape">#</a> **$shape:** `Array.prototype.$shape(shp)`

Set the shape (see [`shape`](#method_shape)). The number of entries must not change.

`shp` can be:

* omitted (or `undefined`): the number of rows is set to the number of entries; the number of columns and number of pages are set to `1`

* a singleton: the number of rows is set to the value of `shp`; the number of pages is set to `1`; the number of columns is set automatically (to ensure that the number of entries does not change)

* 2-entry array: the number of rows and columns are set to the entries of `shp`; the number of pages is set automatically

* 3-entry array: the number of rows, columns and pages are set to the entries of `shp` 

`$shape` removes all keys and labels and returns the modified cube.

Example:

```
x = [2, 3].rand(100);
```
```
x.$shape(3);
```

---

<a id="method_set_set_shape" href="#method_set_set_shape">#</a> **$$shape:** `Array.prototype.$$shape(f)`

Set the shape (see [`shape`](#method_shape)) using the function `f`.

`x.$$shape(f)` is equivalent to `x.$shape(f(x.shape(), x))`.

`$$shape` removes all keys and labels and returns the modified cube.

Example:

```
x = [2, 3].rand(100);
```
```
x.$$shape(shp => shp[0] === 2 ? 3 : 2);
```

---

<a id="method_n" href="#method_n">#</a> **n:** `Array.prototype.n(dim = 0)`

Length of dimension `dim`.

Returns a non-negative integer.

(Note: use the `length` property as normal to get the total number of entries.)

Example:

```
x = [2, 3].rand(100);
```
```
x.n();
```

---

<a id="method_set_squeeze" href="#method_set_squeeze">#</a> **$squeeze:** `Array.prototype.$squeeze()`

Move dimensions of length greater than 1 'to the front'.

Dimensions that are moved take their keys and labels with them (unlike `$shape` which removes keys and labels).

Returns the modified cube.

Example:

```
x = [3, 1, 2].rand(100);
```
```
x.$squeeze();
```

---

```{.no-input .no-output}
deleteVariables('x');
```