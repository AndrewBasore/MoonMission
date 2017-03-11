function preload() {
    game.load.image('ship', 'assets/games/invaders/player.png');
    game.load.image('earth', 'assets/globe.png');
    game.load.image('moon', 'assets/moon.png');


    //image for background
    game.load.image('background', 'assets/misc/starfield.jpg');

    //image for launch button
    game.load.spritesheet('button', 'assets/buttons/launchButton.png', 193, 71);

    //load audio file.
    game.load.audio('sfx', 'assets/audio/SoundEffects/fx_mixdown.ogg');

    //load explosion spritesheet
    game.load.spritesheet('kaboom', 'assets/games/invaders/explode.png', 128, 128);
}

var launchFX;
var fx;


var game = new Phaser.Game(800, 900, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update:update });
const G = 1.5;

function create() {
    game.physics.startSystem(Phaser.Physics.P2JS);



    isFired = false; //boolean toggled for rocket blast-off
    cursors = game.input.keyboard.createCursorKeys();

    game.stage.backgroundColor = '#182d3b';
    background = game.add.tileSprite(0, 0, 800, 900, 'background');

    button = game.add.button(game.world.centerX + 95, 820, 'button', launch, this, 2, 1, 0);
    button.scale.setTo(.5,.5);

    earth = game.add.sprite(215, 750, 'earth');
    earth.scale.setTo(.8,.8);
    moon = game.add.sprite(550, 200, 'moon');
    moon.scale.setTo(.23,.23);

        ship = game.add.sprite(215, game.world.height - 415 + 150, 'ship');
    game.physics.p2.enable(ship);
    game.physics.p2.enable(moon);
    game.physics.p2.enable(earth);




    //initialize fx
    fx=  game.add.audio('sfx');
    launchFX = game.add.audio('sfx');
    fx.allowMultiple = true;
    //Create Audio Markers
    launchFX.addMarker('launchSound', 4, 3.2);
    fx.addMarker('crash', 12, 4.2);


    //attaches explosion animation to ship
    ship.anchor.x = 0.5;
    ship.anchor.y = 0.5;
    ship.animations.add('kaboom');


    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');


    //Logic for collision
    ship.body.onBeginContact.add(crash, this);







}

function update() {
    console.log(fx.isPlaying);

    if (cursors.left.isDown) {ship.body.rotateLeft(100);}   //ship movement
    else if (cursors.right.isDown){ship.body.rotateRight(100);}
    else {ship.body.setZeroRotation();}

    if (cursors.up.isDown && isFired){
        ship.body.thrust(50);
        if(!launchFX.isPlaying){
            launchFX.play('launchSound');
        }

    }


    if(isFired){
        // console.log(ship.body.velocity);
        forceFromMoon();
        forceFromEarth();
    }



}

function crash(body){

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(ship.body.x, ship.body.y);
    console.log(explosion.reset);
    explosion.play('kaboom', 30, false, true);

    ship.kill();
    fx.stop();
    fx.play('crash');
}

function getDistance(obj1, obj2){
    return Math.sqrt( Math.pow(obj1.y-obj2.y, 2) + Math.pow(obj1.x - obj2.x, 2));
}

function angleToMoonOrEarth(moonOrEarth){
    return Math.atan2(moonOrEarth.y - ship.y, moonOrEarth.x - ship.x);
}

function forceFromMoon(){ // applies force to ship of gravitation
    var angle = angleToMoonOrEarth(moon);
    var distance = getDistance(moon, ship);

    ship.body.force.y += G*30*3716*Math.sin(angle) / Math.pow(distance, 2);
    ship.body.force.x += G*30*3716*Math.cos(angle) / Math.pow(distance,2);

}

function forceFromEarth(){ //force of earth is 81.4 times that of moon at equal distances
    var angle = angleToMoonOrEarth(earth);
    var distance = getDistance(earth, ship);

    ship.body.force.y += G*302500*Math.sin(angle) / Math.pow(distance, 2);
    ship.body.force.x += G*302500*Math.cos(angle) / Math.pow(distance, 2);

}

function launch(){
    launchFX.play('launchSound');

    isFired = true;
	button.kill();
}


function moveBullets (bullet) {
     accelerateToObject(bullet,ship,30);  //start accelerateToObject on every bullet
}

function accelerateToObject(obj1, obj2, speed) {
    if (typeof speed === 'undefined') { speed = 60; }
    var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
    obj1.body.rotation = angle + game.math.degToRad(90);  // correct angle of angry bullets (depends on the sprite used)
    obj1.body.force.x = Math.cos(angle) * speed;    // accelerateToObject
    obj1.body.force.y = Math.sin(angle) * speed;
}
