uniform vec2 u_resolution;
uniform sampler2D u_texture;

void main() {
    vec2 point = vec2(gl_FragCoord) / u_resolution;
    gl_FragColor = texture2D(u_texture, point);
}
