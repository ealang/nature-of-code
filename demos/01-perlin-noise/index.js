import basicFragmentSetup from '../../lib/basic-fragment-setup.js';

const NUM_GRADIENTS = 128;
const ANIM_FREQ = 0.3;

const gradients = [...Array(NUM_GRADIENTS)].map(_ => Math.random() * Math.PI * 2);

function onUpdate(time, uniforms) {
  for (var i = 0; i < NUM_GRADIENTS; ++i) {
    uniforms.u_gradients.value[i] = gradients[i] + time * Math.PI * ANIM_FREQ;
  }
}

basicFragmentSetup(
  'demos/01-perlin-noise/fragment-shader.glsl',
  {
    uniforms: {
      u_gridSize: { value: 0.08 },
      u_gradients: { value: [...gradients] },
    },
    onUpdate,
  },
);
