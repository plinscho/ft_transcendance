import * as THREE from 'three';
import { Text3D } from '../Text3D.js';

export class ScoreboardPlayer {
	#scoreOffsetX = 30;
	#nameOffsetY = 40;
	#scoreOffsetZ = 50;
	#nameSize = 20;

	constructor(scene, state, nicks, field_x, field_z){
		this.scene = scene;
		this.state = state;
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
		if (this.state.currentState === this.state.states.LOCALCOOP ||
			this.state.currentState === this.state.states.TOURNAMENTS
		) {
			this.front = false // change view to top view.
		}

		this.positionP1Front = {
			x: this.state.player2 ? -this.field_x / 2 - this.#scoreOffsetX : this.field_x / 2 + this.#scoreOffsetX,
			y: 50,
			z: this.state.player2 ? +this.field_z / 2 + this.#scoreOffsetZ + 100 : -this.field_z / 2 - this.#scoreOffsetZ - 100,
		};
		
		this.positionP2Front = {
			x: this.state.player2 ? -this.field_x / 2 - this.#scoreOffsetX : this.field_x / 2 + this.#scoreOffsetX,
			y: 50,
			z: this.state.player2 ? -this.field_z / 2 - this.#scoreOffsetZ - 100 : +this.field_z / 2 + this.#scoreOffsetZ + 100,
		};

		this.positionP1Top = {
			x: -this.field_x / 2 - this.#scoreOffsetX - 75,
			y: 70,
			z: -this.field_z / 2 - this.#scoreOffsetZ,
		};

		this.positionP2Top = {
			x: this.field_x / 2 + this.#scoreOffsetX + 75,
			y: 70,
			z: -this.field_z / 2 + this.#scoreOffsetZ,
		};

	}

	updateNicks(nick1, nick2) {
		// this.nicks[0] = nick1;
		// this.nicks[1] = nick2;
	
		if (this.meshes["nameP1Mesh"]) {
			this.meshes["nameP1Mesh"].updateText(nick1.toString());
		}
	
		if (this.meshes["nameP2Mesh"]) {
			this.meshes["nameP2Mesh"].updateText(nick2.toString());
		}	
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
		color,
		positionFront,
		positionTop,
		rotationFrontY,
		rotationTopX,
		meshKey,
		isScore
	}) {
		const isFront = this.front;
		const position = isFront ? positionFront : positionTop;
	
		const text3D = new Text3D(text, position, color, 30, 1);
	
		text3D.createText((textMesh) => {
			text3D.mesh = textMesh;
			if (isFront) {
				textMesh.rotation.y = rotationFrontY * Math.PI / 180;
			} else {
				textMesh.position.x -= 1;
				if (isScore === true)
					textMesh.position.y = -50;
				else
					textMesh.position.y = 5;
				textMesh.position.z = -this.field_x / 2 - this.#scoreOffsetZ;
				textMesh.rotation.x = rotationTopX * Math.PI / 180;
			}
			this.scene.add(textMesh);
			this.meshes[meshKey] = text3D;
		});
		return text3D;
	}

	createP1Score() {
		this.createPlayerText({
			text: this.score1.toString(),
			color: 0xDDCAD9,
			positionFront: this.positionP1Front,
			positionTop: this.positionP1Top,
			rotationFrontY: this.state.player2 ? 90 : -90,
			rotationTopX: -30,
			meshKey: "scoreP1Mesh",
			isScore: true
		});
	}
	
	createP1Name() {
		if (this.front)
			var pos1 = {...this.positionP1Front, y: this.positionP1Front.y + this.#nameOffsetY};
		else
			var pos2 = {...this.positionP1Top,  x: this.positionP1Top.x - this.#nameOffsetY };
		this.createPlayerText({
			text: this.nicks[0],
			color: 0x9E0031,
			positionFront: pos1,
			positionTop: pos2,
			rotationFrontY: this.state.player2 ? 90 : -90,
			rotationTopX: -30,
			meshKey: "nameP1Mesh",
			isScore: false
		});
	}
	
	createP2Score() {
		this.createPlayerText({
			text: this.score2.toString(),
			color: 0xDDCAD9,
			positionFront: this.positionP2Front,
			positionTop: this.positionP2Top,
			rotationFrontY: this.state.player2 ? 90 : -90,
			rotationTopX: -30,
			meshKey: "scoreP2Mesh",
			isScore: true
		});
	}	

	createP2Name() {
		if (this.front)
			var pos1 = {...this.positionP2Front, y: this.positionP2Front.y + this.#nameOffsetY};
		else
			var pos2 = {...this.positionP2Top,  x: this.positionP2Top.x - this.#nameOffsetY - 10};
		this.createPlayerText({
			text: this.nicks[1],
			color: 0x9E0031,
			positionFront: pos1,
			positionTop: pos2,
			rotationFrontY: this.state.player2 ? 90 : -90,
			rotationTopX: -30,
			meshKey: "nameP2Mesh",
			isScore: false
		});
	}

}



