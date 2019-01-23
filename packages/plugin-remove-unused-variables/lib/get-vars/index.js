'use strict';

const {
    traverse,
    types,
} = require('putout');

const {
    isAssignmentPattern,
    isIdentifier,
    isClassDeclaration,
    isFunctionDeclaration,
    isObjectPattern,
} = types;

const getVars = require('./get-vars');

const generator = () => {
    let i = 0;
    return () => --i;
};

const generate = generator();

module.exports = (ast, opts = {}) => {
    const vars = {};
    const scopeBlocks = new Map();
    const allParams = [];
    const {
        setPath,
    } = opts;
    
    const use = useVariable({
        vars,
        scopeBlocks,
    });
    
    const declare = declareVariable({
        vars,
        scopeBlocks,
        setPath,
    });
    
    const isUsed = isUsedVariable({
        vars,
        scopeBlocks,
    });
    
    const addParams = addParamsVariable(allParams);
    
    traverse(ast, getVars({
        use,
        declare,
        addParams,
    }));
    
    allParams.map(useParamsBeforeLastUsed({
        use,
        isUsed,
    }));
    
    scopeBlocks.clear();
    
    return Object.values(vars);
};

const addParamsVariable = (allParams) => ({path, params}) => {
    allParams.push({
        path,
        params,
    });
};

function getScopeNumber({name, scope, scopeBlocks}) {
    let done = false;
    
    if (scope.hasOwnBinding(name)) {
        done = true;
        return getBlockId(scope.block, scopeBlocks);
    }
    
    while (scope.parent) {
        scope = scope.parent;
        
        if (!done && scope.hasOwnBinding(name))
            return getBlockId(scope.block, scopeBlocks);
    }
    
    return getBlockId(scope.block, scopeBlocks);
}

const isUsedVariable = ({vars, scopeBlocks}) => (path, name) => {
    const {scope} = path;
    const scopeNumber = getScopeNumber({
        name,
        scope,
        scopeBlocks,
    });
    
    const current = vars[scopeNumber];
    const {used} = current[name];
    
    return used;
};

function getScope(path) {
    const {
        node,
        scope,
    } = path;
    
    if (isFunctionDeclaration(node))
        return path.parentPath.scope;
    
    if (isClassDeclaration(node))
        return path.parentPath.scope;
    
    return scope;
}

const declareVariable = ({vars, setPath, scopeBlocks}) => (path, name) => {
    const scope = getScope(path);
    const scopeNumber = getScopeNumber({
        name,
        scope,
        scopeBlocks,
    });
    
    if (!vars[scopeNumber])
        vars[scopeNumber] = {};
    
    const current = vars[scopeNumber];
    if (current[name])
        current[name].declared = true;
    else
        current[name] = {
            declared: true,
            used: false,
        };
    
    if (setPath)
        current[name].path = path;
};

const useVariable = ({vars, scopeBlocks}) => (path, name) => {
    const {scope} = path;
    const scopeNumber = getScopeNumber({
        name,
        scope,
        scopeBlocks,
    });
    
    if (!vars[scopeNumber])
        vars[scopeNumber] = {};
    
    const current = vars[scopeNumber];
    if (current[name])
        current[name].used = true;
    else
        current[name] = {
            declared: false,
            used: true,
        };
};

const getBlockId = (block, scopeBlocks) => {
    if (scopeBlocks.has(block))
        return scopeBlocks.get(block);
    
    const id = generate();
    
    scopeBlocks.set(block, id);
    
    return id;
};

const useParamsBeforeLastUsed = ({use, isUsed}) => ({path, params}) => {
    let i = params.length;
    
    while (--i > 0) {
        const param = params[i];
        
        if (traverseIsUsed(isUsed, path, param))
            break;
    }
    
    while (--i >= 0) {
        if (!isIdentifier(params[i]))
            continue;
        
        use(path, params[i].name);
    }
};

const traverseIsUsed = (isUsed, path, node) => {
    if (isIdentifier(node))
        return isUsed(path, node.name);
    
    if (isObjectPattern(node))
        return isUsedObjectPattern(isUsed, path, node);
    
    if (isAssignmentPattern(node))
        return isUsedAssignmentPattern(isUsed, path, node);
};

const isUsedAssignmentPattern = (isUsed, path, node) => {
    const {left} = node;
    
    if (isIdentifier(left))
        return isUsed(path, left.name);
};

const isUsedObjectPattern = (isUsed, path, node) => {
    for (const prop of node.properties) {
        const {value} = prop;
        
        if (isIdentifier(value)) {
            if (isUsed(path, value.name))
                return true;
            
            continue;
        }
    }
    
    return false;
};

