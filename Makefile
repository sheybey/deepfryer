build: src/*.ts src/*.tsx src/*.css encoder/deepfry.js node_modules
	npm run build

node_modules: package.json
	npm i

encoder/deepfry.js:
	cd encoder && $(MAKE)
	mkdir -p public/static/js
	cp encoder/deepfry.wasm public/static/js/deepfry.wasm

clean:
	rm -rf build
	cd encoder && $(MAKE) clean

fullclean: clean
	cd encoder && $(MAKE) fullclean

.PHONY: clean fullclean
