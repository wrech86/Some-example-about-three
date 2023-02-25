import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
let scene, camera, renderer, control
let ambientLight, directionalLight
let material,globalPlanes,empty
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
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
  let {globalPlane,localPlane} = await obj()
  //
  scene.add(new THREE.AmbientLight(0x505050));

  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.angle = Math.PI / 5;
  //模糊
  spotLight.penumbra = 0.2;
  spotLight.position.set(2, 3, 3);
  spotLight.castShadow = true;
  spotLight.shadow.camera.near = 3;
  spotLight.shadow.camera.far = 10;
  spotLight.shadow.mapSize.width = 516;
  spotLight.shadow.mapSize.height = 516;
  scene.add(spotLight);
  const spotLightHelper = new THREE.SpotLightHelper( spotLight );
  scene.add( spotLightHelper );
  const dirLight = new THREE.DirectionalLight(0x55505a, 1);
  dirLight.position.set(0, 3, 0);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 10;

  dirLight.shadow.camera.right = 1;
  dirLight.shadow.camera.left = -1;
  dirLight.shadow.camera.top = 1;
  dirLight.shadow.camera.bottom = -1;

  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);
  const helper = new THREE.DirectionalLightHelper( dirLight, 1 );
  scene.add( helper );
  // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  // scene.add( helper );
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000)
  camera.position.set(0, 5, 7)
  camera.lookAt(scene.position)
  control = new OrbitControls(camera, canvas)
  control.target.set( 0, 1, 0 );
  control.enableDamping = true
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true ,logarithmicDepthBuffer:true})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2))
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true
  renderer.setSize(width, height)
  globalPlanes = [globalPlane]
  empty = Object.freeze([])
  renderer.clippingPlanes = empty
  renderer.localClippingEnabled = true
  renderer.render(scene, camera)
  window.addEventListener('resize', size)
  gui(globalPlane,localPlane)
  
}
function gui(globalPlane,localPlane){
  const gui = new GUI()
  const local = gui.addFolder('local')
  const propsLocal = {
    get 'Enabled'(){
      return renderer.localClippingEnabled
    },
    set 'Enabled'(v){
      renderer.localClippingEnabled = v
    },
    get 'Shadows'() {

      return material.clipShadows;

    },
    set 'Shadows'( v ) {

      material.clipShadows = v;

    },

    get 'Plane'() {

      return localPlane.constant;

    },
    set 'Plane'( v ) {

      localPlane.constant = v;

    }
  }
  const global = gui.addFolder('global')
  const propsGlobal = {

    get 'Enabled'() {
      console.log(renderer.clippingPlanes !== empty);
      return renderer.clippingPlanes !== empty;

    },
    set 'Enabled'( v ) {
      renderer.clippingPlanes = v ? globalPlanes : empty;
    },

    get 'Plane'() {

      return globalPlane.constant;

    },
    set 'Plane'( v ) {

      globalPlane.constant = v;

    }
  };
  local.add(propsLocal,'Enabled')
  local.add(propsLocal,'Shadows')
  local.add(propsLocal,'Plane',0,1)
  global.add( propsGlobal, 'Enabled' );
	global.add( propsGlobal, 'Plane', - 0.4, 3 );
}
async function obj() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry( 9, 9, 1, 1 ),
    new THREE.MeshPhongMaterial( { color: 0xa0adaf, shininess: 150,side:THREE.DoubleSide } )
  );
  ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
  ground.receiveShadow = true;
  scene.add( ground );
  const localPlane = new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 0 );
	const globalPlane = new THREE.Plane( new THREE.Vector3( - 1, 0, 0 ), 0.1 );
  material = new THREE.MeshPhongMaterial({
    color:0x80ee10,
    shininess:100,
    side:THREE.DoubleSide,
    clippingPlanes:[localPlane],
    clipShadows:true
  })
  const geo = new THREE.BoxGeometry(2,2,2)
  const mesh = new THREE.Mesh(geo,material)
  mesh.position.y= 1.001
  mesh.castShadow = true
  scene.add(mesh)
  return {globalPlane,localPlane}
}
function time() {
  requestAnimationFrame(time)
  control.update()
  renderer.render(scene, camera)
}