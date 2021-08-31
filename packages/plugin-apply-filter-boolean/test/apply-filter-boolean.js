'use strict';

const applyFilterBoolean = require('..');

const test = require('@putout/test')(__dirname, {
    'apply-filter-boolean': applyFilterBoolean,
});

test('plugin-apply-filter-boolean: transform: report', (t) => {
    t.report('array', 'Apply "filter(Boolean)"');
    t.end();
});

test('plugin-apply-filter-boolean: transform: object', (t) => {
    t.transform('array');
    t.end();
});

