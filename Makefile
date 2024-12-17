SHELL = /bin/bash -u -e -o pipefail
export PATH := node_modules/.bin:$(PATH)

build: css compile elm-review test test-playwright

diff:
	git diff -- ':!dist'

compile: dist/tiny-form-fields.js dist/tiny-form-fields.esm.js dist/base-custom-field.js

dist/tiny-form-fields.js: src/Main.elm Makefile
	elm         make src/Main.elm --optimize --output dist/tiny-form-fields.js

dist/tiny-form-fields.esm.js: src/Main.elm Makefile
	npx elm-esm make src/Main.elm --optimize --output=dist/tiny-form-fields.esm.js
	cp src/base-custom-field.js dist/

dist/base-custom-field.js: src/base-custom-field.js
	cp src/base-custom-field.js dist/

css: dist/tiny-form-fields.min.css

dist/tiny-form-fields.min.css: input.css tailwind.config.js index.html src/Main.elm
	npx tailwindcss --input input.css --output dist/tiny-form-fields.min.css --minify
	touch dist/tiny-form-fields.min.css

ELM_MAKE_FLAGS=--debug
run:
	npx elm-live src/Main.elm \
		--start-page index.html \
		-- --output=dist/tiny-form-fields.js $(ELM_MAKE_FLAGS)

run-ignore-error:
	make run || echo shutdown test server

test:
	npx elm-test

ping-run:
	wget --tries=90 --retry-connrefused -SO - http://localhost:8000

test-playwright:
	npx playwright test --reporter=line
	echo playwright pass

test-playwright-ui:
	npx playwright test --ui

stop-run:
	killall node

elm-review:
	yes | npx elm-review -- --fix-all
