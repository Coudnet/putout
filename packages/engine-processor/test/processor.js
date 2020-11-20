'use strict';

const {readFile} = require('fs').promises;
const {join} = require('path');

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const processFile = require('putout/lib/cli/process-file');

const {runProcessors, getExtensions} = require('..');

test('putout: engine-processor: no processor', async (t) => {
    const name = 'hello.xxx';
    const processFile = stub();
    const options = {};
    const rawSource = '';
    const index = 0;
    const length = 1;
    
    const {isProcessed} = await runProcessors({
        name,
        processFile,
        options,
        rawSource,
        index,
        length,
    });
    
    t.notOk(isProcessed, 'should not process');
    t.end();
});

test('putout: engine-processor: javascript', async (t) => {
    const name = 'hello.js';
    const options = {};
    const rawSource = `const a = 'hello'`;
    const index = 0;
    const length = 1;
    const processFile = stub().returns({
        source: rawSource,
        places: [],
    });
    
    await runProcessors({
        name,
        processFile,
        options,
        rawSource,
        index,
        length,
    });
    
    const expected = {
        index,
        length,
        name,
        options,
        rawSource,
        source: rawSource,
        startLine: 0,
    };
    
    t.ok(processFile.calledWith(expected), 'should not process');
    t.end();
});

test('putout: engine-processor: markdown: javascript', async (t) => {
    const name = join(__dirname, 'fixture/js.md');
    const options = {
        processors: [
            'markdown',
        ],
    };
    const rawSource = await readFile(name, 'utf8');
    const index = 0;
    const length = 1;
    const processFile = stub().returns({
        source: rawSource,
        places: [],
    });
    
    await runProcessors({
        name,
        processFile,
        options,
        rawSource,
        index,
        length,
    });
    
    const expected = {
        index,
        length,
        name: `${name}{js}`,
        options,
        rawSource,
        source: 'const a = 5;',
        startLine: 1,
    };
    
    t.ok(processFile.calledWith(expected), 'should not process');
    t.end();
});

test('putout: engine-processor: markdown: fix', async (t) => {
    const name = join(__dirname, 'fixture', 'fix.md');
    const outputName = join(__dirname, 'fixture', 'fix-fix.md');
    const options = {
        dir: __dirname,
        processors: [
            'markdown',
        ],
    };
    const rawSource = await readFile(name, 'utf8');
    const output = await readFile(outputName, 'utf8');
    const index = 0;
    const length = 1;
    
    const {processedSource} = await runProcessors({
        name,
        fix: true,
        processFile: processFile({
            name: `${name}{js}`,
            fix: true,
        }),
        options,
        rawSource,
        index,
        length,
    });
    
    t.equal(processedSource, output);
    t.end();
});

test('putout: engine-processor: getExtensions', (t) => {
    const js = {
        extensions: [
            'js',
            'ts',
        ],
    };
    
    const css = {
        extensions: [
            'css',
        ],
    };
    
    const processors = [js, css];
    const result = getExtensions(processors);
    
    const expected = [
        'js',
        'ts',
        'css',
    ];
    
    t.deepEqual(expected, result, 'should equal');
    t.end();
});

