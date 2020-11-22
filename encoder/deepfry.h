int compress(const unsigned char *input, int width, int height,
    unsigned char **output, unsigned long *output_size, char const **error);

void adjust(unsigned char *input, unsigned long pixels,
    double saturation, int brightness, int contrast);