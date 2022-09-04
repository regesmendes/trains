<template>
    <div class="flex-column">
        <button @click="newTrainForm = !newTrainForm">New Train</button>
        <div class="flex-column" v-show="newTrainForm">
            <div>New Train</div>
            <div>
                <label for="compositionLength">Length: </label>
                <input
                    type="number"
                    id="compositionLength"
                    v-model="newTrain.length"
                />
            </div>
            <div>
                <label for="selectedTrack">Track: </label>
                <select
                    name="selectedTrack"
                    id="selectedTrack"
                    v-model="selectedTrack"
                >
                    <option
                        v-for="(path, index) in paths"
                        :value="index"
                        :key="index"
                    >
                        {{ path.name }}
                    </option>
                </select>
            </div>
            <button @click="addTrain">Add</button>
        </div>
        <button @click="viewJsonPaths = !viewJsonPaths">JSON Paths</button>
        <div v-show="viewJsonPaths" class="flex-column">
            <label>Current Paths</label>
            <div>{{ JSON.stringify(paths) }}</div>
            <button @click="drawPaths">Draw Paths</button>
            <br />
            <label>Import JSON</label>
            <textarea v-model="jsonPaths"></textarea>
            <button @click="importPaths">Import</button>
        </div>
        <button @click="pathEditor = !pathEditor">Path Editor</button>
        <div v-show="pathEditor" class="path-editor">
            <div v-if="!newPath.isCreating" class="flex-column">
                <div>
                    <label for="newPathX">x: </label>
                    <input type="number" id="newPathX" v-model="newPath.x" />
                </div>
                <div>
                    <label for="newPathY">y: </label>
                    <input type="number" id="newPathY" v-model="newPath.y" />
                </div>
                <div>
                    <button @click="createPath">New Starting Point</button>
                </div>
            </div>
            <div v-else>
                <div class="cursor-pos">
                    <label
                        >Current position: {{ newPath.x }},
                        {{ newPath.y }}</label
                    >
                    <button @click="resetPath">Reset</button>
                </div>
                <div>
                    <label>Straight</label>
                    <div class="flex-column">
                        <div>
                            <label for="straightX">x: </label>
                            <input
                                type="number"
                                id="straightX"
                                v-model="straight.x"
                            />
                        </div>
                        <div>
                            <label for="straightY">y: </label>
                            <input
                                type="number"
                                id="straightY"
                                v-model="straight.y"
                            />
                        </div>
                        <div>
                            <button @click="drawLine">Draw</button>
                            <button @click="undoLastAction">Undo</button>
                        </div>
                    </div>
                </div>
                <div>
                    <label>Ellipse</label>
                    <div class="flex-column">
                        <div>
                            <label for="ellipseX">X Radius: </label>
                            <input
                                type="number"
                                id="ellipseX"
                                v-model="ellipse.xRadius"
                            />
                        </div>
                        <div>
                            <label for="ellipseY">Y Radius: </label>
                            <input
                                type="number"
                                id="ellipseY"
                                v-model="ellipse.yRadius"
                            />
                        </div>
                        <div>
                            <label for="ellipseStartAngle">Start Angle: </label>
                            <input
                                type="number"
                                id="ellipseStartAngle"
                                v-model="ellipse.startAngle"
                            />
                        </div>
                        <div>
                            <label for="ellipseEndAngle">End Angle: </label>
                            <input
                                type="number"
                                id="ellipseEndAngle"
                                v-model="ellipse.endAngle"
                            />
                        </div>
                        <div>
                            <label for="ellipseClockwise">Clockwise: </label>
                            <input
                                type="checkbox"
                                id="ellipseClockwise"
                                v-model="ellipse.clockwise"
                            />
                        </div>
                        <div>
                            <label for="ellipseRotation">Rotation: </label>
                            <input
                                type="number"
                                id="ellipseRotation"
                                v-model="ellipse.rotation"
                            />
                        </div>
                        <div>
                            <label for="ellipseOffset">Offset: </label>
                            <select v-model="ellipse.offset" id="ellipseOffset">
                                <option value="0">None</option>
                                <option value="+x">right</option>
                                <option value="-x">left</option>
                                <option value="+y">up</option>
                                <option value="-y">down</option>
                            </select>
                        </div>
                        <div>
                            <button @click="drawEllipse">Draw</button>
                            <button @click="undoLastAction">Undo</button>
                        </div>
                    </div>
                </div>
                <div>
                    <label for="pathName">Name</label>
                    <input type="text" id="pathName" v-model="newPath.name" />
                    <button @click="savePath">Done</button>
                    <button @click="cancelPath">Cancel</button>
                </div>
            </div>
        </div>
        <button @click="trainEditor = !trainEditor">Train Editor</button>
        <div v-show="trainEditor" class="flex-column">
            <label for="selectedTrain">Select a train</label>
            <select v-model="selectedTrain" id="selectedTrain">
                <option
                    v-for="(train, index) in trains"
                    :value="index"
                    :key="index"
                >
                    Train {{ index }}
                </option>
            </select>
            <input
                type="number"
                v-model="trainSpeed"
                @change="changeTrainSpeed"
            />
            <button @click="stopTrain">Stop Train</button>
            <button @click="removeTrain">Remove</button>
        </div>
    </div>
</template>

<script>
var graphics = null;
var factory = null;
var scene = null;

export default {
    name: "App",
    data: function () {
        return {
            config: {
                type: global.Phaser.AUTO,
                width: 1080,
                height: 920,
                // backgroundColor: '#2d2d2d',
                backgroundColor: "#c6c6c6",
                parent: "phaser-example",
                scene: {
                    preload: function () {
                        this.load.image("red", "./red.png");
                        // this.load.json("track1", "./track1.json");
                    },
                    create: function () {
                        scene = this;
                        factory = this.add;
                        graphics = this.add.graphics();
                    },
                    update: this.updateScene,
                },
            },
            game: null,
            trains: [],
            selectedTrack: false,
            selectedTrain: -1,
            paths: [],
            pathEditor: false,
            newTrainForm: false,
            trainEditor: false,
            trainSpeed: 10,
            newPath: {
                x: 200,
                y: 200,
                isCreating: false,
                path: this.emptyJasonPath(),
                name: "",
            },
            newTrain: {
                length: 5,
            },
            straight: {
                x: 0,
                y: 0,
            },
            ellipse: {
                xRadius: 100,
                yRadius: 100,
                startAngle: 0,
                endAngle: 90,
                clockwise: true,
                rotation: 0,
                offset: "0",
            },
            pathCursor: null,
            positionHistory: [],
            viewJsonPaths: false,
            jsonPaths: "",
        };
    },
    mounted() {
        this.game = new global.Phaser.Game(this.config);
        this.paths = [
            {
                type: "Path",
                x: 200,
                y: 200,
                autoClose: true,
                curves: [
                    {
                        type: "EllipseCurve",
                        x: 700,
                        y: 250,
                        xRadius: 150,
                        yRadius: 150,
                        startAngle: 270,
                        endAngle: 0,
                        clockwise: false,
                        rotation: 0,
                    },
                    {
                        type: "LineCurve",
                        points: [850, 249.99999999999997, 850, 550],
                    },
                    {
                        type: "EllipseCurve",
                        x: 700,
                        y: 550,
                        xRadius: 150,
                        yRadius: 150,
                        startAngle: 0,
                        endAngle: 180,
                        clockwise: false,
                        rotation: 0,
                    },
                    {
                        type: "EllipseCurve",
                        x: 400,
                        y: 550,
                        xRadius: 150,
                        yRadius: 150,
                        startAngle: 0,
                        endAngle: 270,
                        clockwise: true,
                        rotation: 0,
                    },
                    {
                        type: "LineCurve",
                        points: [400, 400, 300, 400],
                    },
                    {
                        type: "EllipseCurve",
                        x: 300,
                        y: 250,
                        xRadius: 150,
                        yRadius: 150,
                        startAngle: 90,
                        endAngle: 270,
                        clockwise: false,
                        rotation: 0,
                    },
                    {
                        type: "LineCurve",
                        points: [300, 100, 700, 100],
                    },
                ],
            },
            {
                type: "Path",
                x: 200,
                y: 200,
                autoClose: true,
                curves: [
                    {
                        type: "LineCurve",
                        points: [700, 100, 800, 100],
                    },
                    {
                        type: "EllipseCurve",
                        x: 800,
                        y: 250,
                        xRadius: 150,
                        yRadius: 150,
                        startAngle: 270,
                        endAngle: 0,
                        clockwise: false,
                        rotation: 0,
                    },
                    {
                        type: "LineCurve",
                        points: [950, 249.99999999999997, 950, 650],
                    },
                    {
                        type: "EllipseCurve",
                        x: 800,
                        y: 650,
                        xRadius: 150,
                        yRadius: 150,
                        startAngle: 0,
                        endAngle: 90,
                        clockwise: false,
                        rotation: 0,
                    },
                    {
                        type: "LineCurve",
                        points: [800, 800, 200, 800],
                    },
                    {
                        type: "EllipseCurve",
                        x: 200,
                        y: 650,
                        xRadius: 150,
                        yRadius: 150,
                        startAngle: 90,
                        endAngle: 180,
                        clockwise: false,
                        rotation: 0,
                    },
                    {
                        type: "LineCurve",
                        points: [50, 650, 50, 250],
                    },
                    {
                        type: "EllipseCurve",
                        x: 200,
                        y: 250,
                        xRadius: 150,
                        yRadius: 150,
                        startAngle: 180,
                        endAngle: 270,
                        clockwise: false,
                        rotation: 0,
                    },
                    {
                        type: "LineCurve",
                        points: [199.99999999999997, 100, 700, 100],
                    },
                ],
            },
        ];
        this.paths.forEach((path, index) => {
            let pathObj = new global.Phaser.Curves.Path(path);
            pathObj.name = "P" + index;
            this.paths[index] = pathObj;
        });
    },
    methods: {
        removeTrain: function () {
            if (this.trains.length && this.trains[this.selectedTrain]) {
                this.trains[this.selectedTrain].forEach((car) => car.destroy());
                if (this.selectedTrain == 0) {
                    this.trains = this.trains.slice(1);
                } else if (this.selectedTrain == this.trains.length - 1) {
                    this.trains = this.trains.slice(0, -1);
                } else {
                    this.trains = [
                        ...this.trains.slice(0, this.selectedTrain),
                        ...this.trains.slice(this.selectedTrain + 1),
                    ];
                }
            }
        },

        addTrain: function () {
            if (this.paths.length && this.paths[this.selectedTrack]) {
                let train = [];
                for (let i = 0; i < this.newTrain.length; i++) {
                    let car = factory.follower(
                        this.paths[this.selectedTrack],
                        0,
                        0,
                        "red"
                    );
                    car.startFollow({
                        positionOnPath: true,
                        // ease: "Sine.easeInOut",
                        ease: "Linear",
                        duration: 8000,
                        yoyo: false,
                        repeat: -1,
                        delay: i * 50,
                    });
                    train.push(car);
                }
                this.trains.push(train);
            }
        },

        stopTrain: function () {
            if (this.trains.length && this.trains[this.selectedTrain]) {
                this.trains[this.selectedTrain].forEach((car) =>
                    car.pauseFollow()
                );
            }
        },

        changeTrainSpeed: function () {
            if (this.trains.length && this.trains[this.selectedTrain]) {
                if (this.trainSpeed === 0) {
                    this.stopTrain();
                } else {
                    let speed = (10 / this.trainSpeed) * 8000;
                    this.trains[this.selectedTrain].forEach((car, index) => {
                        if (car.pathTween.paused) {
                            car.startFollow({
                                positionOnPath: true,
                                // ease: "Sine.easeInOut",
                                ease: "Linear",
                                duration: speed,
                                yoyo: false,
                                repeat: -1,
                                delay: index * 50,
                            });
                        } else {
                            car.pathTween.data[0].duration = speed;
                        }
                    });
                }
            }
        },

        changePath: function () {
            // this.selectedTrack = !this.selectedTrack;
        },

        updateScene: function () {
            // this.trains.forEach((follower) => {
            //     if (
            //         follower.x >= 690 &&
            //         follower.x <= 700 &&
            //         follower.y >= 99 &&
            //         follower.y <= 101
            //     ) {
            //         if (this.selectedTrack && follower.path.name === "p2") {
            //             follower.delay = 0;
            //             follower.setPath(this.paths[0]);
            //         } else if (!this.selectedTrack && follower.path.name === "p1") {
            //             follower.delay = 0;
            //             follower.setPath(this.paths[1]);
            //         }
            //     }
            // });
        },

        emptyJasonPath: function (x = 200, y = 200) {
            return {
                type: "Path",
                x: x,
                y: y,
                autoClose: true,
                curves: [],
            };
        },

        resetPath: function () {
            let path = this.emptyJasonPath();
            this.newPath = {
                x: path.x,
                y: path.y,
                isCreating: false,
                path: path,
            };
            graphics.clear();
        },

        createPath: function () {
            this.newPath.isCreating = true;
            graphics.lineStyle(2, 0xff0000, 1);
            this.positionCursor();
        },

        drawLine: function () {
            let node = {
                type: "LineCurve",
                points: [
                    this.newPath.x,
                    this.newPath.y,
                    this.straight.x,
                    this.straight.y,
                ],
            };
            this.positionHistory.push([this.newPath.x, this.newPath.y]);
            this.newPath.path.curves.push(node);
            this.newPath.x = this.straight.x;
            this.newPath.y = this.straight.y;
            let path = new global.Phaser.Curves.Path(this.newPath.path);
            path.draw(graphics);
            this.positionCursor();
        },

        drawEllipse: function () {
            let newX =
                this.ellipse.offset === "-x"
                    ? this.newPath.x - this.ellipse.xRadius
                    : this.ellipse.offset === "+x"
                    ? this.newPath.x + this.ellipse.xRadius
                    : this.newPath.x;
            let newY =
                this.ellipse.offset === "+y"
                    ? this.newPath.y - this.ellipse.yRadius
                    : this.ellipse.offset === "-y"
                    ? this.newPath.y + this.ellipse.yRadius
                    : this.newPath.y;
            let node = {
                type: "EllipseCurve",
                x: newX,
                y: newY,
                xRadius: this.ellipse.xRadius,
                yRadius: this.ellipse.yRadius,
                startAngle: this.ellipse.startAngle,
                endAngle: this.ellipse.endAngle,
                clockwise: !this.ellipse.clockwise,
                rotation: this.ellipse.rotation,
            };
            this.positionHistory.push([this.newPath.x, this.newPath.y]);
            this.newPath.path.curves.push(node);
            let path = new global.Phaser.Curves.Path(this.newPath.path);
            path.draw(graphics);
            let position = path.getEndPoint();
            this.newPath.x = position.x;
            this.newPath.y = position.y;
            this.positionCursor();
        },

        savePath: function () {
            let path = new global.Phaser.Curves.Path(this.newPath.path);
            path.name = this.newPath.name;
            this.paths.push(path);
            this.resetPathEditor();
            this.positionCursor();
        },

        cancelPath: function () {
            this.pathEditor = false;
            this.resetPath();
            this.resetPathEditor();
            this.positionCursor();
        },

        resetPathEditor: function () {
            this.newPath.isCreating = false;
            this.newPath.path = this.emptyJasonPath();
            this.pathEditor = false;
            this.drawPaths();
        },

        drawPaths: function () {
            graphics.clear();
            graphics.lineStyle(1, 0x000000, 1);
            this.paths.forEach((path) => {
                path.draw(graphics);
            });
        },

        importPaths: function () {
            this.paths = [];
            JSON.parse(this.jsonPaths).forEach((path, index) => {
                let pathObj = new global.Phaser.Curves.Path(path);
                pathObj.name = "P" + index;
                this.paths.push(pathObj);
            });
            this.drawPaths();
        },

        undoLastAction: function () {
            this.newPath.path.curves.pop();
            let position = this.positionHistory.pop();
            if (position) {
                this.newPath.x = position[0];
                this.newPath.y = position[1];
            }

            let path = new global.Phaser.Curves.Path(this.newPath.path);
            graphics.clear();
            path.draw(graphics);
            this.positionCursor();
        },

        positionCursor: function () {
            if (this.pathCursor) {
                this.pathCursor.destroy();
            }

            if (this.pathEditor) {
                this.pathCursor = factory.polygon(
                    this.newPath.x,
                    this.newPath.y,
                    [0, 0, 0, 8, 8, 8, 8, 0],
                    0xff0000
                );

                scene.tweens.add({
                    targets: this.pathCursor,
                    repeat: -1,
                    alpha: 0,
                });
            }
        },
    },
};
</script>
