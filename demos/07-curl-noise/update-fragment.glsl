uniform sampler2D u_buffer;
uniform vec2 u_resolution;  // buffer resolution

uniform vec2 u_cameraView;

uniform float u_perlinScale;
uniform float u_perlinChangeRate;
uniform vec2 u_fixedVelocity;
uniform float u_curlVelocityScale;

uniform float u_timeDeltaSec;
uniform float u_timeSec;
uniform bool u_firstRender;

float interpolate(float v1, float v2, float mix) {
    // https://en.wikipedia.org/wiki/Cubic_Hermite_spline
    return v1 + (v2 - v1) * (3.0 - mix * 2.0) * mix * mix;
}

float rand(vec2 point){
    // https://thebookofshaders.com/10/
    return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 gradient(vec3 point) {
    float i = point.x + point.y + point.z;
    vec3 g = vec3(
        rand(point.xy + i) * 2. - 1.,
        rand(point.yz + i) * 2. - 1.,
        rand(point.zx + i) * 2. - 1.
    );
    return g / length(g);
}

float gradientDot(vec3 gridPt, vec3 samplePt) {
    vec3 delta = samplePt - gridPt;
    return dot(gradient(gridPt), delta);
}

float perlin(vec3 point) {
    // Find grid cell
    int ix = int(point.x);
    int iy = int(point.y);
    int iz = int(point.z);

    // Get coordinates of surrounding grid points
    vec3 gridBl = vec3(float(ix), float(iy), float(iz));
    vec3 gridBr = gridBl + vec3(1., 0., 0.);
    vec3 gridTl = gridBl + vec3(0., 1., 0.);
    vec3 gridTr = gridTl + vec3(1., 0., 0.);
    vec3 up = vec3(0., 0., 1.);

    // Interpolate gradient dot products
    float dx = point.x - gridBl.x;
    float dy = point.y - gridBl.y;
    float dz = point.z - gridBl.z;

    return interpolate(
        interpolate(
            interpolate(
                 gradientDot(gridBl, point),
                 gradientDot(gridBr, point),
                 dx
            ),
            interpolate(
                 gradientDot(gridTl, point),
                 gradientDot(gridTr, point),
                 dx
            ),
            dy
        ),
        interpolate(
            interpolate(
                 gradientDot(gridBl + up, point),
                 gradientDot(gridBr + up, point),
                 dx
            ),
            interpolate(
                 gradientDot(gridTl + up, point),
                 gradientDot(gridTr + up, point),
                 dx
            ),
            dy
        ),
        dz
    );
}

vec2 initialPos(vec2 dataLoc) {
    return dataLoc * u_cameraView;
}

vec2 bufferPos(vec2 dataLoc) {
    return texture2D(u_buffer, dataLoc).xy;
}

void main() {
    vec2 dataLoc = vec2(gl_FragCoord) / u_resolution;
    vec2 pos = u_firstRender ?
        initialPos(dataLoc) :
        bufferPos(dataLoc);

    vec3 pos3 = vec3(
        pos / u_perlinScale,
        u_timeSec * u_perlinChangeRate
    );

    float step = 0.001;
    float value = perlin(pos3);
    vec2 curl = vec2(
        (perlin(pos3 + vec3(0., step, 0.)) - value) / step,
        -(perlin(pos3 + vec3(step, 0., 0.)) - value) / step
    );

    pos += (u_fixedVelocity + u_curlVelocityScale * curl) * u_timeDeltaSec;
    pos = vec2(
       mod(pos.x, u_cameraView.x),
       mod(pos.y, u_cameraView.y)
    );

    gl_FragColor = vec4(pos, 0., 0.);
}
