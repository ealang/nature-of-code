import basicFragmentSetup from '../../lib/basic-fragment-setup.js';
import {fetchText} from '../../lib/utils.js';

(async () => {
  basicFragmentSetup(
    await fetchText('demos/00-hello-world/fragment-shader.glsl'),
  );
})();
