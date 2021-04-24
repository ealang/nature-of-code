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

function loadTexture(path) {
  const loader = new THREE.TextureLoader();
  return loader.load(path);
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

  const texture = loadTexture('bayer.png');

  const shaderMaterial = new THREE.ShaderMaterial( {
    vertexShader,
    fragmentShader,
    uniforms: {
      u_resolution: { value: [width, height] },
      u_timeMs: { value: 0 },
      u_texture: { value: texture },
    },
  });
  const plane = makePlane(width, height, shaderMaterial);
  scene.add(plane);

  const startTime = new Date();

  function render() {
    shaderMaterial.uniforms.u_timeMs.value = new Date() - startTime;

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render();
});
