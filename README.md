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

The app is compiled using React's normal toolchain. The encoder is exposed as
a module by symlinking it into node_modules. If you are not using the
makefile, you can create this symlink manually:

`cd node_modules && ln -s ../encoder deepfry-encoder`

Once the encoder is compiled, the webassembly binary needs to be copied to
`/public/static/js/` so it can be used at runtime. The [Makefile](./Makefile)
does both of these things if you want to see the exact steps.

Once you have compiled the encoder and copied the webassembly binary, you can
just use the React build script: `npm run build`

[emscripten]: https://emscripten.org/docs/getting_started/downloads.html