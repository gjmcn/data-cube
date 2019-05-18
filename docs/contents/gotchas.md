## Gotchas

---

Data-Cube aims to add array-oriented programming to JavaScript as seamlessly as possible. However, there are a few traps to beware of:

__Singletons__<br>
In general, JavaScript does not handle [singletons](?arguments#singletons) like Data-Cube methods do. This is most likely to cause a problem where a Data-Cube method is incorrectly assumed to return a non-array. E.g.

```
[3, 4].sum() > 5;   BAD EXAMPLE!!!!!!!!!!
```

In the above example, `sum` returns a 1-entry array which is always truthy. (Note: 
[fold methods](?fold) always return an array &mdash; they only reduce one dimension so do not always produce a single value.)