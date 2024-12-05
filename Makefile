SHELL = /bin/bash -u -e -o pipefail
export PATH := node_modules/.bin:$(PATH)

dist/tiny-form-fields.esm.js: css src/Main.elm Makefile elm-review test
	elm         make src/Main.elm --optimize --output dist/tiny-form-fields.js
	npx elm-esm make src/Main.elm --optimize --output=dist/tiny-form-fields.esm.js

css: dist/tiny-form-fields.min.css

dist/tiny-form-fields.min.css: input.css tailwind.config.js index.html src/Main.elm
	npx tailwindcss --input input.css --output dist/tiny-form-fields.min.css --minify
	touch dist/tiny-form-fields.min.css

run:
	npx elm-live src/Main.elm \
		--start-page index.html \
		-- --output=dist/tiny-form-fields.js --debug

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
	npx elm-review --fix-all
