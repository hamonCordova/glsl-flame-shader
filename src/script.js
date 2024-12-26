import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import GUI from 'lil-gui'
import flameVertexShader from './shaders/flame/vertex.glsl';
import flameFragmentShader from './shaders/flame/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 325 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const imageLoader = new THREE.TextureLoader();

// When changing the alpha texture, you probably may need to change the plane sizes
const flameAlphaTexture1 = imageLoader.load('./flame_firelighter.png');
const flameAlphaTexture2 = imageLoader.load('./flame_candle.png');
const flameAlphaTexture3 = imageLoader.load('./flame_candle2.png');

/**
 * Placeholder
 */
const debugObj = {
    uBaseColor: '#0011ff',
    uBaseColorMix: '#000a33',
    uTopColor: '#ffb347',
    uTopColorMix: '#ff9500',
    changeTexture1: () => {
        flameMaterial.uniforms.uAlphaTexture.value = flameAlphaTexture1;
        flame.geometry = new THREE.PlaneGeometry(2.3, 3, 40, 40);
    },
    changeTexture2: () => {
        flameMaterial.uniforms.uAlphaTexture.value = flameAlphaTexture2;
        flame.geometry = new THREE.PlaneGeometry(2.3, 3, 40, 40);
    },
    changeTexture3: () => {
        flameMaterial.uniforms.uAlphaTexture.value = flameAlphaTexture3;
        flame.geometry = new THREE.PlaneGeometry(1, 2, 40, 40);
    }
}

const flameMaterial = new THREE.ShaderMaterial({
    vertexShader: flameVertexShader,
    fragmentShader: flameFragmentShader,
    uniforms:
        {
            uAlphaTexture: new THREE.Uniform(flameAlphaTexture3),
            uTime: new THREE.Uniform(0),
            uBaseColor: new THREE.Uniform(new THREE.Color(debugObj.uBaseColor)),
            uBaseColorMix: new THREE.Uniform(new THREE.Color(debugObj.uBaseColorMix)),
            uTopColor: new THREE.Uniform(new THREE.Color(debugObj.uTopColor)),
            uTopColorMix: new THREE.Uniform(new THREE.Color(debugObj.uTopColorMix))
        },
    side: THREE.DoubleSide,
    wireframe: false,
    transparent: true,
})

// When changing the alpha texture, you probably may need to change the sizes
const flame = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 2, 40, 40),
    flameMaterial
)
scene.add(flame)

// GUI Controls
gui.addColor(debugObj, 'uTopColor').onChange((color) => {
    flameMaterial.uniforms.uTopColor.value = new THREE.Color(debugObj.uTopColor)
}).name('Top Color')

gui.addColor(debugObj, 'uTopColorMix').onChange((color) => {
    flameMaterial.uniforms.uTopColorMix.value = new THREE.Color(debugObj.uTopColorMix)
}).name('Top Color Mix')

gui.addColor(debugObj, 'uBaseColor').onChange((color) => {
    flameMaterial.uniforms.uBaseColor.value = new THREE.Color(debugObj.uBaseColor)
}).name('Base Color')

gui.addColor(debugObj, 'uBaseColorMix').onChange((color) => {
    flameMaterial.uniforms.uBaseColorMix.value = new THREE.Color(debugObj.uBaseColorMix)
}).name('Base Color Mix')


gui.add(debugObj, 'changeTexture1')
gui.add(debugObj, 'changeTexture2')
gui.add(debugObj, 'changeTexture3')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)

    bloomPass.setSize(sizes.width, sizes.height)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.001, 1000)
camera.position.set(0, 0, -14)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const ambientLight = new THREE.AmbientLight(0xffffff, 4); // White light
scene.add(ambientLight);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Post-processing (Bloom)
 */
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.7,
    0.75,
    0.16
)
composer.addPass(bloomPass)

gui.add(bloomPass, 'strength').min(0).max(3).step(0.1).name('Bloom Strength')
gui.add(bloomPass, 'radius').min(0).max(1).step(0.01).name('Bloom Radius')
gui.add(bloomPass, 'threshold').min(0).max(1).step(0.01).name('Bloom Threshold')

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    controls.update()

    flameMaterial.uniforms.uTime.value = elapsedTime

    composer.render()

    window.requestAnimationFrame(tick)
}

tick()
