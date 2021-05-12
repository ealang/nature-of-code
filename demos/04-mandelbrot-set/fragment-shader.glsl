uniform vec2 u_resolution;
uniform float u_timeSec;
uniform vec2 u_viewStart;
uniform vec2 u_viewSize;

#define ITERATIONS 100
#define MAX_VAL 2.0

int compute(vec2 point) {
    float real = 0.0;
    float complex = 0.0;
    for (int i = 0; i < ITERATIONS; ++i) {
        float real2 = real * real;
        float complex2 = complex * complex;

        float newReal = real2 - complex2 + point.x;
        float newComplex = 2.0 * real * complex + point.y;

        real = newReal;
        complex = newComplex;

        if (real2 + complex2 > MAX_VAL) {
            return i;
        }
    }

    return ITERATIONS;
}

void main() {
    vec2 samplePt = vec2(gl_FragCoord) / u_resolution * u_viewSize + u_viewStart;
    float v = float(compute(samplePt)) / float(ITERATIONS);

    gl_FragColor = vec4(v, v, v, 1.0);
}
