<template>
    <div>
        <button @click="addFollower">+</button>
        <button @click="delFollower">-</button>
        Current Path: {{ !turnout ? "outter" : "inner" }}
        <button @click="changePath">Change</button>
    </div>
</template>
<script>

var config = {
    type: global.Phaser.AUTO,
    width: 1080,
    height: 920,
    // backgroundColor: '#2d2d2d',
    backgroundColor: "#c6c6c6",
    parent: "phaser-example",
    scene: {
        preload: preloadScene,
        create: createScene,
        update: updateScene,
    },
};
var game = new global.Phaser.Game(config);
var path = new global.Phaser.Curves.Path(700, 100);
var path2 = new global.Phaser.Curves.Path(700, 100);
var turnout = false;
var followers = [];
var graphics;
var scene;

function preloadScene() {
    this.load.image("red", "./red.png");
}

function createScene() {
    scene = this.add;
    graphics = scene.graphics();

    graphics.lineStyle(2, 0xffffff, 1);
    path.name = "p1";
    // xRadius, yRadius, startAngle, endAngle, clockwise, rotation
    path.ellipseTo(150, 150, 270, 0);
    path.lineTo(850, 550);
    path.ellipseTo(150, 150, 0, 180);
    path.ellipseTo(150, 150, 0, 270, true);
    path.lineTo(300, 400);
    path.ellipseTo(150, 150, 90, 270);
    path.lineTo(700, 100);

    path2.name = "p2";
    path2.lineTo(800, 100);
    path2.ellipseTo(150, 150, 270, 0);
    path2.lineTo(950, 650);
    path2.ellipseTo(150, 150, 0, 90);
    path2.lineTo(200, 800);
    path2.ellipseTo(150, 150, 90, 180);
    path2.lineTo(50, 250);
    path2.ellipseTo(150, 150, 180, 270);
    path2.lineTo(700, 100);

    path.draw(graphics);
    path2.draw(graphics);
    game;
}

function updateScene() {
    followers.forEach((follower) => {
        if (follower.x >= 690 && follower.x <= 700 && follower.y === 100) {
            if (turnout && follower.path.name === "p2") {
                follower.delay = 0;
                follower.setPath(path);
            } else if (!turnout && follower.path.name === "p1") {
                follower.delay = 0;
                follower.setPath(path2);
            }
        }
    });
}

export default {
    name: "App",
    data: function () {
        return {
            turnout: false
        };
    },
    methods: {
        delFollower: function () {
            let f = followers.pop();
            f.destroy();
        },

        addFollower: function () {
            var follower = scene.follower(path2, 0, 0, "red");
            follower.startFollow({
                positionOnPath: true,
                // ease: "Sine.easeInOut",
                ease: "Linear",
                duration: 8000,
                yoyo: false,
                repeat: -1,
            });
            followers.push(follower);
        },

        changePath: function () {
            turnout = !turnout;
            this.turnout = turnout;
        },
    },
};
</script>
