# DataCube

DataCube manipulates JavaScript's native arrays so that an array behaves both as a normal array and as a *cube*: a 3-dimensional array whose entries and *subcubes* can be accessed using integer indices or keys (which can be anything). Cubes make it easy to handle data that naturally fit into a multidimensional array or a 'data-table'. Since DataCube manipulates the native array class, the syntax for using cubes is simple and clean, e.g.

```js
[3,4].cube(1);         //3-by-4 matrix, each entry is 1
[5,6,7,8].$shape(2);   //change shape of array to 2-by-2 ($ indicates a setter)
```

## Install/Load

Install: `npm install --save data-cube`

The package uses the Universal Module Definition (UMD) so can be loaded in a  `<script>` tag or imported with JavaScript.

DataCube exports the function `dc`:

* `dc` is a global variable when DataCube is loaded in a `<script>` tag.

* `dc` converts an existing array to a cube &mdash; see [toCube](https://github.com/gjmcn/data-cube/wiki/Other-Methods#method_to_cube).

* `dc` has properties that can be used to create new cubes &mdash; see [Create and Copy](https://github.com/gjmcn/data-cube/wiki/Create-and-Copy).

In practice, `dc` is rarely required. For example:

```js
//change shape
dc([4,5,6,7]).$shape(2);   //explicit conversion with dc
[4,5,6,7].$shape(2);       //array converted to cube automatically

//create 3-by-4(-by-1) cube
dc.cube([3,4]);            //dc.cube function
[3,4].cube();              //cube method, slightly cleaner

```

---

**See the [Wiki](https://github.com/gjmcn/data-cube/wiki) for more details and the documentation.**