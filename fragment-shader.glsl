uniform vec2 resolution;
uniform float timeMs;

void main() {
    vec2 uv = vec2(gl_FragCoord) / resolution;
    float b = cos(timeMs/1000.0 * 3.14 * 0.5) * 0.5 + 0.5;
    gl_FragColor = vec4(uv.x, uv.y, b, 1.0);
}
