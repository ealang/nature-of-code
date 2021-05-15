uniform sampler2D u_buffer;

varying vec4 v_color;

void main() {
    vec4 state = texture2D(u_buffer, position.xy);

    float s = length(state.ba) / MAX_VELOCITY;
    v_color = vec4(
        s * 2.,
        2. * s * s * s,
        (1.0 - s) * (1.0 - s) * (1.0 - s),
        0.5
    );

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vec2(state), 0., 1.0);
    gl_PointSize = 1.0;
}

