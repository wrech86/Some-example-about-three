import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader'
let scene,camera,renderer,control,ambientLight,directionalLight
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
init()
function size(){
  width = window.innerWidth
  height = window.innerHeight
  camera.aspect = width/height
  camera.updateProjectionMatrix()
  renderer.setSize(width,height)
}
function init(){
  scene = new THREE.Scene()
  //
  obj()
  //
  ambientLight = new THREE.AmbientLight('#ffffff',0.5)
  scene.add(ambientLight)
  directionalLight = new THREE.DirectionalLight('#ffffff',0.8)
  directionalLight.position.set(10,10,0)
  directionalLight.scale.set(5,5,5)
  scene.add(directionalLight)
  scene.add(directionalLight.target)
  // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  // scene.add( helper );
  camera = new THREE.PerspectiveCamera(75,width/height,1,1000)
  camera.position.set(0,5,7)
  camera.rotateX(Math.PI/6)
  control = new OrbitControls(camera,canvas)
  control.enableDamping = true
  renderer = new THREE.WebGLRenderer({canvas:canvas,antialias:true})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||2))
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(width,height)
  renderer.render(scene,camera)
  environment()
  time()
  window.addEventListener('resize',size)
}
function environment(){
 const p = new THREE.PMREMGenerator(renderer)
 p.compileEquirectangularShader()
 let loader = new RGBELoader()
 loader.setDataType(THREE.FloatType)
 loader.load('/source/hdir/puresky_1k.hdr',(texture)=>{
  const envMap = p.fromEquirectangular(texture).texture;
      scene.background = envMap;
      scene.environment = envMap;
      texture.dispose();
      p.dispose();
 })
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