const { Elm } = require('./elm-schema.js');
const fs = require('fs');

const app = Elm.GenerateSchema.init();

app.ports.outputSchema.subscribe(function(schemaJson) {
    fs.writeFileSync('dist/config.schema.json', schemaJson);
    console.log('JSON Schema generated: dist/config.schema.json');
    process.exit(0);
});