import { ImagePiece } from "./imagePiece.js";
import { MovesToDestinationControl } from "./movesToDestinationControl.js";
import { CreatureDeathFadeTime, ParasiteKillTime, WurmBodyRotate, WurmHeadRotate, WurmSpeed, WurmStunTime } from "./timing.js";
import { Feeder } from "./feeder.js";
import { DistanceObjects, GetClosestPrey, PlaySound, RandomXonField, RandomYonField } from "./gameControl.js";
import { Wurm } from "./wurm.js";
import { LaserHitable } from "./laserHitable.js";
import { headImage, bodyImage, electic_buzz, dragonSound } from "./resources.js";

export interface BackAttachable {
    backAttachX: number;
    backAttachY: number;
    angle: number;
    Follower: WurmBodyPiece;
    //centerPointX: number;
    //centerPointY: number;
}

const height = 30;
const width = 30;
const radius = 15;

const sight_range = 500;

export class WurmHead extends LaserHitable implements BackAttachable {
    
    wurmObject : Wurm;
    Layer =4;
    Name= "Wurm Head";
    //WurmEats : Event;

    constructor(wurmObject :Wurm){
        super(height, width, WurmSpeed, WurmHeadRotate);
        this.PieceImage = headImage;
        this.wurmObject = wurmObject;
        this.LaserHitSound = electic_buzz;
    }

    stun_counter : number;

    get backAttachX(): number{
        return this.CenterX + radius*0.8*Math.cos(this.angle);
    }

    get backAttachY(): number{
        return this.CenterY + radius*0.8*Math.sin(this.angle);
    }
    
    CheckLaserHit(x: number, y: number): boolean {
        let result = super.CheckLaserHit(x,y);
        if (this.hit){
            this.stun_counter = WurmStunTime;
            this.feeder_target = null;
        }
        this.hit = false;

        return result;
    }

    Follower: WurmBodyPiece;
    
    get isStunned(): boolean{
        return this.stun_counter > 0;
    }

    target_angle :number;

    feeder_target : Feeder = null;

    SetTargetAngle() :void{
        this.target_angle = Math.atan((this.CenterY - this.destination_y) / (this.CenterX - this.destination_x));
        if (this.target_angle < 0)
            this.target_angle += Math.PI * 2;

        if (this.CenterX - this.destination_x < 0)
            this.target_angle += Math.PI;
        if (this.target_angle >= 2 * Math.PI)
            this.target_angle -= Math.PI * 2;
    }

    Update(time_step:number) :void
    {
        if (this.isStunned)
        {
            this.stun_counter-=time_step;
            ImagePiece.prototype.Update.call(this);
            return;
        }
        if (this.feeder_target != null)
        {
            //this.feeder_target.Dibs();
            if (this.feeder_target.eaten)
            {
                this.feeder_target = null;
                this.resting = true;
            }
            else
            {
                this.SetDestination(this.feeder_target.CenterX, this.feeder_target.CenterY);
                this.SetTargetAngle();
                if (DistanceObjects(this,this.feeder_target) <= radius)
                {
                    this.wurmObject.head_Eats(this);
                    //Eats(this, new EatEventData(this.feeder_target));
                    //if (theControl.SoundEffectsOn)
                    //    EatSound.Play();
                    PlaySound(dragonSound);
                }
                    
                
            }
        } 
        
        if (this.resting){
            this.feeder_target = GetClosestPrey(this, false, "Feeder") as Feeder;
            if (this.feeder_target != null && DistanceObjects(this, this.feeder_target) > sight_range)
                this.feeder_target = null;
            
            if (this.feeder_target == null)
            {
                this.SetDestination(RandomXonField(), RandomYonField());
            }
        }
            
        super.Update(time_step);
    }

    
}

export class WurmBodyPiece extends ImagePiece implements BackAttachable //, Prey
    {
        Layer = 3;
        Name = "WurmBody";
        Leader :BackAttachable;
        head :WurmHead;

        radians_per_ms = WurmBodyRotate; //be careful here!!!!

        constructor(leader_ :BackAttachable , head_:WurmHead)
        {
            super(height,width,leader_.angle);
            this.Leader = leader_;
            this.head = head_;
            this.Leader.Follower = this;            
            this.Height = 30;
            this.Width = 30;

            this.PieceImage = bodyImage;
            
        }

        
        Follower : WurmBodyPiece;

        get backAttachX(): number{
            return this.CenterX + radius*Math.cos(this.angle);
        }
    
        get backAttachY(): number{
            return this.CenterY + radius*Math.sin(this.angle);
        }
    
        
        
        //public event EventHandler<EventArgs> EatenByParasite;


        fade_time_elapsed : number = 0;
        total_bites_suffered : number = 0;

        Update(time_step:number) :void
        {
            if (this.head.isStunned){
                ImagePiece.prototype.Update.call(this);
                return;
            }
                
            this.angle += this.radians_per_ms*time_step* Math.cos(this.Leader.angle - this.angle - Math.PI / 2);

            
            if (this.total_bites_suffered > 0  && this.total_bites_suffered < ParasiteKillTime)
                this.total_bites_suffered = Math.max(this.total_bites_suffered - time_step,0);

            
            this.CenterX = this.Leader.backAttachX + radius * Math.cos(this.angle);
            this.CenterY = this.Leader.backAttachY + radius * Math.sin(this.angle);

            if (this.IsEatenByParasite)
            {                
                this.fade_time_elapsed+=time_step;

                if (this.fade_time_elapsed > CreatureDeathFadeTime){
                    this.head.wurmObject.pieceEatenByParasite(this);
                }
                    //EatenByParasite(this, new EventArgs());
                

                this.Opacity = (CreatureDeathFadeTime - this.fade_time_elapsed) / CreatureDeathFadeTime;               
            }
           super.Update(time_step);
        }


        get IsEatenByParasite():boolean {
            return (this.total_bites_suffered >= ParasiteKillTime);
        }

        Available(care_about_dibs:boolean) : boolean 
        {
            if (!care_about_dibs)
                throw new DOMException("something is wrong... everything that hunts wurm pieces cares about dibs");
            return (this.total_bites_suffered == 0);            
        }

        ParasiteBite(timeStep : number) :void
        {
            this.total_bites_suffered+=2*timeStep;    //we will decrement them on update as well.            
        }

        
    }

//export interface EatEventData extends EventArgs {
//    creatureEaten: Feeder;
//}