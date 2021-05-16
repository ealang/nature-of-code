import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

export function makeOrthoCamera(width, height, {x=0, y=0, z=5} = {}) {
  const camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 1, 1000);
  camera.rotation.z = Math.PI;
  camera.position.set(x, y, z);
  camera.lookAt(x, y, 0);
  camera.updateProjectionMatrix();
  return camera;
}

export function makePlane(width, height, shaderMaterial) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    shaderMaterial,
  );
}

export function canvasSize() {
  return [
    window.innerWidth,
    window.innerHeight,
  ];
}

export function attachRenderer(renderer) {
  document.body.appendChild(renderer.domElement);
}

export async function fetchText(path) {
  return await fetch(path).then(response => response.text());
}
