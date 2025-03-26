import * as THREE from 'three';
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.7/index.js";

export class CameraManager {
    constructor() {
        this.camera1 = this.createCamera(0, 400, 300);
        this.camera2 = this.createCamera(0, 400, 300);
        this.localCoopCamera = this.createCamera(0, 400, 300);
    }

    createCamera(x, y, z) {
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(x, y, z);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        return camera;
    }

    followBall(camera, ball, p1) {
        const oldX = camera.position.x;
        const oldY = camera.position.y;
        const oldZ = camera.position.z;

        if (p1) {
            const tl = gsap.timeline();
            tl.fromTo(camera.position, { x: ball.position.x, y: camera.position.y, z: ball.position.z },
                { x: oldX, y: oldY, z: oldZ, duration: 2, ease: "power1.inOut" });
        }
        
        if (!p1) {
        const tl = gsap.timeline();
        tl.fromTo(camera.position, { x: -ball.position.x, y: camera.position.y, z: -ball.position.z },
            { x: oldX, y: oldY, z: oldZ, duration: 2, ease: "power1.inOut" });
        }
    }

    screenShake(camera) {
        const tl = gsap.timeline();
        tl.to(camera.position, { x: "+=1", y: "+=1", duration: 0.05, ease: "power1.inOut" })
            .to(camera.position, { x: "-=1", y: "-=1", duration: 0.05, ease: "power1.inOut" });
    }

    // Start at 0 , 400, 300
    // End at -390, 150, 0
    startCamera1Animation() {
        const tl = gsap.timeline();
        tl.fromTo(this.camera1.position, { x: 0, y: 400, z: 300 }, { x: -390, y: 150, z: 0, duration: 1 });
    }

    // Start at 0 , 400, 300
    // End at 390, 150, 0
    startCamera2Animation() {
        const tl = gsap.timeline();
        tl.fromTo(this.camera2.position, { x: 0, y: 400, z: 300 }, { x: 390, y: 150, z: 0, duration: 1 });
    }

    updateCamera(camera) {
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
}
