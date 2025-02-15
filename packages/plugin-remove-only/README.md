# @putout/plugin-remove-only [![NPM version][NPMIMGURL]][NPMURL]

[NPMIMGURL]: https://img.shields.io/npm/v/@putout/plugin-remove-only.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/@putout/plugin-remove-only"npm"

🐊[`Putout`](https://github.com/coderaiser/putout) plugin adds ability to find and remove `test.only` calls. Part of [@putout/plugin-tape](https://github.com/coderaiser/putout/tree/master/packages/plugin-tape).

## Install

```
npm i @putout/plugin-remove-only
```

## Rule

Rule `remove-only` is enabled by default, to disable add to `.putout.json`:

```json
{
    "rules": {
        "remove-only": "off"
    }
}
```

### ❌ Incorrect code example

```js
test.only('some test', (t) => {
    t.end();
});

```

### ✅ Correct code Example

```js
test('some test', (t) => {
    t.end();
});
```

## License

MIT
