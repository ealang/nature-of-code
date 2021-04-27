uniform vec2 u_resolution;
uniform float u_gridSize;
uniform float u_gradients[128];

float interpolate(float v1, float v2, float mix) {
    // https://en.wikipedia.org/wiki/Cubic_Hermite_spline
    return v1 + (v2 - v1) * (3.0 - mix * 2.0) * mix * mix;
}

vec2 gridVecLookup(int i) {
    float angle = u_gradients[i % u_gradients.length()];
    return vec2(cos(angle), sin(angle));
}

float dotProdDiff(vec2 gridPt, vec2 samplePt, vec2 gradient) {
    vec2 delta = samplePt - gridPt;
    return dot(gradient, delta);
}

void main() {
    // Get sample point coordinates
    float scale = 1.0 / (min(u_resolution.x, u_resolution.y) * u_gridSize);
    vec2 point = vec2(
        gl_FragCoord.x * scale,
        gl_FragCoord.y * scale
    );

    // Find grid cell
    int width = int(ceil(u_resolution.x * scale));
    int ix = int(point.x);
    int iy = int(point.y);
    int i = ix + iy * width;

    // Get coordinates of surrounding grid points
    vec2 gridBl = vec2(float(ix), float(iy));
    vec2 gridBr = gridBl + vec2(1.0, 0.0);
    vec2 gridTl = gridBl + vec2(0.0, 1.0);
    vec2 gridTr = gridTl + vec2(1.0, 0.0);

    // Interpolate gradient dot products
    float dx = point.x - gridBl.x;
    float dy = point.y - gridBl.y;

    float valueBottom = interpolate(
         dotProdDiff(gridBl, point, gridVecLookup(i)),
         dotProdDiff(gridBr, point, gridVecLookup(i + 1)),
         dx
     );
    float valueTop = interpolate(
         dotProdDiff(gridTl, point, gridVecLookup(i + width)),
         dotProdDiff(gridTr, point, gridVecLookup(i + width + 1)),
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
