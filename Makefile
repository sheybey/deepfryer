dist: src/*.ts src/*.tsx src/*.css encoder/deepfry.js node_modules
	npm run build

node_modules: package.json
	npm i

encoder/deepfry.js:
	cd encoder && $(MAKE)
	mkdir -p public/static/js
	cp encoder/deepfry.wasm public/static/js/deepfry.wasm
	cp encoder/deepfry.js public/static/js/deepfry.js

clean:
	rm -rf build
	rm -f public/static/js/deepfry.wasm
	rm -f public/static/js/deepfry.js
	cd encoder && $(MAKE) clean

fullclean: clean
	cd encoder && $(MAKE) fullclean

.PHONY: clean fullclean
