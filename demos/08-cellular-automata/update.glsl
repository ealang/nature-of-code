uniform bool u_firstRender;
uniform vec2 u_resolution;
uniform sampler2D u_buffer;

int initialState(vec2 point) {
    if (length(point - u_resolution / 2.) < 20.) {
        return 1;
    }
    return 0;
}

int readState(vec2 point) {
    vec2 uv = point / u_resolution;
    return texture2D(u_buffer, uv).r > 0.5 ? 1 : 0;
}

vec4 encodeValue(int value) {
    if (value == 1) {
        return vec4(1.0, 1.0, 1.0, 1.0);
    }
    return vec4(0.0, 0.0, 0.0, 0.0);
}

int nextState(vec2 point) {
    int b1 = readState(point);
    int b2 = readState(point + vec2(1., 0.));
    int b3 = readState(point + vec2(0., 1.));
    int b4 = readState(point - vec2(1., 0.));
    int b5 = readState(point - vec2(0., 1.));

    int rule_num = -218373306;
    int lookup = b1 | (b2 << 1) | (b3 << 2) | (b4 << 3) | (b5 << 4);
    return (rule_num & (1 << lookup)) == 0 ? 0 : 1;
}

void main() {

    vec2 point = vec2(gl_FragCoord);

    int state;
    if (u_firstRender) {
        state = initialState(point);
    } else {
        state = nextState(point);
    }

    gl_FragColor = encodeValue(state);
}
