'use strict';

const montag = require('montag');

const test = require('@putout/test')(__dirname, {
    'declare-undefined-variables': require('..'),
});

test('putout: plugin: declare-undefined-variables: report: assign', (t) => {
    t.report('assign', `Declare 'assign'`);
    t.end();
});

test('putout: plugin: declare-undefined-variables: report: readable-simple', (t) => {
    t.report('readable-simple', `Declare 'Readable'`);
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: assign', (t) => {
    t.transform('assign');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: is-array', (t) => {
    t.transform('is-array');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: keys', (t) => {
    t.transform('keys');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: values', (t) => {
    t.transform('values');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: join', (t) => {
    t.transform('join');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: readable', (t) => {
    t.transform('readable');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: readable-simple', (t) => {
    t.transform('readable-simple');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: try-catch', (t) => {
    t.transform('try-catch');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: try-to-catch', (t) => {
    t.transform('try-to-catch');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: read-file', (t) => {
    t.transform('read-file');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: mock-import', (t) => {
    t.transform('mock-import');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: re-import', (t) => {
    t.transform('re-import');
    t.end();
});

test('putout: plugin: declare-undefined-variables: report: montag', (t) => {
    t.report('montag', `Declare 'montag'`);
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: montag', (t) => {
    t.transform('montag');
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: assign: dismiss', (t) => {
    t.noTransformWithOptions('assign', {
        dismiss: ['assign', 'stringify'],
    });
    t.end();
});

test('putout: plugin: declare-undefined-variables: transform: parse', (t) => {
    t.transformWithOptions('parse', {
        dismiss: ['assign', 'stringify'],
    });
    t.end();
});

test('putout: plugin: declare-undefined-variables: no report after transform: join', (t) => {
    t.noReportAfterTransform('join');
    t.end();
});

test('putout: plugin: declare-undefined-variables: no report after transform: assign', (t) => {
    t.noReportAfterTransform('assign');
    t.end();
});

test('putout: plugin: declare-undefined-variables: node-js-fs', (t) => {
    t.transform('node-js-fs');
    t.end();
});

test('putout: plugin: declare-undefined-variables: object', (t) => {
    t.transform('object');
    t.end();
});

test('putout: plugin: declare-undefined-variables: putout', (t) => {
    t.transform('putout');
    t.end();
});

test('putout: plugin: declare-undefined-variables: is-type', (t) => {
    t.transform('is-type');
    t.end();
});

test('putout: plugin: declare-undefined-variables: maybe', (t) => {
    t.transform('maybe');
    t.end();
});

test('putout: plugin: declare-undefined-variables: module', (t) => {
    t.transform('module');
    t.end();
});

test('putout: plugin: declare-undefined-variables: os', (t) => {
    t.transform('os');
    t.end();
});

test('putout: plugin: declare-undefined-variables: child_process', (t) => {
    t.transform('child_process');
    t.end();
});

test('putout: plugin: declare-undefined-variables: stream', (t) => {
    t.transform('stream');
    t.end();
});

test('putout: plugin: declare-undefined-variables: currify', (t) => {
    t.transform('currify');
    t.end();
});

test('putout: plugin: declare-undefined-variables: wraptile', (t) => {
    t.transform('wraptile');
    t.end();
});

test('putout: plugin: declare-undefined-variables: noop', (t) => {
    t.transformCode('noop();', montag`
        const noop = () => {};
        noop();
    `);
    t.end();
});

test('putout: plugin: declare-undefined-variables: eslint', (t) => {
    t.transformCode('eslint();', montag`
        import eslint from 'putout/eslint';
        eslint();
    `);
    t.end();
});

test('putout: plugin: declare-undefined-variables: once', (t) => {
    t.transformCode('once();', montag`
        import once from 'once';
        once();
    `);
    t.end();
});

test('putout: plugin: declare-undefined-variables: options-declarations', (t) => {
    t.transformWithOptions('options-declarations', {
        declarations: {
            custom: `const custom= require('custom')`,
        },
    });
    t.end();
});

test('putout: plugin: declare-undefined-variables: pipe', (t) => {
    t.transformCode('await pipe([stream]);', montag`
        import pipe from 'pipe-io';
        await pipe([stream]);
    `);
    t.end();
});

test('putout: plugin: declare-undefined-variables: pullout', (t) => {
    t.transformCode('await pullout(stream);', montag`
        import pullout from 'pullout';
        await pullout(stream);
    `);
    t.end();
});
