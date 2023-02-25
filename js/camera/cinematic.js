import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera'
let scene, camera, renderer, control, ambientLight, directionalLight
let cubeGroup
let point = new THREE.Vector2()
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
let rayCaster
let INTERSECTED;
const radius = 100;
let theta = 0;

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
  scene.background = new THREE.Color(0xf0f0f0);
  //
  obj()
  //
  ambientLight = new THREE.AmbientLight('#ffffff', 0.3)
  scene.add(ambientLight)
  directionalLight = new THREE.DirectionalLight('#ffffff', 0.35)
  directionalLight.position.set(1, 1, 1).normalize()
  directionalLight.scale.set(5, 5, 5)
  scene.add(directionalLight)
  //平行光追随物体 可以设置directionLight.target = Object3D
  // scene.add(directionalLight.target)
  // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  // scene.add( helper );
  camera = new CinematicCamera(75, width / height, 1, 1000)
  camera.setLens(10)
  camera.position.set(0, 100, 100)
  camera.lookAt(scene.position)
  // control = new OrbitControls(camera, canvas)
  // control.enableDamping = true
  rayCaster = new THREE.Raycaster()

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2))
  
  renderer.setSize(width, height)
  renderer.render(scene, camera)
  
  window.addEventListener('resize', size)
  document.addEventListener('mousemove', mouse)
  const effectController = {

    focalLength: 15,
    // jsDepthCalculation: true,
    // shaderFocus: false,
    //
    fstop: 2.8,
    // maxblur: 1.0,
    //
    showFocus: false,
    focalDepth: 3,
    // manualdof: false,
    // vignetting: false,
    // depthblur: false,
    //
    // threshold: 0.5,
    // gain: 2.0,
    // bias: 0.5,
    // fringe: 0.7,
    //
    // focalLength: 35,
    // noise: true,
    // pentagon: false,
    //
    // dithering: 0.0001

  };

  const matChanger = function ( ) {

    for ( const e in effectController ) {

      if ( e in camera.postprocessing.bokeh_uniforms ) {

        camera.postprocessing.bokeh_uniforms[ e ].value = effectController[ e ];

      }

    }

    camera.postprocessing.bokeh_uniforms[ 'znear' ].value = camera.near;
    camera.postprocessing.bokeh_uniforms[ 'zfar' ].value = camera.far;
    camera.setLens( effectController.focalLength, camera.frameHeight, effectController.fstop, camera.coc );
    effectController[ 'focalDepth' ] = camera.postprocessing.bokeh_uniforms[ 'focalDepth' ].value;

  };

  //

  const gui = new GUI();

  gui.add( effectController, 'focalLength', 1, 135, 0.01 ).onChange( matChanger );
  gui.add( effectController, 'fstop', 1.8, 22, 0.01 ).onChange( matChanger );
  gui.add( effectController, 'focalDepth', 0.1, 100, 0.001 ).onChange( matChanger );
  gui.add( effectController, 'showFocus', true ).onChange( matChanger );

  matChanger();

  
}
function obj() {
  cubeGroup = new THREE.Group()
  const geometry = new THREE.BoxGeometry( 5, 5, 5);
  for (let index = 0; index < 1000; index++) {
    let cube = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color:Math.random()*0xffffff}))
    cube.position.x = THREE.MathUtils.randInt(-100, 100)
    cube.position.y = THREE.MathUtils.randInt(-100, 100)
    cube.position.z = THREE.MathUtils.randInt(-100, 100)
    cubeGroup.add(cube)
  }
  scene.add(cubeGroup)

}
function mouse(event) {
  point.x = (event.clientX / window.innerWidth) * 2 - 1,
  point.y = -(event.clientY / window.innerHeight) * 2 + 1
}

function time() {
  requestAnimationFrame(time)

  ray()
  // control.update()

}
function ray() {
  // theta += 0.1;
	// camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
	// camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
	// camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
	// camera.lookAt( scene.position );
	// camera.updateMatrixWorld();

  rayCaster.setFromCamera(point, camera)
  let intersects = rayCaster.intersectObjects(cubeGroup.children, false)
  if ( intersects.length > 0 ) {
    const targetDistance = intersects[ 0 ].distance;

					camera.focusAt( targetDistance );
   // using Cinematic camera focusAt method
    
    // intersects[0].object.material.emissive.setHex(0xff0000)
    
    if ( INTERSECTED != intersects[ 0 ].object ) {
      //从一个物体直接移动到另一个物体，需要将前一个物体设置为原来的颜色，再将INTERSECTED设置为现在的物体
      if ( INTERSECTED ) {
        INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      }

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );

    }
   
  }else {
    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

    INTERSECTED = null;

  }

  

  if ( camera.postprocessing.enabled ) {

    camera.renderCinematic( scene, renderer );

  } else {

    scene.overrideMaterial = null;

    renderer.clear();
    renderer.render( scene, camera );

  }

}
