export class OnTheFieldPiece {
    constructor(control, height, width) {
        this.Height = height;
        this.Width = width;
        this.theControl = control;
    }
    Remove() {
        //todo 
    }
    get CenterX() {
        return this.x + this.Width / 2;
    }
    set CenterX(value) {
        this.x = value - this.Width / 2;
    }
    get CenterY() {
        return this.y + this.Height / 2;
    }
    set CenterY(value) {
        this.y = value - this.Height / 2;
    }
}
//# sourceMappingURL=OnTheFieldPiece.js.map