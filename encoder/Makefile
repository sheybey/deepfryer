DF_CFLAGS += -Imozjpeg
DF_CFLAGS += -O3
DF_CFLAGS += -o deepfry.js

DF_EMFLAGS += --pre-js=library.js
DF_EMFLAGS += --closure=1
DF_EMFLAGS += -s ASSERTIONS=1
DF_EMFLAGS += -s WASM=1
DF_EMFLAGS += -s MODULARIZE=1
DF_EMFLAGS += -s EXPORT_NAME=moduleFactory
DF_EMFLAGS += -s ALLOW_MEMORY_GROWTH=1
DF_EMFLAGS += -s ENVIRONMENT=web
DF_EMFLAGS += -s EXPORTED_FUNCTIONS='["_adjust","_compress","_tjFree","_malloc","_free"]'
DF_EMFLAGS += -s EXPORTED_RUNTIME_METHODS='["UTF8ToString","getValue","setValue"]'

MOZJPEG_CMAKEFLAGS += -DENABLE_SHARED=0
MOZJPEG_CMAKEFLAGS += -DENABLE_STATIC=1
MOZJPEG_CMAKEFLAGS += -DWITH_TURBOJPEG=1
MOZJPEG_CMAKEFLAGS += -DPNG_SUPPORTED=0

MOZJPEG_BUILDDIR = mozjpeg-build
MOZJPEG_STATICLIB = $(MOZJPEG_BUILDDIR)/libturbojpeg.a
MOZJPEG_PATH = $(realpath mozjpeg)


deepfry.js: deepfry.c deepfry.h library.js $(MOZJPEG_STATICLIB)
	emcc $(DF_CFLAGS) deepfry.c $(MOZJPEG_STATICLIB) $(DF_EMFLAGS)

$(MOZJPEG_STATICLIB): mozjpeg
	mkdir -p $(MOZJPEG_BUILDDIR)
	cd $(MOZJPEG_BUILDDIR) && emcmake cmake $(MOZJPEG_PATH) $(MOZJPEG_CMAKEFLAGS)
	cd $(MOZJPEG_BUILDDIR) && $(MAKE)

clean:
	rm -f deepfry.wasm deepfry.js

cleanmozjpeg:
	rm -rf $(MOZJPEG_BUILDDIR)

fullclean: clean cleanmozjpeg

.PHONY: fullclean clean cleanmozjpeg

