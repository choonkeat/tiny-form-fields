dist/tiny-form-fields.esm.js: css src/Main.elm Makefile test
	elm make src/Main.elm --optimize --output dist/tiny-form-fields.js
	npx elm-esm make src/Main.elm --output=dist/tiny-form-fields.esm.js

css: dist/tiny-form-fields.min.css

dist/tiny-form-fields.min.css: input.css tailwind.config.js index.html src/Main.elm
	npx tailwindcss --input input.css --output dist/tiny-form-fields.min.css --minify
	touch dist/tiny-form-fields.min.css

run:
	npx elm-live src/Main.elm \
		--start-page index.html \
		-- --output=dist/tiny-form-fields.js

run-ignore-error:
	make run || echo shutdown test server

test:
	npx elm-test

ping-run:
	wget --tries=90 --retry-connrefused -SO - http://localhost:8000

test-playwright:
	npx playwright test
	echo playwright pass

stop-run:
	killall node
