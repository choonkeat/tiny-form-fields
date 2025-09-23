#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generates an Elm module that contains test data from JSON fixtures
 * This allows us to read JSON files at build time and embed them in Elm tests
 */
function generateCrossValidationTests() {
	const testDataDir = path.join(__dirname, '..', 'go', 'testdata');
	const outputPath = path.join(__dirname, '..', 'tests', 'GoElmCrossValidationTestData.elm');

	console.log('Reading JSON fixtures from:', testDataDir);

	if (!fs.existsSync(testDataDir)) {
		console.error('Test data directory does not exist:', testDataDir);
		process.exit(1);
	}

	// Read all JSON files in the testdata directory
	const jsonFiles = fs
		.readdirSync(testDataDir)
		.filter((file) => file.endsWith('.json'))
		.filter((file) => file.startsWith('go')); // Only Go-generated fixtures

	console.log('Found JSON fixtures:', jsonFiles);

	if (jsonFiles.length === 0) {
		console.error('No JSON fixtures found in', testDataDir);
		process.exit(1);
	}

	// Generate Elm module content
	const elmContent = generateElmModule(testDataDir, jsonFiles);

	// Write the generated Elm file
	fs.writeFileSync(outputPath, elmContent, 'utf8');
	console.log('Generated Elm test data module at:', outputPath);
}

function generateElmModule(testDataDir, jsonFiles) {
	const moduleName = 'GoElmCrossValidationTestData';

	// Read and process each JSON file
	const testCases = jsonFiles.map((fileName) => {
		const filePath = path.join(testDataDir, fileName);
		const jsonContent = fs.readFileSync(filePath, 'utf8');

		// Extract test case name from filename (remove 'go_' prefix and '.json' suffix)
		const testName = fileName.replace(/^go_/, '').replace(/\.json$/, '');
		const functionName = testName.charAt(0).toLowerCase() + testName.slice(1) + 'Json';

		return {
			name: testName,
			functionName: functionName,
			fileName: fileName,
			jsonContent: jsonContent,
		};
	});

	// Generate the Elm module
	return `module ${moduleName} exposing (..)

{-| This module is auto-generated from Go test fixtures.
Do not edit manually - run 'node scripts/generate-cross-validation-tests.js' to regenerate.
-}

-- Test case data from Go fixtures

${testCases
	.map(
		(testCase) => `
{-| JSON content from ${testCase.fileName} -}
${testCase.functionName} : String
${testCase.functionName} =
    """${escapeElmString(testCase.jsonContent)}"""
`
	)
	.join('')}

{-| All available test cases -}
testCases : List { name : String, fileName : String, jsonContent : String }
testCases =
    [ ${testCases
		.map(
			(testCase) => `
        { name = "${testCase.name}"
        , fileName = "${testCase.fileName}"
        , jsonContent = ${testCase.functionName}
        }`
		)
		.join('\n    , ')}
    ]

{-| Get test case by name -}
getTestCase : String -> Maybe String
getTestCase name =
    case name of
${testCases.map((testCase) => `        "${testCase.name}" -> Just ${testCase.functionName}`).join('\n')}
        _ -> Nothing
`;
}

function escapeElmString(str) {
	return str
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/\t/g, '\\t');
}

// Run the generator
if (require.main === module) {
	generateCrossValidationTests();
}

module.exports = { generateCrossValidationTests };
