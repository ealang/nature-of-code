uniform vec2 u_resolution;
uniform float u_timeSec;
uniform sampler2D u_texture;

void main() {
    vec2 uv = vec2(gl_FragCoord) / u_resolution;
    lowp vec4 tex = texture2D(u_texture, uv);

    float r = cos(u_timeSec * 3.14 * 0.5) * 0.5 + 0.5;
    float g = uv.y;
    float b = tex.b;

    gl_FragColor = vec4(r, g, b, 1.0);
}
