import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
function planesFromMesh(v, i) {
  const n = v.length
  let result = new Array(n)
  for (let index = 0, j = 0; index < n; index++, j += 3) {
    const a = v[i[j]], b = v[i[j + 1]], c = v[i[j + 2]]
    result[index] = new THREE.Plane().setFromCoplanarPoints(a, b, c)

  }
  return result
}
const planeToMatrix = (function () {

  // creates a matrix that aligns X/Y to a given plane

  // temporaries:
  const xAxis = new THREE.Vector3(),
    yAxis = new THREE.Vector3(),
    trans = new THREE.Vector3();

  return function planeToMatrix(plane) {

    const zAxis = plane.normal,
      matrix = new THREE.Matrix4();

    // Hughes & Moeller '99
    // "Building an Orthonormal Basis from a Unit Vector."

    if (Math.abs(zAxis.x) > Math.abs(zAxis.z)) {

      yAxis.set(- zAxis.y, zAxis.x, 0);

    } else {

      yAxis.set(0, - zAxis.z, zAxis.y);

    }

    xAxis.crossVectors(yAxis.normalize(), zAxis);

    plane.coplanarPoint(trans);
    return matrix.set(
      xAxis.x, yAxis.x, zAxis.x, trans.x,
      xAxis.y, yAxis.y, zAxis.y, trans.y,
      xAxis.z, yAxis.z, zAxis.z, trans.z,
      0, 0, 0, 1);

  };

})();
let scene, camera, renderer, control
let globalClippingPlanes
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
const Vertices = [
  new THREE.Vector3(+ 1, 0, + Math.SQRT1_2),
  new THREE.Vector3(- 1, 0, + Math.SQRT1_2),
  new THREE.Vector3(0, + 1, - Math.SQRT1_2),
  new THREE.Vector3(0, - 1, - Math.SQRT1_2)
],
  Indices = [
    0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2
  ],
  Planes = planesFromMesh(Vertices, Indices),
  PlaneMatrices = Planes.map(planeToMatrix),
  GlobalClippingPlanes = cylindricalPlanes(5, 2.5),
  Empty = Object.freeze([]);

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
  obj()
  //
  const spotLight = new THREE.SpotLight(0xffffff, 0.5);
  spotLight.angle = Math.PI / 5;
  spotLight.penumbra = 0.2;
  spotLight.position.set(2, 3, 3);
  spotLight.castShadow = true;
  spotLight.shadow.camera.near = 3;
  spotLight.shadow.camera.far = 10;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  scene.add(spotLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(0, 2, 0);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 10;

  dirLight.shadow.camera.right = 1;
  dirLight.shadow.camera.left = - 1;
  dirLight.shadow.camera.top = 1;
  dirLight.shadow.camera.bottom = - 1;

  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);
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
  renderer.shadowMap.enabled = true
  globalClippingPlanes = createPlanes( GlobalClippingPlanes.length );
				renderer.clippingPlanes = Empty;
				renderer.localClippingEnabled = true;
  renderer.setSize(width, height)
  renderer.render(scene, camera)
  window.addEventListener('resize', size)
}
function obj() {
  const clipMaterial = new THREE.MeshToonMaterial({
    color: 0xee0a10,
    shininess: 100,
    side: THREE.DoubleSide,
    clippingPlanes: createPlanes(Planes.length),
    clipShadows: true
  })
  const object = new THREE.Group()
  const geo = new THREE.BoxGeometry(0.18, 0.18, 0.18)
  for (let z = - 2; z <= 2; ++z)
    for (let y = - 2; y <= 2; ++y)
      for (let x = - 2; x <= 2; ++x) {

        const mesh = new THREE.Mesh(geo, clipMaterial);
        mesh.position.set(x / 5, y / 5, z / 5);
        mesh.castShadow = true;
        object.add(mesh);

      }

      object.position.y=2
  scene.add(object);
  const planeGeometry = new THREE.PlaneGeometry( 3, 3, 1, 1 ),

  color = new THREE.Color();

const volumeVisualization = new THREE.Group();
volumeVisualization.visible = false;

for ( let i = 0, n = Planes.length; i !== n; ++ i ) {

  const material = new THREE.MeshBasicMaterial( {
    color: color.setHSL( i / n, 0.5, 0.5 ).getHex(),
    side: THREE.DoubleSide,

    opacity: 0.2,
    transparent: true,

    // clip to the others to show the volume (wildly
    // intersecting transparent planes look bad)
    clippingPlanes: clipMaterial.clippingPlanes.
      filter( function ( _, j ) {

        return j !== i;

      } )

    // no need to enable shadow clipping - the plane
    // visualization does not cast shadows

  } );

  const mesh = new THREE.Mesh( planeGeometry, material );
  mesh.matrixAutoUpdate = false;

  volumeVisualization.add( mesh );
}
scene.add( volumeVisualization );

const ground = new THREE.Mesh( planeGeometry,
  new THREE.MeshPhongMaterial( {
    color: 0xa0adaf, shininess: 10 } ) );
ground.rotation.x = - Math.PI / 2;
ground.scale.multiplyScalar( 3 );
ground.receiveShadow = true;
scene.add( ground );

}
function createPlanes(n) {
  const result = new Array(n)
  result.forEach((e) => [
    e = new THREE.Plane()
  ])
  return result
}
function cylindricalPlanes(n, distance) {
  const result = createPlanes(n)
  result.forEach((e, i) => {
    const plane = e
    const angle = i * Math.PI / 2
    plane.setFromCoplanarPoints(Math.cos(angle), 0, Math.sin(angle))
    plane.constant = distance
  })
  return result
}
function time() {
  requestAnimationFrame(time)
  control.update()
  renderer.render(scene, camera)
}