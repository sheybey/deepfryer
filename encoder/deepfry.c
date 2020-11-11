#include <turbojpeg.h>
#include <stdlib.h>
#include <stdio.h>


int deepfry(const unsigned char *input, int width, int pitch, int height,
    int pixel_format, unsigned char **output, unsigned long *output_size,
    char const **error)
{
    // create compression instance
    tjhandle compressor;
    if (!(compressor = tjInitCompress())) {
        *error = tjGetErrorStr2(NULL);
        return 0;
    }

    // compress image
    unsigned char *jpeg_buffer;
    unsigned long jpeg_size;
    if (0 != tjCompress2(compressor, input, width, pitch, height, TJPF_RGB,
        &jpeg_buffer, &jpeg_size, TJSAMP_420, 1,
        TJFLAG_FASTUPSAMPLE | TJFLAG_FASTDCT | TJFLAG_PROGRESSIVE)) {
        *error = tjGetErrorStr2(compressor);
        tjDestroy(compressor);
        return 0;
    }

    // destroy compressor
    if (0 != tjDestroy(compressor)) {
        *error = "failed to destroy compressor";
        return 0;
    }

    *output = jpeg_buffer;
    *output_size = jpeg_size;
    return 1;
}
