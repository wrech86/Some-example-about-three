import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
let scene, camera, renderer, control, ambientLight, directionalLight
let mixer,gui,actions,activeAction,previousAction,face
const api = { state: 'Walking' }
let clock = new THREE.Clock()

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
  scene.background = new THREE.Color('#cccccc')
  scene.fog = new THREE.Fog('#cccccc', 20, 100)
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
  renderer.setSize(width, height)
  renderer.render(scene, camera)
  window.addEventListener('resize', size)
}
function obj() {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
  mesh.rotation.x = - Math.PI / 2;
  scene.add(mesh);

  const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  const loader = new GLTFLoader()
  loader.loadAsync('/source/gltfModel/RobotExpressive.glb').then((data) => {
    scene.add(data.scene)
    console.log(data);
    createGUI(data.scene, data.animations)
  })
}
function createGUI(obj, ani) {
  const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
  const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];
  gui = new GUI()
  mixer = new THREE.AnimationMixer(obj)
  actions = {}
  ani.forEach(clip => {
    let action = mixer.clipAction(clip)
    actions[clip.name] = action
    //'Idle', 'Walking', 'Running', 'Dance'这四个动作需要持续进行
    if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
      action.clampWhenFinished = true;
      action.loop = THREE.LoopOnce;
    }
  });
  //gui
  //肢体
  const statesFolder = gui.addFolder('States')
  const clipCtrl = statesFolder.add(api,'state').options(states)
  clipCtrl.onChange(()=>{
    fadeToAction(api.state,0.5)
  })
  statesFolder.open()
  //表情
  const emotesFolder = gui.addFolder('Emotes')
  function createEmote(name){
    api[name]=()=>{
      fadeToAction(name,0.2)
      //一个动作的结束会调用restoreState
      mixer.addEventListener('finished',restoreState)
    }
    emotesFolder.add(api,name)
  }
  function restoreState(){
    mixer.removeEventListener('finished',restoreState)
    //两个动画要保持顺次进行,所以在emote动画要继续执行state动画
    fadeToAction(api.state,0.2)
  }
  emotes.forEach((e)=>{
    createEmote(e)
  })
  emotesFolder.open()
  console.log(obj);
  face = obj.getObjectByName( 'Head_4' );
  const expressions = Object.keys( face.morphTargetDictionary );
	const expressionFolder = gui.addFolder( 'Expressions' );
  expressions.forEach((e,i)=>{
    expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01 ).name( e )
  })
  activeAction = actions[api.state]
  activeAction.play()
  expressionFolder.open()
}
function fadeToAction(name,duration){
  previousAction = activeAction
  activeAction = actions[name]
  if(previousAction!==activeAction){
    previousAction.fadeOut(duration)
  }
  activeAction.reset()
  .setEffectiveTimeScale(1).setEffectiveWeight(1)
  .fadeIn(duration).play()
}
function time() {
  let d = clock.getDelta()
  if(mixer)mixer.update(d)

  
  control.update()
  renderer.render(scene, camera)
  requestAnimationFrame(time)
}