'use strict';

const traverse = require('@babel/traverse').default;
const jessy = require('jessy');
const nessy = require('nessy');
const {template} = require('@putout/engine-parser');
const {replaceWith} = require('@putout/operate');
const {
    isIdentifier,
    isStringLiteral,
    isTemplateElement,
    isRegExpLiteral,
    StringLiteral,
    Identifier,
} = require('@babel/types');

const {
    is,
    isArgsStr,
    isImportsStr,
} = require('./is');

const {entries} = Object;
const isNumber = (a) => typeof a === 'number';
const parseExpression = (a) => a.expression || a;

module.exports.getTemplateValues = (node, str) => {
    const templateNode = template.ast(str);
    const waysFrom = findVarsWays(templateNode);
    
    return getValues({
        node,
        waysFrom,
    });
};

module.exports.findVarsWays = findVarsWays;

const parseName = (node) => {
    if (isStringLiteral(node))
        return node.value;
    
    if (isTemplateElement(node))
        return node.value.raw;
    
    if (isRegExpLiteral(node))
        return node.pattern;
    
    return node.name;
};

function findVarsWays(node) {
    if (isIdentifier(node) && is(node.name))
        return {
            [node.name]: [''],
        };
    
    if (isRegExpLiteral(node) && is(node.pattern))
        return {
            [node.pattern]: ['pattern'],
        };
    
    if (isStringLiteral(node) && is(node.value))
        return {
            [node.value]: ['value'],
        };
    
    const vars = {};
    
    traverse(node, {
        noScope: true,
        'Identifier|StringLiteral|TemplateElement|RegExpLiteral'(path) {
            const {node} = path;
            const way = [];
            const name = parseName(node);
            debugger;
            
            if (!is(name))
                return;
            
            path.find((path) => {
                const {key, listKey} = path;
                
                if (isNumber(key)) {
                    way.unshift(`${listKey}.${key}`);
                    return;
                }
                
                way.unshift(key);
            });
            
            vars[name] = vars[name] || [];
            vars[name].push(way.join('.'));
        },
    });
    
    return vars;
}

module.exports.getValues = getValues;

function getValues({waysFrom, node}) {
    const result = {};
    
    for (const [name, ways] of entries(waysFrom)) {
        for (let way of ways) {
            if (isImportsStr(name))
                way = way.replace(/\.0.local$/, '');
            
            else if (isArgsStr(name))
                way = way.replace(/\.0$/, '');
            
            way = way.replace(/\.expression$/, '');
            
            result[name] = result[name] || jessy(way, node);
        }
    }
    
    return result;
}

module.exports.setValues = setValues;

const convertToNode = (node, value) => {
    if (typeof value !== 'string')
        return value;
    
    return Identifier(value);
};

function setValues({waysTo, values, path}) {
    const node = parseExpression(path.node);
    
    for (const [name, ways] of entries(waysTo)) {
        for (let way of ways) {
            if (!way) {
                replaceWith(path, convertToNode(node, values[name]));
                continue;
            }
            
            if (isArgsStr(name))
                way = way.replace(/\.0$/, '');
            
            nessy(way, values[name], node);
        }
    }
}

