'use strict';

const {homedir} = require('os');
const {dirname, join} = require('path');
const {readdirSync} = require('fs');

const findUp = require('find-up');
const once = require('once');
const tryCatch = require('try-catch');

const merge = require('./merge');
const parseMatch = require('./parse-match');
const defaultOptions = require('../putout.json');
const getRelativePath = require('../lib/get-relative-path');

const readCodeMods = once(_readCodeMods);
const readRules = once(_readRules);

const cwd = process.cwd();

module.exports = ({rulesdir, name, options = {}} = {}) => {
    const [dir, customOptions] = getOptions(cwd);
    const mergedOptions = merge(options, defaultOptions, customOptions);
    const {match} = mergedOptions;
    const relativeName = getRelativePath(name, dir);
    
    const resultOptions = merge(
        readCodeMods(),
        readRules(dir, rulesdir),
        parseMatch(relativeName, match),
        mergedOptions,
    );
    
    return {
        ...resultOptions,
        dir,
    };
};

function getOptions(cwd) {
    const putoutPath = findUp.sync('.putout.json', {
        cwd,
    });
    
    if (putoutPath)
        return [
            dirname(putoutPath),
            require(putoutPath),
        ];
    
    const packagePath = findUp.sync('package.json', {
        cwd,
    });
    
    if (packagePath)
        return [
            dirname(packagePath),
            require(packagePath).putout || {},
        ];
    
    return [
        '',
        {},
    ];
}

function _readRules(dirOpt, rulesDir) {
    if (!rulesDir)
        return {};
    
    const dir = join(dirOpt, rulesDir);
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

function _readCodeMods() {
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
