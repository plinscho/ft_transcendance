import * as THREE from 'three';
import { Text3D } from '../Text3D.js';

export class ScoreboardPlayer {
	#scoreOffsetX = 30;
	#nameOffsetY = 40;
	#scoreOffsetZ = 0;
	#nameSize = 20;

	constructor(scene, state, nicks, field_x, field_z){
		this.scene = scene;
		this.currentState = state.getSceneName();
		this.field_x = field_x;
		this.field_z = field_z;
		this.front = true; // start assuming we are in "PLAY" or "MULTIPLAYER" for frontal view
		this.nicks = nicks;

		if (!this.nicks) {
			this.nicks = ["P1", "P2"];
		}

		this.score1 = 0;
		this.score2 = 0;
		this.meshes = {};

		// texture loaders variables
		this.scoreP1Mesh = null;
		this.nameP1Mesh = null;
		this.scoreP2Mesh = null;
		this.nameP2Mesh = null;

		if (this.currentState === state.currentState.LOCALCOOP ||
			this.currentState === state.currentState.TOURNAMENTS
		) {
			this.front = false // change view to top view.
		}
		console.log(this.currentState);

		this.positionP1Front = {
			x: this.field_x / 2 + this.#scoreOffsetX,
			y: 50,
			z: -this.field_z / 2 + this.#scoreOffsetZ,
		};
		
		this.positionP2Front = {
			x: this.field_x / 2 + this.#scoreOffsetX,
			y: 50,
			z: this.field_z / 2 + this.#scoreOffsetZ,
		};

		this.positionP1Top = {
			x: -this.field_x / 2 - this.#scoreOffsetX,
			y: 50,
			z: this.field_z / 2 + this.#scoreOffsetZ,
		};

		this.positionP2Top = {
			x: this.field_x / 2 + this.#scoreOffsetX,
			y: 50,
			z: this.field_z / 2 + this.#scoreOffsetZ,
		};

	}

	updateScoreboard(score1, score2){
		this.score1 = score1;
		this.score2 = score2;
	
		if (this.meshes["scoreP1Mesh"]) {
			this.meshes["scoreP1Mesh"].updateText(this.score1.toString());
		}
	
		if (this.meshes["scoreP2Mesh"]) {
			this.meshes["scoreP2Mesh"].updateText(this.score2.toString());
		}
	}

	resetTextScoreboard() {
		if (this.meshes) {
			Object.values(this.meshes).forEach(mesh => {
				if (mesh) {
					this.scene.remove(mesh); // lo quita del render
					if (mesh.geometry) mesh.geometry.dispose(); // libera memoria de geometría
					if (mesh.material) mesh.material.dispose(); // libera memoria de material
				}
			});
			this.meshes = {}; // o [] si usas array, pero estás usando como objeto tipo diccionario
		}
	}

	createPlayerText({
		text,
		positionFront,
		positionTop,
		rotationFrontY,
		rotationTopX,
		meshKey,
	}) {
		const isFront = this.front;
		const position = isFront ? positionFront : positionTop;
	
		const text3D = new Text3D(text, position, 0xffffff, 30, 1);
	
		text3D.createText((textMesh) => {
			text3D.mesh = textMesh;
			if (isFront) {
				textMesh.rotation.y = rotationFrontY * Math.PI / 180;
			} else {
				textMesh.position.x -= 25;
				textMesh.position.y = 5;
				textMesh.position.z = -this.field_x / 2 - scoreOffsetZ;
				textMesh.rotation.x = rotationTopX * Math.PI / 180;
			}
			this.scene.add(textMesh);
			this.meshes[meshKey] = text3D;
		});
	}

	createP1Score() {
		this.createPlayerText({
			id: 1,
			text: this.score1.toString(),
			positionFront: this.positionP1Front,
			positionTop: this.positionP1Top,
			rotationFrontY: -90,
			rotationTopX: -30,
			meshKey: "scoreP1Mesh"
		});
	}
	
	createP1Name() {
		const pos = {...this.positionP1Front, y: this.positionP1Front.y + this.#nameOffsetY};
		this.createPlayerText({
			id: 0,
			text: this.nicks[0],
			positionFront: pos,
			positionTop: this.positionP1Top,
			rotationFrontY: -90,
			rotationTopX: -30,
			meshKey: "nameP1Mesh"
		});
	}
	
	createP2Score() {
		this.createPlayerText({
			id: 2,
			text: this.score2.toString(),
			positionFront: this.positionP2Front,
			positionTop: this.positionP2Top,
			rotationFrontY: -90,
			rotationTopX: -30,
			meshKey: "scoreP2Mesh"
		});
	}	

	createP2Name() {
		const pos = {...this.positionP2Front, y: this.positionP2Front.y + this.#nameOffsetY};
		this.createPlayerText({
			id: 0,
			text: this.nicks[1],
			positionFront: pos,
			positionTop: this.positionP2Top,
			rotationFrontY: -90,
			rotationTopX: -30,
			meshKey: "nameP2Mesh"
		});
	}

}



