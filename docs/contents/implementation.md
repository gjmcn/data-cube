## Implementation

---

Data-Cube adds new methods to `Array.prototype`. When one of these methods is called, the calling array is converted to a 'cube' by adding properties to the array instance:

```{.no-exec}
array instance
    _data_cube   //true (boolean)
    _s           //shape (3-entry array, integers ≥ 0)
                 // -- following properties only exist when in use --
    _k           //keys (3-entry array)
    _l           //labels (3-entry array)
    _b           //before-update functions (cube)
    _a           //after-update functions (cube)
```

The property `_k` only exists if at least one dimension has keys. Each entry of the array `_k` is either `undefined` (the dimension has no keys) or a map. The keys of the map are the keys for the dimension; the values are the corresponding indices.

The property `_l` only exists if at least one dimension has a label. Each entry of the array `_l` is either `undefined` (the dimension has no label) or a non-empty string.

The property `_b` only exists if there is at least one [before-update](?updates){.internal} function. The entries of `_b` are functions.

The property `_a` only exists if there is at least one after-update function. The entries of `_a` are functions.

The properties discussed above are manipulated by Data-Cube methods and _should not be changed directly_. For performance, these properties are created through assignment so are enumerable. This has few practical implications since 'non-index' array properties are ignored in most cases &mdash; e.g. by native array methods, spread syntax, `for...of` loops and `JSON.stringify`. (The new properties _are_ visited by `for...in` loops and included in the results of `Object.keys` and `Object.getOwnPropertyNames`, but these are not typicallly used with arrays.)

Except for the [create, copy and convert methods](?create){.internal}, Data-Cube methods convert the calling array to a cube before doing anything else. Hence, even if a method throws an error, the calling array will be converted to a cube. Where reasonable, other mutations to a cube are 'transactional'. For example, when setting multiple entries with a single method call, the method will check that all of the entries exist before changing any of them.