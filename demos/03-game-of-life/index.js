import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import feedbackFragmentSetup from '../../lib/feedback-fragment-setup.js';

const loader = new THREE.TextureLoader();
loader.load('images/rgb-noise-512.png', onLoad);

function onLoad(texture) {
  texture.minFilter= THREE.NearestFilter;
  texture.magFilter= THREE.NearestFilter;

  feedbackFragmentSetup(
    'demos/03-game-of-life/fragment-shader.glsl',
    {
      uniforms: {
        u_textureSeed: { value: texture },
      },
      defines: {
        TEXTURE_RES: 512,
      },
      renderDelayMs: 100,
    },
  );
}
