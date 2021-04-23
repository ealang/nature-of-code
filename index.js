import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

const size = Math.min(window.innerWidth, window.innerHeight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(size, size);
document.body.appendChild(renderer.domElement);

function makeCamera() {
  const camera = new THREE.OrthographicCamera(-size/2, size/2, size/2, -size/2, 1, 10);
  camera.rotation.z = Math.PI;
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  return camera;
}

function makePlane(shaderMaterial) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    shaderMaterial,
  );
}

function vertexShader() {
  return `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);
    }
  `;
}

function fragmentShader() {
  return `
    void main() {
      gl_FragColor = vec4(0.0, 0.58, 0.86, 1.0);
    }
  `;
}

const camera = makeCamera();

const shaderMaterial = new THREE.ShaderMaterial( {
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
});
const plane = makePlane(shaderMaterial);

const scene = new THREE.Scene();
scene.add(camera);
scene.add(plane);

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();