uniform vec2 u_resolution;
uniform float u_timeSec;
uniform float u_gravity;
uniform int u_numContourLines;
uniform float u_contourWidth;
uniform float u_contourForceCutoff;
uniform float u_colorScale;

struct Body {
  vec2 position;
  float radius;
  float mass;
};

uniform Body u_bodies[NUM_BODIES];

float _tanh(float x) {
    #define e 2.71828
    float e2x = pow(e, 2.0 * x);
    return (e2x - 1.0) / (e2x + 1.0);
}

// Get force vector applied to object 1
vec2 gravAttraction(vec2 pos1, float mass1, vec2 pos2, float mass2) {
    vec2 diff = pos2 - pos1;
    float distSq = dot(diff, diff);
    vec2 dir = diff / sqrt(distSq);

    return mass1 * mass2 * u_gravity / distSq * dir;
}

float forceAt(vec2 pos) {
    vec2 force = vec2(0.0, 0.0);
    for (int i = 0; i < NUM_BODIES; ++i) {
        Body body = u_bodies[i];
        vec2 forcePart = gravAttraction(pos, 1.0, body.position, body.mass);
        force += forcePart;
    }

    return length(force);
}

float forceGradientAt(vec2 pos) {
    vec2 gradient = vec2(0.0, 0.0);

    for (int i = 0; i < NUM_BODIES; ++i) {
        Body body = u_bodies[i];

        vec2 delta = body.position - pos;
        float dist = length(delta);
        float dist4 = dist * dist * dist * dist;

        vec2 gradientPart = 2.0 * u_gravity * body.mass / dist4 * vec2(
            delta.x,
            delta.y
        );

        gradient += gradientPart;
    }

    return length(gradient);
}

vec4 colorForce(float force, float forceGradient) {
    // Contour lines
    if (force < u_contourForceCutoff) {
        float lineWidth = u_contourWidth;
        float lineHeight = forceGradient * lineWidth;

        float bandHeight = u_contourForceCutoff / float(u_numContourLines);
        float sampleOffset = mod(force, bandHeight);

        if (sampleOffset > bandHeight - lineHeight) {
            return vec4(0.0, 0.0, 0.0, 1.0);
        }
    }

    float color = _tanh(force * u_colorScale);
    return vec4(color, color, color, 1.0);
}

void main() {
    vec2 uv = vec2(gl_FragCoord) / u_resolution;
    
    // Check for overlap with any bodies
    for (int i = 0; i < NUM_BODIES; ++i) {
        if (distance(uv, u_bodies[i].position) <= u_bodies[i].radius) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            return;
        }
    }

    float force = forceAt(uv);
    float forceGradient = forceGradientAt(uv);
    gl_FragColor = colorForce(force, forceGradient);
}

