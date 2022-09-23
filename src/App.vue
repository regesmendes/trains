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
        <button @click="viewJsonPaths = !viewJsonPaths">Import/Export JSON</button>
        <div v-show="viewJsonPaths" class="flex-column">
            <label>Current Track Stuff</label>
            <div>{{ JSON.stringify({'paths': paths, 'semaphores': semaphores.map(s => s.detectors.map(d => ({x: d.x, y: d.y})))}) }}</div>
            <br />
            <label>Import JSON</label>
            <textarea v-model="jsonPaths"></textarea>
            <button @click="importJSON">Import</button>
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
                            <label for="straightAngle">Angle: </label>
                            <input
                                type="number"
                                id="straightAngle"
                                v-model="straight.angle"
                            />
                        </div>
                        <div>
                            <label for="straightX">x: </label>
                            <input
                                type="number"
                                id="straightX"
                                v-model="straight.x"
                            />
                            <button @click="tanXrd">tg \</button>
                            <button @click="tanXru">tg /</button>
                        </div>
                        <div>
                            <label for="straightY">y: </label>
                            <input
                                type="number"
                                id="straightY"
                                v-model="straight.y"
                            />
                            <button @click="tanYru">tg /</button>
                            <button @click="tanYrd">tg \</button>
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
                <div>
                    <label>Semaphores</label>
                    <div v-for="(semaphore, index) in semaphores" :key="index" class="flex-column">
                        <div class="flex-column">
                            <label>
                                Semaphore {{ index }}
                            </label>
                            <button @click="removeSemaphore(index)">Remove Semaphore</button>
                        </div>
                        <label v-for="(detector, index) in semaphore.detectors" :key="index">
                            Detector {{ index }}: {{ detector.x }}, {{ detector.y }}
                        </label>
                        <button @click="newDetector(index)">New Detector</button>
                        <div>Status: {{ semaphore.isOpen() ? 'open' : 'closed' }}</div>
                    </div>
                    <button @click="newSemaphore">New Semaphore</button>
                </div>
            </div>
        </div>
        <button @click="trainControls = !trainControls">Train Controls</button>
        <div v-show="trainControls" class="flex-column">
            <div
                v-for="(train, index) in trains"
                :key="index"
                class="flex-column"
            >
                <div>Train {{ index }}</div>
                <div>Line {{ train.getLineName() }}</div>
                <button @click="train.debug=!train.debug">Debug Movement</button>
                <button @click="changeTrack(train)">Change Track</button>
                <div>
                    Speed:
                    <input
                        type="number"
                        v-model="train.speed"
                        min="0"
                        max="10"
                    />
                </div>
                <button @click="train.reverseMotion()">Reverse</button>
                <button @click="removeTrain(index)">Remove</button>
                <button
                    @click="selectedTrain = index"
                    v-show="selectedTrain != index"
                >
                    Highlight
                </button>
            </div>
        </div>
    </div>
</template>

<script>
var graphics = null;
var factory = null;
var scene = null;

class Train {
    id = 0;
    speed = 0;
    autoPilot = 0;
    reverse = false;
    priority = false;
    failedTry = 0;
    cars = [];
    points = [];
    paths = [];
    locator = 0;
    carOffset = 1; // requires callibration
    cuttOff = -1;
    debug = false;
    reached = true;

    carPosition = function (n) {
        let offset = n * this.carOffset;
        let position =
            n > 0
                ? (this.locator < offset ? this.points.length : 0) +
                  (this.locator - offset)
                : this.locator;
        return this.points[position];
    };

    resumeMovement = function (scene) {
        if (this.autoPilot > this.speed) {
            this.speed++;
            scene.time.addEvent({
                delay: 1000,
                callback: this.resumeMovement,
                callbackScope: this,
                args: [scene],
            });
        } else {
            this.autoPilot = 0;
            this.failedTry = 0;
        }
    };

    reverseMotion = function () {
        this.reverse = !this.reverse;
    };

    moveLocator = function () {
        this.locator = this.reverse
            ? this.locator > 0
                ? --this.locator
                : this.points.length - 1
            : ++this.locator % this.points.length;

        if (
            this.recallibrateCarOffset > -1 &&
            ((this.reverse && this.recallibrateCarOffset > this.locator) ||
                this.recallibrateCarOffset < this.locator)
        ) {
            this.recallibrateCarOffset = -1;
            this.callibrateCarOffset();
        }
        if (
            this.cuttOff > -1 &&
            ((this.reverse && this.cuttOff > this.locator) ||
                this.cuttOff < this.locator)
        ) {
            this.cuttOff = -1;
            this.removePath(this.paths[0].name);
        }
    };

    startMoving = function (scene) {
        let speedRate = 15; // px/s for each speed point
        let speed = this.speed * speedRate;

        this.reached = true
        this.cars.forEach((car, index) => {
            if (car.body) {
                let target = this.carPosition(index);
                let distance = global.Phaser.Math.Distance.Between(
                    car.x,
                    car.y,
                    target.x,
                    target.y
                );
                // distance tolerance, the faster it moves, the more tolerance is required.
                this.reached = this.reached && distance < this.speed / 3 + 1;

                if (this.reached) {
                    if (this.debug) console.log('car reset: ', index, target.x, target.y)
                    car.body.reset(target.x, target.y);
                } else {
                    if (this.debug) console.log('moving car ', index, ' to ', target.x, target.y)
                    scene.physics.moveToObject(car, target, speed);
                }
            }
        });

        if (this.speed && this.reached) {
            if (this.debug) console.log('moving locator...')
            this.moveLocator();
        }
    };

    destroyTrain = function () {
        this.speed = 0;
        this.cars.forEach((car) => car.destroy());
    };

    addPath = function (path, cut = true) {
        let pieces = 50;
        let distance = 0;
        const min = 4;
        const max = 5;

        while (distance < min || distance > max) {
            path.points = path.getSpacedPoints(pieces).slice(0, pieces);
            distance = global.Phaser.Math.Distance.Between(
                path.points[0].x,
                path.points[0].y,
                path.points[1].x,
                path.points[1].y
            );
            pieces *= distance / ((min + max) / 2);
        }
        this.recallibrateCarOffset = this.points.length + 2;
        if (cut) {
            this.cuttOff =
                this.points.length + this.cars.length * (this.carOffset + 3);
        }
        this.paths.push(path);
        this.points = this.paths.reduce((l, p) => [...l, ...p.points], []);
    };

    removePath = function (name) {
        let bookmark = this.carPosition(0);
        this.paths = this.paths.filter((p) => p.name !== name);
        this.points = this.paths.reduce((l, p) => [...l, ...p.points], []);
        this.points.forEach((p, i) => {
            if (p.x === bookmark.x && p.y === bookmark.y) {
                this.locator = i;
            }
        });
    };

    callibrateCarOffset = function () {
        this.carOffset = 0;
        for (let d = 0; d < 20; ) {
            this.carOffset++;
            let car1 = this.carPosition(1);
            let car2 = this.carPosition(2);
            d = global.Phaser.Math.Distance.Between(
                car1.x,
                car1.y,
                car2.x,
                car2.y
            );
        }
    };

    addCars = function (scene, qty = 1) {
        this.callibrateCarOffset();
        this.locator = qty * this.carOffset;
        for (let i = 0; this.cars.length < qty; i++) {
            let position = this.carPosition(i);
            let car = scene.physics.add.image(position.x, position.y, "red");
            this.cars.push(car);
        }
    };

    handleTrainsCollision = function (scene) {
        let delay = 1500;
        this.autoPilot = Math.max(this.autoPilot, Math.min(this.speed, 7));
        this.failedTry++;
        if (!this.priority && this.failedTry % 5 === 1) {
            this.reverseMotion();
        } else {
            if (this.priority) {
                this.speed = 0;
            }
            delay *= this.failedTry * 4;
        }

        scene.time.addEvent({
            delay: delay,
            callback: this.resumeMovement,
            callbackScope: this,
            args: [scene],
        });
    };

    handleSemaphore = function (semaphore, carList) {
        if (carList.length) {
            let isThisTrain = carList.filter(
                car => car.gameObject.body && this.cars.filter(car2 => car2.body && car.gameObject.body.center.x === car2.body.center.x && car.gameObject.body.center.y === car2.body.center.y).length
            ).length

            if (isThisTrain) {
                semaphore.handleCollision(this)
            } else if (semaphore.train && semaphore.train.id === this.id) {
                // this train is not on collision, but still holds the priority, shall release the semaphore
                semaphore.release()
            }
        } else {
            this.resumeMovement(semaphore.scene)
        }
    };

    setupCollisions = function (scene, trainList, deep = true) {
        trainList.forEach((train) => {
            train.cars.forEach((car) => {
                scene.physics.add.overlap(
                    this.cars[0],
                    car,
                    function () {
                        train.handleTrainsCollision(scene);
                    },
                    null,
                    this
                );

                scene.physics.add.overlap(
                    this.cars[this.cars.length - 1],
                    car,
                    function () {
                        train.handleTrainsCollision(scene);
                    },
                    null,
                    this
                );
            });
            if (deep) {
                train.setupCollisions(scene, [this], false);
            }
        });
    };

    setPriority = function (priority) {
        this.priority = priority;
    };

    getLineName = function () {
        return this.paths.map((p) => p.name).join(" - ");
    };
}

class Semaphore {
    train = 0;
    releasing = false;
    scene = null;
    detectors = [];

    constructor(scene, x, y) {
        let detector = {
            x: x,
            y: y,
            detector: scene.add.circle(x, y, 10).setStrokeStyle(2, 0xffff00)
        }
        this.scene = scene;
        this.detectors.push(detector);
    }

    newDetector = function (x, y) {
        let detector = {
            x: x,
            y: y,
            detector: this.scene.add.circle(x, y, 10).setStrokeStyle(2, 0xffff00)
        }
        this.detectors.push(detector);
    }

    isOpen = function () {
        return !this.train
    }

    handleCollision = function (train) {
        if (!this.train) {
            this.train = train
            train.resumeMovement(this.scene)
        } else if (this.train.id !== train.id) {
            train.autoPilot = Math.max(train.autoPilot, Math.min(train.speed, 7))
            train.speed = 0
        }
    }

    release = function() {
        if (this.train && !this.releasing) {
            this.releasing = true
            this.scene.time.addEvent({
                delay: 2000,
                callback: function () {
                    this.releasing = false
                    this.train = null
                },
                callbackScope: this,
            })
        }
    }
}

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
                physics: {
                    default: "arcade",
                    arcade: { debug: false },
                },
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
            semaphores: [],
            selectedTrack: 0,
            selectedTrain: -1,
            paths: [],
            pathEditor: false,
            newTrainForm: false,
            trainControls: false,
            trainSpeed: 0,
            newPath: {
                x: 200,
                y: 200,
                isCreating: false,
                path: this.emptyJasonPath(),
                name: "",
                showCurrentPaths: true,
            },
            newTrain: {
                length: 5,
            },
            straight: {
                x: 0,
                y: 0,
                angle: 0,
            },
            ellipse: {
                xRadius: 100,
                yRadius: 100,
                startAngle: 0,
                endAngle: 90,
                clockwise: true,
                rotation: 0,
            },
            pathCursor: null,
            positionHistory: [],
            viewJsonPaths: false,
            jsonPaths: "",
        };
    },
    mounted() {
        let self = this;
        this.game = new global.Phaser.Game(this.config);

        setTimeout(function () {
            scene.input.on('pointerdown', function (pointer) {
                self.pointerClicked(pointer.x, pointer.y);
            });
            self.importJSON();
        }, 1000);

        this.jsonPaths = '{"paths": [{"type": "Path","x": 200,"y": 200,"autoClose": false,"name": "Depot 01","curves": [{"type": "LineCurve","points": [250,150,520,150]},{"type": "EllipseCurve","x": 520,"y": -30,"xRadius": 180,"yRadius": 180,"startAngle": 90,"endAngle": 59.99999999999999,"clockwise": true,"rotation": 0},{"type": "EllipseCurve","x": 700.0000000000001,"y": 281.76914536239786,"xRadius": 180,"yRadius": 180,"startAngle": 239.99999999999997,"endAngle": 270,"clockwise": false,"rotation": 0}]},{"type": "Path","x": 200,"y": 200,"autoClose": true,"name": "Track 01","curves": [{"type": "EllipseCurve","x": 700,"y": 250,"xRadius": 150,"yRadius": 150,"startAngle": 270,"endAngle": 0,"clockwise": false,"rotation": 0},{"type": "LineCurve","points": [850,249.99999999999997,850,550]},{"type": "EllipseCurve","x": 700,"y": 550,"xRadius": 150,"yRadius": 150,"startAngle": 0,"endAngle": 180,"clockwise": false,"rotation": 0},{"type": "EllipseCurve","x": 400,"y": 550,"xRadius": 150,"yRadius": 150,"startAngle": 0,"endAngle": 270,"clockwise": true,"rotation": 0},{"type": "LineCurve","points": [400,400,300,400]},{"type": "EllipseCurve","x": 300,"y": 250,"xRadius": 150,"yRadius": 150,"startAngle": 90,"endAngle": 270,"clockwise": false,"rotation": 0},{"type": "LineCurve","points": [300,100,700,100]}]},{"type": "Path","x": 200,"y": 200,"autoClose": true,"name": "Track 02","curves": [{"type": "LineCurve","points": [700,100,800,100]},{"type": "EllipseCurve","x": 800,"y": 250,"xRadius": 150,"yRadius": 150,"startAngle": 270,"endAngle": 0,"clockwise": false,"rotation": 0},{"type": "LineCurve","points": [950,249.99999999999997,950,650]},{"type": "EllipseCurve","x": 800,"y": 650,"xRadius": 150,"yRadius": 150,"startAngle": 0,"endAngle": 90,"clockwise": false,"rotation": 0},{"type": "LineCurve","points": [800,800,200,800]},{"type": "EllipseCurve","x": 200,"y": 650,"xRadius": 150,"yRadius": 150,"startAngle": 90,"endAngle": 180,"clockwise": false,"rotation": 0},{"type": "LineCurve","points": [50,650,50,250]},{"type": "EllipseCurve","x": 200,"y": 250,"xRadius": 150,"yRadius": 150,"startAngle": 180,"endAngle": 270,"clockwise": false,"rotation": 0},{"type": "LineCurve","points": [199.99999999999997,100,700,100]}]},{"type": "Path","x": 200,"y": 200,"autoClose": false,"name": "Track 03","curves": [{"type": "LineCurve","points": [700,70,800,70]},{"type": "EllipseCurve","x": 800,"y": 250,"xRadius": 180,"yRadius": 180,"startAngle": 270,"endAngle": 0,"clockwise": false,"rotation": 0},{"type": "LineCurve","points": [980,249.99999999999994,980,650]},{"type": "EllipseCurve","x": 800,"y": 650,"xRadius": 180,"yRadius": 180,"startAngle": 0,"endAngle": 90,"clockwise": false,"rotation": 0},{"type": "LineCurve","points": [800,830,200,830]},{"type": "EllipseCurve","x": 200,"y": 650,"xRadius": 180,"yRadius": 180,"startAngle": 90,"endAngle": 180,"clockwise": false,"rotation": 0},{"type": "LineCurve","points": [20,650,20,250]},{"type": "EllipseCurve","x": 200,"y": 249.99999999999997,"xRadius": 180,"yRadius": 180,"startAngle": 180,"endAngle": 270,"clockwise": false,"rotation": 0},{"type": "LineCurve","points": [199.99999999999997,69.99999999999997,700,70]}]}],"semaphores": [[{"x": 621,"y": 120},{"x": 606,"y": 100},{"x": 775,"y": 120},{"x": 785,"y": 100}]]}'
    },
    computed: {
        allCars() {
            return this.trains.reduce((l, t) => [...l, ...t.cars], []);
        },
    },
    methods: {
        removeTrain: function (n) {
            if (this.trains.length && this.trains[n]) {
                this.trains[n].destroyTrain();

                scene.time.addEvent({
                    delay: 500,
                    callback: function () {
                        if (n == 0) {
                            this.trains = this.trains.slice(1);
                        } else if (n == this.trains.length - 1) {
                            this.trains = this.trains.slice(0, -1);
                        } else {
                            this.trains = [
                                ...this.trains.slice(0, n),
                                ...this.trains.slice(n + 1),
                            ];
                        }
                    },
                    callbackScope: this,
                });
            }
        },

        pointerClicked: function(x, y) {
            let position = {
                x: parseInt(x) - 220,
                y: parseInt(y)
            };
            this.setStraightPosition(position);
            this.positionCursor(position);
        },

        addTrain: function () {
            if (this.paths.length && this.paths[this.selectedTrack]) {
                let train = new Train();
                train.id = this.trains.length + 1;
                train.addPath(this.paths[this.selectedTrack], false);
                train.addCars(scene, this.newTrain.length);
                train.setPriority(this.trains.length < 1);
                if (this.trains.length) {
                    train.setupCollisions(scene, this.trains);
                }

                train.startMoving(scene); // default speed is 0
                this.trains.push(train);
                this.selectedTrain = this.trains.length - 1;
            }
        },

        changeTrack: function (train) {
            let names = train.paths.map((p) => p.name).join(",");
            let available = this.paths.filter((p) => names.indexOf(p.name));

            if (available.length) {
                train.addPath(available[0]);
            }
        },

        updateScene: function () {
            this.liveSemaphores();

            this.trains.forEach((train) => {
                train.startMoving(scene);
            });

            if (this.trains.length) {
                global.Phaser.Actions.SetAlpha(this.allCars, 0.5);
                if (this.trains[this.selectedTrain]) {
                    global.Phaser.Actions.SetAlpha(
                        this.trains[this.selectedTrain].cars,
                        1
                    );
                }
            }
        },

        emptyJasonPath: function (x = 200, y = 200) {
            return {
                type: "Path",
                x: x,
                y: y,
                autoClose: false,
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
            this.resetPathEditorView();
        },

        createPath: function () {
            this.newPath.isCreating = true;
            graphics.lineStyle(2, 0xff0000, 1);
            this.positionCursor();
            this.setStraightPosition();
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

        tanYru: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newY = Math.tan(alpha) * (this.newPath.x - this.straight.x);
            this.straight.y = parseInt(this.newPath.y + newY);
        },

        tanYrd: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newY = Math.tan(alpha) * (this.straight.x - this.newPath.x);
            this.straight.y = parseInt(this.newPath.y + newY);
        },

        tanXru: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newX = (this.newPath.y - this.straight.y) / Math.tan(alpha);
            this.straight.x = parseInt(this.newPath.x + newX);
        },

        tanXrd: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newX = (this.straight.y - this.newPath.y) / Math.tan(alpha);
            this.straight.x = parseInt(this.newPath.x + newX);
        },

        drawEllipse: function () {
            let alpha = (this.ellipse.startAngle * Math.PI) / 180;
            let newX =
                Math.cos(alpha) * this.ellipse.xRadius * -1 + this.newPath.x;
            let newY =
                Math.sin(alpha) * this.ellipse.yRadius * -1 + this.newPath.y;
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
            this.newPath.x = parseInt(position.x);
            this.newPath.y = parseInt(position.y);
            this.positionCursor();
            this.setStraightPosition();
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
            this.resetPathEditorView();
        },

        drawPaths: function () {
            graphics.clear();
            graphics.lineStyle(1, 0x000000, 1);
            this.paths.forEach((path) => {
                path.draw(graphics);
            });
        },

        importJSON: function () {
            this.paths = [];
            this.semaphores = [];
            let parsed = JSON.parse(this.jsonPaths)
            parsed.paths.forEach((path, index) => {
                let pathObj = new global.Phaser.Curves.Path(path);
                pathObj.name = path.name ? path.name : "T" + index;
                this.paths.push(pathObj);
            });
            parsed.semaphores.forEach(semaphore => {
                let semObj = new Semaphore(scene, semaphore[0].x, semaphore[0].y);
                for (let x = 1; x < semaphore.length; x++) {
                    semObj.newDetector(semaphore[x].x, semaphore[x].y)
                }
                this.semaphores.push(semObj)
            })
            this.drawPaths();
        },

        undoLastAction: function () {
            this.newPath.path.curves.pop();
            let position = this.positionHistory.pop();
            if (position) {
                this.newPath.x = position[0];
                this.newPath.y = position[1];
            }

            this.resetPathEditorView();
        },

        resetPathEditorView: function () {
            let path = new global.Phaser.Curves.Path(this.newPath.path);
            if (this.newPath.showCurrentPaths) {
                this.drawPaths();
            } else {
                graphics.clear();
            }
            graphics.lineStyle(2, 0xff0000, 1);
            path.draw(graphics);
            this.positionCursor();
        },

        setStraightPosition: function (position) {
            this.straight.x = position ? position.x : this.newPath.x;
            this.straight.y = position ? position.y : this.newPath.y;
        },

        positionCursor: function (position) {
            if (this.pathCursor) {
                this.pathCursor.destroy();
            }

            if (this.pathEditor) {
                this.pathCursor = factory.polygon(
                    position ? position.x : this.newPath.x,
                    position ? position.y : this.newPath.y,
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

        newSemaphore: function () {
            let semaphore = new Semaphore(scene,
                this.straight.x,
                this.straight.y);
            this.semaphores.push(semaphore);
        },

        removeSemaphore: function (n) {
            this.semaphores[n].detectors.forEach(d => d.detector.destroy());
            if (n == 0) {
                this.semaphores = this.semaphores.slice(1);
            } else if (n == this.semaphores.length - 1) {
                this.semaphores = this.semaphores.slice(0, -1);
            } else {
                this.semaphores = [
                    ...this.semaphores.slice(0, n),
                    ...this.semaphores.slice(n + 1),
                ];
            }
        },

        liveSemaphores: function() {
            this.semaphores.forEach(semaphore => {
                let cars = semaphore.detectors.reduce((cars, detector) => {
                    let list = scene.physics.overlapCirc(detector.x, detector.y, 10, true, true)
                    return list.length ? [...cars, ...list] : [...cars]
                }, []);
                if (!cars.length) {
                    semaphore.release()
                }

                this.trains.forEach(train => {
                    train.handleSemaphore(semaphore, cars)
                })
            })
        },

        newDetector: function (n) {
            this.semaphores[n].newDetector(this.straight.x, this.straight.y)
        }
    },
};
</script>
