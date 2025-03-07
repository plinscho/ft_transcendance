import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 20, 1500, 0.1);
        pointLight.position.set(0, 100, 0);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.set(2048, 2048);
        scene.add(pointLight);

        const spotLight = new THREE.SpotLight(0xffffff, 30);
        spotLight.position.set(0, 0, 0);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        spotLight.decay = 1;
        spotLight.distance = 1000;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.set(2048, 2048);
        scene.add(spotLight);
        scene.add(spotLight.target);
    }
}
