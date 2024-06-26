dist/tiny-form-fields.esm.js: css src/Main.elm Makefile test
	elm make src/Main.elm --output dist/tiny-form-fields.js
	npx elm-esm make src/Main.elm --output=dist/tiny-form-fields.esm.js

css: dist/tiny-form-fields.min.css

dist/tiny-form-fields.min.css: input.css tailwind.config.js index.html src/Main.elm
	npx tailwindcss --input input.css --output dist/tiny-form-fields.min.css --minify
	touch dist/tiny-form-fields.min.css

run:
	npx elm-live src/Main.elm \
		--start-page index.html \
		-- --output=dist/tiny-form-fields.js

test:
	npx elm-test
