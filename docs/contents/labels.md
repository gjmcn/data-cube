## Labels

---

Each dimension can have a (non-empty) string label:

```
x = [2, 3].cube(5).$label(1, 'The columns!');  //set label on dimension 1
```

Whereas keys replace indices, methods always use numbers for dimensions:

```
x.sum(1);  //specify dimension by number, not label
```

```{.no-input .no-output}
deleteVariables('x');
```