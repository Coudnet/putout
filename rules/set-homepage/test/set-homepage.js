'use strict';

const setHomepage = require('..');
const test = require('@putout/test')(__dirname, {
    'set-homepage': setHomepage,
});

test('rules: set-hompage: report', (t) => {
    t.report('homepage', 'Set homepage');
    t.end();
});

test('rules: set-hompeage: transform', (t) => {
    t.transform('homepage');
    t.end();
});

test('rules: set-hompeage: no report', (t) => {
    t.noReport('no-name-homepage');
    t.end();
});

test('rules: set-hompeage: transform: codemod', (t) => {
    t.noTransform('codemod');
    t.end();
});

test('rules: set-hompeage: transform: rule', (t) => {
    t.noTransform('rule');
    t.end();
});

