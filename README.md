# DataCube

DataCube manipulates JavaScript's native arrays so that an array behaves both as a normal array and as a *cube*: a 3-dimensional array whose entries and *subcubes* can be accessed using integer indices or keys (which can be anything). Cubes make it easy to handle data that naturally fit into a multidimensional array or a 'data-table'. Since DataCube manipulates the native array class, the syntax for using cubes is simple and clean, e.g.

```js
[3,4].cube(1);         //3-by-4 matrix, each entry is 1
[5,6,7,8].$shape(2);   //change shape of array to 2-by-2 ($ indicates a setter)
```

## Install/Load

Install: `npm install --save data-cube`

The package uses the Universal Module Definition (UMD) so can be loaded in a  `<script>` tag or imported with JavaScript.

---

**See the [Wiki](https://github.com/gjmcn/data-cube/wiki) for more details and the documentation.**