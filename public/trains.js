var config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 920,
    // backgroundColor: '#2d2d2d',
    backgroundColor: '#c6c6c6',
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var path;
var graphics;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('red', './red.png')
}

function create() {
    graphics = this.add.graphics();
    path = new Phaser.Curves.Path(300, 100)

    path.lineTo(700, 100)
    // xRadius, yRadius, startAngle, endAngle, clockwise, rotation
    path.ellipseTo(150, 150, 270, 0);
    path.lineTo(850, 550)
    path.ellipseTo(150, 150, 0, 180);
    path.ellipseTo(150, 150, 0, 270, true);
    path.lineTo(300, 400)
    path.ellipseTo(150, 150, 90, 180);
    path.ellipseTo(150, 150, 180, 270);

    graphics.lineStyle(2, 0xffffff, 1);
    path.draw(graphics)

    for (var i = 0; i < 15; i++) {
        var follower = this.add.follower(path, 0, 0, 'red');

        follower.startFollow({
            duration: 8000,
            positionOnPath: true,
            repeat: -1,
            // ease: 'Sine.easeInOut',
            ease: 'Linear',
            delay: i * 70,
            yoyo: true
        });
    }
}

function update() {
}
