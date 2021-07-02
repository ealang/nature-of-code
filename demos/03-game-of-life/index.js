import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import basicFragmentSetup from '../../lib/basic-fragment-setup.js';
import frameBuffer from '../../lib/frame-buffer.js';
import {fetchText, canvasSize} from '../../lib/utils.js';

const main = async (seedTexture) => {
  seedTexture.minFilter = THREE.NearestFilter;
  seedTexture.magFilter = THREE.NearestFilter;

  const [width, height] = canvasSize();

  const fb = frameBuffer({
    fragmentShader: await fetchText("demos/03-game-of-life/update.glsl"),
    width,
    height,
    uniforms: {
      u_buffer: { value: seedTexture },
    },
    defines: {
      SEED_SIZE: 512,
    },
  });

  const setup = basicFragmentSetup(
    await fetchText("demos/03-game-of-life/render.glsl"),
    {
      width,
      height,
      autoRender: false,
      uniforms: {
        u_texture: { value: null, },
      },
    },
  );

  function render() {
    const boardState = fb.render(setup.renderer);

    setup.shaderMaterial.uniforms.u_texture.value = boardState;
    setup.render();

    setTimeout(() => {
      requestAnimationFrame(render);
    }, 100);
  }

  requestAnimationFrame(render);
};

const loader = new THREE.TextureLoader();
loader.load('images/rgb-noise-512.png', main);
