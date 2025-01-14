'use strict';

const test = require('@putout/test')(__dirname, {
    'putout-config': require('..'),
});

test('plugin-putout-config: transform: convert-boolean-to-string', (t) => {
    t.transform('convert-boolean-to-string');
    t.end();
});

test('plugin-putout-config: transform: remove-empty', (t) => {
    t.transform('remove-empty');
    t.end();
});

