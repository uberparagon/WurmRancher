import { DistanceObjects, GetClosestPlant, RandomXonField, RandomYonField } from "./gameControl.js";
import { GoodGrass } from "./goodGrass.js";
import { LaserDestructablePiece } from "./laserDestructablePiece.js";
import { RelativeRotateToRadiansPerFrame, RelativeSpeedToPixelsPerFrame, relGrassEaterRotate, relGrassEaterSpeed } from "./timing.js";

const height = 30;
const width =30;
const grassEaterImage = new Image();
grassEaterImage.src = "../Resources/grass_eater.png";

export class GrassEater extends LaserDestructablePiece{
    Layer = 6;
    Name = "GrassEater";
    hit = false;

    constructor(){
        super(height,width, RelativeSpeedToPixelsPerFrame(relGrassEaterSpeed), RelativeRotateToRadiansPerFrame(relGrassEaterRotate));
        this.PieceImage = grassEaterImage;
    }

    target_plant : GoodGrass = null;

    Update() : void{
        if (this.hit){
            super.Update();
            return;
        }
        
        if (this.target_plant != null && DistanceObjects(this, this.target_plant) < 1 && !(this.hit))
            {
                this.target_plant.Eat();
                if (this.target_plant.Eaten)
                    this.target_plant = null;
            }

            if (this.target_plant == null && this.resting) // find a new destination!
            {
                this.target_plant = (GetClosestPlant(this,["GoodGrass"]) as GoodGrass);
                if (this.target_plant != null)
                {
                    this.SetDestination(this.target_plant.CenterX, this.target_plant.CenterY);
                    this.target_plant.Dibs(10);
                }
                else
                    this.SetDestination(RandomXonField(),RandomYonField());
            }
            super.Update();
    }
    
}