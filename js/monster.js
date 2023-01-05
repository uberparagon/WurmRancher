import { DistanceObjects, GetClosestPrey, PlaySound, RandomXonField, RandomYonField } from "./gameControl.js";
import { LaserDestructablePiece } from "./laserDestructablePiece.js";
import { monsterDieSound, monsterEatSound, monsterImage } from "./resources.js";
import { MonsterRotate, MonsterSpeed } from "./timing.js";
var height = 50;
var width = 50;
export class Monster extends LaserDestructablePiece {
    constructor() {
        super(height, width, MonsterSpeed, MonsterRotate);
        this.Name = "Monster";
        this.Layer = 5;
        this.LaserHitSound = monsterDieSound;
        this.PieceImage = monsterImage;
    }
    Update(time_step) {
        if (!this.hit) {
            if (this.target_feeder != null) {
                this.target_feeder.Dibs();
                if (this.target_feeder.eaten) {
                    this.target_feeder = null;
                    this.resting = true;
                }
                else {
                    this.SetDestination(this.target_feeder.CenterX, this.target_feeder.CenterY);
                    if (DistanceObjects(this, this.target_feeder) <= this.Width / 2) {
                        this.target_feeder.Eat();
                        PlaySound(monsterEatSound);
                    }
                }
            }
            if (this.target_feeder == null && this.resting) // find a new destination!
             {
                this.target_feeder = GetClosestPrey(this, true, "Feeder");
                if (this.target_feeder != null) {
                    console.log("new prey aquired", this, this.target_feeder, this.target_feeder.dibs);
                    this.target_feeder.Dibs();
                    //console.log("tried to dibs it", this.target_feeder.dibs);
                    this.SetDestination(this.target_feeder.CenterX, this.target_feeder.CenterY);
                }
                else {
                    this.SetDestination(RandomXonField(), RandomYonField());
                    console.log("no prey available", this);
                }
            }
        }
        super.Update(time_step);
    }
}
//# sourceMappingURL=monster.js.map