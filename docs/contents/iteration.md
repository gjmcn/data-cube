
## Iteration

---

Use native approaches to loop over entries: [`while`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while), [`for`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for) and [`for...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) loops, and the [`forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) method.

There are currently no Data-Cube methods for iterating over a dimension. For now, use a `for` loop:

```js {.no-exec}
//loop over column indices
for (let j = 0, n = x.n(1); j < n; j++) {};
```

Or call [`ind`](?other#method_ind), [`key`](?keys#method_key) or [`indOrKey`](?other#method_ind_or_key), and loop over the result using `for...of`:

```js {.no-exec}
//loop over column indices
for (let j of x.ind(1)) {};

//loop over column keys
for (let j of x.key(1)) {};

//loop over column indices or keys
for (let j of x.indOrKey(1)) {};
```