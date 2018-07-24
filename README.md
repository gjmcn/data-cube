Data-Cube adds array-oriented programming to JavaScript:

* A native array behaves as both a normal array and as a 'cube': a 3-dimensional array whose entries and subcubes can be accessed using indices (negative indices count back from the end of a dimension) or keys (which can be any data type).

* New array methods make it easier to work with arrays and allow us to take advantage of the additional array structure.

See the [Wiki](https://github.com/gjmcn/data-cube/wiki) for more details and the docs.

See [this Observable notebook](https://beta.observablehq.com/@gjmcn/data-cube-array-oriented-javascript) for a quick overview of Data-Cube.

## Install/Load

Install: `npm install --save data-cube`

Data-Cube exports the function `dc`:

* `dc` is a global variable when Data-Cube is loaded in a `<script>` tag.

* `dc` converts an existing array to a cube &mdash; see [toCube](https://github.com/gjmcn/data-cube/wiki/Other#method_to_cube).

* `dc` has properties that can be used to create new cubes &mdash; see [Create, Copy and Convert](https://github.com/gjmcn/data-cube/wiki/Create-Copy-and-Convert).

In practice, `dc` is rarely required. For example:

```js
dc([4,5,6,7]).$shape(2);   //convert to cube, set shape
[4,5,6,7].$shape(2);       //automatic conversion

dc.cube([3,4]);            //create 3-by-4(-by-1) cube
[3,4].cube();              //same, slightly cleaner

```
