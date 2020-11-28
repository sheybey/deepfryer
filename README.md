# deepfryer

This project runs images through a JPEG encoder, intentionally using the worst
possible compression settings and optionally oversaturating the colors. This
results in what is colloquially known as a "deep-fried" meme.

You can see a live version of this app at https://deepfry.heybey.tech

## building (short version)

Clone the repository and its submodule (`git clone --recursive` or `git
submodule init && git submodule update`). Install and activate
[emscripten][emscripten] in your current shell, then run `make`.

## building (long version)

The app is composed of two components: an encoder based on mozjpeg and a react
web application. The encoder is compiled to javascript and webassembly using
emscripten, then loaded as a web worker at runtime by the application.

### compiling the encoder

1. Obtain a copy of the [emscripten SDK][emscripten].
2. Compile mozjpeg with the turbojpeg api as a static library using
   emscripten. See the [Makefile](./encoder/Makefile) for how exactly this is
   done.
3. Compile deepfry.c with emscripten and link it with the mozjpeg static
   library. Details on this process can also be obtained from the Makefile.

### compiling the application

The app is compiled using React's normal toolchain and does not need to
directly reference the encoder during compilation.. The compiled encoder is
served as-is and loaded at runtime as a web worker.

Once the encoder is compiled, the compiled javascript and webassembly need to
be copied to `/public/static/js/` so they can be used at runtime. The
[Makefile](./Makefile) does this if you want to see the exact steps.

Once you have compiled the encoder and copied it you can just use the React
build script: `npm run build`

[emscripten]: https://emscripten.org/docs/getting_started/downloads.html