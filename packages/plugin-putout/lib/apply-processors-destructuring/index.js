'use strict';

module.exports.report = () => 'Test operator should be destructured';

module.exports.replace = () => ({
    'async (t) => {await t.process(__args)}': 'async ({process}) => {await process(__args)}',
    'async (t) => {await t.comparePlaces(__args)}': 'async ({comparePlaces}) => {await comparePlaces(__args)}',
});