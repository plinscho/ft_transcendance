import * as THREE from 'three';

export class Stars {
    constructor(scene) {
        this.scene = scene;
        this.stars = []; // Store star references
        this.fillStars();
    }

    createStars() {
        const geometry = new THREE.SphereGeometry(1, 8, 8);
        const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        const star = new THREE.Mesh(geometry, material);

        // Randomize position
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));
        star.position.set(x, y, z);

        this.scene.add(star);
        this.stars.push(star); // Store reference
    }

    fillStars() {
        Array(500).fill().forEach(() => this.createStars()); // Pass function reference properly
    }

    animateStars() {
        this.stars.forEach((star) => {
            star.position.x += Math.random() * 0.2;
            star.position.y += Math.random() * 0.2;
            if (star.position.x > 500) star.position.x = -500;
            if (star.position.y > 500) star.position.y = -500;
        });
    }
}
