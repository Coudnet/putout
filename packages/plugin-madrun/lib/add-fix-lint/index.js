'use strict';

const {
    types,
    operate,
    template,
} = require('putout');

const {replaceWithMultiple} = operate;

const {
    isIdentifier,
    isLiteral,
    isStringLiteral,
    ObjectProperty,
    StringLiteral,
} = types;

const fixLintScript = template.ast(`
    () => run('lint', '--fix')
`);

module.exports.report = () => `fix:lint should exist`;

module.exports.fix = (path) => {
    replaceWithMultiple(path, [
        path.node,
        ObjectProperty(StringLiteral('fix:lint'), fixLintScript.expression),
    ]);
};

module.exports.traverse = ({push}) => {
    return {
        'module.exports = {}'(path) {
            const propertiesPaths = path.get('right.properties');
            const {lint, fixLint} = getLintProperties(propertiesPaths);
            
            if (!lint || fixLint)
                return;
            
            push(lint);
        },
    };
};

function getLintProperties(propertiesPaths) {
    const result = {};
    
    for (const propPath of propertiesPaths) {
        const {node} = propPath;
        
        if (isLiteral(node.key, {value: 'fix:lint'})) {
            result.fixLint = propPath;
            continue;
        }
        
        if (isIdentifier(node.key, {name: 'lint'}) || isStringLiteral(node.key, {value: 'lint'})) {
            result.lint = propPath;
            continue;
        }
        
        if (result.lint && result.fixLint)
            return result;
    }
    
    return result;
}

