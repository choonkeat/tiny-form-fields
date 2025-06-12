#!/usr/bin/env node

const fs = require('fs');
const Ajv = require('ajv');

// Check if ajv is installed
try {
    require.resolve('ajv');
} catch (e) {
    console.error('Error: ajv package not found. Please install it with:');
    console.error('npm install --save-dev ajv');
    process.exit(1);
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: node validate-config.js <config.json>');
    console.log('   or: npx validate-config <config.json>');
    console.log('');
    console.log('Validates a tiny-form-fields config JSON against the schema.');
    process.exit(1);
}

const configFile = args[0];

// Check if files exist
if (!fs.existsSync('dist/config.schema.json')) {
    console.error('Error: dist/config.schema.json not found. Run "make schema" to generate it.');
    process.exit(1);
}

if (!fs.existsSync(configFile)) {
    console.error(`Error: ${configFile} not found.`);
    process.exit(1);
}

try {
    // Load schema and config
    const schema = JSON.parse(fs.readFileSync('dist/config.schema.json', 'utf8'));
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    // Validate
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);
    const valid = validate(config);

    if (valid) {
        console.log(`✅ ${configFile} is valid!`);
        process.exit(0);
    } else {
        console.error(`❌ ${configFile} is invalid:`);
        validate.errors.forEach(error => {
            console.error(`  - ${error.instancePath || 'root'}: ${error.message}`);
            if (error.data !== undefined) {
                console.error(`    Got: ${JSON.stringify(error.data)}`);
            }
        });
        process.exit(1);
    }
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}