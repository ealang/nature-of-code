import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {makeCamera, makePlane, fetchNoCache, canvasSize, attachRenderer} from './utils.js';

export default async function feedbackFragmentSetup(fragmentShaderPath, {uniforms = {}, onUpdate = null, defines = {}, renderDelayMs = 0} = {}) {
  const [width, height] = canvasSize();

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  attachRenderer(renderer);

  const opts = {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  };
  const renderTargets = [
    new THREE.WebGLRenderTarget(width, height, opts),
    new THREE.WebGLRenderTarget(width, height, opts),
  ];

  const canvasScene = new THREE.Scene();
  const bufferScene = new THREE.Scene();

  const canvasCamera = makeCamera(width, height);
  const bufferCamera = makeCamera(width, height);

  canvasScene.add(canvasCamera);
  bufferScene.add(bufferCamera);

  const canvasMaterial = new THREE.MeshBasicMaterial();

  const fragmentShader = await fetchNoCache(fragmentShaderPath);
  const bufferShaderMaterial = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms: {
      u_resolution: { value: [width, height] },
      u_timeSec: { value: 0 },
      u_iteration: { value: 0},
      u_buffer: { value: null},
      ...uniforms,
    },
    defines,
  });
  canvasScene.add(makePlane(width, height, canvasMaterial));
  bufferScene.add(makePlane(width, height, bufferShaderMaterial));

  const startTime = new Date();

  var iteration = 0;

  function render() {
    const curTime = (new Date() - startTime) / 1000.0;

    bufferShaderMaterial.uniforms.u_timeSec.value = curTime;
    bufferShaderMaterial.uniforms.u_iteration.value = iteration++;
    if (onUpdate) {
      onUpdate(curTime, bufferShaderMaterial.uniforms);
    }

    const readTarget = renderTargets[iteration % 2];
    const writeTarget = renderTargets[(iteration + 1) % 2];

    // render to texture
    bufferShaderMaterial.uniforms.u_buffer.value = readTarget.texture;
    renderer.setRenderTarget(writeTarget);
    renderer.render(bufferScene, bufferCamera);

    // render to canvas
    canvasMaterial.map = writeTarget.texture;
    renderer.setRenderTarget(null);
    renderer.render(canvasScene, canvasCamera);

    setTimeout(() => {
      requestAnimationFrame(render);
    }, renderDelayMs);
  }

  render();
}
