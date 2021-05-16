import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {makeOrthoCamera, attachRenderer, fetchText, canvasSize} from '../../lib/utils.js';
import frameBuffer from '../../lib/frame-buffer.js';
import makeParticles from '../../lib/make-particles.js';

(async () => {
  const num_bodies = 4;
  const textureSize = 512;
  const max_velocity = 0.4;

  const [width, height] = canvasSize();

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  attachRenderer(renderer);

  const camera = makeOrthoCamera(width/height * 2, 2.);

  const fb = frameBuffer({
    fragmentShader: await fetchText("demos/05-gravity-particles/update-fragment.glsl"),
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    width: textureSize,
    height: textureSize,
    uniforms: {
      u_timeDeltaSec: { value: 0 },
      u_iteration: { value: 0 },
      u_bodies: {
        value: [...new Array(num_bodies)].map(_ => {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * .7;
          return {
            position: [Math.cos(angle) * r, Math.sin(angle) * r],
            mass: 1,
            radius: 0.1,
          };
        }),
      },
    },
    defines: {
      NUM_BODIES: num_bodies,
      GRAVITY: 0.002,
      MAX_VELOCITY: max_velocity,
    },
  });

  const particles = makeParticles({
    fragmentShader: await fetchText("demos/05-gravity-particles/render-fragment.glsl"),
    vertexShader: await fetchText("demos/05-gravity-particles/render-vertex.glsl"),
    bufferWidth: textureSize,
    bufferHeight: textureSize,
    uniforms: {
      u_buffer: { value: null },
    },
    defines: {
      MAX_VELOCITY: max_velocity,
    },
  });

  const scene = new THREE.Scene();
  scene.add(camera);
  scene.add(particles.points);

  var lastTime = new Date();
  var iteration = 0;

  const render = () => {
    const curTime = new Date();
    const deltaTime = (curTime - lastTime) / 1000;
    lastTime = curTime;

    // update particle position
    fb.shaderMaterial.uniforms.u_timeDeltaSec.value = deltaTime;
    fb.shaderMaterial.uniforms.u_iteration.value = iteration++;
    const particleState = fb.render(renderer);

    // render particles
    particles.shaderMaterial.uniforms.u_buffer.value = particleState;
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
})();
