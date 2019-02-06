#!/usr/bin/env node

'use strict';

const {promisify} = require('util');

const {
    extname,
    resolve,
    dirname,
} = require('path');

const {
    readFile,
    writeFile,
    readFileSync,
    writeFileSync,
    readdirSync,
    statSync,
} = require('fs');

const read = promisify(readFile);
const write = promisify(writeFile);

const {
    underline,
    red,
    grey,
    redBright,
    bold,
} = require('chalk');

const once = require('once');
const glob = require('glob');
const tryCatch = require('try-catch');
const deepmerge = require('deepmerge');
const arrayUnion = require('array-union');
const {
    table,
    getBorderCharacters,
} = require('table');

const {cwd} = process;

const defaultOptions = require('../putout.json');

const putout = require('..');
const batch = require('../lib/batch');
const parseMatch = require('../lib/parse-match');
const getRelativePath = require('../lib/get-relative-path');
const readCodeMods = once(_readCodeMods);

const one = (f) => (a) => f(a);

const argv = require('yargs-parser')(process.argv.slice(2), {
    boolean: [
        'version',
        'help',
        'fix',
        'raw',
    ],
    string: [
        'config',
    ],
    alias: {
        'v': 'version',
        'h': 'help',
        'c': 'config',
    },
    default: {
        fix: false,
    },
});

const {
    fix,
    raw,
    config,
} = argv;

if (argv.version) {
    console.log(require('../package.json').version);
    process.exit();
}

if (argv.help) {
    help();
    process.exit();
}

const readUp = require('find-up');

const [e, files] = tryCatch(getFiles, argv._.map(String));

if (e)
    exit(e);

let errorsCount = 0;
let filesCount = 0;

const ignore = require('ignore');

/*
const output = files
    .map(processFiles)
    .filter(Boolean);
*/

main();

async function main() {
    const batchResult = await batch(processFiles, 200, files)
    const output = batchResult.filter(Boolean);
    
    if (output.length) {
        process.stdout.write('\n');
        output.map(one(console.log));
        
        console.log(bold(redBright(`✖ ${errorsCount} errors in ${filesCount} files`)));
        console.log(bold(redBright('  fixable with the `--fix` option')));
    }
}

async function processFiles(name) {
    const dir = dirname(name);
    const [dirOpt, currOpt] = getOptions(dir);
    const options = mergeOptions(currOpt);
    const {match} = options;
    
    const ignorer = ignore();
    if (options.ignore)
        ignorer.add(options.ignore);
    
    const relativeName = getRelativePath(name, dirOpt);
    
    if (dirOpt && ignorer.ignores(relativeName))
        return;
    
    const input = readFileSync(name, 'utf8');
    
    const [e, result] = tryCatch(putout, input, {
        fix,
        ...merge(
            defaultOptions,
            readCodeMods(),
            options,
            parseMatch(match, relativeName),
        ),
    });
    
    if (e) {
        console.error(underline(resolve(name)));
        const {
            line,
            column,
        } = e.position || {
            line: 'x',
            column: 'x',
        };
        
        e.message = `${grey(`${line}:${column}`)} ${red(e.message)}`;
        console.log(raw ? e : e.message);
        return;
    }
    
    const {code, places} = result;
    
    if (!places.length)
        return;
    
    if (fix)
        return writeFileSync(name, code);
    
    const data = [];
    ++filesCount;
    
    for (const place of places) {
        const {
            message,
            position,
            rule,
        } = place;
        
        const {
            line,
            column,
        } = position;
        
        ++errorsCount;
        
        data.push([
            grey(`${line}:${column}`),
            `${red('error')}   ${message}`,
            grey(rule),
        ]);
    }
    
    return [
        underline(resolve(name)),
        table(data, {
            border: getBorderCharacters('void'),
            drawHorizontalLine: () => false,
        }),
    ].join('\n');
}

function addExt(a) {
    const ext = extname(a);
    const isDir = statSync(a).isDirectory();
    
    if (isDir && ext !== '.js')
        return `${a}/**/*.js`;
    
    return a;
}

function getFiles(args) {
    const files = args
        .map(addExt)
        .map(one(glob.sync));
    
    return [].concat(...files);
}

function help() {
    const bin = require('../help');
    const usage = 'Usage: putout [options] [path]';
    
    console.log(usage);
    console.log('Options:');
    
    Object.keys(bin).forEach((name) => {
        console.log('  %s %s', name, bin[name]);
    });
}

function exit(e) {
    if (raw)
        console.error(e);
    else
        console.error(red(e.message));
    
    process.exit(1);
}

function merge(...args) {
    const arrayMerge = (a, b) => arrayUnion(a, b);
    return deepmerge.all(args, {
        arrayMerge,
    });
}

function mergeOptions(baseOptions = {}) {
    if (!config)
        return baseOptions;
    
    const customOptions = require(`${cwd()}/${config}`);
    
    return merge(baseOptions, customOptions);
}

function getOptions(cwd) {
    const putoutPath = readUp.sync('.putout.json', {
        cwd,
    });
    
    if (putoutPath)
        return [
            dirname(putoutPath),
            require(putoutPath),
        ];
    
    const infoPath = readUp.sync('package.json', {
        cwd,
    });
    
    if (infoPath)
        return [
            dirname(infoPath),
            require(infoPath).putout,
        ];
    
    return [''];
}

function _readCodeMods() {
    const {join} = require('path');
    const {homedir} = require('os');
    
    const dir = join(homedir(), '.putout');
    const [e, names] = tryCatch(readdirSync, dir);
    
    if (e)
        return {};
    
    const plugins = [];
    
    for (const name of names) {
        const full = join(dir, name);
        const plugin = require(full);
        const shortName = name.replace('putout-plugin-');
        
        plugins.push({
            [shortName]: plugin,
        });
    }
    
    return {
        plugins,
    };
}

