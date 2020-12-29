const fs = require("fs");
const path = require("path");

function writeFile(dir, mergedResults, customFileName) {
    let fileName = customFileName || "wdio-merged.json";
    const filePath = path.join(dir, fileName);
    console.log('FILEPATH: ', filePath)
    console.log('DIR: ', dir)
    console.log('mergedResults: ', mergedResults)
    console.log('customFileName: ', customFileName)
    try {
        fs.writeFileSync(filePath, JSON.stringify(mergedResults));
    } catch (error) {
        console.log('ERROR on write in writeFile: ', error);
    }
    
}

function getDataFromFiles(dir, filePattern) {
    const fileNames = fs
        .readdirSync(dir)
        .filter((file) => file.match(filePattern));
    const data = [];

    fileNames.forEach((fileName) => {
        let fileContent = "";
        
        try {
            fileContent = fs.readFileSync(`${dir}/${fileName}`);
            const fileContentParsed = JSON.parse(fileContent);
            data.push(JSON.parse(fileContentParsed));
        } catch (error) {
            console.log('JSON parse failed with error: ', error)
        }
        
    });

    return data;
}

function mergeData(rawData) {
    let mergedResults;

    console.log('RAW DATA: ',rawData);
    rawData.forEach((data) => {
        if (mergedResults === undefined) {
            // use the first result so that we have the right shape
            mergedResults = {};
            Object.assign(mergedResults, data);
        } else {
            mergedResults.tests.push(...data.tests);
        }
    });

    // mergedResults.tests.forEach((suite) => {
    //     mergedResults.end =
    //         suite.end > mergedResults.end ? suite.end : mergedResults.end;
    // });

    mergedResults.tests.sort((a, b) => (a.status < b.status ? 1 : -1));

    console.log('MERGED result set: ', mergedResults);
    return mergedResults;
}

const mergeResults = (...args) => {
    const dir = args[0] || process.argv[2];
    const filePattern = args[1] || process.argv[3];
    const customFileName = args[2] || process.argv[4];

    const rawData = getDataFromFiles(dir, filePattern);
    const mergedResults = mergeData(rawData);
    writeFile(dir, mergedResults, customFileName);
};

module.exports = mergeResults;
