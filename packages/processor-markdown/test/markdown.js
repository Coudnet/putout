'use strict';

const {join} = require('path');
const {readFile} = require('fs').promises;

const test = require('supertape');
const {runProcessors} = require('@putout/engine-processor');
const processFile = require('putout/lib/cli/process-file');

test('putout: processor: markdown', async (t) => {
    const {
        output,
        processedSource,
    } = await doTheThing('js');
    
    t.equal(processedSource, output);
    t.end();
});

test('putout: processor: markdown: no js', async (t) => {
    const {
        output,
        processedSource,
    } = await doTheThing('no-js');
    
    t.equal(processedSource, output);
    t.end();
});

test('putout: processor: markdown: bracket: no "\\["', async (t) => {
    const {
        output,
        processedSource,
    } = await doTheThing('bracket');
    
    t.equal(processedSource, output);
    t.end();
});

test('putout: processor: links: no new lines', async (t) => {
    const {
        output,
        processedSource,
    } = await doTheThing('links');
    
    t.equal(processedSource, output);
    t.end();
});

async function doTheThing(name) {
    const inputName = join(__dirname, 'fixture', `${name}.md`);
    const outputName = join(__dirname, 'fixture', `${name}-fix.md`);
    
    const rawSource = await readFile(inputName, 'utf8');
    const output = await readFile(outputName, 'utf8');
    const options = {
        dir: __dirname,
        processors: [
            'markdown',
        ],
        plugins: [
            'remove-unused-variables',
        ],
    };
    const index = 0;
    const length = 1;
    
    const process = processFile({
        fix: true,
    });
    
    const {processedSource} = await runProcessors({
        name: inputName,
        process,
        options,
        rawSource,
        index,
        length,
    });
    
    return {
        processedSource,
        output,
    };
}