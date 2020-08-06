# @putout/plugin-putout [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL]

[NPMIMGURL]:                https://img.shields.io/npm/v/@putout/plugin-putout.svg?style=flat&longCache=true
[NPMURL]:                   https://npmjs.org/package/@putout/plugin-putout"npm"

[DependencyStatusURL]:      https://david-dm.org/coderaiser/putout?path=packages/plugin-putout
[DependencyStatusIMGURL]:   https://david-dm.org/coderaiser/putout.svg?path=packages/plugin-putout

`putout` plugin helps with `putout` plugins development.

## Install

```
npm i @putout/plugin-putout -D
```

## Rules

```json
{
    "rules": {
        "putout/convert-to-no-transform-code": "on",
        "putout/convert-replace-with": "on",
        "putout/convert-replace-with-multiple": "on",
        "putout/convert-babel-types": "on"
        "putout/convert-path-remove": "on"
    }
}
```

## convert-to-no-transform-code

### ❌ Incorrect code example

```js
test('plugin-apply-destructuring: transform: array: destructuring', (t) => {
    const code = 'const {name} = array[0]';
    
    t.transformCode(code, code);
    t.end();
});
```

### ✅ Correct code Example

```js
test('plugin-apply-destructuring: transform: array: destructuring', (t) => {
    const code = 'const {name} = array[0]';
    
    t.noTransformCode(code);
    t.end();
});
```

## convert-replace-with

### ❌ Incorrect code example

```js
module.exports.fix = (path) => {
    path.replaceWith(Identifier('hello'));
};
```

### ✅ Correct code Example

```js
const {replaceWith} = require('putout').operate;

module.exports.fix = (path) => {
    replaceWith(path, Identifier('hello'));
};
```

## convert-replace-with-multiple

### ❌ Incorrect code example

```js
module.exports.fix = (path) => {
    path.replaceWithMultiple([Identifier('hello')]);
};
```

### ✅ Correct code Example

```js
const {replaceWithMultiple} = require('putout').operate;

module.exports.fix = (path) => {
    replaceWithMultiple(path, [Identifier('hello')]);
};
```

## convert-babel-types

### ❌ Incorrect code example

```js
const {
    ObjectExpression,
    SpreadElement,
    isObjectExpression,
    isIdentifier,
} = require('@babel/types');
```

### ✅ Correct code Example

```js
const {
    ObjectExpression,
    SpreadElement,
    isObjectExpression,
    isIdentifier,
} = require('putout').types;
```

## convert-path-remove

### ❌ Incorrect code example

```js
module.exports.fix = (path) => {
    path.remove();
};
```

### ✅ Correct code Example

```js
const {remove} = require('putout').operate;

module.exports.fix = (path) => {
    remove(path);
};
```

## License

MIT

