uniform int u_iteration;
uniform vec2 u_resolution;
uniform float u_timeSec;
uniform float u_timeDeltaSec;
uniform sampler2D u_buffer;

#define PI 3.14

struct Body {
  vec2 position;
  float mass;
  float radius;
};

uniform Body u_bodies[NUM_BODIES];

float rand(vec2 point){
    // https://thebookofshaders.com/10/
    return fract(sin(dot(point.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 initialState(vec2 point) {
    float a = atan(point.y - 0.5, point.x - 0.5);
    float r = rand(point) * .3;
    float vx = cos(a + PI / 2.) * 0.1;
    float vy = sin(a + PI / 2.) * 0.1;
    return vec4(vec2(cos(a), sin(a)) * r, vx, vy);
}

vec4 readState(vec2 point) {
    return texture2D(u_buffer, point);
}

void main() {
    vec2 point = vec2(gl_FragCoord) / u_resolution;
    vec4 state = u_iteration == 0 ?
        initialState(point) :
        readState(point);

    vec2 pos = state.rg;
    vec2 vel = state.ba;

    vec2 forces = vec2(0., 0.);
    for (int i = 0; i < NUM_BODIES; ++i) {
        Body body = u_bodies[i];
        vec2 delta = body.position - pos;
        float dist = length(delta);
        if (dist > body.radius) {
            vec2 force = float(GRAVITY) * body.mass / (dist * dist * dist) * delta;
            forces += force;
        }
    }

    vel += forces * u_timeDeltaSec;
    if (length(vel) > float(MAX_VELOCITY)) {
        vel = vel / length(vel) * float(MAX_VELOCITY);
    }

    pos += vel * u_timeDeltaSec;

    gl_FragColor = vec4(pos, vel);
}
