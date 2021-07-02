import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import frameBuffer from '../../lib/frame-buffer.js';
import makeParticles from '../../lib/make-particles.js';
import {fetchText, canvasSize, makeOrthoCamera, attachRenderer} from '../../lib/utils.js';

(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const particleFBSize = urlParams.get("buffer") || 512;
  const particleAlpha = urlParams.get("alpha") || 0.5;
  const particleSize = urlParams.get("size") || 1;

  const [width, height] = canvasSize();
  const viewSize = Math.max(width, height);
  const viewWidth = width / viewSize;
  const viewHeight = height / viewSize;

  const fbUniforms = {
    u_perlinScale: { value: 0.1 },
    u_perlinChangeRate: { value: 0.1 },
    u_timeDeltaSec: { value: 0 },
    u_timeSec: { value: 0 },
    u_firstRender: { value: true },
    u_cameraView: { value: [viewWidth, viewHeight] },
    u_fixedVelocity: { value: [0, 0.03] },
    u_curlVelocityScale: { value: 0.05 },
  };

  /*
  // for viewing perlin noise
  basicFragmentSetup(
    await fetchText('demos/07-curl-noise/update-fragment.glsl'),
    {
      uniforms: fbUniforms,
    },
  );
  return;
  */

  const fb = frameBuffer({
    fragmentShader: await fetchText("demos/07-curl-noise/update-fragment.glsl"),
    type: THREE.FloatType,
    width: particleFBSize,
    height: particleFBSize,
    uniforms: fbUniforms,
    defines: {},
  });

  const particles = makeParticles({
    fragmentShader: await fetchText("demos/07-curl-noise/render-fragment.glsl"),
    vertexShader: await fetchText("demos/07-curl-noise/render-vertex.glsl"),
    bufferWidth: particleFBSize,
    bufferHeight: particleFBSize,
    uniforms: {
      u_buffer: { value: null },
      u_alpha: { value: particleAlpha },
      u_pointSize: { value: particleSize },
    },
    defines: {},
  });

  const camera = makeOrthoCamera(
    viewWidth,
    viewHeight,
    {x: viewWidth / 2, y: viewHeight / 2},
  );

  const scene = new THREE.Scene();
  scene.add(camera);
  scene.add(particles.points);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  attachRenderer(renderer);

  const startTime = new Date();
  var lastTime = 0;
  const render = () => {
    const curTime = (new Date() - startTime) / 1000;
    const deltaTime = curTime - lastTime;
    lastTime = curTime;

    // update particle position
    fb.shaderMaterial.uniforms.u_timeDeltaSec.value = deltaTime;
    fb.shaderMaterial.uniforms.u_timeSec.value = curTime;
    const particleState = fb.render(renderer);
    fb.shaderMaterial.uniforms.u_firstRender.value = false;

    // render particles
    particles.shaderMaterial.uniforms.u_buffer.value = particleState;
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
})();
