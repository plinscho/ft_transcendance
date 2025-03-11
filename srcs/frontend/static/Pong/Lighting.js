import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        const neonColorsArray = [0xDDCAD9, 0x9E0031, 0xF87666];

        this.neonColors = neonColorsArray[Math.floor(Math.random() * neonColorsArray.length)];
        console.log(this.neonColors);

        const ambientLight = new THREE.AmbientLight(this.neonColors, 1.3);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(this.neonColors, 400);
        pointLight.position.set(-200, 150, 0);
        pointLight.decay = 0;
        pointLight.distance = 1000;
        pointLight.intensity = 100;
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.set(2048, 2048);
        scene.add(pointLight);
        //help[er]
        const sphereSize = 5;
        const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
        scene.add(pointLightHelper);

        const spotLight = new THREE.SpotLight(this.neonColors, 300);
        spotLight.position.set(0, 200, 0);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        spotLight.decay = 0;
        spotLight.distance = 10000;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.set(2048, 2048);
        scene.add(spotLight);
    }

    updateColors() {
        this.neonColors = neonColorsArray[Math.floor(Math.random() * neonColorsArray.length)];
    }
}
