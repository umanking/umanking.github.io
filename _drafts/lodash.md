## keyBy

user-age를 키값으로해서 

```js
var users = [
  { user: 'barney', age: 36, active: true },
  { user: 'fred',  age: 40, active: false },
  { user: 'travis', age: 37, active: true}
];

result = _.keyBy(users, function(o){
  return `${o.user}-${o.age}`
} );
```



Result

```
{
   "barney-36": {
      "user": "barney",
      "age": 36,
      "active": true
   },
   "fred-40": {
      "user": "fred",
      "age": 40,
      "active": false
   },
   "travis-37": {
      "user": "travis",
      "age": 37,
      "active": true
   }
}
```





## Ref

- https://codepen.io/travist/full/jrBjBz/
- https://lodash.com/docs/4.17.15#sumBy