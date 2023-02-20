dist: src/*.ts src/*.tsx src/*.css public/static/js/deepfry.js node_modules
	npm run build

node_modules: package.json
	npm i

public/static/js/deepfry.js: encoder/deepfry.js
	cd encoder && $(MAKE)
	mkdir -p public/static/js
	cp encoder/deepfry.wasm encoder/deepfry.js public/static/js/

clean:
	rm -rf build
	rm -f public/static/js/deepfry.wasm
	rm -f public/static/js/deepfry.js
	cd encoder && $(MAKE) clean

fullclean: clean
	cd encoder && $(MAKE) fullclean

.PHONY: clean fullclean
