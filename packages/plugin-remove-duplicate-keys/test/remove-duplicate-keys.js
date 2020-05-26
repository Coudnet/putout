'use strict';

const removeDebugger = require('..');
const test = require('@putout/test')(__dirname, {
    'remove-duplicate-keys': removeDebugger,
});

test('remove duplicate-keys: report', (t) => {
    t.report('duplicate', 'Duplicate keys should be avoided');
    t.end();
});

test('remove duplicate-keys: transform: duplicate', (t) => {
    t.transform('duplicate-literal');
    t.end();
});

test('remove duplicate-keys: transform: literal', (t) => {
    t.transform('duplicate-literal');
    t.end();
});

test('remove duplicate-keys: transform: spread', (t) => {
    t.transform('spread');
    t.end();
});

test('remove duplicate-keys: transform: couple', (t) => {
    t.transform('couple');
    t.end();
});

