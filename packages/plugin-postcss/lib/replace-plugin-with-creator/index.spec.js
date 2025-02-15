'use strict';

const test = require('@putout/test')(__dirname, {
    'postcss/replace-plugin-with-creator': require('.'),
});

test('plugin-postcss: report', (t) => {
    t.report('export', `creator should be used instead of plugin`);
    t.end();
});

test('plugin-postcss: transform', (t) => {
    t.transform('export');
    t.end();
});

