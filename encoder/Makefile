DF_CFLAGS += -Imozjpeg
DF_CFLAGS += -O3
DF_CFLAGS += -o deepfry.js

DF_EMFLAGS += --pre-js=library.js
DF_EMFLAGS += -s ASSERTIONS=1
DF_EMFLAGS += -s WASM=1
DF_EMFLAGS += -s MODULARIZE=1
DF_EMFLAGS += -s EXPORT_NAME=moduleFactory
DF_EMFLAGS += -s ALLOW_MEMORY_GROWTH=1
DF_EMFLAGS += -s ENVIRONMENT=web
DF_EMFLAGS += -s EXPORTED_FUNCTIONS='["_deepfry","_tjFree","_malloc","_free"]'
DF_EMFLAGS += -s EXPORTED_RUNTIME_METHODS='["UTF8ToString","getValue","setValue"]'

MOZJPEG_CMAKEFLAGS += -DENABLE_SHARED=0
MOZJPEG_CMAKEFLAGS += -DENABLE_STATIC=1
MOZJPEG_CMAKEFLAGS += -DWITH_TURBOJPEG=1
MOZJPEG_CMAKEFLAGS += -DPNG_SUPPORTED=0


deepfry.js: deepfry.c deepfry.h library.js mozjpeg/build/libturbojpeg.a
	emcc $(DF_CFLAGS) deepfry.c mozjpeg/build/libturbojpeg.a $(DF_EMFLAGS)

mozjpeg/build/libturbojpeg.a:
	mkdir -p mozjpeg/build
	cd mozjpeg/build && emcmake cmake .. $(MOZJPEG_CMAKEFLAGS)
	+cd mozjpeg/build && emmake $(MAKE)

clean:
	rm -f deepfry.wasm deepfry.js

cleanmozjpeg:
	rm -rf mozjpeg/build

fullclean: clean cleanmozjpeg

.PHONY: fullclean clean cleanmozjpeg

