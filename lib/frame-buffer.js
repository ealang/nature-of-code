import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {makeOrthoCamera, makePlane} from './utils.js';

export default function frameBuffer({
  fragmentShader,
  width,
  height,
  uniforms = {},
  defines = {},
  format = THREE.RGBAFormat,
  type = THREE.UnsignedByteType,
}) {
  const opts = {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format,
    type,
  };
  const renderTargets = [
    new THREE.WebGLRenderTarget(width, height, opts),
    new THREE.WebGLRenderTarget(width, height, opts),
  ];

  const scene = new THREE.Scene();

  const camera = makeOrthoCamera(width, height);
  scene.add(camera);

  const shaderMaterial = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms: {
      u_resolution: { value: [width, height] },
      u_buffer: { value: null },
      ...uniforms,
    },
    defines,
  });

  scene.add(makePlane(width, height, shaderMaterial));

  var firstRender = true;
  var iteration = 0;

  function render(renderer) {
    const nextIteration = (iteration + 1) % 2;
    const readTarget = renderTargets[iteration];
    const writeTarget = renderTargets[nextIteration];

    if (!firstRender || !shaderMaterial.uniforms.u_buffer.value) {
      shaderMaterial.uniforms.u_buffer.value = readTarget.texture;
    }

    renderer.setRenderTarget(writeTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    iteration = nextIteration;
    firstRender = false;

    return writeTarget.texture;
  };

  return {
    render,
    shaderMaterial,
    nextBuffer: (buffer) => {
      firstRender = true;
      shaderMaterial.uniforms.u_buffer.value = buffer;
    },
  };
}
