import * as THREE from 'three';

import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { DragControls } from "three/addons/controls/DragControls.js";
//import { Porta } from './portas'
//import { Quarto } from './quarto'

let renderer, camera, pControl;
var scene;
let xdir = 0, zdir = 0
let tempoI, tempoF, vel, deltaT
let loader = new GLTFLoader()
var mouse, raycaster
let boxGeometry, boxMaterial, boxMesh;
let isBoxSelected = false;

let gaveta1voxModel, gaveta1selected = false, gaveta1open = false;
let porta1, chave1, parede1, parede1a, parede1b, parede1c, cama = null;

let inventario = new Array();

let arrastaveis = []



function init() {

	// renderer
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// raycaster
	mouse = new THREE.Vector2
	raycaster = new THREE.Raycaster()
	raycaster.far = 15;

	// scene
	scene = new THREE.Scene();
	scene.add(new THREE.GridHelper(100, 100))

	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry( 100, 100, 1, 1 ),
		new THREE.MeshPhongMaterial( { color: 0xa0adaf, shininess: 150 } )
	);

	ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
	ground.receiveShadow = true;
	scene.add( ground );

	// camera
	const aspect = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.y = 7

	// ambient
	const light1 = new THREE.PointLight(0xFFFFFF, 0.5)
	light1.position.set(-25, 30, 20)
	scene.add(light1)

	const sphereSize = 1;
	const pointLightHelper = new THREE.PointLightHelper( light1, sphereSize );
	scene.add( pointLightHelper );

	// ambient
	const light2 = new THREE.PointLight(0xFFFFFF, 0.5)
	light2.position.set(-25, 30, 30)
	scene.add(light2)

	const sphereSize2 = 1;
	const pointLightHelper2 = new THREE.PointLightHelper( light2, sphereSize );
	scene.add( pointLightHelper2 );

	  // Criar a geometria da caixa
	  boxGeometry = new THREE.BoxGeometry(2, 2, 2);

	  // Criar um material inicial com uma cor padrão
	  boxMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
	
	  // Criar uma malha com a geometria e o material
	  boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
	  boxMesh.position.set(0, 1, 0);
	  scene.add(boxMesh);

	  class Porta {
		constructor(model, x, y, z) {
			this.portatrancada = true;
		  this.portaselected = false;
		  this.portaopen = false;
		  this.porta = null;

		  	const geometry = new THREE.BoxGeometry( 1, 0, 1 ); 
			const material = new THREE.MeshBasicMaterial( {color: 0xffff00} ); 
			const hinge = new THREE.Mesh( geometry, material );

		  this.portafuncional = hinge;

		  loader.load(model, (gltf) => {
			gltf.scene.scale.setScalar(3);
			gltf.scene.position.set(x/3, y/3, z/3);
			this.portafuncional.add(gltf.scene);
			this.porta = gltf.scene.children[0];
		  });

			this.portafuncional.add( hinge );
			hinge.position.set(x, y, z)

			scene.add( this.portafuncional );

			document.addEventListener("click", function () {
				if (pControl.isLocked) {
					if (porta1.portaselected) {
						if (porta1.portatrancada == true && inventario.includes('Chave 1'))
						{if (porta1.portaopen == false) {
						  porta1.portafuncional.rotation.y -= 1.5
						  porta1.portaopen = true;
						} else {
							porta1.portafuncional.rotation.y += 1.5
						  porta1.portaopen = false;
						}
					}}}})
		}
	  }
	  
	  class Item {
		constructor(model, scalar, x, y, z, nome='') {
			this.noInventario = false;
			this.modeloItem = null;
			this.selected = false;

		  loader.load(model, (gltf) => {
			gltf.scene.scale.setScalar(scalar);
			gltf.scene.position.set(x, y, z);
			scene.add(gltf.scene);
			this.modeloItem = gltf.scene.children[0];
		  });

		  scene.add(this.modeloItem)

		  document.addEventListener("click", () => {
			if (pControl.isLocked) {
				if (this.selected == true) {
					this.noInventario = true
					inventario.push(nome)
					if (this.modeloItem.parent) {
						this.modeloItem.parent.remove(this.modeloItem); // Remove o modelo da cena
					  }
				}
			}
		  });
	  }}

	  class Objeto {
		constructor(model, scalar, x, y, z, rotY, nome='') {
			this.selected = false;
			this.modeloObjeto = null;

		  loader.load(model, (gltf) => {
			gltf.scene.scale.setScalar(scalar);
			gltf.scene.position.set(x, y, z);
			gltf.scene.rotation.y = rotY;
			scene.add(gltf.scene);
			this.modeloObjeto = gltf.scene.children[0];
		  });

		  scene.add(this.modeloObjeto)
		}
	  }

	  function Quarto() {
		loader.load( 'models/Flower.glb', function ( gltf ) {
			gltf.scene.scale.setScalar( 5 )
			gltf.scene.position.set( -1, 0, -1 )
			scene.add( gltf.scene )
		}, undefined, function ( error ) {
			console.error( error )
		})
	
		loader.load( 'models/mesavox.glb', function ( gltf ) {
			gltf.scene.scale.setScalar( 3 )
			gltf.scene.position.set( -46, 0, 40 )
			gltf.scene.rotation.y = Math.PI
			scene.add( gltf.scene )
		}, undefined, function ( error ) {
			console.error( error )
		})
	
		loader.load( 'models/gaveta1vox.glb', function ( gltf ) {
			gltf.scene.scale.setScalar( 3 );
			gltf.scene.position.set( -46, 1.8, 35.8 );
			gltf.scene.rotation.y = Math.PI;
			scene.add( gltf.scene );
			gaveta1voxModel = gltf.scene.children[0];
		}, undefined, function ( error ) {
			console.error( error );
		});
	


		chave1 = new Item('models/chave1Vox.glb', 1, -35, 6, 35.8, 'Chave 1')

		porta1 = new Porta('models/porta1.glb', -10, 0, 0)

		parede1 = new Objeto('models/parede1vox.glb', 3, -25.035, 0, 0, Math.PI)

		parede1a = new Objeto('models/paredecomum.glb', 3, -50, 0, 25.5, 1.57)
		parede1b = new Objeto('models/paredecomum.glb', 3, 0, 0, 25.5, 1.57)
		parede1c = new Objeto('models/paredecomum.glb', 3, -25.035, 0, 50, Math.PI)

		cama = new Objeto('models/camavox.glb', 2.5, -10, 0, 35, Math.PI+Math.PI/2)
	}

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
	vel = 18

	Quarto()


	document.addEventListener("click", function () {
		if (!pControl.isLocked) {
		  pControl.lock();
		}
		else {
			if (isBoxSelected) {
				boxMesh.position.y +=1
			}

			if (gaveta1selected) {
				if (gaveta1open == false){
					gaveta1voxModel.position.x -= 0.5
					gaveta1open = true
				} else {
					gaveta1voxModel.position.x += 0.5
					gaveta1open = false
				}
				
			}

		}
	  });
	

	  const geometry = new THREE.SphereGeometry(1, 32, 32);
	  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	  const sphere = new THREE.Mesh(geometry, material);
	  scene.add(sphere);
	  
	  const dragControls = new DragControls([sphere, boxMesh], camera, renderer.domElement);

	  dragControls.addEventListener('drag', (event) => {
		const intersection = raycaster.intersectObject(event.object)[0];
		if (intersection && pControl.isLocked) {
		  // Atualize a posição do objeto com base na interseção do raio
		  event.object.position.x.copy(intersection.point.position.x/2);
		  event.object.position.y.copy(intersection.point.position.y/2);
		  event.object.position.z.copy(intersection.point.position.z/2);
		}
	  });
	  

	  
	  
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

	// Verificar colisões com o Raycaster
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children);

	// Verificar se o Raycaster colide com o BoxGeometry
	if (intersects.length > 0 && intersects[0].object === boxMesh) {
		// Raycast está colidindo com o BoxGeometry
		isBoxSelected = true;
		boxMaterial.color.set(0xff0000); // Definir a cor desejada quando selecionado
		boxMesh.position.z += 0.03
		} else {
		// Raycast não está colidindo com o BoxGeometry
		isBoxSelected = false;
		boxMaterial.color.set(0xFFFFFF); // Voltar para a cor padrão
	}

	// Verificar se o Raycaster colide com a gaveta1
	if (intersects.length > 0 && intersects[0].object === gaveta1voxModel) {
		// Raycast está colidindo com o gaveta1voxModel
		gaveta1selected = true;
	} else {
		gaveta1selected = false
	}

	// Verificar se o Raycaster colide com a porta1
	if (intersects.length > 0 && intersects[0].object === porta1.porta) {
		// Raycast está colidindo com a porta1
		porta1.portaselected = true;
	} else {
		porta1.portaselected = false
	}

	// Verificar se o Raycaster colide com a chave1
	if (intersects.length > 0 && intersects[0].object === chave1.modeloItem) {
		// Raycast está colidindo com a chave1
		chave1.selected = true;
		
	} else {
		chave1.selected = false
	}




	renderer.render( scene, camera );

}



init();
render();