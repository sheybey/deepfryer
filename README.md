# deepfryer

This project runs images through a JPEG encoder, intentionally using the worst
possible compression settings. This results in what is colloquially known as a
"deep-fried" meme.

You can see a compiled version of this app at https://deepfry.heybey.tech

## building (short version)

Clone the repository and its submodule (`git clone --recursive` or `git
submodule init && git submodule update`). Install and activate
[emscripten][emscripten] in your current shell, then run `make`.

## building (long version)

The app is composed of two components: an encoder based on mozjpeg and a react
web application. The encoder is compiled to javascript and webassembly using
emscripten, then integrated with the react app and compiled using the react
toolchain.

### compiling the encoder

1. Obtain a copy of the [emscripten SDK][emscripten].
2. Compile mozjpeg with the turbojpeg api as a static library using
   emscripten. See the [Makefile](./encoder/Makefile) for how exactly this is
   done.
3. Compile deepfry.c with emscripten and link it with the mozjpeg static
   library. Details on this process can also be obtained from the Makefile.

### compiling the application

The app is compiled using React's normal toolchain. This presents an issue in
that the default eslint settings are far stricter than the output emscripten
produces. This can be worked around by symlinking the emscripten-compiled code
into the source rather than copying it. Yes, I am aware that this is a dirty
underhanded trick that never should have seen the light of day.

Once the encoder is compiled, the symlink that already exists in src will
point to the compiled encoder. The only other thing you need to do before
building is to copy the webassembly binary to `/public/static/js/`. Again,
the [Makefile](./Makefile) does this if you want to see the exact steps.

Once you have compiled the encoder and copied the webassembly binary, you can
just use the React build script: `npm run build`

[emscripten]: https://emscripten.org/docs/getting_started/downloads.html