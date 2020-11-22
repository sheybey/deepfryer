#include <turbojpeg.h>
#include <stdlib.h>
#include <stdio.h>
#include <math.h>


int compress(const unsigned char *input, int width, int height,
    unsigned char **output, unsigned long *output_size, char const **error)
{
    // create compression instance
    tjhandle compressor;
    if (!(compressor = tjInitCompress())) {
        *error = tjGetErrorStr2(NULL);
        return 0;
    }

    // compress image
    unsigned char *jpeg_buffer = NULL;
    unsigned long jpeg_size = 0;
    if (0 != tjCompress2(compressor, input, width, 0, height, TJPF_RGB,
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


static inline int clamp(int color)
{
    if (color > 255) {
        return 255;
    } else if (color < 0) {
        return 0;
    }
    return color;
}


void adjust(unsigned char *input, unsigned long pixels,
    double saturation, int brightness, int contrast)
{
    const double factor = (259.0 * (contrast + 255)) /
        (255.0 * (259 - contrast));

    for (unsigned long i = 0; i < pixels * 3; i += 3) {
        // brightness adjustment
        int r = clamp((int)input[i] + brightness);
        int g = clamp((int)input[i + 1] + brightness);
        int b = clamp((int)input[i + 2] + brightness);

        // if brightness has set the color to white, the other adjustments
        // will all be no-ops and can be skipped
        if (r != 255 || g != 255 || b != 255) {
            // a saturation adjust or 0 or adjustment of a shade of gray is a
            // no-op and can be skipped
            if (saturation != 0.0 && (r != g || g != b || r != b)) {
                // normalize RGB values
                double r1 = r / 255.0;
                double g1 = g / 255.0;
                double b1 = b / 255.0;

                // convert to HSV space
                const double value = fmax(r1, fmax(g1, b1));
                double chroma = value - fmin(r1, fmin(g1, b1));

                double hue = 60.0;
                if (chroma == 0.0) {
                    hue = 0.0;
                } else if (value == r1) {
                    hue *= (g1 - b1) / chroma;
                } else if (value == g1) {
                    hue *= 2.0 + ((b1 - r1) / chroma);
                } else {
                    hue *= 4.0 + ((r1 - g1) / chroma);
                }

                // apply saturation adjustment
                double s1 = fmax(0.0, fmin(1.0,
                    (value == 0.0 ? 0.0 : chroma / value) + saturation));

                chroma = value * s1;
                const double hPrime = hue / 60;
                const double x = chroma * (1 - fabs(fmod(hPrime, 2) - 1));

                if (hPrime <= 1) {
                    r1 = chroma;
                    g1 = x;
                    b1 = 0;
                } else if (hPrime <= 2) {
                    r1 = x;
                    g1 = chroma;
                    b1 = 0;
                } else if (hPrime <= 3) {
                    r1 = 0;
                    g1 = chroma;
                    b1 = x;
                } else if (hPrime <= 4) {
                    r1 = 0;
                    g1 = x;
                    b1 = chroma;
                } else if (hPrime <= 5) {
                    r1 = x;
                    g1 = 0;
                    b1 = chroma;
                } else {
                    r1 = chroma;
                    g1 = 0;
                    b1 = x;
                }

                const double m = value - chroma;
                r = round(255.0 * (r1 + m));
                g = round(255.0 * (g1 + m));
                b = round(255.0 * (b1 + m));
            }

            // contrast adjustment
            if (contrast != 0) {
                r = clamp((factor * (r - 128)) + 128);
                g = clamp((factor * (g - 128)) + 128);
                b = clamp((factor * (b - 128)) + 128);
            }
        }

        // write modified colors
        input[i] = r;
        input[i + 1] = g;
        input[i + 2] = b;
    }
}
