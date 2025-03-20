class Particle{
    constructor(x, y, c){  
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = p5.Vector.random2D();
        this.acc.mult(0.05);
        this.c = 0;

        this.hue = random(20, 350);
        this.life = 255;
        this.done = false;

    }

    update(){
        this.finished();

        this.vel.add(this.acc);
        this.pos.add(this.vel);

        this.life -= 5;
        this.hue -= 1;
        if(this,hue > 350) this.hue = 20;
    }

    display(){
    colorMode(HSB, 360, 100, 100, 255);   
    fill(this.hue, 100, 100, this.life);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 10, 10);
    }

    finished(){
        if (this.life < 0){
            this.done = true;
        } else {
            this.done = false;
        }
    }
}