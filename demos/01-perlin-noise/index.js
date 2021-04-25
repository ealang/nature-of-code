import basicFragmentSetup from '../../lib/basic-fragment-setup.js';

basicFragmentSetup(
  'demos/01-perlin-noise/fragment-shader.glsl',
  {
    u_gridSize: { value: 0.1 },
    u_animFreq: { value: 0.2 },
  },
);
