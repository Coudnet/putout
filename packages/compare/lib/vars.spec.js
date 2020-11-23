'use strict';

const test = require('supertape');
const putout = require('putout');
const montag = require('montag');
const {template} = require('@putout/engine-parser');

const {compare} = require('./compare');
const {getTemplateValues} = require('./vars');

const {types, generate} = putout;
const {RegExpLiteral} = types;

test('putout: compare: vars: getTemplateValues', (t) => {
    const addVar = {
        report: () => '',
        filter: (path) => {
            const {node} = path;
            const {body} = node;
            const [first] = body.body;
            const {__i} = getTemplateValues(node, 'for (let __i = 0; __i < __n; __i++) __c');
            
            return compare(first, `const __a = __b[${__i.name}]`);
        },
        replace: () => ({
            'for (let __i = 0; __i < __n; __i++) __c': (vars) => {
                const {__c, __i} = vars;
                const [node] = __c.body;
                const {__a, __b} = getTemplateValues(node, `const __a = __b[${__i.name}]`);
                
                __c.body.shift();
                
                return `for (const ${__a.name} of ${__b.name}) __c`;
            },
        }),
    };
    
    const input = 'for (let i = 0; i < n; i++) {const item = items[i]; log(item);}';
    
    const {code} = putout(input, {
        plugins: [{
            'convert-for-to-for-of': addVar,
        }],
    });
    
    const expected = 'for (const item of items) {\n  log(item);\n};';
    
    t.deepEqual(code, expected, 'should equal');
    t.end();
});

test('putout: compare: vars: getTemplateValues: __array', (t) => {
    const node = template.ast('const [] = array');
    const {__array} = getTemplateValues(node, 'const __array = __');
    
    t.equal(__array && __array.type, 'ArrayPattern');
    t.end();
});

test('putout: compare: vars: getTemplateValues: __', (t) => {
    const node = template.ast('const [] = array');
    const {__} = getTemplateValues(node, 'const __array = __');
    
    t.equal(__ && __.type, 'Identifier');
    t.end();
});

test('putout: compare: vars: getTemplateValues: __object', (t) => {
    const node = template.ast('const {} = obj');
    const {__object} = getTemplateValues(node, 'const __object = __');
    
    t.equal(__object.type, 'ObjectPattern');
    t.end();
});

test('putout: compare: vars: vars: setValues : __args', (t) => {
    const applyToSpread = {
        report: () => '',
        replace: () => ({
            'function __a(__args){}': 'const __a = (__args) => {}',
        }),
    };
    
    const {code} = putout('function hello(a, b, c){}', {
        plugins: [{
            'convert-to-arrow': applyToSpread,
        }],
    });
    
    const expected = 'const hello = (a, b, c) => {};';
    
    t.deepEqual(code, expected);
    t.end();
});

test('putout: compare: vars: vars: __imports', (t) => {
    const applyToSpread = {
        report: () => '',
        replace: () => ({
            'import __imports from "__a"': ({__imports, __a}) => {
                let result = 'const {\n';
                
                for (const {imported} of __imports) {
                    result += `${imported.name},`;
                }
                
                result += `\n} = require(${__a.raw});`;
                
                return result;
            },
        }),
    };
    
    const {code} = putout('import {hello} from "world"', {
        plugins: [{
            'convert-esm-to-commonjs': applyToSpread,
        }],
    });
    
    const expected = `const {\n  hello\n} = require('world');`;
    
    t.deepEqual(code, expected);
    t.end();
});

test('putout: compare: vars: identifier', (t) => {
    const varToConst = {
        report: () => '',
        replace: () => ({
            '!!__a': '__a',
        }),
    };
    
    const {code} = putout('if (!!y) fn()', {
        fixCount: 1,
        plugins: [{
            'var-to-const': varToConst,
        }],
    });
    
    const expected = 'if (y) fn()';
    
    t.deepEqual(code, expected, 'should equal');
    t.end();
});

test.only('putout: compare: vars: regexp', (t) => {
    const varToConst = {
        report: () => '',
        replace: () => ({
            'const __a = /__b/': 'const __a = __b'
        }),
    };
    
    const {code} = putout('const a = /hello/', {
        fixCount: 1,
        plugins: [{
            'var-to-const': varToConst,
        }],
    });
    
    const expected = `const a = 'hello';`;
    
    t.equal(code, expected, 'should equal');
    t.end();
});

test('putout: compare: vars: regexp: identifier', (t) => {
    const varToConst = {
        report: () => '',
        replace: () => ({
            '/__a/': '__a',
        }),
    };
    
    const {code} = putout('/hello/', {
        fixCount: 1,
        plugins: [{
            'var-to-const': varToConst,
        }],
    });
    
    const expected = `hello;`;
    
    t.equal(code, expected, 'should equal');
    t.end();
});

test('putout: compare: vars: regexp: string literal', (t) => {
    const varToConst = {
        report: () => '',
        replace: () => ({
            '/__a/': `'__a'`,
        }),
    };
    
    const {code} = putout('/hello/', {
        fixCount: 1,
        plugins: [{
            'var-to-const': varToConst,
        }],
    });
    
    const expected = `'hello';`;
    
    t.equal(code, expected, 'should equal');
    t.end();
});

test('putout: compare: vars: vars: findVarsWays: __object', (t) => {
    const convert = {
        report: () => '',
        replace: () => ({
            __object: ({__object}) => {
                const {code} = generate(__object);
                return `(${code})`;
            },
        }),
    };
    
    const source = montag`
        fn({a, b, c})
    `;
    
    const expected = montag`
        fn(({
          a,
          b,
          c
        }))
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['convert', convert],
        ],
    });
    
    t.deepEqual(code, expected, 'should equal');
    t.end();
});

test('putout: compare: vars: __args__a', (t) => {
    const varToConst = {
        report: () => '',
        replace: () => ({
            '(__args__a) => __b(__args__a)': '__b',
        }),
    };
    
    const input = 'const y = (a, b) => alert(a, b)';
    const expected = 'const y = alert';
    
    const {code} = putout(input, {
        fixCount: 1,
        plugins: [{
            'var-to-const': varToConst,
        }],
    });
    
    t.deepEqual(code, expected, 'should equal');
    t.end();
});

test('putout: compare: vars: __args__a: different', (t) => {
    const varToConst = {
        report: () => '',
        replace: () => ({
            '(__args__a) => __b(__args__a)': '__b',
        }),
    };
    
    const input = 'const y = () => alert(a, b);';
    
    const {code} = putout(input, {
        fixCount: 1,
        plugins: [{
            'var-to-const': varToConst,
        }],
    });
    
    t.deepEqual(code, input, 'should equal');
    t.end();
});

test('putout: compare: vars: "__a"', (t) => {
    const convertReplace = {
        report: () => '',
        replace: () => ({
            '__a.replace("__b", __c)': ({__b}, path) => {
                const value = __b.raw.slice(1, -1);
                const regexp = {
                    ...RegExpLiteral('xx', 'g'),
                    extra: {
                        raw: `/${escape(value)}/g`,
                    },
                };
                
                path.get('arguments.0').replaceWith(regexp);
                return path.node;
            },
        }),
    };
    
    const input = '"hello".replace(/l/g, "x")';
    
    const {code} = putout(input, {
        fixCount: 1,
        plugins: [
            ['convert-replace', convertReplace],
        ],
    });
    
    t.deepEqual(code, input, 'should equal');
    t.end();
});

test('putout: compare: vars: `__a`', (t) => {
    const varToConst = {
        report: () => '',
        replace: () => ({
            'const x = `__a`': ({__a}) => {
                const {raw} = __a.value;
                return `const x = "${raw}"`;
            },
        }),
    };
    
    const input = 'const x = `hello`';
    
    const {code} = putout(input, {
        fixCount: 1,
        plugins: [{
            'var-to-const': varToConst,
        }],
    });
    
    const expected = `const x = 'hello';`;
    
    t.equal(code, expected, 'should equal');
    t.end();
});
