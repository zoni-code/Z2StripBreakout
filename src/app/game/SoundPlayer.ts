import { sound } from "@pixi/sound";

export class SoundPlayer {

    constructor() {
        this.add("hit", "./sound/hit.mp3");
        this.add("conflict", "./sound/conflict.mp3");
        this.add("wall", "./sound/wall.mp3");
        this.add("throwBall", "./sound/throwBall.mp3");
        this.add("clear", "./sound/clear.mp3");
        this.add("smash", "./sound/smash.mp3");
        this.add("item", "./sound/item.mp3");
        this.add("lifeDecreased", "./sound/lifeDecreased.mp3");
    }

    private add(id: string, path: string) {
        if (!sound.exists(id)) {
            sound.add(id, require(path));
        }
    }

    public play(id: string) {
        sound.play(id);
    }
}
