# DataCube

DataCube manipulates JavaScript's native arrays so that an array behaves both as a normal array and as a *cube*: a 3-dimensional array whose entries and *subcubes* can be accessed using indices or keys. Cubes make it easy to handle data that naturally fit into a multidimensional array or a 'data-table'. Since DataCube manipulates the native array class, the syntax for using cubes is simple and clean, e.g.

```js
[3,4].cube(1);         //3-by-4 matrix, each entry is 1
[5,6,7,8].$shape(2);   //change shape of array to 2-by-2 ($ indicates a setter)
```

Some notes:

* Formally, a cube always has 3 dimensions: rows, columns and pages. However, the following names are useful:
	* matrix: cube with 1 page
	* vector: cube with 1 column and 1 page

* The first argument of many cube methods is the dimension to operate on. Dimensions are referred to by number:
	* `0`: rows/down
	* `1`: columns/across
	* `2`: pages/back

* There many cube methods, for example:
	* get/set entries and subcubes: `at`, `row`, `cube`, ...
	* operators: `add`, `and`, `eq`, ...
	* reduce: `sum`, `mult`, `max`, ...
	* query: `where`, `count`, `order`, ...
	* sets: `union`, `inter`, `diff`, ...
	* basic linear algebra: `matMult`, `tpose`, `diag`, ...

* There are libraries that add additional cube methods:
	* advanced linear algebra: `det`, `inv`, `svd` ...
	* html: `attr`, `on`, `append`, ...

* Cube methods behave sensibly when passed arrays/cubes or non-arrays. E.g. `lt` is the less-than method:
	```js
	[3,6].lt(5);       //=> [true, false]
	[3,6].lt([5,9]);   //=> [true, true]
	```

* A cube behaves like a standard array in many respects:
	* many native array methods can be used as normal; native methods that would invalidate the cube (e.g. `push`, `pop` and `splice`, see below) will produce an error
	* other syntax such as `+=`, `++`, `...` and `[]` for getting/setting entries can be used as normal

* The number of entries of a cube **cannot** be changed.

## Arrays versus cubes
By default, an array is a standard array: any standard array method can be used (including `push`, `pop` and `splice`) and the number of entries is not fixed.

When a cube setter method is used, it converts an existing array to a cube if it is not one already. Setters return the modified cube which allows chaining, e.g. `x.$shape(y).$key(z)`. Only setters and the `toCube` method convert an existing array to a cube.

Only setters and `delete` (used to remove keys and dimension labels) change an existing array/cube. Many other cube methods return a new cube &mdash; e.g. `[3,4].cube(1)` returns a 3-by-4 matrix with all entries set to `1`.

The `fromCube` method (converts a cube back to a standard array) is the only cube method that returns a standard array.

## Implementation

To enable writing code such as `[5,6,7,8].$shape(2)`, we add methods to the array prototype rather than creating a subclass (which is problematic with arrays in JavaScript anyway).

A cube instance is an array with additional properties. The following diagram shows all possible additional properties:

```
array instance
└───_d_c_  //truthy property of this name indicates a cube (object)
│   │   r  //number of rows (integer ≥ 0)
│   │   c  //number of columns (integer ≥ 0)
│   │   p  //number of pages (integer ≥ 0)
│   │
│   └───e //extras, object
│       │   rk  //row keys (object)
│       │   ra  //row keys (array)
│       │   ck  //column keys (object)
│       │   ca  //column keys (array)
│       │   pk  //page keys (object)
│       │   pa  //page keys (array)
│       │   rl  //row label (non-empty string)
│       │   cl  //column label (non-empty string)
│       │   pl  //page label (non-empty string)

```

A cube always has a property `_d_c_`; the `_d_c_` object always has properties `r`, `c` and `p`.

The extras object `e` exists if the cube has, or has ever had, any keys or labels &mdash; cube methods know these need not be considered if this object does not exist.

Properties of the extras object are only truthy if the corresponding keys or labels are in use; otherwise the properties either do not exist or are `undefined`.

If a cube has e.g. row keys, both `rk` and `ra` are used:

* `rk`: each property name is a key, the value is the corresponding row index.

* `ra`: entry *i* is the key of row *i*.

Once an array has been converted to a cube, it is sealed with `Object.seal()` and the `length` property is made non-writable. Native array methods that are not compatible with cubes (such as `push`, `pop` and `splice`) are modified: they behave as normal when called from a standard array, but throw an error when called from a cube.
