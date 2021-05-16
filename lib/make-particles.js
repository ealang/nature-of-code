import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

export default function makeParticles({
  fragmentShader,
  vertexShader,
  bufferWidth,
  bufferHeight,
  uniforms = {},
  defines = {},
  blending = THREE.AdditiveBlending,
}) {

  const shaderMaterial = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms,
    defines,
    blending,
  });

  const vertices = new Float32Array(bufferWidth * bufferHeight * 3);
  var i = 0;
  for (var y = 0; y < bufferHeight; ++y) {
    for (var x = 0; x < bufferWidth; ++x) {
      vertices[i++] = x / bufferWidth;
      vertices[i++] = y / bufferHeight;
      ++i;
    }
  }

  const bufferGeometry = new THREE.BufferGeometry();
  bufferGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(vertices, 3),
  );

  const points = new THREE.Points(bufferGeometry, shaderMaterial);

  return {
    shaderMaterial,
    points,
  };
}
