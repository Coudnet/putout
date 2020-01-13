'use strict';

const debug = require('debug')('putout:template:compare');

const {isArray} = Array;
const isObject = (a) => a && typeof a === 'object';

module.exports = (a, b) => {
    if (!debug.enabled)
        return;
    
    const parsedValue = parseValue(a);
    const parsedPathValue = parseValue(b);
    
    debug(`${parsedValue} = ${parsedPathValue}`);
    return;
};

function parseValue(a) {
    if (isArray(a) && a[0]) {
        const [{type, name, value}] = a;
        return `${type}: ["${name || value}"]`;
    }
    
    if (isObject(a)) {
        const {
            type,
            name,
            value,
        } = a;
        
        return `${type}: "${name || value}"`;
    }
    
    return `${typeof a}: "${a}"`;
}

