'use strict';

const {run} = require('madrun');

module.exports = {
    'prepublishOnly': () => run('build:dev'),
    'build:base': () => 'webpack --config ./.webpack/webpack.config.js',
    'build': () => run('build:base', '--mode production'),
    'build:dev': () => run('build:base', '--mode development'),
    'test': () => `tape 'test/*.js' 'lib/**/*.spec.js'`,
    'watch:test': () => `nodemon -w lib -w test -x ${run('test')}`,
    'lint': () => {
        const names = [
            'bin',
            'lib',
            'madrun.js',
            '.eslintrc.js',
            'test',
            '.webpack',
        ].join(' ');
        
        return `bin/putout.js ${names}`;
    },
    'fix:lint': () => run('lint', '--fix'),
    'putout': () => `bin/putout.js bin lib test madrun.js`,
    'coverage': () => `nyc ${run('test')}`,
    'report': () => `nyc report --reporter=text-lcov | coveralls || true`,
};

