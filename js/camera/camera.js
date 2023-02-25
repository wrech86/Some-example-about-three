import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
let scene, camera, renderer, control, ambientLight, directionalLight, mesh
let cameraRig, activeCamera, activeHelper;
let cameraPerspective, cameraOrtho;
let cameraPerspectiveHelper, cameraOrthoHelper;
const frustumSize = 600;
let canvas = document.getElementById('canvas')
let width = window.innerWidth
let height = window.innerHeight
let aspect = width / height
init()
time()
function size() {
  width = window.innerWidth
  height = window.innerHeight
  aspect = width / height
  camera.aspect = width / height * 0.5
  camera.updateProjectionMatrix()
  cameraPerspective.aspect = 0.5 * aspect;
  cameraPerspective.updateProjectionMatrix()
  cameraOrtho.left = - 0.5 * frustumSize * aspect / 2;
  cameraOrtho.right = 0.5 * frustumSize * aspect / 2;
  cameraOrtho.top = frustumSize / 2;
  cameraOrtho.bottom = - frustumSize / 2;
  cameraOrtho.updateProjectionMatrix();
  renderer.setSize(width, height)
}
function init() {
  scene = new THREE.Scene()
  //

  //
  // ambientLight = new THREE.AmbientLight('#ffffff',0.5)
  // scene.add(ambientLight)
  // directionalLight = new THREE.DirectionalLight('#ffffff',0.8)
  // directionalLight.position.set(10,10,0)
  // directionalLight.scale.set(5,5,5)
  // scene.add(directionalLight)
  // scene.add(directionalLight.target)
  // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  // scene.add( helper );
  camera = new THREE.PerspectiveCamera(50, (width / height) * 0.5, 1, 10000)
  camera.position.set(0, 0, 2500)

  cameraPerspective = new THREE.PerspectiveCamera(50, (width / height) * 0.5, 150, 1000)
  cameraPerspectiveHelper = new THREE.CameraHelper(cameraPerspective)
  scene.add(cameraPerspectiveHelper)

  cameraOrtho = new THREE.OrthographicCamera(0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000)
  cameraOrthoHelper = new THREE.CameraHelper(cameraOrtho);
  scene.add(cameraOrthoHelper);

  activeCamera = cameraPerspective;
  activeHelper = cameraPerspectiveHelper;

  cameraOrtho.rotateY(Math.PI)
  cameraPerspective.rotateY(Math.PI)

  cameraRig = new THREE.Group()
  cameraRig.add(cameraOrtho)
  cameraRig.add(cameraPerspective)

  scene.add(cameraRig)
  obj()
  console.log(scene);
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2))
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(width, height)
  renderer.render(scene, camera)
  window.addEventListener('resize', size)
  document.addEventListener('keydown', onKeyDown);
}
function onKeyDown(event) {

  switch (event.keyCode) {

    case 79: /*O*/

      activeCamera = cameraOrtho;
      activeHelper = cameraOrthoHelper;

      break;

    case 80: /*P*/

      activeCamera = cameraPerspective;
      activeHelper = cameraPerspectiveHelper;

      break;

  }

}
function obj() {
  let geo = new THREE.BufferGeometry()
  let vertices = []
  for (let index = 0; index < 10000; index++) {
    vertices.push(parseFloat(THREE.MathUtils.randFloatSpread( 2000 )))
    vertices.push(parseFloat(THREE.MathUtils.randFloatSpread( 2000 )))
    vertices.push(parseFloat(THREE.MathUtils.randFloatSpread( 2000 )))
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  let p = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff' }))
  scene.add(p)
  mesh = new THREE.Mesh(
    new THREE.SphereGeometry(100, 16, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
  );
  scene.add(mesh);

  const mesh2 = new THREE.Mesh(
    new THREE.SphereGeometry(50, 16, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
  );
  mesh2.position.y = 150;
  mesh.add(mesh2);

  const mesh3 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 16, 8),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
  );
  mesh3.position.z = 150;
  cameraRig.add(mesh3);
}
function time() {
  requestAnimationFrame(time)
  render()
  renderer.render(scene, camera)
}
function render() {
  const r = Date.now() * 0.0005;

  mesh.position.x = 700 * Math.cos(r);
  mesh.position.z = 700 * Math.sin(r);
  mesh.position.y = 700 * Math.sin(r);

  mesh.children[0].position.x = 70 * Math.cos(2 * r);
  mesh.children[0].position.z = 70 * Math.sin(r);

  if (activeCamera === cameraPerspective) {

    cameraPerspective.fov = 35 + 30 * Math.sin(0.5 * r);
    cameraPerspective.far = mesh.position.length();
    cameraPerspective.updateProjectionMatrix();

    cameraPerspectiveHelper.update();
    cameraPerspectiveHelper.visible = true;

    cameraOrthoHelper.visible = false;

  } else {

    cameraOrtho.far = mesh.position.length();
    cameraOrtho.updateProjectionMatrix();

    cameraOrthoHelper.update();
    cameraOrthoHelper.visible = true;

    cameraPerspectiveHelper.visible = false;

  }

  cameraRig.lookAt(mesh.position);

  renderer.clear();

  activeHelper.visible = false;

  renderer.setViewport(0, 0, width / 2, height);
  renderer.render(scene, activeCamera);

  activeHelper.visible = true;

  renderer.setViewport(width / 2, 0, width / 2, height);
  renderer.render(scene, camera);

}