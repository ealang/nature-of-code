import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import basicFragmentSetup from '../../lib/basic-fragment-setup.js';

const loader = new THREE.TextureLoader();
const texture = loader.load('images/noc_print.jpeg');

basicFragmentSetup(
  'demos/00-hello-world/fragment-shader.glsl',
  {
    u_texture: { value: texture },
  },
);
