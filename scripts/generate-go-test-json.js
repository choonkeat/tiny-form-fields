const fs = require('fs');
const path = require('path');

// This will be replaced with the actual Elm compilation output
const { Elm } = require('./elm-stuff/generated-js/GenerateGoTestJSON.js');

const app = Elm.GenerateGoTestJSON.init();

app.ports.output.subscribe((jsonString) => {
    // Write to go/test_fixtures.json
    const outputPath = path.join(__dirname, 'go', 'test_fixtures.json');
    fs.writeFileSync(outputPath, jsonString, 'utf8');
    console.log('Generated Go test fixtures at:', outputPath);
    process.exit(0);
});