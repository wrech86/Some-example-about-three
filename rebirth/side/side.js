import * as THREE from 'three'
import { BackSide } from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
let scene,camera,renderer,control
let canvas = document.getElementById('canvas')
init()
time()
function init(){
  createScene()
  createCamera()
  createRenderer()
  create3D()
  window.addEventListener('size',size)
}
function createScene(){
  scene = new THREE.Scene()
  scene.background = 0xffffff
}
function createCamera(){
  camera = new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,1000)
  camera.position.set(12,12,12)
  camera.up.set(0,1,0)
  camera.lookAt(scene.position)
}
function createRenderer(){
  renderer = new THREE.WebGLRenderer({canvas:canvas,antialias:false})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||2))
  renderer.setSize(window.innerWidth,window.innerHeight)
  control = new OrbitControls(camera,canvas)
  control.enableDamping = true
  renderer.render(scene,camera)
}
function create3D(){
  let geometry = new THREE.BoxGeometry(10,10,10)
  let material = new THREE.MeshBasicMaterial({color:0xf0f0f0,side:THREE.BackSide})
  let cube = new THREE.Mesh(geometry,material)
  scene.add(cube)
}
function size(){
  let width = window.innerWidth,height = window.innerHeight
  camera.aspect = width/height
  camera.updateProjectionMatrix()
  renderer.setSize(width,height)
}
function render(){
  renderer.render(scene,camera)
}
function time(){
  render()
  requestAnimationFrame(time)
}