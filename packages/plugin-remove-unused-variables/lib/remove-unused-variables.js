'use strict';

const getVars = require('./get-vars');
const transform = require('./transform');
const getUnused = require('./get-unused');

module.exports.report = ({name}) => `"${name}" is defined but never used`;

module.exports.fix = ({chunk}) => {
    chunk.remove();
};

module.exports.find = (ast) => {
    const vars = getVars(ast, {
        setPath: true,
    });
    
    const transformed = transform(vars);
    const unused = getUnused(transformed);
    
    return unused;
};

