'use strict';

const test = require('@putout/test')(__dirname, {
    'putout/convert-add-argument-to-add-args': require('.'),
});

test('plugin-putout: convert-add-argument-to-add-args: report', (t) => {
    t.report('add-argument', 'Use addArgs instead of addArgument');
    t.end();
});

test('plugin-putout: convert-add-argument-to-add-args: transform', (t) => {
    t.transform('add-argument');
    t.end();
});

