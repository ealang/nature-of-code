import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {attachRenderer, canvasSize, fetchText} from '../../lib/utils.js';
import makeParticles from '../../lib/make-particles.js';
import {OrbitControls} from '../../lib/three-orbit-controls.js';

const main = async (seedTexture) => {

  const [width, height] = canvasSize();
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  attachRenderer(renderer);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.rotation.z = Math.PI;
  camera.position.set(0, -1.5, 1.5);
  camera.lookAt(0, 0, 0);

  const orbit = new OrbitControls(camera, renderer.domElement);

  const size = 256;
  const particles = makeParticles({
    fragmentShader: await fetchText("demos/06-particle-terrain/render-fragment.glsl"),
    vertexShader: await fetchText("demos/06-particle-terrain/render-vertex.glsl"),
    bufferWidth: size,
    bufferHeight: size,
    uniforms: {
      u_heightMap: { value: seedTexture }
    },
  });

  const scene = new THREE.Scene();
  scene.add(camera);
  scene.add(particles.points);

  var lastTime = new Date();
  const render = () => {
    const curTime = new Date();
    const delta = (curTime - lastTime) / 1000;
    lastTime = curTime;

    particles.points.rotation.z += delta * Math.PI * 2 * 0.005;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
};

const loader = new THREE.TextureLoader();
loader.load('images/heightmap-256.png', main);
