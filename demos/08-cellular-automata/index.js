import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import basicFragmentSetup from '../../lib/basic-fragment-setup.js';
import frameBuffer from '../../lib/frame-buffer.js';
import {fetchText, canvasSize} from '../../lib/utils.js';

(async () => {
  const [width, height] = canvasSize();

  const fb = frameBuffer({
    fragmentShader: await fetchText("demos/08-cellular-automata/update.glsl"),
    width,
    height,
    uniforms: {
      u_firstRender: { value: true },
    },
    defines: {
      SEED_SIZE: 512,
    },
  });

  const setup = basicFragmentSetup(
    await fetchText("demos/08-cellular-automata/render.glsl"),
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
    fb.shaderMaterial.uniforms.u_firstRender.value = false;

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
