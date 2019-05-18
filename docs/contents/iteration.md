To iterate over entries, use standard approaches such as `for` and `for...of` loops and the native array methods `forEach` and `map`. Also see the cube method [[cmap|Entrywise#method_cmap]].

There are currently no generators or methods for iterating over a dimension directly. For now, call [[indOrKey|Other#method_ind_or_key]], [[ind|Other#method_ind]] or [[key|Get-and-Set-Keys-and-Labels#method_key]] and loop over the result. For example:

```js {.no-exec}
//loop over row indices or keys
for (let j of x.indOrKey()) {};

//loop over row keys
for (let j of x.key()) {};

//loop over row indices
for (let j of x.ind()) {};

//loop over row indices, for loop
for (let j = 0; j < x.n(); j++) {};
``` 
