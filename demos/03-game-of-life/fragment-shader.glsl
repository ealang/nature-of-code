uniform uint u_iteration;
uniform vec2 u_resolution;
uniform float u_timeSec;
uniform sampler2D u_buffer;
uniform sampler2D u_textureSeed;

bool initialState(vec2 point) {
    vec2 uv = mod(point / float(TEXTURE_RES), 1.0);
    return texture(u_textureSeed, uv).r > 0.5;
}

bool readState(vec2 point) {
    vec2 uv = mod(point / u_resolution, 1.0);
    return texture(u_buffer, uv).r > 0.5;
}

vec4 encodeValue(bool value) {
    if (value) {
        return vec4(1.0, 1.0, 1.0, 1.0);
    }
    return vec4(0.0, 0.0, 0.0, 0.0);
}

bool nextState(vec2 point) {
    int count = 0;
    for (int x = -1; x <= 1; ++x) {
        for (int y = -1; y <= 1; ++y) {
            if (x != 0 || y != 0) {
                if (readState(point + vec2(x, y))) {
                    ++count;
                }
            }
        }
    }

    if (count < 2) {
        return false;
    }
    if (count > 3) {
        return false;
    }

    bool curState = readState(point);
    if (!curState && count == 3) {
        return true;
    }

    return curState;
}

void main() {
    vec2 point = vec2(gl_FragCoord);

    bool state;
    if (u_iteration == 0u) {
        state = initialState(point);
    } else {
        state = nextState(point);
    }

    gl_FragColor = encodeValue(state);
}
