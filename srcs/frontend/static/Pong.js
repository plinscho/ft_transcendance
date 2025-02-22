import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { PlayerController } from './PlayerController.js';

export class Pong {
    constructor(state, multiplayer, networkManager, localcoop) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.camera1 = this.createCamera1();
        this.camera2 = this.createCamera2();
        this.localcoopCamera = this.createLocalCoopCamera();

        this.multiplayer = multiplayer;
        this.networkManager = networkManager;
        this.localcoop = localcoop;
        //fog
        //this.scene.fog = new THREE.Fog(0x000000, 10, 1000);

        // Field and Paddle properties
        this.field_x = 400;
        this.field_y = 10;
        this.field_z = 300

        this.paddle_x = 10;
        this.paddle_y = 10;
        this.paddle_z = 50;

        this.ballRadius = 7;

        // paddle
        this.paddle1DirZ = 0;
        this.paddle2DirZ = 0;
        this.paddleSpeed = 5;

        // ball
        this.ballDirZ = -1;
        this.ballDirX = -1;
        this.ballSpeed = 2;

        // scores
        this.scoreP1Text = null;
        this.scoreP2Text = null;
        this.score1 = 0;
        this.score2 = 0;
        this.maxScore = 5;
        this.bounceTime = 0;

        // Game Start Countdown
        this.starting = false;  // Whether the countdown is active
        this.start = false;     // Whether the game has officially started
        this.countdownText = null; // Holds reference to countdown `Text3D`
        this.countdownMesh = null; // Stores the countdown mesh

        this.createBackground();
        this.createScene();

        this.createScoreboard();


        //player initialization
        this.player1 = new PlayerController(
            this.state,
            this.paddle1,
            this.multiplayer,              // isMultiplayer
            this.field_x,
            5,                  // Paddle Speed
            this.ball,          // Ball reference
            this.networkManager, // Pass network manager if multiplayer
            this.ballDirX,      // Ball direction on X axis
            this.ballDirZ       // ^^ on Z axis
        );

        this.player2 = new PlayerController(
            this.state,
            this.paddle2,
            this.multiplayer,   // Multiplayer status
            this.field_x,
            5,                  // Paddle Speed
            this.ball,          // Ball reference
            this.networkManager, // Pass network manager if multiplayer
            this.ballDirX,      // Ball direction on X axis
            this.ballDirZ       // ^^ on Z axis
        );


    }
    createLocalCoopCamera() {
        const cameraLocalCoop = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        cameraLocalCoop.position.set(0, 250, 350); // Start behind Paddle1
        cameraLocalCoop.lookAt(new THREE.Vector3(0, 0, 0));

        return cameraLocalCoop;
    }

    createCamera1() {
        //Camara player1
        const camera1 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera1.position.set(400, 200, 0); // Start behind Paddle1
        camera1.lookAt(new THREE.Vector3(0, 0, 0));

        return camera1;
    }

    createCamera2() {
        //Camara player2
        const camera2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera2.position.set(-400, 200, 0); // Posición detrás del paddle 2, en el lado opuesto
        camera2.lookAt(new THREE.Vector3(0, 0, 0));

        return camera2;
    }

    updateCameraPlayer1() {
        if (!this.camera1 || !this.paddle1 || !this.ball) return;

        this.camera1.lookAt(0, 0, 0);
        // Move camera behind Paddle1
        //this.camera1.position.x = this.paddle1.position.x - 200;
        //this.camera1.position.y += (this.paddle1.position.y - this.camera1.position.y) * 0.05;
        //this.camera1.position.z = this.ball.position.z + 200 + 0.04 * (-this.ball.position.x + this.paddle1.position.x);

        // Look at the ball instead of manual rotations
        //this.camera1.rotation.x = -0.01 * (this.ball.position.y) * Math.PI / 180;
        //this.camera1.rotation.y = -60 * Math.PI / 180;
        //this.camera1.rotation.z = -90 * Math.PI / 180;
    }

    updateCameraPlayer2() {
        if (!this.camera2 || !this.paddle2 || !this.ball) return;
    
        this.camera1.lookAt(0, 0, 0);
        // Posición de la cámara detrás de Paddle2 (invertida respecto a Player 1)
        // this.camera2.position.x = this.paddle2.position.x + 200;  // Invertimos la dirección
        // this.camera2.position.y += (this.paddle2.position.y - this.camera2.position.y) * 0.05;
        // this.camera2.position.z = this.paddle2.position.z + 200 + 0.04 * (-this.ball.position.x + this.paddle2.position.x);
    
        // Ajustar la orientación para que mire correctamente

        // this.camera2.rotation.x = -0.01 * (this.ball.position.y) * Math.PI / 180;
        // this.camera2.rotation.y = 60 * Math.PI / 180; // Rotamos la cámara 180° en Y
        // this.camera2.rotation.z = 90 * Math.PI / 180; // Ajuste en Z para mantener perspectiva similar
    }
    

    createBackground() {
        const bgGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);

        const bgMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uColor1: { value: new THREE.Color(0x440088) },
                uColor2: { value: new THREE.Color(0x440066) },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                varying vec2 vUv;
                void main() {
                    float dist = distance(vUv, vec2(0.5));
                    vec3 color = mix(uColor2, uColor1, smoothstep(0.1, 0.7, dist));
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            depthWrite: false,
            depthTest: false
        });

        this.backgroundMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        this.backgroundMesh.renderOrder = -1;

        const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.backgroundCamera = bgCamera;

        this.scene.add(this.backgroundMesh);
    }

    createScene() {
        const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ffff });
        const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x440066 });
        const paddleMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const paddle2Material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xD43001 });


        // Add helpers
        const gridHelper = new THREE.GridHelper( 600, 100 );
        const axesHelper = new THREE.AxesHelper( 350 );
        this.scene.add( gridHelper );
        this.scene.add( axesHelper );

        // Enable shadow casting
        planeMaterial.roughness = 0.5;
        tableMaterial.roughness = 0.4;
        paddleMaterial.roughness = 0.2;
        ballMaterial.roughness = 0.3;

        // Playing surface (Field)
        const surface = new THREE.Mesh(
            new THREE.BoxGeometry(this.field_x + 50, this.field_y - 10, this.field_z + 50),
            planeMaterial
        );
        this.scene.add(surface);

        // Table border (for visibility)
        const table = new THREE.Mesh(
            new THREE.BoxGeometry(this.field_x , this.field_y , this.field_z),
            tableMaterial
        );
        //table.position.x = 20;
        table.receiveShadow = true;
        this.scene.add(table);

        // Ball
        this.ball = new THREE.Mesh(
            new THREE.SphereGeometry(this.ballRadius, 16, 16),
            ballMaterial
        );
        this.ball.position.set(0, 0, this.ballRadius);
        this.ball.castShadow = true;
        this.ball.receiveShadow = true;
        this.scene.add(this.ball);

        // Paddles
        this.paddle1 = new THREE.Mesh(
            new THREE.BoxGeometry(this.paddle_x, this.paddle_y, this.paddle_z),
            paddleMaterial
        );
        
        let offset = 10;

        this.paddle1.position.set( (-this.field_x / 2 + offset ) , table.position.y + offset, table.position.z / 2);
        this.paddle1.castShadow = true;
        this.paddle1.receiveShadow = true;
        this.scene.add(this.paddle1);

        this.paddle2 = new THREE.Mesh(
            new THREE.BoxGeometry(this.paddle_x, this.paddle_y, this.paddle_z),
            paddle2Material
        );
        this.paddle2.position.set( (this.field_x / 2 - offset) , table.position.y + offset, table.position.z / 2);
        this.paddle2.castShadow = true;
        this.paddle2.receiveShadow = true;
        this.scene.add(this.paddle2);

        // Lights

        // 🔹 Ambient Light (Soft global illumination)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // 🔹 Move Point Light Closer
        const pointLight = new THREE.PointLight(0xffffff, 20, 1500, 0.1);
        pointLight.position.set(10, 10, 1000); // Closer to objects

        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 2048;
        pointLight.shadow.mapSize.height = 2048;

        this.scene.add(pointLight);

        // 🔹 Point Light Helper (Visualize Position)
        const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
        this.scene.add(pointLightHelper);

        // 🔹 Spot Light (Strong Shadow Direction)
        const spotLight = new THREE.SpotLight(0xffffff, 30);
        spotLight.position.set(0, 0, 0);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.5;
        spotLight.decay = 1;
        spotLight.distance = 1000;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        spotLight.target.position.set(0, 0, 0);
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
    }

    createScoreboard() {
        const scoreOffsetX = 30;
        const scoreOffsetZ = 100;

        // Player 1 Score (Bottom Left)
        const positionP1 = {
            x: -this.field_x / 2 + scoreOffsetX,
            y: 50,
            z: this.field_x / 2 - scoreOffsetZ,
        };

        this.scoreP1Text = new Text3D(this.score1.toString(), positionP1, 0xffffff, 30, 1);
        this.scoreP1Text.createText((textMesh) => {
            this.scoreP1Mesh = textMesh;
            this.scene.add(this.scoreP1Mesh);
        });

        // Player 2 Score (Top Right)
        const positionP2 = {
            x: this.field_x / 2 - scoreOffsetX,
            y: 50,
            z: this.field_x / 2 - scoreOffsetZ,
        };

        this.scoreP2Text = new Text3D(this.score2.toString(), positionP2, 0xffffff, 30, 1);
        this.scoreP2Text.createText((textMesh) => {
            this.scoreP2Mesh = textMesh;
            this.scene.add(this.scoreP2Mesh);
        });
    }

    updateScoreboard() {
        if (this.scoreP1Text && this.scoreP1Mesh) {
            this.scoreP1Text.updateText(this.score1.toString());
        }
        if (this.scoreP2Text && this.scoreP2Mesh) {
            this.scoreP2Text.updateText(this.score2.toString());
        }
    }

    ballPhysics() {
        // if ball goes off the 'left' side (Player's side)
        if (this.ball.position.x <= -this.field_x / 2) {
            // CPU scores
            this.score2++;
            // update scoreboard HTML
            // reset ball to center
            this.resetBall(2);
            this.matchScoreCheck();
        }

        // if ball goes off the 'right' side (CPU's side)
        if (this.ball.position.x >= this.field_x / 2) {
            // Player scores
            this.score1++;

            // reset ball to center
            this.resetBall(1);
            this.matchScoreCheck();
        }

        // if ball goes off the top side (side of table)
        if (this.ball.position.z <= -this.field_z / 2) {
            this.ballDirZ = -this.ballDirZ;
        }
        // if ball goes off the bottom side (side of table)
        if (this.ball.position.z >= this.field_z / 2) {
            this.ballDirZ = -this.ballDirZ;
        }

        // update ball position over time
        this.ball.position.x += this.ballDirX * this.ballSpeed;
        this.ball.position.z += this.ballDirZ * this.ballSpeed;

        // limit ball's y-speed to 2x the x-speed
        // this is so the ball doesn't speed from left to right super fast
        // keeps game playable for humans
        if (this.ballDirZ > this.ballSpeed * 2) {
            this.ballDirZ = this.ballSpeed * 2;
        }
        else if (this.ballDirZ < -this.ballSpeed * 2) {
            this.ballDirZ = -this.ballSpeed * 2;
        }
    }

    resetBall(loser) {
        // position the ball in the center of the table
        this.ball.position.x = 0;
        this.ball.position.z = 0;

        // if player lost the last point, we send the ball to opponent
        if (loser == 1) {
            this.ballDirX = -1;
        }
        // else if opponent lost, we send ball to player
        else {
            this.ballDirX = 1;
        }

        // set the ball to move +ve in y plane (towards left from the camera)
        this.ballDirZ = 1;
    }

    paddlePhysics() {
        // PLAYER PADDLE LOGIC

        // if ball is aligned with paddle1 on x plane
        // remember the position is the CENTER of the object
        // we only check between the front and the middle of the paddle (one-way collision)
        if (this.ball.position.x <= this.paddle1.position.x + this.paddle_x
            && this.ball.position.x >= this.paddle1.position.x) {
            // and if ball is aligned with paddle1 on y plane
            if (this.ball.position.z <= this.paddle1.position.z + this.paddle_z / 2
                && this.ball.position.z >= this.paddle1.position.z - this.paddle_z / 2) {
                // and if ball is travelling towards player (-ve direction)
                if (this.ballDirX < 0) {
                    // stretch the paddle to indicate a hit
                    this.paddle1.scale.z = 1.1;
                    // switch direction of ball travel to create bounce
                    this.ballDirX = -this.ballDirX;
                    // we impact ball angle when hitting it
                    // this is not realistic physics, just spices up the gameplay
                    // allows you to 'slice' the ball to beat the opponent
                    this.ballDirZ -= this.paddle1DirZ * 0.7;
                }
            }
        }

        // OPPONENT PADDLE LOGIC	

        // if ball is aligned with paddle2 on x plane
        // remember the position is the CENTER of the object
        // we only check between the front and the middle of the paddle (one-way collision)
        if (this.ball.position.x <= this.paddle2.position.x + this.paddle_x
            && this.ball.position.x >= this.paddle2.position.x) {
            // and if ball is aligned with paddle2 on y plane
            if (this.ball.position.z <= this.paddle2.position.z + this.paddle_z / 2
                && this.ball.position.z >= this.paddle2.position.z - this.paddle_z / 2) {
                // and if ball is travelling towards opponent (+ve direction)
                if (this.ballDirX > 0) {
                    // stretch the paddle to indicate a hit
                    this.paddle2.scale.y = 1.1;
                    // switch direction of ball travel to create bounce
                    this.ballDirX = -this.ballDirX;
                    // we impact ball angle when hitting it
                    // this is not realistic physics, just spices up the gameplay
                    // allows you to 'slice' the ball to beat the opponent
                    this.ballDirZ -= this.paddle2DirZ * 0.7;
                }
            }
        }
    }

    createWinnerBanner(text) {
        const winnerText = new Text3D(text, { x: 0, y: 150, z: 50 }, 0xffffff, 40, 1);

        winnerText.createText((textMesh) => {
            this.winnerText = textMesh;
            this.winnerText.rotation.x = -0.01 * Math.PI / 180;
            this.winnerText.rotation.y = -60 * Math.PI / 180;
            this.winnerText.rotation.z = -90 * Math.PI / 180;
            this.scene.add(this.winnerText);

            setTimeout(() => {
                this.scene.remove(this.winnerText);
                this.backToMenu();
            }, 4000);
        });
    }

    backToMenu() {

        if (this.multiplayer) {
            this.networkManager.sendData({ type: "QUIT" });
            this.networkManager.disconnect();
            this.active = false;
            window.removeEventListener('keydown', this.boundEscapeHandler);
        }
        delete this.player1;
        delete this.player2;
        this.state.loadScene(this.state.states.MENU);
    }

    matchScoreCheck() {
        if (this.score1 >= this.maxScore) {
            this.ballSpeed = 0; // Stop ball movement
            this.createWinnerBanner("Player 1 Wins!");
            // Player 1 celebration effect
            this.bounceTime++;
            this.player1.playerMesh.position.z = Math.sin(this.bounceTime * 0.1) * 10;
            this.player1.playerMesh.scale.z = 2 + Math.abs(Math.sin(this.bounceTime * 0.1)) * 10;
            this.player1.playerMesh.scale.y = 2 + Math.abs(Math.sin(this.bounceTime * 0.05)) * 10;
        }
        else if (this.score2 >= this.maxScore) {
            this.ballSpeed = 0; // Stop ball movement
            this.createWinnerBanner("Player 2 Wins!");

            // Player 2 celebration effect
            this.bounceTime++;
            this.player2.playerMesh.position.z = Math.sin(this.bounceTime * 0.1) * 10;
            this.player2.playerMesh.scale.z = 2 + Math.abs(Math.sin(this.bounceTime * 0.1)) * 10;
            this.player2.playerMesh.scale.y = 2 + Math.abs(Math.sin(this.bounceTime * 0.05)) * 10;
        }
    }

    gameStart() {
        if (this.starting) return false; // Prevent multiple calls
        this.starting = true;
    
        let countdown = 5;
        this.countdownText = new Text3D(countdown.toString(), { x: 0, y: 0, z: 50 }, 0xffffff, 50, 1);
    
        this.countdownText.createText((textMesh) => {
            this.countdownMesh = textMesh;
    
            // Rotate the countdown text to face the camera
            // this.countdownMesh.rotation.x = -0.01 * Math.PI / 180;
            // this.countdownMesh.rotation.y = -60 * Math.PI / 180;
            // this.countdownMesh.rotation.z = -90 * Math.PI / 180;
    
            this.scene.add(this.countdownMesh);
    
            const interval = setInterval(() => {
                countdown--;
    
                if (countdown >= 0) {
                    this.countdownText.updateText(countdown.toString());
                }
    
                if (countdown < 0) {
                    clearInterval(interval);
                    this.scene.remove(this.countdownMesh);
                    this.start = true; // Start the game
                }
            }, 1000);
        });
    
        return false;
    }
    
    update() {
        if (!this.paddle1 || !this.paddle2 || !this.ball) return;

        if (this.state.player1)
            this.updateCameraPlayer1();
        else if (this.state.player2)
            this.updateCameraPlayer2();
        else
            this.updateCameraPlayer1();
        
        if (!this.start) {
            this.start = this.gameStart();
            return;
        }

        this.player1.update();
        this.player2.update();
        this.ballPhysics();
        this.paddlePhysics();
        this.updateScoreboard();
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        if (this.state.player1)
            return this.camera1;
        if (this.state.player2)
            return this.camera2;
        else 
            return this.camera1;
    }
}