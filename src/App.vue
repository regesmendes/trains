<template>
    <div>
        <button @click="addFollower">+</button>
        <button @click="delFollower">-</button>
        <div>
            <label for="currentPath">Current Path: </label>
            <select name="currentPath" id="currentPath" v-model="selectedPath">
                <option
                    v-for="(path, index) in paths"
                    :value="index"
                    :key="index"
                >
                    {{ path.name }}
                </option>
            </select>
        </div>
        <button @click="viewJsonPaths = !viewJsonPaths">JSON Paths</button>
        <button @click="pathEditor = !pathEditor">Path Editor</button>
        <div v-show="pathEditor" class="path-editor">
            <div v-if="!newPath.isCreating" class="new-start">
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
                    <div class="new-start">
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
                    <div class="new-start">
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
        <div v-show="viewJsonPaths" class="new-start">
            <label>Current Paths</label>
            <div>{{ JSON.stringify(paths) }}</div>
            <br />
            <label>Import JSON</label>
            <textarea v-model="jsonPaths"></textarea>
            <button @click="importPaths">Import</button>
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
                        // this.load.json('path1', './path1.json');
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
            followers: [],
            selectedPath: false,
            paths: [],
            pathEditor: false,
            newPath: {
                x: 200,
                y: 200,
                isCreating: false,
                path: this.emptyJasonPath(),
                name: "",
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
    },
    methods: {
        delFollower: function () {
            if (this.followers.length) {
                let f = this.followers.pop();
                f.destroy();
            }
        },

        addFollower: function () {
            if (
                this.paths.length &&
                this.selectedPath >= 0 &&
                this.paths[this.selectedPath]
            ) {
                let follower = factory.follower(
                    this.paths[this.selectedPath],
                    0,
                    0,
                    "red"
                );
                console.log(follower)
                follower.startFollow({
                    positionOnPath: true,
                    // ease: "Sine.easeInOut",
                    ease: "Linear",
                    duration: 8000,
                    yoyo: false,
                    repeat: -1,
                });
                this.followers.push(follower);
            }
        },

        changePath: function () {
            // this.selectedPath = !this.selectedPath;
        },

        updateScene: function () {
            // this.followers.forEach((follower) => {
            //     if (
            //         follower.x >= 690 &&
            //         follower.x <= 700 &&
            //         follower.y >= 99 &&
            //         follower.y <= 101
            //     ) {
            //         if (this.selectedPath && follower.path.name === "p2") {
            //             follower.delay = 0;
            //             follower.setPath(this.paths[0]);
            //         } else if (!this.selectedPath && follower.path.name === "p1") {
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
                pathObj.name = "P" + index
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
