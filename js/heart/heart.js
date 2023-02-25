import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
let scene, camera, renderer, control, ambientLight, directionalLight, clock = 0, group1
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
const loader = new GLTFLoader()
let arr = [], arr1 = [], arr2 = [], arr3 = [], arr4 = [], arr5 = []
let arrAll = [], heart
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
  // fog = new THREE.Fog( '#fecfef' ,300,1000);
  // scene.fog = fog
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2))
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0xff9a9e)
  renderer.setClearAlpha(0.0)
  renderer.setSize(width, height)
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000)
  camera.position.set(0, 0, 300)
  camera.lookAt(scene.position)
  control = new OrbitControls(camera, canvas)
  ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
  scene.add(ambientLight)
  directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(10, 10, 10)
  directionalLight.scale.set(5, 5, 5)
  scene.add(directionalLight)
  //平行光追随物体 可以设置directionLight.target = Object3D
  // scene.add(directionalLight.target)
  // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  // scene.add( helper );
  //
  await environment()
  //
  //
  await obj()
  //
  
 
  window.addEventListener('dblclick',()=>{
    console.log('a');
    if(!document.fullscreenElement){
      canvas.requestFullscreen()
    }else{
      document.exitFullscreen()
    }
  })
  window.addEventListener('resize', size)
}
async function environment() {
  let p = new THREE.PMREMGenerator(renderer)
  p.compileEquirectangularShader()
  const loader = new RGBELoader()
  loader.loadAsync('../../source/hdir/satara_night_1k.hdr').then((data) => {
    let envMap = p.fromEquirectangular(data).texture
    // scene.background = envMap
    scene.environment = envMap
    data.dispose()
    p.dispose()
  })
}
async function obj() {

  for (let y = 1; y < 10; y++) {
    if (y < 6) {
      for (let x = 1; x < y + 1; x++) {
        let z = Math.cos(x / 4) - Math.cos((y + 1) / 4)
        arr.push([x, y, z])
      }
    } else if (y == 6) {
      for (let x = 1; x < 6; x++) {
        let z = Math.cos(x / 4)
        arr.push([x, y, z])
      }
    } else if (y === 7) {
      for (let x = 1; x < 4; x++) {
        let z = Math.cos((2 * x - 1) / 4)
        arr.push([2 * x - 1, y, z])
      }
    } else if (y === 8) {
      for (let x = 0.9; x < 2; x++) {
        let z = Math.cos((2 * x) / 4) + Math.cos((y + 10) / 4)
        arr.push([2 * x, y - 0.5, z])
      }
    } else if (y === 9) {
      let z = Math.cos(2.8 / 4) + Math.cos((y + 3) / 4)
      arr.push([2.8, y - 0.7, z])
    }
  }
  arr.forEach((e) => {
    let x = e[0] * 4
    let y = e[1] * 4
    let z = e[2] * 10
    arr1.push([x, y, z])
    arr2.push([-x, y, z])
    arr3.push([-x, y, -z])
    arr4.push([x, y, -z])
  })
  for (let y = 0; y < 8; y++) {
    let x = 0
    let z = (Math.cos(x / 4) - Math.cos((y + 1) / 4)) * 10
    if (y == 6) {
      z = (Math.cos(x / 4) - Math.cos((y + 0.5) / 4)) * 10
    } else if (y == 7) {
      z = (Math.cos(x / 4) - Math.cos((y - 0.3) / 4)) * 10
    }
    if (y == 0) {
      arr5.push([x, y * 4, z])
    } else {
      arr5.push([x, y * 4, z])
      arr5.push([x, y * 4, -z])
    }
  }
  for (let y = 3; y < 8; y++) {
    {
      let z = 0
      let x = (y + 0.5) * 4
      if (y == 6) {
        x = (y) * 4
      } else if (y == 7) {
        x = (y - 1.5) * 4
      }
      arr5.push([x, y * 4, z])
      arr5.push([-x, y * 4, z])
    }
  }
  arrAll = [...arr1, ...arr2, ...arr3, ...arr4, ...arr5]
  group1 = new THREE.Group()
  group1.scale.set(10, 10, 10)
  loader.loadAsync('../../source/gltfModel/heart/scene.gltf').then((data) => {
    heart = data.scene
    scene.add(heart)
    arrAll.forEach(e => {
      const love = heart.clone()
      love.scale.setScalar(0.02)
      love.position.set(e[0], e[1], e[2])
      group1.add(love)
    })
  })
  group1.position.y = -180
  scene.add(group1)
  console.log(group1);

}
function time() {
  requestAnimationFrame(time)
  render()
  renderer.render(scene, camera)
}
function render() {
  clock = clock + 0.1
  let f = Math.sin(clock) / 8
  if (heart) {
    heart.scale.setScalar(1 + f)
  }
  // group1.traverse((c)=>{
  //   let total = c.children
  //   let child1 = total.slice(0,arr1.length-1)
  //   child1.forEach(e=>{
  //     e.position.z+=f
  //   })
  // })
  group1.updateWorldMatrix()

}