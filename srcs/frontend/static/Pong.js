import * as THREE from 'three';
import { Text3D } from './Text3D.js';
import { PlayerController } from './PlayerController.js';

export class Pong {
    constructor(state, multiplayer) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.camera = this.createCamera();
        this.multiplayer = multiplayer;
        //player2 inputs(online or offline)


        //fog
        //this.scene.fog = new THREE.Fog(0x000000, 10, 1000);

        // Field and Paddle properties
        this.fieldWidth = 400;
        this.fieldHeight = 200;
        this.paddleWidth = 10;
        this.paddleHeight = 50;
        this.paddleDepth = 10;
        this.ballRadius = 7;

        // paddle
        this.paddle1DirY = 0;
        this.paddle2DirY = 0;
        this.paddleSpeed = 5;

        // ball
        this.ballDirY = -1;
        this.ballDirX = -1;
        this.ballSpeed = 1;

        // scores
        this.scoreP1Text = null;
        this.scoreP2Text = null;
        this.score1 = 0;
        this.score2 = 0;

        this.bounceTime = 0;

        this.createBackground();
        this.createScene();

        this.playerControl();
        this.createScoreboard();

        this.player1 = new PlayerController(this.paddle1, false, this.state.network);
        this.player2 = new PlayerController(this.paddle2, this.multiplayer, this.state.network);

    }

    createCamera() {
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(0, 1000, 400); // Start behind Paddle1
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        return camera;
    }

    //TODO: CHANGE CAMERA TO FOLLOW THE BALL INSTEAD OF PADDLE
    updateCamera() {
        if (!this.camera || !this.paddle1 || !this.ball) return;

        // Move camera behind Paddle1
        this.camera.position.x = this.paddle1.position.x - 200;
        this.camera.position.y += (this.paddle1.position.y - this.camera.position.y) * 0.05;
        this.camera.position.z = this.paddle1.position.z + 200 + 0.04 * (-this.ball.position.x + this.paddle1.position.x);

        // Look at the ball instead of manual rotations
        this.camera.rotation.x = -0.01 * (this.ball.position.y) * Math.PI / 180;
        this.camera.rotation.y = -60 * Math.PI / 180;
        this.camera.rotation.z = -90 * Math.PI / 180;
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
        const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x45FFCA });
        const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x440066 });
        const paddleMaterial = new THREE.MeshLambertMaterial({ color: 0x1B32C0 });
        const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xD43001 });

        // Enable shadow casting
        planeMaterial.roughness = 0.5;
        tableMaterial.roughness = 0.4;
        paddleMaterial.roughness = 0.2;
        ballMaterial.roughness = 0.3;

        // Playing surface (Field)
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(this.fieldWidth * 0.95, this.fieldHeight),
            planeMaterial
        );

        plane.receiveShadow = true;
        this.scene.add(plane);

        // Table border (for visibility)
        const table = new THREE.Mesh(
            new THREE.BoxGeometry(this.fieldWidth * 1.15, this.fieldHeight * 1.13, 20),
            tableMaterial
        );
        table.position.x = 20;
        table.position.z = -15; // Slightly lower than the playing surface
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
            new THREE.BoxGeometry(this.paddleWidth, this.paddleHeight, this.paddleDepth),
            paddleMaterial
        );
        this.paddle1.position.set(-this.fieldWidth / 2 + this.paddleWidth, 0, this.paddleDepth);
        this.paddle1.castShadow = true;
        this.paddle1.receiveShadow = true;
        this.scene.add(this.paddle1);

        this.paddle2 = new THREE.Mesh(
            new THREE.BoxGeometry(this.paddleWidth, this.paddleHeight, this.paddleDepth),
            paddleMaterial
        );
        this.paddle2.position.set(this.fieldWidth / 2 - this.paddleWidth, 0, this.paddleDepth);
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
        const scoreOffsetX = -30;
        const scoreOffsetY = -30;
    
        // Player 1 Score (Bottom Left)
        const positionP1 = {
            x: -this.fieldWidth / 2 + scoreOffsetX,
            y: -this.fieldHeight / 2 + scoreOffsetY,
            z: 50
        };
    
        this.scoreP1Text = new Text3D(this.score1.toString(), positionP1, 0xffffff, 30, 1);
        this.scoreP1Text.createText((textMesh) => {
            this.scoreP1Mesh = textMesh;
            this.scoreP1Mesh.rotation.x = -0.01 * Math.PI / 180;
            this.scoreP1Mesh.rotation.y = -60 * Math.PI / 180;
            this.scoreP1Mesh.rotation.z = -90 * Math.PI / 180;
            this.scene.add(this.scoreP1Mesh);
        });
    
        // Player 2 Score (Top Right)
        const positionP2 = {
            x: this.fieldWidth / 2 - scoreOffsetX,
            y: this.fieldHeight / 2 - scoreOffsetY + 100,
            z: 50
        };
    
        this.scoreP2Text = new Text3D(this.score2.toString(), positionP2, 0xffffff, 30, 1);
        this.scoreP2Text.createText((textMesh) => {
            this.scoreP2Mesh = textMesh;
            this.scoreP2Mesh.rotation.x = -0.01 * Math.PI / 180;
            this.scoreP2Mesh.rotation.y = -60 * Math.PI / 180;
            this.scoreP2Mesh.rotation.z = -90 * Math.PI / 180;
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
    

    playerControl() {
        this.activeKeys = {};

        window.addEventListener('keydown', (e) => {
            this.activeKeys[e.key.toLowerCase()] = true;
            console.log(this.activeKeys);
        });

        window.addEventListener('keyup', (e) => {
            this.activeKeys[e.key.toLowerCase()] = false;
            console.log(this.activeKeys);
        });
    }

    playerPaddleMovement() {
        if (!this.paddle1) return;  // Ensure paddle exists

        if (this.activeKeys['a']) {
            if (this.paddle1.position.y < this.fieldWidth * 0.25) {
                this.paddle1DirY = this.paddleSpeed * 0.5;
            } else {
                this.paddle1DirY = 0;
                this.paddle1.scale.y += (2 - this.paddle1.scale.y) * 0.15;
            }
        }
        else if (this.activeKeys['d']) {
            if (this.paddle1.position.y > -this.fieldWidth * 0.25) {
                this.paddle1DirY = -this.paddleSpeed * 0.5;
            } else {
                this.paddle1DirY = 0;
                this.paddle1.scale.y += (2 - this.paddle1.scale.y) * 0.15;
            }
        } else {
            this.paddle1DirY = 0; //stop the paddle
        }

        // Reset scale for smooth animation
        this.paddle1.scale.y += (1 - this.paddle1.scale.y) * 0.2;
        this.paddle1.scale.z += (1 - this.paddle1.scale.z) * 0.2;
        this.paddle1.position.y += this.paddle1DirY;
    }

    ballPhysics() {
        // if ball goes off the 'left' side (Player's side)
        if (this.ball.position.x <= -this.fieldWidth / 2) {
            // CPU scores
            this.score2++;
            // update scoreboard HTML
            // reset ball to center
            this.resetBall(2);
            this.matchScoreCheck();	
        }

        // if ball goes off the 'right' side (CPU's side)
        if (this.ball.position.x >= this.fieldWidth / 2) {
            // Player scores
            this.score1++;


            // reset ball to center
            this.resetBall(1);
            //matchScoreCheck();	
        }

        // if ball goes off the top side (side of table)
        if (this.ball.position.y <= -this.fieldHeight / 2) {
            this.ballDirY = -this.ballDirY;
        }
        // if ball goes off the bottom side (side of table)
        if (this.ball.position.y >= this.fieldHeight / 2) {
            this.ballDirY = -this.ballDirY;
        }

        // update ball position over time
        this.ball.position.x += this.ballDirX * this.ballSpeed;
        this.ball.position.y += this.ballDirY * this.ballSpeed;

        // limit ball's y-speed to 2x the x-speed
        // this is so the ball doesn't speed from left to right super fast
        // keeps game playable for humans
        if (this.ballDirY > this.ballSpeed * 2) {
            this.ballDirY = this.ballSpeed * 2;
        }
        else if (this.ballDirY < -this.ballSpeed * 2) {
            this.ballDirY = -this.ballSpeed * 2;
        }
    }

    resetBall(loser) {
        // position the ball in the center of the table
        this.ball.position.x = 0;
        this.ball.position.y = 0;

        // if player lost the last point, we send the ball to opponent
        if (loser == 1) {
            this.ballDirX = -1;
        }
        // else if opponent lost, we send ball to player
        else {
            this.ballDirX = 1;
        }

        // set the ball to move +ve in y plane (towards left from the camera)
        this.ballDirY = 1;
    }

    paddlePhysics() {
        // PLAYER PADDLE LOGIC

        // if ball is aligned with paddle1 on x plane
        // remember the position is the CENTER of the object
        // we only check between the front and the middle of the paddle (one-way collision)
        if (this.ball.position.x <= this.paddle1.position.x + this.paddleWidth
            && this.ball.position.x >= this.paddle1.position.x) {
            // and if ball is aligned with paddle1 on y plane
            if (this.ball.position.y <= this.paddle1.position.y + this.paddleHeight / 2
                && this.ball.position.y >= this.paddle1.position.y - this.paddleHeight / 2) {
                // and if ball is travelling towards player (-ve direction)
                if (this.ballDirX < 0) {
                    // stretch the paddle to indicate a hit
                    this.paddle1.scale.y = 1.1;
                    // switch direction of ball travel to create bounce
                    this.ballDirX = -this.ballDirX;
                    // we impact ball angle when hitting it
                    // this is not realistic physics, just spices up the gameplay
                    // allows you to 'slice' the ball to beat the opponent
                    this.ballDirY -= this.paddle1DirY * 0.7;
                }
            }
        }

        // OPPONENT PADDLE LOGIC	

        // if ball is aligned with paddle2 on x plane
        // remember the position is the CENTER of the object
        // we only check between the front and the middle of the paddle (one-way collision)
        if (this.ball.position.x <= this.paddle2.position.x + this.paddleWidth
            && this.ball.position.x >= this.paddle2.position.x) {
            // and if ball is aligned with paddle2 on y plane
            if (this.ball.position.y <= this.paddle2.position.y + this.paddleHeight / 2
                && this.ball.position.y >= this.paddle2.position.y - this.paddleHeight / 2) {
                // and if ball is travelling towards opponent (+ve direction)
                if (this.ballDirX > 0) {
                    // stretch the paddle to indicate a hit
                    this.paddle2.scale.y = 1.1;
                    // switch direction of ball travel to create bounce
                    this.ballDirX = -this.ballDirX;
                    // we impact ball angle when hitting it
                    // this is not realistic physics, just spices up the gameplay
                    // allows you to 'slice' the ball to beat the opponent
                    this.ballDirY -= this.paddle2DirY * 0.7;
                }
            }
        }
    }

    matchScoreCheck()
    {
        // if player has 7 points
        if (this.score1 >= this.maxScore)
        {
            // stop the ball
            this.ballSpeed = 0;
            // write to the banner
            document.getElementById("scores").innerHTML = "Player wins!";		
            document.getElementById("winnerBoard").innerHTML = "Refresh to play again";
            // make paddle bounce up and down
            this.bounceTime++;
            this.paddle1.position.z = Math.sin(bounceTime * 0.1) * 10;
            // enlarge and squish paddle to emulate joy
            this.paddle1.scale.z = 2 + Math.abs(Math.sin(this.bounceTime * 0.1)) * 10;
            this.paddle1.scale.y = 2 + Math.abs(Math.sin(this.bounceTime * 0.05)) * 10;
        }
        // else if opponent has 7 points
        else if (this.score2 >= this.maxScore)
        {
            // stop the ball
            this.ballSpeed = 0;
            // write to the banner
            document.getElementById("scores").innerHTML = "CPU wins!";
            document.getElementById("winnerBoard").innerHTML = "Refresh to play again";
            // make paddle bounce up and down
            this.bounceTime++;
            this.paddle2.position.z = Math.sin(bounceTime * 0.1) * 10;
            // enlarge and squish paddle to emulate joy
            this.paddle2.scale.z = 2 + Math.abs(Math.sin(this.bounceTime * 0.1)) * 10;
            this.paddle2.scale.y = 2 + Math.abs(Math.sin(this.bounceTime * 0.05)) * 10;
        }
    }

    update() {
        if (!this.paddle1 || !this.paddle2 || !this.ball) return;

        this.playerPaddleMovement();
        this.ballPhysics();
        this.paddlePhysics();
        this.updateCamera();
        this.updateScoreboard();
        
    }


    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}
