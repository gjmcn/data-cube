These methods filter, sort or group a dimension of the calling array based on their `val` argument:

* If `val` is a (singleton) function, it is passed the calling array and the entries of the result are filtered/sorted/grouped.

* Otherwise, the entries of `val` are filtered/sorted/grouped.

Notes:

* Each entry of `val` (or the result of `val` if it is a function) corresponds to an index of dimension `dim` of the calling array &mdash; `val` must have the same number of entries as the length of `dim` (though see [[group|Query#method_group]]).

* Use a function for `val` to refer to the calling array when it is not assigned to a variable. For example, if `x` is a matrix, `x.rowSlice(0, 99).where(0, me => me.col(2).gt(50))` gets the first 100 rows of `x`, and from these, gets the rows where column `2` is greater than `50`.

Query methods return a new cube.

---

<a id="method_where" href="#method_where">#</a> **where:** `Array.prototype.where(dim = 0, val)`

Get rows, columns or pages (depending on `dim`) where the corresponding values of `val` are truthy.

The order of rows/columns/pages is preserved.

Example:

```
x = [1, 8].seq().$shape(4);
```
```
x.where(0, x.col(1).gt(6));
```

---

<a id="method_order" href="#method_order">#</a> **order:** `Array.prototype.order(dim = 0, val, how = null)`

Order rows, columns or pages (depending on `dim`).

`how` specifies how `val` is sorted &mdash; see [[arrange|Sort#method_arrange]].

Example:

```
x = [2, 5].rand(10);
```
```
x.order(1, x.row(1), 'asc');
```

---

<a id="method_group" href="#method_group">#</a> **group:** `Array.prototype.group(dim = 0, val, ent = 'subcube')`

Group rows, columns or pages (depending on `dim`). For simplicity, the description below focuses on grouping rows &mdash; i.e. `dim` equal to `0`.

`group` partitions the rows of the calling array into subcubes. If the calling array has _n_ rows, `val` can have:

* _n_ entries: the rows of the calling array are grouped into subcubes based on the entries of `val` &mdash; so there is  a subcube for each unique value in `val`. `group` returns a vector with the unique values of `val` (order preserved) as row keys and the subcubes as entries (though see `ent` below).

* _2n_ entries: `val` is split into two 'grouping vectors' and there is a subcube for each pair of unique values from the two grouping vectors. `group` returns a matrix with the unique values of the first grouping vector (order preserved) as row keys, the unique values of the second grouping vector (order preserved) as column keys and the subcubes as entries.

* _3n_ entries: similar to _2n_ entries, but `val` is split into three grouping vectors and `group` returns a cube with row, column and page keys.

As with all query methods, `val` can be a function that is passed the calling array. In this case, the result must contain _n_, _2n_ or _3n_ entries.

`ent` specifies what each entry of the returned cube contains:

* `'subcube'`: subcube

* `'count'`: number of rows in the subcube

* function: the function is passed the subcube and the key(s) corresponding to the entry being computed; the result is used as the entry

Notes:

* Row order is preserved &mdash; rows in a subcube appear in the same order as they do in the calling array.

* Equality tests use the "SameValueZero" algorithm (this is the same as `===` except that any two `NaN` values are equal). 

* `undefined` and `null` cannot be used as keys. If `val` contains `undefined`, the corresponding key of the returned cube is the string `'_undefined_'`. Similarly, `'_null_'` is used for `null`.

* `group` uses the vector indices of `val`. For example, to group the columns of a matrix `x` on rows `2` and `4` use: `x.group(1, x.row([2,4]).tp())` (note the use of the transpose method [[tp|Other#method_tp]]).

Example:

```
x = ['a', 'b', 'c'].grid([10, 20]);
```
```
g = x.group(0, x.col(0));
```
```
g.at('b');
```

--- 

```{.no-input .no-output}
deleteVariables('g', 'x');
```
