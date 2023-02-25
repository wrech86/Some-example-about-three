import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'
let scene,camera,renderer,control,ambientLight,directionalLight
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
init().then(time)
function size(){
  width = window.innerWidth
  height = window.innerHeight
  camera.aspect = width/height
  camera.updateProjectionMatrix()
  renderer.setSize(width,height)
}
async function init(){
  scene = new THREE.Scene()
  renderer = new THREE.WebGLRenderer({canvas:canvas,antialias:true})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||2))
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(width,height)
  camera = new THREE.PerspectiveCamera(75,width/height,1,1000)
  camera.position.set(0,5,7)
  camera.lookAt( scene.position )
  control = new OrbitControls(camera,canvas)
  control.enableDamping = true
  //
  obj()
  //
  ambientLight = new THREE.AmbientLight('#ffffff',0.5)
  scene.add(ambientLight)
  directionalLight = new THREE.DirectionalLight('#ffffff',0.8)
  directionalLight.position.set(10,10,0)
  directionalLight.scale.set(5,5,5)
  scene.add(directionalLight)
  //平行光追随物体 可以设置directionLight.target = Object3D
  // scene.add(directionalLight.target)
  // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  // scene.add( helper );
 
  
 
  
  window.addEventListener('resize',size)
}
function obj(){
  let cube = new THREE.Mesh(new THREE.BoxGeometry(3,3,3),new THREE.MeshToonMaterial({color:'pink'}))
  scene.add(cube)
}
function time(){
  requestAnimationFrame(time)
  control.update()
  renderer.render(scene,camera)
}