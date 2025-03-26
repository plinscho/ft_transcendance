import * as THREE from 'three';
import { Field } from './Field.js';
import { Table } from './Table.js';
import { Paddle } from './Paddle.js';
import { Ball } from './Ball.js';
import { Lighting } from './Lighting.js';

export class PongScene {
    constructor(field_x, field_y, field_z, paddle_x, paddle_y, paddle_z, ballRadius, scene) {
        this.scene = scene;

        // Add Field
        this.field = new Field(field_x, field_y, field_z);
        this.field.addToScene(this.scene);

        // Add Table
        this.table = new Table(field_x, field_y, field_z);
        this.table.addToScene(this.scene);

        // Add Ball
        this.ball = new Ball(ballRadius, field_y);
        this.ball.addToScene(this.scene);

        // Add Paddles
        const offset = 10;
        this.paddle1 = new Paddle(paddle_x, paddle_y + offset, paddle_z, 0x922b21, [(-field_x / 2 + offset), field_y + offset, 0]);
        this.paddle1.addToScene(this.scene);

        this.paddle2 = new Paddle(paddle_x, paddle_y + offset, paddle_z, 0x922b21, [(field_x / 2 - offset), field_y + offset, 0]);
        this.paddle2.addToScene(this.scene);

        // Add Lighting
        new Lighting(this.scene);
    }

    // Expose paddles and ball
    getPaddle1() {
        return this.paddle1.mesh;
    }

    getPaddle2() {
        return this.paddle2.mesh;
    }

    getBall() {
        return this.ball.mesh;
    }
}
