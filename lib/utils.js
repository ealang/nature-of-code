import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

export function makeCamera(width, height) {
  const camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 1, 10);
  camera.rotation.z = Math.PI;
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
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

export async function fetchNoCache(path) {
  const noCache = {
    headers: { 'Cache-Control': 'no-cache' },
  };
  return await fetch(path, noCache).then(response => response.text());
}
