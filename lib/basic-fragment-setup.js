import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {makeCamera, makePlane, fetchNoCache, canvasSize, attachRenderer} from './utils.js';

export default async function basicFragmentSetup(fragmentShaderPath, {uniforms = {}, onUpdate = null, defines = {}} = {}) {
  const fragmentShader = await fetchNoCache(fragmentShaderPath);

  const [width, height] = canvasSize();

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  attachRenderer(renderer);

  const scene = new THREE.Scene();

  const camera = makeCamera(width, height);
  scene.add(camera);

  const shaderMaterial = new THREE.ShaderMaterial( {
    fragmentShader,
    uniforms: {
      u_resolution: { value: [width, height] },
      u_timeSec: { value: 0 },
      ...uniforms,
    },
    defines,
  });
  const plane = makePlane(width, height, shaderMaterial);
  scene.add(plane);

  const startTime = new Date();

  function render() {
    const curTime = (new Date() - startTime) / 1000.0;
    shaderMaterial.uniforms.u_timeSec.value = curTime;
    if (onUpdate) {
      onUpdate(curTime, shaderMaterial.uniforms);
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render();
}
