import basicFragmentSetup from '../../lib/basic-fragment-setup.js';
import {canvasSize} from '../../lib/utils.js';

(async () => {

  const [width, height] = canvasSize();
  const size = Math.min(width, height);

  const targetWidth = 3.5;
  const targetHeight = 2;
  const targetXStart = -2.5;
  const targetYStart = -1;

  var [xSize, ySize] = (() => {
    const screenRatio = width / height;
    const targetRatio = targetWidth / targetHeight;
    return [
      targetWidth * Math.max(screenRatio / targetRatio, 1),
      targetHeight * Math.max(targetRatio / screenRatio, 1),
    ];
  })();

  var xStart = targetXStart + targetWidth / 2 - xSize / 2;
  var yStart = targetYStart + targetHeight / 2 - ySize / 2;

  const render = await basicFragmentSetup(
    'demos/04-mandelbrot-set/fragment-shader.glsl',
    {
      uniforms: {
        u_viewSize: {
          value: [xSize, ySize],
        },
        u_viewStart: {
          value: [xStart, yStart],
        },
      },
      singleRender: true,
      width,
      height,
  });

  render.canvas.addEventListener("click", (event) => {
    const screenX = event.clientX / render.width;
    const screenY = 1 - event.clientY / render.height;
    const worldX = screenX * xSize + xStart;
    const worldY = screenY * ySize + yStart;

    xSize *= 0.5;
    ySize *= 0.5;

    xStart = worldX - xSize * screenX;
    yStart = worldY - ySize * screenY;

    render.shaderMaterial.uniforms.u_viewSize.value = [xSize, ySize];
    render.shaderMaterial.uniforms.u_viewStart.value = [xStart, yStart];

    render.requestRender();
  });

})();
