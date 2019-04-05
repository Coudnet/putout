'use strict';

const {traverseClass} = require('../common');

module.exports.report = ({node}) => {
    const {name} = node;
    return `name of method "${name}" should not start from under score`;
};

module.exports.fix = ({node}) => {
    const {name} = node;
    node.name = name.replace(/^_/, '');
};

module.exports.find = (ast, {push}) => {
    traverseClass(ast, {
        ClassMethod(chunk) {
            const keyPath = chunk.key;
            const {name} = keyPath.node;
            
            if (!name.indexOf('_'))
                push(keyPath);
        },
    });
};

