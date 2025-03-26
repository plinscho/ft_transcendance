import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        const neonColorsArray = [0xc292b7/*, 0x9E0031, 0xF87666*/];

        this.neonColors = neonColorsArray[Math.floor(Math.random() * neonColorsArray.length)];
        //console.log(this.neonColors);

        const ambientLight = new THREE.AmbientLight(this.neonColors, 0.2);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(this.neonColors, 100);
        pointLight.position.set(-200, 350, 0);
        pointLight.decay = 0;
        pointLight.distance = 1000;
        pointLight.intensity = 100;
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.set(2048, 2048);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0xF87666, 100);
        pointLight.position.set(200, 350, 0);
        pointLight.decay = 0;
        pointLight.distance = 1000;
        pointLight.intensity = 100;
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.set(2048, 2048);
        scene.add(pointLight2);

        //const sphereSize = 5;
        //const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
        //scene.add(pointLightHelper);

        const spotLight = new THREE.SpotLight(0xF87666, 300);
        spotLight.position.set(0, 350, 300);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.2;
        spotLight.decay = 0.2;
        spotLight.distance = 700;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.set(2048, 2048);
        scene.add(spotLight);

        const spotLight2 = new THREE.SpotLight(0x9E0031, 300);
        spotLight.position.set(0, 350, -500);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.2;
        spotLight.decay = 0.2;
        spotLight.distance = 700;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.set(2048, 2048);
        scene.add(spotLight2);
    }

    updateColors() {
        this.neonColors = neonColorsArray[Math.floor(Math.random() * neonColorsArray.length)];
    }
}
