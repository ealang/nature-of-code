uniform sampler2D u_buffer;
uniform float u_pointSize;

void main() {
    vec2 pos = texture2D(u_buffer, position.xy).xy;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0., 1.0);
    gl_PointSize = u_pointSize;
}

