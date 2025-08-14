SHELL = /bin/bash -u -e -o pipefail
export PATH := node_modules/.bin:$(PATH)
ELM_MAKE_FLAGS=--debug

build: ELM_MAKE_FLAGS=--optimize
build: css format compile schema test test-go test-json-compatibility

diff:
	git diff -bw -- ':!dist'

compile: dist/tiny-form-fields.js dist/tiny-form-fields.esm.js dist/base-custom-field.js

dist/tiny-form-fields.js: src/Main.elm Makefile
	elm         make src/Main.elm $(ELM_MAKE_FLAGS) --output dist/tiny-form-fields.js

dist/tiny-form-fields.esm.js: src/Main.elm Makefile
	npx elm-esm make src/Main.elm $(ELM_MAKE_FLAGS) --output=dist/tiny-form-fields.esm.js
	cp src/base-custom-field.js dist/

dist/base-custom-field.js: src/base-custom-field.js
	cp src/base-custom-field.js dist/

css: dist/tiny-form-fields.min.css

dist/tiny-form-fields.min.css: input.css tailwind.config.js index.html src/Main.elm
	npx tailwindcss --input input.css --output dist/tiny-form-fields.min.css --minify
	touch dist/tiny-form-fields.min.css

run: node_modules/.bin/elm-esm
	npx elm-live src/Main.elm \
		--start-page index.html \
		--path-to-elm node_modules/.bin/elm-esm \
		-- --output=dist/tiny-form-fields.esm.js $(ELM_MAKE_FLAGS)

node_modules/.bin/elm-esm:
	npm ci

run-ignore-error:
	make run || echo shutdown test server

test-all: test test-go test-json-compatibility test-playwright

test:
	npx elm-test

ping-run:
	wget --tries=90 --retry-connrefused -SO - http://localhost:8000

# Usage: make test-playwright [PLAYWRIGHT_FILE=e2e/mytest.spec.ts]
# If PLAYWRIGHT_FILE is specified, only that file will be tested
# Otherwise, all tests will be run
test-playwright:
	@if [ -z "$(PLAYWRIGHT_FILE)" ]; then \
		npx playwright test --reporter=line; \
	else \
		npx playwright test "$(PLAYWRIGHT_FILE)" --reporter=line; \
	fi
	echo playwright pass

test-playwright-ui:
	npx playwright test --ui

generate-go-test-json: go/testdata/elm_json_fixtures.json

go/testdata/elm_json_fixtures.json: scripts/GenerateGoTestJSON.elm src/Main.elm
	elm make scripts/GenerateGoTestJSON.elm --output=scripts/generate-go-test-json-elm.js
	node -e "const {Elm} = require('./scripts/generate-go-test-json-elm.js'); const fs = require('fs'); const app = Elm.GenerateGoTestJSON.init(); app.ports.output.subscribe(json => { fs.writeFileSync('go/testdata/elm_json_fixtures.json', json); console.log('Generated go/testdata/elm_json_fixtures.json'); process.exit(0); });"
	rm scripts/generate-go-test-json-elm.js

test-go: generate-go-test-json
	make -C go test

test-json-compatibility: generate-go-test-json
	@echo "Testing JSON compatibility between Elm and Go..."
	@if make -C go test > /dev/null 2>&1; then \
		echo "✓ JSON compatibility test passed"; \
	else \
		echo "✗ JSON compatibility test failed - Elm/Go JSON structures are out of sync"; \
		exit 1; \
	fi

stop-run:
	killall node

elm-review:
	(yes | npx elm-review --fix-all) || npx elm-review

schema: dist/config.schema.json

dist/config.schema.json: src/ConfigSchema.elm src/GenerateSchema.elm Makefile
	elm make src/GenerateSchema.elm --output=elm-schema.js
	node generate-schema.js
	rm elm-schema.js
	npx --package=ajv-cli ajv compile -s dist/config.schema.json

test-schema-compile:
	elm make src/GenerateSchema.elm --output=elm-schema-test.js
	rm elm-schema-test.js

validate-config:
	@if [ -z "$(CONFIG)" ]; then \
		echo "Usage: make validate-config CONFIG=path/to/config.json"; \
		exit 1; \
	fi
	node validate-config.js "$(CONFIG)"

format:
	npx elm-format src/ tests/ --yes
	npx prettier --write "index.html" "input.css" "e2e/**/*.ts"

clean:
	rm -f go/testdata/elm_json_fixtures.json scripts/generate-go-test-json-elm.js
