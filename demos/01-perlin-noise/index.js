import basicFragmentSetup from '../../lib/basic-fragment-setup.js';

basicFragmentSetup(
  'demos/01-perlin-noise/fragment-shader.glsl',
  {
    uniforms: {
      u_gridSize: { value: 0.05 },
      u_animFreqHz: { value: 0.1 },
    },
  },
);
