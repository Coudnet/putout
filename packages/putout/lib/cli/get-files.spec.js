'use strict';

const {join} = require('path');
const fs = require('fs').promises;

const test = require('supertape');
const mockRequire = require('mock-require');
const stub = require('@cloudcmd/stub');

const getFiles = require('./get-files');

const {isJS} = getFiles;
const {reRequire, stopAll} = mockRequire;

const rmStart = (a) => a.replace('lib/', '');

test('putout: getFiles: error', async (t) => {
    const [e] = await getFiles(['*.xxx']);
    
    t.equal(e.message, 'No files matching the pattern "*.xxx" were found');
    t.end();
});

test('putout: getFiles: error: not first', async (t) => {
    const [e] = await getFiles(['**/*.js', '*.xxx']);
    
    t.equal(e.message, 'No files matching the pattern "*.xxx" were found');
    t.end();
});

test('putout: getFiles', async (t) => {
    const fastGlob = stub().returns([
        'get-files.js',
        'get-files.spec.js',
    ]);
    
    mockRequire('fast-glob', fastGlob);
    
    const getFiles = reRequire('./get-files');
    
    const [, files] = await getFiles(['**/get-files*.js']);
    const result = files.map(rmStart);
    const expected = [
        'get-files.js',
        'get-files.spec.js',
    ];
    
    stopAll();
    
    t.deepEqual(result, expected);
    t.end();
});

test('putout: getFiles: name', async (t) => {
    const fastGlob = stub().returns([
        'get-files.js',
    ]);
    
    mockRequire('fast-glob', fastGlob);
    
    const getFiles = reRequire('./get-files');
    
    const [, files] = await getFiles(['lib/get-files.js']);
    const result = files.map(rmStart);
    const expected = [
        'get-files.js',
    ];
    
    stopAll();
    
    t.deepEqual(result, expected);
    t.end();
});

test('putout: getFiles: dir', async (t) => {
    const fastGlob = stub().returns([
        'bin/putout.js',
    ]);
    
    mockRequire('fast-glob', fastGlob);
    
    const getFiles = reRequire('./get-files');
    const [, files] = await getFiles(['bin']);
    const result = files.map(rmStart);
    const expected = [
        'bin/putout.js',
    ];
    
    stopAll();
    
    t.deepEqual(result, expected);
    t.end();
});

test('putout: getFiles: glob', async (t) => {
    const dir = join(__dirname, '..', '..');
    
    const getFiles = reRequire('./get-files');
    const [, files] = await getFiles([`${dir}/{bin,.madrun.js}`]);
    const result = files.map(rmStart);
    const expected = [
        join(dir, '.madrun.js'),
        join(dir, 'bin/putout.js'),
    ];
    
    stopAll();
    
    t.deepEqual(result, expected);
    t.end();
});

test.only('putout: getFiles: mjs, tsx', (t) => {
    const {lstat} = fs;
    
    fs.lstat = stub().returns({
        isDirectory: stub().returns(true),
    });
    
    const fastGlob = stub().returns([
        'get-files',
    ]);
    
    mockRequire('fast-glob', fastGlob);
    
    fs.lstat = lstat;
    stopAll();
    
    console.log(fastGlob.args);
    const [, args] = fastGlob.args;
    const expected = ['get-files/**/*.{js,mjs,jsx,ts,tsx}'];
    
    console.log(fastGlob.calledWith());
    
    t.deepEqual(args, expected);
    t.end();
});

test('putout: isJS: tsx', (t) => {
    const result = isJS('index.tsx');
    
    t.ok(result);
    t.end();
});

test('putout: isJS: mjs', (t) => {
    const result = isJS('index.mjs');
    
    t.ok(result);
    t.end();
});

