import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'

let mixer
const size={
  width:window.innerWidth,
  height:window.innerHeight
}
window.addEventListener('resize',()=>{
  size.width = window.innerWidth
  size.height = window.innerHeight
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth,window.innerHeight)
  
})
const canvas = document.getElementById('canvas')

const scene = new THREE.Scene()

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshPhongMaterial({color:'#ffffff'}))
mesh.rotation.x = - Math.PI / 2
scene.add(mesh)

const loader = new FBXLoader()
loader.load('./source/fbxModel/Angry.fbx',(obj)=>{
  console.log(obj);
  obj.scale.set(0.1,0.1,0.1)
  mixer = new THREE.AnimationMixer(obj)
  let clip = mixer.clipAction(obj.animations[0])
  clip.play()
  scene.add(obj)
})

const aLight = new THREE.AmbientLight('#ffffff',0.3)
scene.add(aLight)
const pLight = new THREE.PointLight('#ffff00',1.0)
pLight.position.set(0,10,0)
scene.add(pLight)

const camera = new THREE.PerspectiveCamera(45,size.width/size.height,1,1000)
camera.position.set(10,20,30)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({canvas,antialias:true})
renderer.setPixelRatio(Math.min(window.devicePixelRatio||2))
renderer.setSize(size.width,size.height)
renderer.render(scene,camera)
const control = new OrbitControls(camera,canvas)
control.enableDamping=true
control.target.set( 0, 5, 0 );
control.update();
const clock = new THREE.Clock()
function time(){
  window.requestAnimationFrame(time)
  let delta = clock.getDelta()
  if(mixer)mixer.update(delta)
  control.update();
  renderer.render(scene,camera)
}
time()

