import * as THREE from 'three';

export class Pong {
    constructor(state) {
        this.scene = new THREE.Scene();
        this.state = state;
        this.camera = this.createCamera();

        //this.scene.fog = new THREE.Fog(0x000000, 10, 1000);

        // Field and Paddle properties
        this.fieldWidth = 400;
        this.fieldHeight = 200;
        this.paddleWidth = 10;
        this.paddleHeight = 50;
        this.paddleDepth = 10;
        this.ballRadius = 7;

        this.createBackground();

        this.createScene();
    }

    createCamera() {
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(0, 1000, 400); // Start behind Paddle1
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        return camera;
    }

    updateCamera() {
        if (!this.camera || !this.paddle1 || !this.ball) return;

        // Move camera behind Paddle1
        this.camera.position.x = this.paddle1.position.x - 200;
        this.camera.position.y += (this.paddle1.position.y - this.camera.position.y) * 0.05;
        this.camera.position.z = this.paddle1.position.z + 200 + 0.04 * (-this.ball.position.x + this.paddle1.position.x);

        // Look at the ball instead of manual rotations
        this.camera.rotation.x = -0.03 * (this.ball.position.y) * Math.PI / 180;
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
        table.position.x = 20 ;
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
        spotLight.angle = Math.PI / 6; // Narrower cone for sharper shadows
        spotLight.penumbra = 0.5;
        spotLight.decay = 1;
        spotLight.distance = 1000;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        spotLight.target.position.set(0, 0, 0); // Focus on the center
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);

    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}
