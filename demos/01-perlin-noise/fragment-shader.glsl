uniform vec2 u_resolution;
uniform float u_timeSec;
uniform float u_gridSize;
uniform float u_animFreq;

#define PI2 (3.14 * 2.0)

float interpolate(float v1, float v2, float mix) {
    // https://en.wikipedia.org/wiki/Cubic_Hermite_spline
    return v1 + (v2 - v1) * (3.0 - mix * 2.0) * mix * mix;
}

vec2 gridVec(float x, float y) {
    float i = cos(x + cos(y)) + u_timeSec * u_animFreq * PI2;
    return vec2(cos(i), sin(i));
}

float dotProdDiff(vec2 grid, vec2 p) {
    vec2 gradient = gridVec(grid.x, grid.y);
    vec2 delta = p - grid;
    return dot(gradient, delta);
}

void main() {
    // Get sample point coordinates
    float scale = 1.0 / (min(u_resolution.x, u_resolution.y) * u_gridSize);
    vec2 point = vec2(
        gl_FragCoord.x * scale,
        gl_FragCoord.y * scale
    );

    // Get coordinates of surrounding grid points
    float ix = float(int(point.x));
    float iy = float(int(point.y));
    vec2 gridBl = vec2(ix, iy);
    vec2 gridBr = vec2(ix + 1.0, iy);
    vec2 gridTl = vec2(ix, iy + 1.0);
    vec2 gridTr = vec2(ix + 1.0, iy + 1.0);

    // Interpolate gradient dot products
    float dx = point.x - ix;
    float dy = point.y - iy;

    float valueBottom = interpolate(
         dotProdDiff(gridBl, point),
         dotProdDiff(gridBr, point),
         dx
     );
    float valueTop = interpolate(
         dotProdDiff(gridTl, point),
         dotProdDiff(gridTr, point),
         dx
    );
    float value = interpolate(valueBottom, valueTop, dy);

    // Amplify values
    value = clamp(value * 2.5, -1.0, 1.0);

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
