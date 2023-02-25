import * as THREE from 'three'
import 'default-passive-events'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'
import {DecalGeometry} from 'three/examples/jsm/geometries/DecalGeometry'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
let scene,camera,renderer,control
let ambientLight,directionalLight1,directionalLight2
let mesh,rayCaster,line,mouseHelper
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
const size = new THREE.Vector3( 10, 10, 10 );
const intersects = [],decals=[];
const texture = new THREE.TextureLoader()
const decalDiffuse = texture.load('../../source/texture/decal/decal-diffuse.png')
const decalNormal = texture.load('../../source/texture/decal/decal-normal.jpg')
const decalMaterial = new THREE.MeshPhongMaterial( {
  specular: 0x444444,
  map: decalDiffuse,
  normalMap: decalNormal,
  //法线贴图的影响程度
  normalScale: new THREE.Vector2( 1, 1 ),
  shininess: 30,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  //使顶点位置稍微偏移一点，避免闪烁，性能优于renderer.logarithmicDepthBuffer
  polygonOffset: true,
  polygonOffsetFactor: - 4,
  wireframe: false
} );
const intersection = {
  intersects:false,
  point:new THREE.Vector3(),
  normal:new THREE.Vector3()
}
const params = {
  minScale: 10,
  maxScale: 20,
  rotate: true,
  clear: function () {

    removeDecals();

  }
};
let mouse=new THREE.Vector2()
const position = new THREE.Vector3();
const orientation = new THREE.Euler();
init().then(time)
function onSize(){
  width = window.innerWidth
  height = window.innerHeight
  camera.aspect = width/height
  camera.updateProjectionMatrix()
  renderer.setSize(width,height)
}
async function init(){
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75,width/height,1,1000)
  camera.position.set(0,5,120)
  camera.lookAt( scene.position )
  control = new OrbitControls(camera,canvas)
  control.minDistance = 50
  control.maxDistance = 200
  control.update()
  renderer = new THREE.WebGLRenderer({canvas:canvas,antialias:true})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||2))
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(width,height)
  renderer.render(scene,camera)
  //
  ambientLight = new THREE.AmbientLight(0x443333,0.5)
  scene.add(ambientLight)
  directionalLight1 = new THREE.DirectionalLight(0xffddcc,0.8)
  directionalLight1.position.set(10,10,5)
  directionalLight1.scale.set(5,5,5)
  scene.add(directionalLight1)
  //平行光追随物体 可以设置directionLight.target = Object3D
  // scene.add(directionalLight1.target)
  // const helper = new THREE.DirectionalLightHelper( directionalLight1, 5 );
  // scene.add( helper );
  directionalLight2 = new THREE.DirectionalLight(0xccccff,0.8)
  directionalLight2.position.set(-10,10,-5)
  directionalLight2.scale.set(5,5,5)
  scene.add(directionalLight2)
  //
  obj()
  //
  rayCaster = new THREE.Raycaster()
  mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1,1,10),new THREE.MeshNormalMaterial())
  mouseHelper.visible = true
  scene.add(mouseHelper)
  let moved = false
  control.addEventListener('change',()=>{
    moved = true
  },{passive:true})
  //鼠标点击
  window.addEventListener( 'pointerdown', function () {
    moved = false;
  },{passive:true});
  window.addEventListener('pointerup',(e)=>{
    
    if(moved == false){
     
      checkIntersection(e.clientX,e.clientY)
      if(intersection.intersects)shoot()
     
    }
  },{passive:true})
  window.addEventListener('pointermove',(e)=>{
    if(e.isPrimary){
      checkIntersection(e.clientX,e.clientY)
    }
  },{passive:true})
  
  
  window.addEventListener('resize',onSize,{passive:true})
}
function obj(){
  const geometry = new THREE.BufferGeometry()
  geometry.setFromPoints([new THREE.Vector3(),new THREE.Vector3()])
  line = new THREE.Line(geometry,new THREE.LineBasicMaterial())
  scene.add(line)
  const loader = new GLTFLoader()
  loader.loadAsync('../../source/gltfModel/LeePerrySmith.glb').then((data)=>{
    mesh = data.scene.children[0]
    mesh.material = new THREE.MeshPhongMaterial({
      specular:0x111111,
      map:texture.load('../../source/texture/decal/leePerrySmith/Map-COL.jpg'),
      specularMap:texture.load('../../source/texture/decal/leePerrySmith/Map-SPEC.jpg'),
      normalMap:texture.load('../../source/texture/decal/leePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg'),
      shininess:25
    })
    scene.add(mesh)
    mesh.scale.setScalar(10)
  })
}
function checkIntersection(x,y){
  if(mesh===undefined)return
  mouse.x = (x/width)*2-1
  mouse.y = -((y/height)*2-1)
  rayCaster.setFromCamera(mouse,camera)
  rayCaster.intersectObject(mesh,false,intersects)
  if(intersects.length>0){
    //相交的点
    let p = intersects[0].point
    mouseHelper.position.copy(p)
    intersection.point.copy(p)
    //相交的面
    
    let n = intersects[0].face.normal.clone()
    //通过传入的矩阵（m的左上角3 x 3子矩阵）变换向量的方向， 并将结果进行normalizes（归一化）。
    n.transformDirection(mesh.matrixWorld)
    //往外延伸了10倍
    n.multiplyScalar(10)
    //向量相加
    n.add(p)
    intersection.normal.copy(intersects[0].face.normal)
    mouseHelper.lookAt(n)
    const positions = line.geometry.attributes.position
    //positions有两个点
    positions.setXYZ(0,p.x,p.y,p.z)
    positions.setXYZ(1,n.x,n.y,n.z)
    positions.needsUpdate = true
    console.log(p,n);
    console.log(positions);
    intersection.intersects = true
    intersects.length = 0
  }else{
    intersection.intersects = false
  }
  const gui = new GUI();

	gui.add( params, 'minScale', 1, 30 );
	gui.add( params, 'maxScale', 1, 30 );
	gui.add( params, 'rotate' );
	gui.add( params, 'clear' );
	gui.open();
}
function shoot(){
  position.copy(intersection.point)
  orientation.copy(mouseHelper.rotation)
  if(params.rotate){
    orientation.z = Math.random()*2*Math.PI
  }
  const scale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
	size.set( scale, scale, scale );
  const material = decalMaterial.clone()
  material.color.setHex(Math.random() * 0xffffff)
  // mesh — 一个网格对象。
  // position — 贴花投影器的位置。
  // orientation — 贴花投影器的朝向。
  // size — 贴花投影器的尺寸。
  const m=new THREE.Mesh(new DecalGeometry(mesh, position, orientation, size),material)
  decals.push(m)
  scene.add(m)
}
function removeDecals() {

  decals.forEach( function ( d ) {

    scene.remove( d );

  } );

  decals.length = 0;

}
function time(){
  requestAnimationFrame(time)
  
  renderer.render(scene,camera)
}
let i = new IntersectionObserver()
