import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import basicFragmentSetup from '../../lib/basic-fragment-setup.js';
import frameBuffer from '../../lib/frame-buffer.js';
import {fetchText, canvasSize} from '../../lib/utils.js';

const main = async (seed) => {
  const [width, height] = canvasSize();

  const urlParams = new URLSearchParams(window.location.search);
  const initialRule = urlParams.get("rule") || -805568008;

  const circleRad = urlParams.get("circleRad") || 100;

  const fb = frameBuffer({
    fragmentShader: await fetchText("demos/08-cellular-automata/update.glsl"),
    width,
    height,
    uniforms: {
      u_firstRender: { value: true },
      u_ruleNum: { value: initialRule },
      u_circleRad: { value: circleRad },
      u_drawBrush: { value: {
        position: [0, 0],
        radius: 0,
      }}
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
    fb.shaderMaterial.uniforms.u_drawBrush.value.radius = 0;

    requestAnimationFrame(render);
  }

  const createElem = (tag, text, x, y) => {
    const elem = document.createElement(tag);
    elem.style.position = "absolute";
    elem.style.left = `${x}px`;
    elem.style.top = `${y}px`;
    elem.innerText = text;
    document.body.appendChild(elem);
    return elem;
  };

  const curElem = createElem("span", initialRule, 10, 10);
  curElem.style.color = "#0F0";

  createElem("button", "next", 10, 40).addEventListener("click", (event) => {
    const newRule = (Math.random() * 4294967295) | 0;
    console.log(newRule);
    fb.shaderMaterial.uniforms.u_ruleNum.value = newRule;
    curElem.innerText = newRule;

    var url = new URL(window.location);
    url.searchParams.set("rule", newRule);
    history.pushState(null, null, url.toString());
  });

  createElem("button", "to circle", 10, 70).addEventListener("click", (event) => {
    fb.shaderMaterial.uniforms.u_firstRender.value = true;
    fb.shaderMaterial.uniforms.u_circleRad.value = circleRad;
  });

  createElem("button", "to blank", 10, 100).addEventListener("click", (event) => {
    fb.shaderMaterial.uniforms.u_firstRender.value = true;
    fb.shaderMaterial.uniforms.u_circleRad.value = 0;
  });

  createElem("button", "to noise", 10, 130).addEventListener("click", (event) => {
    fb.nextBuffer(seed);
  });

  setup.renderer.domElement.addEventListener("click", (event) => {
    const screenX = event.clientX;
    const screenY = setup.height - event.clientY;
    fb.shaderMaterial.uniforms.u_drawBrush.value.position = [screenX, screenY];
    fb.shaderMaterial.uniforms.u_drawBrush.value.radius = 5;
  });

  requestAnimationFrame(render);
};

const loader = new THREE.TextureLoader();
loader.load('images/rgb-noise-512.png', main);
