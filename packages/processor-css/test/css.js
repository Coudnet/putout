'use strict';

const {join} = require('path');
const {readFile} = require('fs/promises');

const test = require('supertape');
const mockRequire = require('mock-require');

const stub = require('@cloudcmd/stub');
const {runProcessors} = require('@putout/engine-processor');
const processFile = require('putout/process-file');

const {stopAll, reRequire} = mockRequire;

test('putout: processor: css', async (t) => {
    const name = 'style';
    const inputName = join(__dirname, 'fixture', `${name}.css`);
    const outputName = join(__dirname, 'fixture', `${name}-fix.css`);
    
    const rawSource = await readFile(inputName, 'utf8');
    const output = await readFile(outputName, 'utf8');
    const options = {
        processors: [
            'css',
        ],
    };
    
    const fix = true;
    const {processedSource} = await runProcessors({
        fix,
        name: inputName,
        processFile: processFile({
            fix,
        }),
        options,
        rawSource,
    });
    
    t.equal(processedSource, output);
    t.end();
});

test('putout: processor: css: places', async (t) => {
    const name = 'style';
    const inputName = join(__dirname, 'fixture', `${name}.css`);
    
    const rawSource = await readFile(inputName, 'utf8');
    const options = {
        processors: [
            'css',
        ],
    };
    
    const fix = false;
    const {places} = await runProcessors({
        fix,
        name: inputName,
        processFile: processFile({
            fix,
        }),
        options,
        rawSource,
    });
    
    const expected = [{
        message: 'Expected indentation of 4 spaces (indentation)',
        position: {
            column: 1,
            line: 2,
        },
        rule: 'indentation (stylelint)',
    }];
    
    t.deepEqual(places, expected);
    t.end();
});

test('putout: processor: css: template', async (t) => {
    const name = 'template';
    const inputName = join(__dirname, 'fixture', `${name}.css`);
    
    const rawSource = await readFile(inputName, 'utf8');
    
    const options = {
        processors: [
            'css',
        ],
    };
    
    const fix = false;
    const {places} = await runProcessors({
        fix,
        name: inputName,
        processFile: processFile({
            fix,
        }),
        options,
        rawSource,
    });
    
    const expected = [{
        message: 'Unknown word (CssSyntaxError)',
        position: {
            column: 4,
            line: 1,
        },
        rule: 'CssSyntaxError (stylelint)',
    }];
    
    t.deepEqual(places, expected);
    t.end();
});

test('putout: processor: css: found config', async (t) => {
    const name = 'style';
    const inputName = join(__dirname, 'fixture', `${name}.css`);
    
    const rawSource = await readFile(inputName, 'utf8');
    const options = {
        processors: [
            'css',
        ],
    };
    
    const load = async () => {};
    const search = stub().returns({
        config: {
            rules: {
                indentation: 2,
            },
        },
    });
    
    const cosmiconfig = stub().returns({
        search,
        load,
    });
    
    mockRequire('cosmiconfig', {
        cosmiconfig,
    });
    
    reRequire('../lib/css');
    const {runProcessors} = reRequire('@putout/engine-processor');
    
    const fix = false;
    const {places} = await runProcessors({
        fix,
        name: inputName,
        processFile: processFile({
            fix,
        }),
        options,
        rawSource,
    });
    
    stopAll();
    reRequire('..');
    
    const expected = [{
        message: 'Expected indentation of 2 spaces (indentation)',
        position: {
            column: 1,
            line: 2,
        },
        rule: 'indentation (stylelint)',
    }];
    
    t.deepEqual(places, expected);
    t.end();
});

test('putout: processor: css: merge user config with default', async (t) => {
    const name = 'merge';
    const inputName = join(__dirname, 'fixture', `${name}.css`);
    
    const rawSource = await readFile(inputName, 'utf8');
    const options = {
        processors: [
            'css',
        ],
    };
    
    const load = async () => {};
    const search = stub().returns({
        config: {
            rules: {
                indentation: 3,
            },
        },
    });
    
    const cosmiconfig = stub().returns({
        search,
        load,
    });
    
    mockRequire('cosmiconfig', {
        cosmiconfig,
    });
    
    reRequire('../lib/css');
    const {runProcessors} = reRequire('@putout/engine-processor');
    
    const fix = false;
    const {places} = await runProcessors({
        fix,
        name: inputName,
        processFile: processFile({
            fix,
        }),
        options,
        rawSource,
    });
    
    stopAll();
    reRequire('..');
    
    const expected = [{
        message: 'Expected a trailing semicolon (declaration-block-trailing-semicolon)',
        position: {
            column: 11,
            line: 2,
        },
        rule: 'declaration-block-trailing-semicolon (stylelint)',
    }, {
        message: 'Expected indentation of 3 spaces (indentation)',
        position: {
            column: 1,
            line: 2,
        },
        rule: 'indentation (stylelint)',
    }];
    
    t.deepEqual(places, expected);
    t.end();
});

