import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {canvasSize, attachRenderer} from './utils.js';
import {OrbitControls} from './three-orbit-controls.js';
import frameBuffer from './frame-buffer.js';

export default function particleSetup({
  fragmentShader,
  vertexShader,
  bufferWidth,
  bufferHeight,
  uniforms = {},
  defines = {},
  orbitControls = false,
} = {}) {

  const [width, height] = canvasSize();

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  attachRenderer(renderer);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.rotation.z = Math.PI;
  camera.position.set(0, 0, 2);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  scene.add(camera);

  var controls;
  if (orbitControls) {
    controls = new OrbitControls(camera, renderer.domElement);
  }

  const shaderMaterial = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms: {
      u_resolution: { value: [width, height] },
      ...uniforms,
    },
    defines,
    blending:THREE.AdditiveBlending,
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
  scene.add(points);

  return {
    renderer,
    shaderMaterial,
    render: () => {
      if (orbitControls) {
        controls.update();
      }
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    },
    camera,
    points,
  };
}
