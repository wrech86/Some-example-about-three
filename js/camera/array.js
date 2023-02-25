import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
let scene, camera, renderer, control, ambientLight, directionalLight,mesh
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
let aspect = width / height
let amount = 6
let widthD = (width / amount) * window.devicePixelRatio
let heightD = (height / amount) * window.devicePixelRatio

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
  directionalLight.position.set(0.5,0.5,1)
  directionalLight.castShadow = true
  directionalLight.shadow.camera.zoom = 4
  scene.add(directionalLight)
  scene.add(directionalLight.target)
  // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  // scene.add( helper );
  let cameras = []
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      const subCamera = new THREE.PerspectiveCamera(40, aspect, 0.1, 10)
      subCamera.viewport = new THREE.Vector4( Math.floor( x * widthD ), Math.floor( y * heightD), Math.ceil( widthD ), Math.ceil( heightD ) );
      subCamera.position.x = (x / amount) - 0.5
      subCamera.position.y = 0.5-(y / amount)
      subCamera.position.z = 1.5
      subCamera.lookAt(0, 0, 0)
      subCamera.updateProjectionMatrix()
      cameras.push(subCamera)
    }
  }
  camera = new THREE.ArrayCamera(cameras)
  camera.position.z = 3
  control = new OrbitControls(camera, canvas)
  control.enableDamping = true
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2))
  renderer.shadowMap.enabled = true;
  renderer.setSize(width, height)
  renderer.render(scene, camera)
  window.addEventListener('resize', size)
}
function obj() {
  const geometryBackground = new THREE.PlaneGeometry(100, 100);
  const materialBackground = new THREE.MeshPhongMaterial({ color: 0x000066 });

  const background = new THREE.Mesh(geometryBackground, materialBackground);
  background.receiveShadow = true;
  background.position.set(0, 0, - 1);
  scene.add(background);

  const geometryCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
  const materialCylinder = new THREE.MeshPhongMaterial({ color: 0xff0000 });

  mesh = new THREE.Mesh(geometryCylinder, materialCylinder);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}
function time() {
  mesh.rotation.x += 0.005;
	mesh.rotation.z += 0.01;
  requestAnimationFrame(time)
  control.update()
  renderer.render(scene, camera)
}