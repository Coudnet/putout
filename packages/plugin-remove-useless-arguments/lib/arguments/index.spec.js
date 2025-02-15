'use strict';

const test = require('@putout/test')(__dirname, {
    'remove-useless-arguments/arguments': require('.'),
});

test('plugin-remove-useless-arguments: arguments: report', (t) => {
    t.report('arg', 'Argument "callback" is useless');
    t.end();
});

test('plugin-remove-useless-arguments: arguments: transform: arg', (t) => {
    t.transform('arg');
    t.end();
});

test('plugin-remove-useless-arguments: arguments: transform: var', (t) => {
    t.transform('var');
    t.end();
});

test('plugin-remove-useless-arguments: arguments: transform: no-args', (t) => {
    t.transform('no-args');
    t.end();
});

test('plugin-remove-useless-arguments: arguments: no transform: not fn', (t) => {
    t.noTransform('not-fn');
    t.end();
});

test('plugin-remove-useless-arguments: arguments: no transform: not fn: spread', (t) => {
    t.noTransform('spread');
    t.end();
});

test('plugin-remove-useless-arguments: arguments: no transform: arguments', (t) => {
    t.noTransform('arguments');
    t.end();
});

test('plugin-remove-useless-arguments: arguments: report: fn', (t) => {
    t.report('fn', 'Function argument is useless');
    t.end();
});
