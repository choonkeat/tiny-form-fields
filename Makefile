dist/tiny-form-fields.esm.js: test src/Main.elm Makefile
	elm make src/Main.elm --output dist/tiny-form-fields.js
	npx elm-esm make src/Main.elm --output=dist/tiny-form-fields.esm.js

run:
	npx elm-live src/Main.elm \
		--start-page index.html \
		-- --output=dist/tiny-form-fields.js

test:
	npx elm-test
