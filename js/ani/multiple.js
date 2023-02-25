import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
let scene, camera, renderer, control, ambientLight, directionalLight, hemiLight, mixers = []
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
let clock = new THREE.Clock()
init().then(time)
function size() {
  width = window.innerWidth
  height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}
async function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 50)
  //
  obj()
  //
  ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
  scene.add(ambientLight)
  directionalLight = new THREE.DirectionalLight('#ffffff', 0.8)
  directionalLight.position.set(10, 10, 0)
  directionalLight.scale.set(5, 5, 5)
  scene.add(directionalLight)
  scene.add(directionalLight.target)
  hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);
  // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  // scene.add( helper );
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000)
  camera.position.set(0, 5, -7)
  camera.lookAt(scene.position)
  control = new OrbitControls(camera, canvas)
  control.enableDamping = true
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2))
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(width, height)
  renderer.render(scene, camera)
  window.addEventListener('resize', size)
}
function obj() {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
  mesh.rotation.x = - Math.PI / 2;
  scene.add(mesh);
  const loader = new GLTFLoader()
  loader.loadAsync('/source/gltfModel/Soldier.glb').then((gltf) => {
    const model1 = SkeletonUtils.clone(gltf.scene);
    const model2 = SkeletonUtils.clone(gltf.scene);
    const model3 = SkeletonUtils.clone(gltf.scene);

    const mixer1 = new THREE.AnimationMixer(model1);
    const mixer2 = new THREE.AnimationMixer(model2);
    const mixer3 = new THREE.AnimationMixer(model3);

    mixer1.clipAction(gltf.animations[0]).play(); // idle
    mixer2.clipAction(gltf.animations[1]).play(); // run
    mixer3.clipAction(gltf.animations[3]).play(); // walk

    model1.position.x = - 2;
    model2.position.x = 0;
    model3.position.x = 2;

    scene.add(model1, model2, model3);
    mixers.push(mixer1, mixer2, mixer3);

  })
}
function time() {
  let d = clock.getDelta()
  if (mixers) {
    mixers.forEach((e) => {
      e.update(d)
    })
  }
  requestAnimationFrame(time)
  control.update()
  renderer.render(scene, camera)
}