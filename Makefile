build: src/*.ts src/*.tsx src/*.css encoder/deepfry.js node_modules/deepfry-encoder
	npm run build

node_modules: package.json
	npm i

node_modules/deepfry-encoder: node_modules
	cd node_modules && ln -s ../encoder deepfry-encoder

encoder/deepfry.js:
	cd encoder && $(MAKE)
	mkdir -p public/static/js
	cp encoder/deepfry.wasm public/static/js/deepfry.wasm

clean:
	rm -rf build
	rm -f public/static/js/deepfry.wasm
	cd encoder && $(MAKE) clean

fullclean: clean
	cd encoder && $(MAKE) fullclean

.PHONY: clean fullclean
