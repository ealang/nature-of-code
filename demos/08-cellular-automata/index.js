import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import basicFragmentSetup from '../../lib/basic-fragment-setup.js';
import frameBuffer from '../../lib/frame-buffer.js';
import {fetchText, canvasSize} from '../../lib/utils.js';

const main = async (seed) => {
  const [width, height] = canvasSize();

  const urlParams = new URLSearchParams(window.location.search);
  var ruleNum = urlParams.get("rule") || -806616584;

  const circleRad = urlParams.get("circleRad") || 100;

  const setRule = (newRule, pushState = true) => {
    console.log(newRule);
    fb.shaderMaterial.uniforms.u_ruleNum.value = newRule;
    document.getElementById("ruleNum").innerText = newRule;

    var url = new URL(window.location);
    url.searchParams.set("rule", newRule);
    if (pushState) {
      history.pushState({ruleNum: newRule}, null, url.toString());
    }

    ruleNum = newRule;
  };

  window.addEventListener("popstate", (event) => {
    if (event.state) {
      setRule(event.state.ruleNum || ruleNum, false);
    }
  });

  const fb = frameBuffer({
    fragmentShader: await fetchText("demos/08-cellular-automata/update.glsl"),
    width,
    height,
    uniforms: {
      u_buffer: { value: seed },
      u_ruleNum: { value: ruleNum },
      u_drawBrush: { value: {
        position: [0, 0],
        radius: 0,
        mode: 0,
        backgroundValue: -1,
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
    fb.shaderMaterial.uniforms.u_drawBrush.value.radius = 0;
    fb.shaderMaterial.uniforms.u_drawBrush.value.backgroundValue = -1;

    requestAnimationFrame(render);
  }

  const buttons = document.createElement("div");
  buttons.style.position = "absolute";
  buttons.style.left = "10px";
  buttons.style.top = "10px";
  buttons.innerHTML = `
    <div><span id="ruleNum" style="color: #0F0"></span></div>
    <div>
      <button id="randomize">randomize</button>
      <button id="mutate">mutate</button>
    </div>
    <div>
      <button id="to_black">to black</button>
      <button id="to_white">to white</button>
    </div>
    <div>
      <button id="to_circle">to circle</button>
      <button id="to_noise">to noise</button>
    </div>
  `;
  document.body.appendChild(buttons);

  document.getElementById("randomize").addEventListener("click", (event) => {
    const newRule = (Math.random() * 4294967295) | 0;
    setRule(newRule);
  });

  document.getElementById("mutate").addEventListener("click", (event) => {
    const bit = (Math.random() * 32) | 0;
    const newRule = ruleNum ^ (1 << bit);
    setRule(newRule);
  });

  document.getElementById("to_circle").addEventListener("click", (event) => {
    fb.shaderMaterial.uniforms.u_drawBrush.value.position = [width / 2, height / 2];
    fb.shaderMaterial.uniforms.u_drawBrush.value.radius = circleRad;
    fb.shaderMaterial.uniforms.u_drawBrush.value.mode = 1;
    fb.shaderMaterial.uniforms.u_drawBrush.value.backgroundValue = 0;
  });

  document.getElementById("to_noise").addEventListener("click", (event) => {
    fb.nextBuffer(seed);
  });

  document.getElementById("to_black").addEventListener("click", (event) => {
    fb.shaderMaterial.uniforms.u_drawBrush.value.position = [width / 2, height / 2];
    fb.shaderMaterial.uniforms.u_drawBrush.value.radius = Math.max(width, height);
    fb.shaderMaterial.uniforms.u_drawBrush.value.mode = 0;
  });

  document.getElementById("to_white").addEventListener("click", (event) => {
    fb.shaderMaterial.uniforms.u_drawBrush.value.position = [width / 2, height / 2];
    fb.shaderMaterial.uniforms.u_drawBrush.value.radius = Math.max(width, height);
    fb.shaderMaterial.uniforms.u_drawBrush.value.mode = 1;
  });

  setup.renderer.domElement.addEventListener("click", (event) => {
    const screenX = event.clientX;
    const screenY = setup.height - event.clientY;
    fb.shaderMaterial.uniforms.u_drawBrush.value.position = [screenX, screenY];
    fb.shaderMaterial.uniforms.u_drawBrush.value.radius = 5;
    fb.shaderMaterial.uniforms.u_drawBrush.value.mode = -1;
  });

  setRule(ruleNum);
  requestAnimationFrame(render);
};

const loader = new THREE.TextureLoader();
loader.load('images/rgb-noise-512.png', main);
