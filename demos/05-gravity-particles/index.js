import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {fetchText} from '../../lib/utils.js';
import frameBuffer from '../../lib/frame-buffer.js';
import particleSetup from '../../lib/particle-setup.js';

(async () => {
  const num_bodies = 4;
  const textureSize = 512;
  const max_velocity = 0.4;
  const fb = frameBuffer(
    await fetchText("demos/05-gravity-particles/update-fragment.glsl"),
    {
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
    },
  );

  const setup = particleSetup({
    fragmentShader: await fetchText("demos/05-gravity-particles/render-fragment.glsl"),
    vertexShader: await fetchText("demos/05-gravity-particles/render-vertex.glsl"),
    bufferWidth: textureSize,
    bufferHeight: textureSize,
    uniforms: {
      u_buffer: { value: null }
    },
    defines: {
      MAX_VELOCITY: max_velocity,
    },
  });

  const startTime = new Date();
  var lastTime = 0;
  var iteration = 0;

  const render = () => {
    const curTime = (new Date() - startTime) / 1000.0;
    const deltaTime = curTime - lastTime;
    lastTime = curTime;

    // update particle position
    fb.shaderMaterial.uniforms.u_timeDeltaSec.value = deltaTime;
    fb.shaderMaterial.uniforms.u_iteration.value = iteration++;
    const particleState = fb.render(setup.renderer);

    // render particles
    setup.shaderMaterial.uniforms.u_buffer.value = particleState;
    setup.render()

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
})();
