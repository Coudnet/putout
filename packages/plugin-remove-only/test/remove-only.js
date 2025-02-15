'use strict';

const removeOnly = require('..');
const test = require('@putout/test')(__dirname, {
    'remove-only': removeOnly,
});

test('plugin-remove-only: report', (t) => {
    t.report('only', '"test.only" should not be used');
    t.end();
});

test('plugin-remove-only: transform', (t) => {
    t.transform('only');
    t.end();
});

test('plugin-remove-only: transform: options', (t) => {
    t.transform('options');
    t.end();
});

test('plugin-remove-only: transform: only-only', (t) => {
    t.transform('only-only');
    t.end();
});

test('plugin-remove-only: transform: not top level', (t) => {
    t.noTransform('not-top-level');
    t.end();
});
