import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
let scene, camera, renderer, control, ambientLight, directionalLight
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
const clipPlanes = [
  new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
  new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
  new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
];
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
  //
  obj()
  //
  ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
  scene.add(ambientLight)
  directionalLight = new THREE.DirectionalLight('#ffffff', 0.8)
  directionalLight.position.set(10, 10, 0)
  directionalLight.scale.set(5, 5, 5)
  scene.add(directionalLight)
  //平行光追随物体 可以设置directionLight.target = Object3D
  scene.add(directionalLight.target)
  // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  // scene.add( helper );
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000)
  camera.position.set(0, 5, 7)
  camera.lookAt(scene.position)
  control = new OrbitControls(camera, canvas)
  control.enableDamping = true
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2))
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.localClippingEnabled = true;
  renderer.setSize(width, height)
  renderer.render(scene, camera)
  window.addEventListener('resize', size)
}
function obj() {
  const group = new THREE.Group()
  for (let index = 0; index < 15; index++) {
    const geo = new THREE.SphereGeometry(index / 15, 48, 24)
    const material = new THREE.MeshToonMaterial({
      color: Math.random() * 0xffffff,
      side: THREE.DoubleSide,
      clippingPlanes: clipPlanes,
      //有这个属性则剪切交集，没有的话剪切并集
      clipIntersection: true
    })
    const mesh = new THREE.Mesh(geo, material)
    group.add(mesh)
  }
  scene.add(group)
  const helpers = new THREE.Group();
  helpers.add(new THREE.PlaneHelper(clipPlanes[0], 2, 0xff0000));
  helpers.add(new THREE.PlaneHelper(clipPlanes[1], 2, 0x00ff00));
  helpers.add(new THREE.PlaneHelper(clipPlanes[2], 2, 0x0000ff));
  helpers.visible = true;
  scene.add(helpers);
}
function time() {
  requestAnimationFrame(time)
  control.update()
  renderer.render(scene, camera)
}