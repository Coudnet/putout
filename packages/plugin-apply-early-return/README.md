# @putout/plugin-apply-early-return [![NPM version][NPMIMGURL]][NPMURL]

[NPMIMGURL]: https://img.shields.io/npm/v/@putout/plugin-apply-early-return.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/@putout/plugin-apply-early-return"npm"

🐊[`Putout`](https://github.com/coderaiser/putout) plugin adds ability to apply early return.

## Install

```
npm i @putout/plugin-apply-early-return
```

## Rule

```json
{
    "rules": {
        "apply-early-return": "on"
    }
}
```

## ❌ Incorrect code example

```js
if (x)
    return;
else
    console.log();
```

## ✅ Correct code Example

```js
if (x)
    return;

console.log();
```

## License

MIT
