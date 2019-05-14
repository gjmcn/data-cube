## Cubes

---

A cube has 3 __dimensions__:

0: rows,&ensp; 1: columns,&ensp; 2: pages {.indent}

```
c = [3, 4, 2].rand(100);
```

The following names are useful:

* a **matrix** has 1 page:

  ```
  m = c.page(1);
  ```

* a **vector** has 1 column and 1 page:

  ```
  m.col(2);
  ```

  A standard array behaves like a vector:

  ```
  a = [5, 'abc', true];
  ```
  ```
  a.row([0, 2]);
  ```

```{.no-input .no-output}
deleteVariables('c', 'm', 'a');
```