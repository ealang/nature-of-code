uniform float size;
uniform float timeMs;

void main() {
    vec4 uv = gl_FragCoord / size;
    float b = cos(timeMs/1000.0 * 3.14 * 0.5) * 0.5 + 0.5;
    gl_FragColor = vec4(uv.x, uv.y, b, 1.0);
}
