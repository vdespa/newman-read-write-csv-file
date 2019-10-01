const newman = require('newman'),
      fs = require('fs'),
      Papa = require('papaparse');

const csvFile = './data.csv';

newman.run({
    collection: require('./collection.json'),
    iterationData: csvFile,
    reporters: ['cli']
}).on('done', function (error, summary) {
    if (error) {
        console.error(error);
    }
    
    // Get CSV result column 
    const csvResultColumn = getCSVResultsColumn(summary.run.executions);

    // Parse the existing CSV file
    let csvData = Papa.parse(fs.readFileSync(csvFile, 'utf8'));    

    // Merge existing CSV data with the test results
    const newCsvData = csvData.data.map((row, index) => {
        return row.concat(csvResultColumn[index]);
    });

    // Write the new CSV data
    fs.writeFileSync(csvFile, Papa.unparse(newCsvData));
});

function getCSVResultsColumn(executions) {
    const textResults = executions
        .map(execution => {
            return execution.assertions.every((currentValue) => currentValue.error == undefined)
        })
        .map(result => result ? 'PASSED' : 'FAILED');

    // Add results column title
    textResults.unshift('result');

    return textResults;
}