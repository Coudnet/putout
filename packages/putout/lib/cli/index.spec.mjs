import {createCommons} from 'simport';
import {createMockImport} from 'mock-import';

const {
    mockImport,
    reImport,
    reImportDefault,
    stopAll,
} = createMockImport(import.meta.url);

const {
    __filename,
    __dirname,
    require,
} = createCommons(import.meta.url);

process.env.CI = process.env.CI || 'true';

import {join} from 'path';
import {readFile} from 'fs/promises';
import {EventEmitter} from 'events';

import test from 'supertape';
import stub from '@cloudcmd/stub';
import tryCatch from 'try-catch';
import chalk from 'chalk';
import tryToCatch from 'try-to-catch';
import {createSimport} from 'simport';

import _cli from './index.mjs';

const {version} = require('../../package.json');
const {parse} = JSON;
const {assign} = Object;
const {red} = chalk;

import {
    OK,
    PLACE,
    NO_FILES,
    NO_PROCESSORS,
    WAS_STOP,
    INVALID_OPTION,
    CANNOT_LOAD_PROCESSOR,
} from './exit-codes.mjs';

const simport = createSimport(__filename);

test('putout: cli: --raw', async (t) => {
    const logError = stub();
    const argv = [
        'xx',
        '--raw',
    ];
    
    const error = Error('No files matching the pattern "xx" were found');
    mockImport('./get-files', stub().returns([error]));
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        logError,
        argv,
    });
    
    stopAll();
    
    t.calledWith(logError, [error], 'should call logError');
    t.end();
});

test('putout: cli: --raw: PUTOUT_FILES', async (t) => {
    process.env.PUTOUT_FILES = 'xx';
    
    const logError = stub();
    const argv = [
        '--raw',
    ];
    
    const error = Error('No files matching the pattern "xx" were found');
    mockImport('./get-files', stub().returns([error]));
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        logError,
        argv,
    });
    
    stopAll();
    
    delete process.env.PUTOUT_FILES;
    await reImportDefault('./index.mjs');
    
    t.calledWith(logError, [error], 'should call logError');
    t.end();
});

test('putout: cli: --raw: parse error', async (t) => {
    const logError = stub();
    const argv = [
        join(__dirname, 'fixture/parse-error.js'),
        '--raw',
        '--no-config',
        '--format',
        'none',
        '--no-ci',
        '--no-cache',
    ];
    
    await reImport('./get-files');
    await reImport('./process-file');
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        logError,
        argv,
        readFile,
    });
    
    const error = SyntaxError('Unexpected token (2:0)');
    assign(error, {
        pos: 11,
        loc: {
            column: 0,
            line: 2,
        },
    });
    
    t.calledWith(logError, [error], 'should call logError');
    t.end();
});

test('putout: cli: --format: specified twice', async (t) => {
    const argv = [
        __filename,
        '--no-config',
        '--format',
        'dump',
        '--format',
        'none',
        '--no-ci',
        '--no-cache',
    ];
    
    const process = stub().returns({
        places: [],
        code: '',
    });
    
    const processFile = stub().returns(process);
    const getFormatter = stub().returns([
        'dump',
        {},
    ]);
    
    const report = stub().returns(stub);
    
    mockImport('./process-file', processFile);
    mockImport('./formatter', {getFormatter});
    mockImport('./report', report);
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
    });
    
    const [arg] = getFormatter.args;
    const [first] = arg;
    
    stopAll();
    
    t.equal(first, 'none', 'should use last passed formatter');
    t.end();
});

test('putout: cli: --fresh', async (t) => {
    const file = join(__dirname, 'fixture/parse-error.js');
    const argv = [
        file,
        '--no-config',
        '--no-cache',
        '--fresh',
    ];
    
    const {_defaultFileCache} = await import('./cache-files/index.mjs');
    const cacheFiles = stub().returns(_defaultFileCache);
    const getOptions = stub().returns({
        formatter: 'dump',
        dir: '.',
        processors: [
            'javascript',
        ],
    });
    
    mockImport('./cache-files/index.mjs', {cacheFiles});
    mockImport('./get-options', getOptions);
    
    await reImport('./get-files');
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
    });
    
    const expected = {
        fresh: true,
        cache: false,
    };
    
    t.calledWith(cacheFiles, [expected]);
    t.end();
});

test('putout: cli: --raw: halt', async (t) => {
    const halt = stub();
    const argv = [
        'xx',
        '--raw',
    ];
    
    await runCli({
        halt,
        argv,
    });
    
    t.calledWith(halt, [NO_FILES], 'should call halt');
    t.end();
});

test('putout: cli: --version', async (t) => {
    const log = stub();
    const argv = [
        '--version',
    ];
    
    await runCli({
        log,
        argv,
    });
    
    const expected = `v${version}`;
    
    t.calledWith(log, [expected], 'should call halt');
    t.end();
});

test('putout: cli: -v', async (t) => {
    const log = stub();
    const argv = [
        '-v',
    ];
    
    await runCli({
        log,
        argv,
    });
    
    const expected = `v${version}`;
    
    t.calledWith(log, [expected], 'should call halt');
    t.end();
});

test('putout: cli: no files', async (t) => {
    const log = stub();
    const argv = [];
    
    await runCli({
        log,
        argv,
    });
    
    t.notOk(log.called, 'should not call log');
    t.end();
});

test('putout: cli: --fix --staged: set', async (t) => {
    const name = './xxx.js';
    const logError = stub();
    const get = stub().returns([
        name,
    ]);
    const set = stub().returns([
        'hello.txt',
    ]);
    
    const argv = [
        '--staged',
        '--fix',
    ];
    
    const getFiles = stub().returns([null, [
        name,
    ]]);
    
    const process = stub().returns({
        places: [],
        code: '',
    });
    
    const {_defaultFileCache} = await import('./cache-files/index.mjs');
    const processFile = stub().returns(process);
    const cacheFiles = stub().returns(_defaultFileCache);
    
    mockImport('./get-files.js', getFiles);
    mockImport('./process-file.js', processFile);
    mockImport('./cache-files/index.mjs', {cacheFiles});
    
    mockImport('./staged.mjs', {
        get,
        set,
    });
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        logError,
    });
    
    stopAll();
    
    t.ok(set.calledWith());
    t.end();
});

test('putout: cli: --fix --staged: exit code', async (t) => {
    const {STAGE} = require('./exit-codes');
    const name = './xxx.js';
    const logError = stub();
    const halt = stub();
    const get = stub().returns([
        name,
    ]);
    const set = stub().returns([]);
    
    const argv = [
        '--staged',
        '--fix',
    ];
    
    const getFiles = stub().returns([null, [
        name,
    ]]);
    
    const process = stub().returns({
        places: [],
        code: '',
    });
    const processFile = stub().returns(process);
    const {_defaultFileCache} = await import('./cache-files/index.mjs');
    const cacheFiles = stub().returns(_defaultFileCache);
    
    mockImport('./get-files', getFiles);
    mockImport('./process-file', processFile);
    mockImport('./cache-files/index.mjs', {cacheFiles});
    
    mockImport('./staged', {
        get,
        set,
    });
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        halt,
        cli,
        argv,
        logError,
    });
    
    stopAll();
    
    t.calledWith(halt, [STAGE]);
    t.end();
});

test('putout: cli: --staged --fix', async (t) => {
    const logError = stub();
    const get = stub().returns(['./xxx.js']);
    const set = stub().returns([
        'hello.txt',
    ]);
    
    const argv = [
        '--staged',
        '--fix',
    ];
    
    mockImport('./staged.mjs', {
        get,
        set,
    });
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        logError,
    });
    
    const [allArgCalls] = logError.args;
    const [arg] = allArgCalls;
    
    const stripAnsi = await simport('strip-ansi');
    const output = stripAnsi(arg);
    const message = 'No files matching the pattern "./xxx.js" were found';
    
    stopAll();
    
    t.equal(output, message, 'should equal');
    t.end();
});

test('putout: cli: ruler processor: --enable', async (t) => {
    const logError = stub();
    const rullerProcessor = stub();
    const argv = [
        '--enable',
        'convert-index-of-to-includes',
    ];
    
    mockImport('./ruler-processor', rullerProcessor);
    
    const cli = await reImportDefault('./index.mjs');
    await runCli({
        cli,
        argv,
        logError,
    });
    
    stopAll();
    
    const places = [];
    const args = {
        disable: '',
        enable: 'convert-index-of-to-includes',
    };
    
    t.calledWith(rullerProcessor, [args, places]);
    t.end();
});

test('putout: cli: ruler processor: --enable-all', async (t) => {
    const logError = stub();
    const rullerProcessor = stub();
    const argv = [
        '--enable-all',
        __filename,
    ];
    
    mockImport('./ruler-processor', rullerProcessor);
    
    const cli = await reImportDefault('./index.mjs');
    await runCli({
        cli,
        argv,
        logError,
    });
    
    stopAll();
    
    t.ok(rullerProcessor.called);
    t.end();
});

test('putout: cli: ruler processor: --disable-all', async (t) => {
    const name = join(__dirname, 'fixture/plugins.js');
    const logError = stub();
    const argv = [
        '--disable-all',
        name,
    ];
    
    const rullerError = Error('should call rullerProcessor with await');
    const rullerProcessor = stub().rejects(rullerError);
    
    mockImport('./ruler-processor', rullerProcessor);
    const cli = await reImportDefault('./index.mjs');
    
    const [error] = await tryToCatch(runCli, {
        cli,
        argv,
        logError,
    });
    
    stopAll();
    
    t.equal(error, rullerError);
    t.end();
});

test('putout: cli: --match', async (t) => {
    const logError = stub();
    const argv = [
        '--match',
        '*.md',
    ];
    
    const readError = Error('cannot read config file');
    const readFile = stub().rejects(readError);
    const writeFile = stub();
    const halt = stub();
    
    const {matchErrors, READ_ERROR} = await import('@putout/cli-match');
    const cli = await reImportDefault('./index.mjs');
    await runCli({
        cli,
        halt,
        argv,
        logError,
        readFile,
        writeFile,
    });
    
    t.calledWith(halt, [READ_ERROR], matchErrors[READ_ERROR]);
    t.end();
});

test('putout: cli: tsx', async (t) => {
    const write = stub();
    
    const argv = [
        '--no-config',
        '--no-cache',
        join(__dirname, 'fixture', 'view.tsx'),
    ];
    
    const eslint = stub().returns(['', []]);
    const getOptions = stub().returns({
        dir: '.',
        formatter: 'dump',
        processors: [
            'javascript',
        ],
    });
    
    mockImport('./eslint', eslint);
    mockImport('./get-options', getOptions);
    
    await reImport('./process-file');
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        write,
        argv,
    });
    
    stopAll();
    
    t.calledWith(write, [''], 'should call logError');
    t.end();
});

test('putout: cli: --transform', async (t) => {
    const write = stub();
    
    const name = join(__dirname, 'fixture/transform.js');
    const source = await readFile(name, 'utf8');
    const transform = 'const __a = __b -> const __b = __a';
    
    const argv = [
        name,
        '--transform',
        `"${transform}"`,
        '--no-config',
        '--format',
        'json',
        '--no-ci',
        '--no-cache',
    ];
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        write,
        readFile,
    });
    
    stopAll();
    
    const expected = {
        errors: [{
            name,
            source,
            places: [{
                rule: '[transform]',
                message: transform,
                position: {
                    line: 1,
                    column: 0,
                },
            }, {
                message: '\'b\' is not defined.',
                position: {
                    column: 11,
                    line: 1,
                },
                rule: 'no-undef (eslint)',
            }],
        }],
        filesCount: 1,
        errorsCount: 2,
    };
    
    const [arg] = write.args;
    const [first] = arg;
    const [, result = {}] = tryCatch(parse, first);
    
    t.deepEqual(result, expected);
    t.end();
});

test('putout: cli: --plugins', async (t) => {
    const write = stub();
    const eslint = stub().returns(['', []]);
    
    const name = join(__dirname, 'fixture/plugins.js');
    const source = await readFile(name, 'utf8');
    
    const argv = [
        name,
        '--plugins',
        'remove-unused-variables,remove-debugger',
        '--no-config',
        '--format',
        'json',
        '--no-ci',
        '--no-cache',
    ];
    
    mockImport('./eslint', eslint);
    await reImport('./process-file');
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        write,
        readFile,
    });
    
    stopAll();
    
    const expected = {
        errors: [{
            name,
            source,
            places: [{
                rule: 'remove-unused-variables',
                message: '"a" is defined but never used',
                position: {
                    line: 1,
                    column: 6,
                },
            }, {
                rule: 'remove-debugger',
                message: `Unexpected "debugger" statement`,
                position: {
                    line: 2,
                    column: 0,
                },
            }],
        }],
        filesCount: 1,
        errorsCount: 2,
    };
    
    const [arg] = write.args;
    const [first] = arg;
    const [, result = {}] = tryCatch(parse, first);
    
    t.deepEqual(result, expected);
    t.end();
});

test('putout: cli: fix', async (t) => {
    const argv = [
        __filename,
        '--no-config',
        '--no-ci',
        '--no-cache',
        '--fix',
    ];
    
    const process = stub().returns({
        places: [],
        code: 'hello',
    });
    
    const processFile = stub().returns(process);
    const writeFile = stub();
    const getOptions = stub().returns({
        dir: __dirname,
        formatter: 'dump',
        processors: [
            'javascript',
        ],
    });
    
    mockImport('./get-options', getOptions);
    mockImport('./process-file', processFile);
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        writeFile,
    });
    
    stopAll();
    
    t.calledWith(writeFile, [__filename, 'hello']);
    t.end();
});

test('putout: cli: no processors', async (t) => {
    const argv = [
        __filename,
        '--no-config',
        '--no-ci',
        '--no-cache',
    ];
    
    const process = stub().returns({
        places: [],
        code: 'hello',
    });
    
    const halt = stub();
    const processFile = stub().returns(process);
    const getOptions = stub().returns({
        dir: __dirname,
        formatter: 'dump',
        processors: [
        ],
    });
    
    mockImport('./get-options', getOptions);
    mockImport('./process-file', processFile);
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        halt,
    });
    
    stopAll();
    
    t.calledWith(halt, [NO_PROCESSORS]);
    t.end();
});

test('putout: cli: not fixable', async (t) => {
    const argv = [
        __filename,
        '--no-config',
        '--no-ci',
        '--no-cache',
    ];
    
    const getOptions = stub().returns({
        dir: __dirname,
        formatter: 'dump',
        processors: [
        ],
    });
    
    const runProcessors = stub().returns({
        isProcessed: true,
        places: [{
            rule: 'eslint/null',
            position: {
                line: 1,
                column: 1,
            },
        }],
    });
    
    const setInfo = stub();
    const getFilePatterns = stub().returns([]);
    const fileCache = stub().returns({
        setInfo,
    });
    
    mockImport('./get-options', getOptions);
    mockImport('./file-cache', fileCache);
    mockImport('@putout/engine-processor', {
        runProcessors,
        getFilePatterns,
    });
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
    });
    
    stopAll();
    
    t.notOk(setInfo.called, 'should not call fileCache.setInfo');
    t.end();
});

test('putout: cli: setInfo: crash', async (t) => {
    const argv = [
        __filename,
        '--no-config',
        '--no-ci',
        '--no-cache',
    ];
    
    const getOptions = stub().returns({
        dir: __dirname,
        formatter: 'dump',
        processors: [
        ],
    });
    
    const runProcessors = stub().returns({
        isProcessed: true,
        places: [{
            rule: 'parser',
            position: {
                line: 1,
                column: 1,
            },
        }],
    });
    
    const setInfo = stub();
    const getFilePatterns = stub().returns([]);
    const fileCache = stub().returns({
        setInfo,
    });
    
    mockImport('./get-options', getOptions);
    mockImport('./file-cache', fileCache);
    mockImport('@putout/engine-processor', {
        runProcessors,
        getFilePatterns,
    });
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
    });
    
    stopAll();
    
    t.notOk(setInfo.called, 'should not call fileCache.setInfo');
    t.end();
});

test('putout: cli: fileCache: canUseCache', async (t) => {
    const argv = [
        __filename,
        '--no-config',
        '--no-ci',
        '--no-cache',
    ];
    
    const options = {
        dir: __dirname,
        formatter: 'dump',
    };
    
    const getOptions = stub().returns(options);
    
    const canUseCache = stub().returns(true);
    const getPlaces = stub().returns([]);
    const reconcile = stub();
    const cacheFiles = stub().returns({
        canUseCache,
        getPlaces,
        reconcile,
    });
    
    mockImport('./get-options', getOptions);
    mockImport('./cache-files/index.mjs', {cacheFiles});
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
    });
    
    stopAll();
    
    const expected = {
        name: __filename,
        options,
    };
    
    t.calledWith(canUseCache, [expected], 'should not call fileCache.canUseCache');
    t.end();
});

test('putout: cli: exit code: PLACE', async (t) => {
    const argv = [
        __filename,
        '--no-config',
        '--no-ci',
        '--no-cache',
    ];
    
    const halt = stub();
    const getOptions = stub().returns({
        dir: __dirname,
        formatter: 'dump',
    });
    
    const name = join(__dirname, './fixture/parse-error.js');
    const source = await readFile(name, 'utf8');
    
    const readFileStub = stub().returns(source);
    
    mockImport('./get-options', getOptions);
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        halt,
        readFile: readFileStub,
    });
    
    stopAll();
    
    t.calledWith(halt, [PLACE]);
    t.end();
});

test('putout: cli: get files: called with ignore option', async (t) => {
    const argv = [
        __filename,
        '--no-ci',
        '--no-cache',
    ];
    
    const ignore = ['xxx'];
    const getOptions = stub().returns({
        dir: __dirname,
        formatter: 'dump',
        ignore,
    });
    
    const getFiles = stub().returns(['dir', []]);
    
    mockImport('./get-options', getOptions);
    mockImport('./get-files', getFiles);
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
    });
    
    stopAll();
    
    const expected = [
        [__filename], {
            ignore,
        },
    ];
    
    t.calledWith(getFiles, expected);
    t.end();
});

test('putout: cli: get files: was stop', async (t) => {
    const argv = [
        '--no-cache',
        '--no-config',
    ];
    
    const ignore = ['xxx'];
    const getOptions = stub().returns({
        dir: __dirname,
        formatter: 'dump',
        ignore,
    });
    
    const getFiles = stub().returns([null, [
        __filename,
        __filename,
    ]]);
    const halt = stub();
    const isStop = stub().returns(true);
    const keypress = stub().returns({
        isStop,
    });
    
    mockImport('./get-options', getOptions);
    mockImport('./get-files', getFiles);
    mockImport('@putout/cli-keypress', keypress);
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        halt,
    });
    
    stopAll();
    
    t.calledWith(halt, [WAS_STOP], 'should set WAS_STOP status');
    t.end();
});

test('putout: cli: get files: was stop: no', async (t) => {
    const argv = [
        __filename,
        '--no-cache',
        '--no-config',
    ];
    
    const ignore = ['xxx'];
    const getOptions = stub().returns({
        dir: __dirname,
        formatter: 'dump',
        ignore,
    });
    
    const getFiles = stub().returns([null, [
        __filename,
    ]]);
    const halt = stub();
    const isStop = stub().returns(false);
    const onHalt = stub().returns({
        isStop,
    });
    
    mockImport('./get-options', getOptions);
    mockImport('./get-files', getFiles);
    mockImport('./on-halt', onHalt);
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        halt,
    });
    
    stopAll();
    
    t.calledWith(halt, [OK], 'should set OK status');
    t.end();
});

test('putout: cli: invalid option', async (t) => {
    const argv = [
        '--hello-world',
    ];
    
    const halt = stub();
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        halt,
    });
    
    stopAll();
    
    t.calledWith(halt, [INVALID_OPTION], 'should exit with INVALID_OPTION code');
    t.end();
});

test('putout: cli: invalid option: message', async (t) => {
    const argv = [
        '--hello-world',
    ];
    
    const logError = stub();
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        logError,
    });
    
    stopAll();
    
    const expected = red(`Invalid option '--hello-world'. Perhaps you meant '--help'`);
    
    t.calledWith(logError, [expected], 'should show message about invalid option');
    t.end();
});

test('putout: cli: invalid option: message: one char', async (t) => {
    const argv = [
        '-z',
    ];
    
    const logError = stub();
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        logError,
    });
    
    stopAll();
    
    const expected = red(`Invalid option '-z'`);
    
    t.calledWith(logError, [expected], 'should show message about invalid option');
    t.end();
});

test('putout: cli: cannot load processor', async (t) => {
    const argv = [];
    
    const halt = stub();
    
    const putoutConfig = require('../../putout.json');
    const {processors} = putoutConfig;
    
    processors.push('hello');
    
    mockImport('../../putout.json', putoutConfig);
    
    const cli = await reImportDefault('./index.mjs');
    
    await reImport('../parse-options');
    await reImport('./get-options');
    
    await runCli({
        cli,
        argv,
        halt,
    });
    
    stopAll();
    
    t.calledWith(halt, [CANNOT_LOAD_PROCESSOR], 'should exit with CANNOT_LOAD_PROCESSOR code');
    t.end();
});

test('putout: cli: cannot load processor: not found', async (t) => {
    const argv = [];
    
    const logError = stub();
    const loadProcessors = stub().throws(Error(`Processor "putout-processor-hello" could not be found!`));
    
    mockImport('@putout/engine-loader', {
        loadProcessors,
    });
    
    const cli = await reImportDefault('./index.mjs');
    
    await runCli({
        cli,
        argv,
        logError,
    });
    
    stopAll();
    
    const expected = red(`Processor "putout-processor-hello" could not be found!`);
    
    t.calledWith(logError, [expected], 'should show message about invalid option');
    t.end();
});

test('putout: cli: addOnce', async (t) => {
    const fn = stub();
    const {_addOnce} = await reImport('./index.mjs');
    const emitter = new EventEmitter();
    
    _addOnce(emitter, 'hello', fn);
    _addOnce(emitter, 'hello', fn);
    
    const result = emitter.listenerCount('hello');
    t.equal(result, 1);
    t.end();
});

test('putout: processor throw', async (t) => {
    const file = join(__dirname, 'fixture/processor.throw');
    const throwProcessor = require('./fixture/processor-throw');
    const argv = [
        file,
        '--no-config',
        '--no-cache',
        '--no-ci',
        '--format',
        'json-lines',
    ];
    
    const getOptions = stub().returns({
        formatter: require('@putout/formatter-json'),
        dir: '.',
        processors: [
            ['throw-processor', throwProcessor],
        ],
    });
    
    mockImport('./get-options', getOptions);
    
    const cli = await reImportDefault('./index.mjs');
    const write = stub();
    
    await runCli({
        cli,
        write,
        argv,
    });
    
    const {places} = parse(write.args[0]);
    const [{rule}] = places;
    
    t.equal(rule, 'parser');
    t.end();
});

test('putout: processor throw: raw', async (t) => {
    const file = join(__dirname, 'fixture/processor.throw');
    const throwProcessor = require('./fixture/processor-throw');
    const argv = [
        file,
        '--no-config',
        '--no-cache',
        '--no-ci',
        '--format',
        'json-lines',
        '--raw',
    ];
    
    const getOptions = stub().returns({
        formatter: require('@putout/formatter-json'),
        dir: '.',
        processors: [
            ['throw-processor', throwProcessor],
        ],
    });
    
    mockImport('./get-options', getOptions);
    
    const cli = await reImportDefault('./index.mjs');
    const log = stub();
    
    await runCli({
        cli,
        argv,
        log,
    });
    
    const [firstCall] = log.args;
    const [error] = firstCall;
    const {message} = error;
    
    t.equal(message, 'preProcess');
    t.end();
});

async function runCli(options) {
    const {
        halt = stub(),
        log = stub(),
        logError = stub(),
        write = stub(),
        argv = [],
        cli = _cli,
        readFile = stub().returns(''),
        writeFile = stub(),
    } = options;
    
    await cli({
        write,
        halt,
        log,
        logError,
        argv,
        readFile,
        writeFile,
    });
}

