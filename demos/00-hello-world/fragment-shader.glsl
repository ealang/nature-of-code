uniform vec2 u_resolution;
uniform float u_timeSec;

void main() {
    vec2 uv = vec2(gl_FragCoord) / u_resolution;

    float r = cos(u_timeSec * 3.14 * 0.5) * 0.5 + 0.5;
    float g = uv.x;
    float b = uv.y;

    gl_FragColor = vec4(r, g, b, 1.0);
}
