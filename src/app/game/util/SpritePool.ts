import * as PIXI from "pixi.js";

export class SpritePool {
    private index: number = 0;
    private sprites: PIXI.Sprite[] = [];

    constructor(private size: number, app: PIXI.Application, image: PIXI.SpriteSource) {
        for (let i = 0; i < size; i++) {
            const sprite = PIXI.Sprite.from(image);
            sprite.x = sprite.y = -1000;
            this.sprites.push(sprite);
            app.stage.addChild(sprite);
        }
    }

    public borrow() {
        return this.sprites[this.index++];
    }

    public resetUnused() {
        for (let i = this.index; i < this.size; i++) {
            this.sprites[i].x = this.sprites[i].y = -1000;
        }
        this.index = 0;
    }

    public dispose() {
        for (let i = 0; i < this.size; i++) {
            this.sprites[i].destroy();
        }
    }
}
