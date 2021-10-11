// entity for rendering html elements "in" the canvas
import { Entity } from "./entity.js";

export class Note extends Entity {
    constructor(elm) {
        // the note entity will be rendered in the canvas
        // and the transforms, position, left and top will be adjusted

        super(); // call entity class constructor

        // set any note specific properties
        this.elm = elm;
        this.isLoaded = false;

        // setup the note
        this.elm.style.position = "absolute";
    }

    render(ctx) {
        // add note element to the canvas if it is not already there
        if (!this.isLoaded) {
            this.isLoaded = true;
            ctx.canvas.parentNode.insertBefore(this.elm, ctx.canvas);
        }

        // account for canvas transforms
        let transforms = ctx.getTransform();
        let scale = transforms.a / window.devicePixelRatio;
        let x_offset = (transforms.e / window.devicePixelRatio) / scale - this.halfw;
        let y_offset = (transforms.f / window.devicePixelRatio) / scale - this.halfh;
                
        // update the note's position and scale
        this.elm.style.left = this.x + x_offset + "px";
        this.elm.style.top = this.y + y_offset + "px";
        this.elm.style.width = this.w + "px";
        this.elm.style.height = this.h + "px";
        //this.elm.style.setProperty("-moz-transform", `scale(${scale})`);
        this.elm.style.zoom = scale;
    }
}