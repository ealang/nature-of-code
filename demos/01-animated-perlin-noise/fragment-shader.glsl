#define PI2 6.283
#define E 2.71828

uniform vec2 u_resolution;
uniform float u_gridSize;
uniform float u_timeSec;
uniform float u_animFreqHz;

float _tanh(float x) {
    float e2x = pow(E, 2.0 * x);
    return (e2x - 1.0) / (e2x + 1.0);
}

float interpolate(float v1, float v2, float mix) {
    // https://en.wikipedia.org/wiki/Cubic_Hermite_spline
    return v1 + (v2 - v1) * (3.0 - mix * 2.0) * mix * mix;
}

float rand(vec2 point){
    // https://thebookofshaders.com/10/
    return fract(sin(dot(point.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float gradientDot(vec2 gridPt, vec2 samplePt) {
    float angle = (rand(gridPt) + u_timeSec * u_animFreqHz) * PI2;
    vec2 gradient = vec2(cos(angle), sin(angle));

    vec2 delta = samplePt - gridPt;
    return dot(gradient, delta);
}

void main() {
    // Get sample point coordinates
    float scale = 1.0 / (max(u_resolution.x, u_resolution.y) * u_gridSize);
    vec2 point = vec2(
        gl_FragCoord.x * scale,
        gl_FragCoord.y * scale
    );

    // Find grid cell
    int ix = int(point.x);
    int iy = int(point.y);

    // Get coordinates of surrounding grid points
    vec2 gridBl = vec2(float(ix), float(iy));
    vec2 gridBr = gridBl + vec2(1.0, 0.0);
    vec2 gridTl = gridBl + vec2(0.0, 1.0);
    vec2 gridTr = gridTl + vec2(1.0, 0.0);

    // Interpolate gradient dot products
    float dx = point.x - gridBl.x;
    float dy = point.y - gridBl.y;

    float valueBottom = interpolate(
         gradientDot(gridBl, point),
         gradientDot(gridBr, point),
         dx
     );
    float valueTop = interpolate(
         gradientDot(gridTl, point),
         gradientDot(gridTr, point),
         dx
    );
    float value = interpolate(valueBottom, valueTop, dy);

    // Amplify values
    value = _tanh(value * 2.8);

    // Compute color
    float r = 0.0;
    float g = 0.0;
    float b = 0.0;
    if (value >= 0.0) {
        b = value;
    } else {
        r = abs(value);
    }
    g = (r + b) / 2.0;

    gl_FragColor = vec4(r, g, b, 1.0);
}
