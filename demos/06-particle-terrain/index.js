import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {fetchText} from '../../lib/utils.js';
import particleSetup from '../../lib/particle-setup.js';

const main = async (seedTexture) => {

  const size = 256;
  const setup = particleSetup({
    fragmentShader: await fetchText("demos/06-particle-terrain/render-fragment.glsl"),
    vertexShader: await fetchText("demos/06-particle-terrain/render-vertex.glsl"),
    bufferWidth: size,
    bufferHeight: size,
    uniforms: {
      u_heightMap: { value: seedTexture }
    },
    orbitControls: true,
  });
  setup.camera.position.y = -1;
  setup.camera.position.z = 1;

  var lastTime = new Date();
  const render = () => {
    const curTime = new Date();
    const delta = (curTime - lastTime) / 1000;
    lastTime = curTime;

    setup.points.rotation.z += delta * Math.PI * 2 * 0.005;

    setup.render();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

};

const loader = new THREE.TextureLoader();
loader.load('images/heightmap-256.png', main);
