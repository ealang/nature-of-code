import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

function makeCamera(width, height) {
  const camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 1, 10);
  camera.rotation.z = Math.PI;
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  return camera;
}

function makePlane(width, height, shaderMaterial) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
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
  console.log(fragmentShader)
  console.log(vertexShader);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = makeCamera(width, height);
  scene.add(camera);

  const shaderMaterial = new THREE.ShaderMaterial( {
      vertexShader,
      fragmentShader,
      uniforms: {
        resolution: { value: [width, height] },
        timeMs: { value: 0 },
      },
  });
  const plane = makePlane(width, height, shaderMaterial);
  scene.add(plane);

  const startTime = new Date();

  function render() {
    shaderMaterial.uniforms.timeMs.value = new Date() - startTime;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render();
});
