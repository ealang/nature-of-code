import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

function makeCamera(size) {
  const camera = new THREE.OrthographicCamera(-size/2, size/2, size/2, -size/2, 1, 10);
  camera.rotation.z = Math.PI;
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  return camera;
}

function makePlane(size, shaderMaterial) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    shaderMaterial,
  );
}

const noCache = {
  headers: { 'Cache-Control': 'no-cache' },
};
const fragShaderPromise = fetch('fragment-shader.glsl', noCache)
  .then(response => response.text());
const vertexShaderPromise = fetch('vertex-shader.glsl', noCache)
  .then(response => response.text());

Promise.all([fragShaderPromise, vertexShaderPromise]).then(([fragmentShader, vertexShader]) => {
  console.log(fragmentShader);

  const size = Math.min(window.innerWidth, window.innerHeight);

  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(size, size);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = makeCamera(size);
  scene.add(camera);

  const shaderMaterial = new THREE.ShaderMaterial( {
      vertexShader,
      fragmentShader,
      uniforms: {
        size: { value: size },
        timeMs: { value: 0 },
      },
  });
  const plane = makePlane(size, shaderMaterial);
  scene.add(plane);

  const startTime = new Date();

  function render() {
    shaderMaterial.uniforms.timeMs.value = new Date() - startTime;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render();
});
