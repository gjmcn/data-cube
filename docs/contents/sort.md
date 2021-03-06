
## Sort

---

__Note:__ see [`order`](?query#method_order) for sorting rows, columns or pages.

---

<a id="method_arrange" href="#method_arrange">#</a> **arrange:** `Array.prototype.arrange(how = null, ret = 'value')`

Sort entries &mdash; the shape, keys and labels of the calling array are ignored.

`how` specifies how entries should be sorted:

*  omitted (or `null` or `undefined`): default unicode-based behavior of native [`sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) method

* function: a 'comparison function' &mdash; see [`sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

* `'asc'`: ascending (comparison function: `(a, b) => a - b`), suitable for numbers and dates

* `'desc'`: descending (comparison function: `(a, b) => b - a`), suitable for numbers and dates

`ret` specifies what the returned array should contain:

* `'value'`: sorted entries

* `'index'`: original vector indices of sorted entries

* `'rank'`: ranks of entries

Returns a new array (unlike the native `sort` method which mutates the calling array).

Example:

```
x = [2, 3].rand(100);
```
```
x.arrange('asc');
```

---

<a id="method_order_key" href="#method_order_key">#</a> **orderKey:** `Array.prototype.orderKey(dim = 0, how = null)`

Sort dimension `dim` by its keys.

`how` specifies how the keys are sorted &mdash; see [`arrange`](#method_arrange).

Returns a new cube.

Example:

```
x = [2, 3].rand(100).$key(1, ['c', 'a', 'b']);
```
```
x.orderKey(1);
```

---

<a id="method_bin" href="#method_bin">#</a> **bin:** `Array.prototype.bin(lim, how = null, name = lim)`

Assign each entry to a bin.

`lim` contains the bin limits.

`how` specifies how the limits are sorted (see [`arrange`](#method_arrange)) and how entries are compared to limits. If `f` is the comparison function associated with `how`, entry `e` of the calling array is assigned to the first bin whose limit `u` satisfies `f(e,u) <= 0`. If `how` is omitted (or `null` or `undefined`), unicode-based sorting is used for the limits and `e` is assigned to the first bin whose limit `u` satisfies `e <= u`.

`name` contains bin names. The entries of `name` correspond to the entries of `lim`:

* `name` must have the same number of entries as `lim`

*  if sorting reorders the limits, the names are reordered accordingly

Returns a new cube with the same shape, keys and labels as the calling array. Each entry of the returned cube is a bin name.

Example:

``` {.no-output}
limits = [39, 59, 79, 100];
```
``` {.no-output}
names = ['fail', 'pass', 'merit', 'distinction'];
```
```
x = [2, 4].rand(100);
```
```
x.bin(limits, 'asc', names);
```

---

```{.no-input .no-output}
deleteVariables('limits', 'names', 'x');
```