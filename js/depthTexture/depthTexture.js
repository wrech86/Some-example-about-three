import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'
let scene,camera,renderer,control,ambientLight,directionalLight
let postScene,postCamera,postMaterial,target
let supportsExtension = true
const params = {
  //将每个元素作为单独的深度值来读取，将其转换为范围限制在[0,1]区间的浮点数。 它是DepthTexture的默认值。
  format:THREE.DepthFormat,
  type:THREE.UnsignedShortType
}
const formats = { DepthFormat: THREE.DepthFormat, DepthStencilFormat: THREE.DepthStencilFormat };
const types = { UnsignedShortType: THREE.UnsignedShortType, UnsignedIntType: THREE.UnsignedIntType, UnsignedInt248Type: THREE.UnsignedInt248Type };
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
  renderer = new THREE.WebGLRenderer({canvas:canvas,antialias:true})
  if(renderer.capabilities.isWebGL2 === false && renderer.extensions.has('WEBGL_depth_texture')===false){
    supportsExtension = false
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||2))
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(width,height)

  camera = new THREE.PerspectiveCamera(75,width/height,0.01,50)
  camera.position.set(0,5,7)
  camera.lookAt( scene.position )
  control = new OrbitControls(camera,canvas)
  control.enableDamping = true
  //
  setupRenderTarget()
  setupScene()
  setupPost()
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
  const gui = new GUI( { width: 300 } );
  gui.add( params, 'format', formats ).onChange( setupRenderTarget );
	gui.add( params, 'type', types ).onChange( setupRenderTarget );
	gui.open();
 
  
  window.addEventListener('resize',size)
}
function setupRenderTarget(){
  if(target)target.dispose()
  const format = parseFloat(params.format)
  const type = parseFloat(params.type)
  target = new THREE.WebGLRenderTarget()
  //设置放大缩小滤镜
  target.texture.minFilter = THREE.NearestFilter
  target.texture.magFilter = THREE.NearestFilter
  //是否开启模版缓冲
  target.stencilBuffer = (format===THREE.DepthStencilFormat)?true:false
  target.depthTexture = new THREE.DepthTexture()
  target.depthTexture.format = format
  target.depthTexture.type = type
}
function setupScene(){
  scene = new THREE.Scene()
  const geometry = new THREE.BoxGeometry(1,1,1)
  const material = new THREE.MeshToonMaterial({color:'pink'})
  const count = 50
  const scale = 5
  count.forEach(e => {
    const z = Math.random()*2.0-1.0
    const angle = Math.PI * 2.0 * Math.random()
    const zScale = Math.sqrt(1.0-z*z)*scale
    const mesh = new THREE.Mesh(geometry,material)
    mesh.position.set(
      Math.cos(angle)*zScale,
      Math.sin(angle)*zScale,
      z*scale
    )
    mesh.rotation.set(Math.random(),Math.random(),Math.random())
    scene.add(mesh)
  });
}
function setupPost(){
  //setup post 
  postCamera = new THREE.OrthographicCamera()
  postMaterial = new THREE.ShaderMaterial({
    
  })
}
function time(){
  requestAnimationFrame(time)
  control.update()
  renderer.render(scene,camera)
}