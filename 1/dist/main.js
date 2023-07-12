import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'

let renderer, scene, camera, pControl;
let xdir = 0, zdir = 0
let tempoI, tempoF, vel, deltaT

function init() {

	// renderer
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// scene
	scene = new THREE.Scene();
	scene.add(new THREE.GridHelper(100, 100))

	// camera
	const aspect = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.y = 5

	// ambient
	scene.add( new THREE.AmbientLight( 0x444444 ) );

	// axes
	scene.add( new THREE.AxesHelper( 40 ) );

	pControl = new PointerLockControls(camera, renderer.domElement)

	document.getElementById('btnPlay').onclick = ()=>{
		pControl.lock()
	}

	document.addEventListener('keydown', (e)=>{
		switch(e.code) {
			case "KeyW":
			case "ArrowUp":
				zdir = 1
				break
			case "KeyA":
			case "ArrowDown":
				xdir = -1
				break
			case "KeyS":
			case "ArrowLeft":
				zdir = -1
				break
			case "KeyD":
			case "ArrowRight":
				xdir = 1
				break
		}
	})

	document.addEventListener('keyup', (e)=>{
		switch(e.code) {
			case "KeyW":
			case "ArrowUp":
				zdir = 0
				break
			case "KeyA":
			case "ArrowLeft":
				xdir = 0
				break
			case "KeyS":
			case "ArrowDown":
				zdir = 0
				break
			case "KeyD":
			case "ArrowRight":
				xdir = 0
				break
		}
	})

	tempoI = Date.now()
	vel = 16
}

function render() {
	requestAnimationFrame(render)

	tempoF = Date.now()

	deltaT = (tempoF - tempoI)/1000

	let xDis = xdir * vel * deltaT
	let zDis = zdir * vel * deltaT

	pControl.moveRight(xDis)
	pControl.moveForward(zDis)

	tempoI = tempoF

	renderer.render( scene, camera );

}

init();
render();