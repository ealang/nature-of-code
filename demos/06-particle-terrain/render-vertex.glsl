uniform sampler2D u_heightMap;

void main() {
    vec4 state = texture2D(u_heightMap, position.xy);

    gl_Position = projectionMatrix * modelViewMatrix * vec4((position.xy - 0.5) * 1.4, state.r * 0.25, 1.0);
    gl_PointSize = 2.0;
}

