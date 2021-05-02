import basicFragmentSetup from '../../lib/basic-fragment-setup.js';

const GRAVITY = 0.0001;
const DEFAULT_DENSITY = 20;

function circleMass(radius, density) {
  return Math.PI * radius * radius * density;
}

function body({x, y, radius, vx = 0, vy = 0, density = DEFAULT_DENSITY}) {
  var ax = 0, ay = 0;
  const mass = circleMass(radius, density);

  const addForce = ({x: dx, y: dy}) => {
    ax += dx / mass;
    ay += dy / mass;
  };
  const pos = () => ({x, y});
  const bake = (dt) => {
    vx += ax;
    vy += ay;
    x += vx * dt;
    y += vy * dt;
    ax = 0;
    ay = 0;
  };

  return {
    addForce,
    pos,
    bake,
    mass,
    radius,
    density,
  }
};

function distance(pos1, pos2) {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Direction from 1 to 2
function unitDirection(pos1, pos2) {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  const dist = distance(pos1, pos2);
  const x = dx / dist;
  const y = dy / dist;
  return {x, y};
}

// Get force vector applied to body 1
function gravAttraction(body1, body2) {
  const pos1 = body1.pos();
  const pos2 = body2.pos();
  const dist = distance(pos1, pos2);
  const force = GRAVITY * body1.mass * body2.mass / (dist * dist);
  const dir = unitDirection(pos1, pos2)
  return {
    x: force * dir.x,
    y: force * dir.y,
  };
}

function multiplyVector({x, y}, val) {
  x *= val;
  y *= val;
  return {x, y};
}

function bodyToUniform(body) {
  const {x, y} = body.pos();
  return {
    position: [x, y],
    radius: body.radius,
    mass: body.mass,
  };
}
 
var lastTime = null;
function onUpdate(time, uniforms) {
  if (lastTime) {
    const dt = time - lastTime;

    // Add forces between all pairs
    for (var i = 0; i < bodies.length - 1; ++i) {
      const body1 = bodies[i];
      for (var j = i + 1; j < bodies.length; ++j) {
        const body2 = bodies[j];
        const dist = distance(body1.pos(), body2.pos());
        if (dist >= body1.radius + body2.radius) {
          const force12 = gravAttraction(body1, body2);
          body1.addForce(force12);
          body2.addForce(multiplyVector(force12, -1));
        }
      }
    }

    for (const body of bodies) {
      body.bake(dt);
    }
  }
  uniforms.u_bodies.value = bodies.map(bodyToUniform);  // TODO: optimize
  lastTime = time;
}

// Screen scaling
const resolutionX = window.innerWidth;
const resolutionY = window.innerHeight;
const resolution = Math.min(resolutionX, resolutionY);
const sizeX = resolutionX / resolution;
const sizeY = resolutionY / resolution;

// Add random bodies
const bodies = [];
for (var i = 0; i < 20; ++i) {
  const radius = Math.random() < 0.5 ? 
    Math.random() * 0.1 :
    Math.random() * 0.02;

  bodies.push(
    body({
      x: Math.random() * sizeX,
      y: Math.random() * sizeY,
      radius,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
    })
  );
}

const fragValue = value => ({value});

basicFragmentSetup(
  'demos/02-gravity/fragment-shader.glsl',
  {
    u_bodies: fragValue(bodies.map(bodyToUniform)),
    u_gravity: fragValue(5),
    u_colorScale: fragValue(0.005),
    u_numBodies: fragValue(bodies.length),
    u_numContourLines: fragValue(5),
    u_contourForceCutoff: fragValue(300),
    u_contourWidth: fragValue(0.005),
    u_resolution: fragValue([resolution, resolution]),
  },
  onUpdate,
);
