'use strict';

const {extname} = require('path');
const {loadProcessors} = require('@putout/engine-loader');

const defaultProcessors = [
    'javascript',
];

module.exports.runProcessors = async ({name, process, options, rawSource, index, length}) => {
    const allPlaces = [];
    const ext = extname(name).slice(1);
    const {
        processors = defaultProcessors,
    } = options;
    
    const loadedProcessors = loadProcessors({
        processors,
    });
    
    let processedSource = '';
    let isProcessed = false;
    
    for (const {extensions, preProcess, postProcess} of loadedProcessors) {
        if (!extensions.includes(ext))
            continue;
        
        const list = preProcess(rawSource);
        const preProcessedList = [];
        
        for (const {source, startLine} of list) {
            const {code, places} = await process({
                name,
                source,
                rawSource,
                options,
                index,
                length,
                startLine,
            });
            
            preProcessedList.push(code);
            allPlaces.push(...places);
        }
        
        processedSource = postProcess(rawSource, preProcessedList);
        isProcessed = true;
    }
    
    return {
        places: allPlaces,
        processedSource,
        isProcessed,
    };
};
