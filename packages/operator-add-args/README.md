# @putout/operator-add-args [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL]

[NPMIMGURL]: https://img.shields.io/npm/v/@putout/operator-add-args.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/@putout/operator-add-args "npm"
[DependencyStatusURL]: https://david-dm.org/coderaiser/putout?path=packages/operator-add-args
[DependencyStatusIMGURL]: https://david-dm.org/coderaiser/putout.svg?path=packages/operator-add-args

`putout` operator adds ability to add-args variable that was not defined before. Renamed to [@putout/operator-add-args](https://github.com/coderaiser/putout/tree/v20.13.0/packages/operator-add-args).

## Install

```
npm i putout @putout/operator-add-args
```

## API

If you want to create `putout plugin` that will add `args` according to your needs just:

```js
const {operator} = require('putout');
const {addArgs} = operator;

module.exports = addArgs({
    comparePlaces: ['{comparePlaces}', 'test("__a", (__args) => __body)'],
});
```

If you have a file `index.spec.js`:

```diff
-test('', () => {
+test('', ({comparePlaces}) => {
    comparePlaces();
});
```

Plugin supports options, so you can pass it in `.putout.json`:

```json
{
    "rules": {
        "tape/declare-t": ["on", {
            "args": {
                "comparePlaces": ["{comparePlaces}", "test('__a', (__args) => __body)"]
            }
        }]
    }
}
```

## License

MIT