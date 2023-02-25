import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { CCDIKSolver, CCDIKHelper } from 'three/examples/jsm/animation/CCDIKSolver'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'
let scene, camera, renderer
let gui,conf
let oControl, tControl
let ambientLight, directionalLight
let mirrorSphereCamera
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
const v0 = new THREE.Vector3();
const OOI = {};
let IKSolver;
init().then(time)
function size() {
  width = window.innerWidth
  height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}
async function init() {
  conf = {
    followSphere: false,
    turnHead: true,
    ik_solver: true,
  };
  scene = new THREE.Scene()
  //
  await obj()
  //
  ambientLight = new THREE.AmbientLight('#ffffff', 8)
  scene.add(ambientLight)
  // directionalLight = new THREE.DirectionalLight('#ffffff', 0.8)
  // directionalLight.position.set(10, 10, 0)
  // directionalLight.scale.set(5, 5, 5)
  // scene.add(directionalLight)
  // scene.add(directionalLight.target)
  // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  // scene.add( helper );
  //
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000)
  camera.position.set(0, 5, 7)
  camera.lookAt(scene.position);
  //
  oControl = new OrbitControls(camera, canvas)
  oControl.enableDamping = true
  oControl.target.copy(OOI.sphere.position)
  tControl = new TransformControls(camera, canvas)
  tControl.size = .75;
  tControl.showX = false;
  tControl.space = 'world';
  tControl.attach(OOI.target_hand_l);
  scene.add(tControl);
  tControl.addEventListener('mouseDown', () => oControl.enabled = false)
  tControl.addEventListener('mouseUp', () => oControl.enabled = true)
  //
  OOI.hand_l.attach(OOI.sphere)
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256)
  cubeRenderTarget.texture.type = THREE.HalfFloatType;
  mirrorSphereCamera = new THREE.CubeCamera(0.05, 50, cubeRenderTarget)
  scene.add(mirrorSphereCamera)
  const mirrorMaterial = new THREE.MeshBasicMaterial({
    envMap: cubeRenderTarget.texture,
    roughness: 0.05,
    metalness: 1
  })
  OOI.sphere.material = mirrorMaterial
  OOI.kira.add(OOI.kira.skeleton.bones[0])
  console.log(OOI.kira.skeleton);
  console.log(OOI.kira);
  const iks = [
    {
      target: 22, // "target_hand_l"
      effector: 6, // "hand_l"
      links: [
        {
          index: 5, // "lowerarm_l"
          rotationMin: new THREE.Vector3(1.2, - 1.8, - .4),
          rotationMax: new THREE.Vector3(1.7, - 1.1, .3)
        },
        {
          index: 4, // "Upperarm_l"
          rotationMin: new THREE.Vector3(0.1, - 0.7, - 1.8),
          rotationMax: new THREE.Vector3(1.1, 0, - 1.4)
        },
      ],
    }
  ];
  IKSolver = new CCDIKSolver( OOI.kira, iks );
	const ccdikhelper = new CCDIKHelper( OOI.kira, iks, 0.01 );
	scene.add( ccdikhelper );
  //
  if(gui){
    gui.dispose()
  }
  gui = new GUI()
  gui.add(conf,'followSphere').name('follow sphere')
  gui.add( conf, 'turnHead' ).name( 'turn head' );
	gui.add( conf, 'ik_solver' ).name( 'IK auto update' );
	gui.add( IKSolver, 'update' ).name( 'IK manual update()' );
	gui.open();
  //
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2))
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  renderer.setSize(width, height)
  renderer.render(scene, camera)
  
  window.addEventListener('resize', size)
}
async function obj() {
  let dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('draco/')
  let gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)
  gltfLoader.setPath('/source/gltfModel/')
  let gltf = await gltfLoader.loadAsync('kira.glb')
  gltf.scene.traverse((n) => {
    if (n.name === 'head') OOI.head = n;
    if (n.name === 'lowerarm_l') OOI.lowerarm_l = n;
    if (n.name === 'Upperarm_l') OOI.Upperarm_l = n;
    if (n.name === 'hand_l') OOI.hand_l = n;
    if (n.name === 'target_hand_l') OOI.target_hand_l = n;

    if (n.name === 'boule') OOI.sphere = n;
    if (n.name === 'Kira_Shirt_left') OOI.kira = n;

    if (n.isMesh) n.frustumCulled = false;
  })
  scene.add(gltf.scene)
}
function time() {
  if(OOI.sphere&&mirrorSphereCamera){
    OOI.sphere.visible = false
    OOI.sphere.getWorldPosition(mirrorSphereCamera.position)
    mirrorSphereCamera.update(renderer,scene)
    OOI.sphere.visible = true
  }
  if(OOI.sphere&&conf.followSphere){
    OOI.sphere.getWorldPosition(v0)
    console.log(v0);
    oControl.target.lerp(v0,0.1)
  }
  if(OOI.head&&OOI.sphere&&conf.turnHead){
    OOI.sphere.getWorldPosition(v0)
    OOI.head.lookAt(v0)
    OOI.head.rotation.set(OOI.head.rotation.x, OOI.head.rotation.y + Math.PI, OOI.head.rotation.z)
  }
  if(conf.ik_solver){
    IKSolver?.update()
  }
  oControl.update()
  renderer.render(scene, camera)
  requestAnimationFrame(time)
}