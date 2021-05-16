uniform sampler2D u_buffer;

void main() {
    vec2 pos = texture2D(u_buffer, position.xy).xy;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0., 1.0);
    gl_PointSize = 1.0;
}

