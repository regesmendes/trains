<template>
    <div class="track-editor">
        <div v-if="!newTrack.isCreating" class="flex-column">
            <div>
                <label for="newTrackX">x: </label>
                <input type="number" id="newTrackX" v-model="newTrack.x" />
            </div>
            <div>
                <label for="newTrackY">y: </label>
                <input type="number" id="newTrackY" v-model="newTrack.y" />
            </div>
            <div>
                <button @click="createTrack">New Starting Point</button>
            </div>
        </div>
        <div v-else>
            <div class="cursor-pos">
                <label
                    >Current position: {{ newTrack.x }},
                    {{ newTrack.y }}</label
                >
                <button @click="resetTrack">Reset</button>
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
                <label for="trackName">Name</label>
                <input type="text" id="trackName" v-model="newTrack.name" />
                <button @click="saveTrack">Done</button>
                <button @click="cancelTrack">Cancel</button>
            </div>
            <div>
                <label>Semaphores</label>
                <div
                    v-for="(semaphore, index) in semaphores"
                    :key="index"
                    class="flex-column"
                >
                    <div class="flex-column">
                        <label> Semaphore {{ index }} </label>
                        <button @click="removeSemaphore(index)">
                            Remove Semaphore
                        </button>
                    </div>
                    <label
                        v-for="(detector, index) in semaphore.detectors"
                        :key="index"
                    >
                        Detector {{ index }}: {{ detector.x }},
                        {{ detector.y }}
                    </label>
                    <button @click="newDetector(index)">
                        New Detector
                    </button>
                    <div>
                        Status: {{ semaphore.isOpen() ? "open" : "closed" }}
                    </div>
                </div>
                <button @click="newSemaphore">New Semaphore</button>
            </div>
            <div class="flex-column">
                <label>Junctions</label>
                <div v-for="(junction, index) in junctions" :key="index">
                    <div>From: {{ junction.from ? junction.from.name : 'n/a' }}</div>
                    <div>To: {{ junction.to ? junction.to.name : 'n/a' }}</div>
                    <button @click="deleteJuntion(index)">Delete Junction</button>
                </div>
                <label>New Junction</label>
                <div>
                    <label for="junctionFrom">From:</label>
                    <select v-model="newJunction.from">
                        <option v-for="(track, index) in tracks" :key="index" :value="index">{{ track.name }}</option>
                    </select>
                    <select v-model="newJunction.to">
                        <option v-for="(track, index) in tracks" :key="index" :value="index">{{ track.name }}</option>
                    </select>
                    <button @click="createJunction">Create Junction</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Semaphore } from './semaphore'

export default {
    data: function() {
        return {
            newTrack: {
                x: 200,
                y: 200,
                isCreating: false,
                track: this.emptyJasonTrack(),
                name: "",
                showCurrentTracks: true,
            },
            newJunction: {
                from: null,
                to: null,
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
            trackCursor: null,
            positionHistory: [],
            semaphores: [],
        }
    },

    props: {
        graphics: Object,
        factory: Object,
        scene: Object,
        tracks: Array,
        junctions: Array
    },

    mounted() {
        let self = this;
        let callBack  = function() {
            if (self.scene) {
                self.scene.input.on("pointerdown", function (pointer) {
                    self.pointerClicked(pointer.x, pointer.y);
                });
            } else {
                setTimeout(callBack, 500);
            }
        }
        setTimeout(callBack, 500);
    },

    methods: {
        emptyJasonTrack: function (x = 200, y = 200) {
            return {
                type: "Path",
                x: x,
                y: y,
                autoClose: false,
                curves: [],
            };
        },

        pointerClicked: function (x, y) {
            let position = {
                x: parseInt(x) - 220,
                y: parseInt(y),
            };
            this.setStraightPosition(position);
            this.positionCursor(position);
        },

        resetTrack: function () {
            let track = this.emptyJasonTrack();
            this.newTrack = {
                x: track.x,
                y: track.y,
                isCreating: false,
                track: track,
                name: "",
                showCurrentTracks: true,
            };
            this.resetTrackEditorView();
        },

        createTrack: function () {
            this.newTrack.isCreating = true;
            this.graphics.lineStyle(2, 0xff0000, 1);
            this.positionCursor();
            this.setStraightPosition();
        },

        drawLine: function () {
            let node = {
                type: "LineCurve",
                points: [
                    this.newTrack.x,
                    this.newTrack.y,
                    this.straight.x,
                    this.straight.y,
                ],
            };
            this.positionHistory.push([this.newTrack.x, this.newTrack.y]);
            this.newTrack.track.curves.push(node);
            this.newTrack.x = this.straight.x;
            this.newTrack.y = this.straight.y;
            let track = new global.Phaser.Curves.Path(this.newTrack.track);
            track.draw(this.graphics);
            this.positionCursor();
        },

        tanYru: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newY = Math.tan(alpha) * (this.newTrack.x - this.straight.x);
            this.straight.y = parseInt(this.newTrack.y + newY);
        },

        tanYrd: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newY = Math.tan(alpha) * (this.straight.x - this.newTrack.x);
            this.straight.y = parseInt(this.newTrack.y + newY);
        },

        tanXru: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newX = (this.newTrack.y - this.straight.y) / Math.tan(alpha);
            this.straight.x = parseInt(this.newTrack.x + newX);
        },

        tanXrd: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newX = (this.straight.y - this.newTrack.y) / Math.tan(alpha);
            this.straight.x = parseInt(this.newTrack.x + newX);
        },

        drawEllipse: function () {
            let alpha = (this.ellipse.startAngle * Math.PI) / 180;
            let newX =
                Math.cos(alpha) * this.ellipse.xRadius * -1 + this.newTrack.x;
            let newY =
                Math.sin(alpha) * this.ellipse.yRadius * -1 + this.newTrack.y;
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
            this.positionHistory.push([this.newTrack.x, this.newTrack.y]);
            this.newTrack.track.curves.push(node);

            let track = new global.Phaser.Curves.Path(this.newTrack.track);
            track.draw(this.graphics);
            let position = track.getEndPoint();
            this.newTrack.x = parseInt(position.x);
            this.newTrack.y = parseInt(position.y);
            this.positionCursor();
            this.setStraightPosition();
        },

        saveTrack: function () {
            let track = new global.Phaser.Curves.Path(this.newTrack.track);
            track.name = this.newTrack.name;
            this.$emit('trackSaved', track);
            this.resetTrackEditor();
            this.positionCursor();
        },

        cancelTrack: function () {
            this.resetTrack();
            this.resetTrackEditor();
            this.positionCursor();
            this.resetTrackEditorView();
        },

        resetTrackEditor: function () {
            this.newTrack.isCreating = false;
            this.newTrack.track = this.emptyJasonTrack();
            this.resetTrackEditorView();
        },

        undoLastAction: function () {
            this.newTrack.track.curves.pop();
            let position = this.positionHistory.pop();
            if (position) {
                this.newTrack.x = position[0];
                this.newTrack.y = position[1];
            }

            this.resetTrackEditorView();
        },

        drawTracks: function () {
            this.graphics.lineStyle(1, 0x000000, 1);
            this.tracks.forEach((track) => {
                track.draw(this.graphics);
            });
        },

        resetTrackEditorView: function () {
            let track = new global.Phaser.Curves.Path(this.newTrack.track);

            this.graphics.clear();
            if (this.newTrack.showCurrentTracks) {
                this.drawTracks();
            }
            this.graphics.lineStyle(2, 0xff0000, 1);
            track.draw(this.graphics);
            this.positionCursor();
        },

        setStraightPosition: function (position) {
            this.straight.x = position ? position.x : this.newTrack.x;
            this.straight.y = position ? position.y : this.newTrack.y;
        },

        positionCursor: function (position) {
            if (this.trackCursor) {
                this.trackCursor.destroy();
            }

            this.trackCursor = this.factory.polygon(
                position ? position.x : this.newTrack.x,
                position ? position.y : this.newTrack.y,
                [0, 0, 0, 8, 8, 8, 8, 0],
                0xff0000
            );

            this.scene.tweens.add({
                targets: this.trackCursor,
                repeat: -1,
                alpha: 1,
            });
        },

        newSemaphore: function () {
            let semaphore = new Semaphore(
                this.scene,
                this.straight.x,
                this.straight.y
            );
            this.semaphores.push(semaphore);
        },

        removeSemaphore: function (n) {
            this.semaphores[n].detectors.forEach((d) => d.detector.destroy());
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

        newDetector: function (n) {
            this.semaphores[n].newDetector(this.straight.x, this.straight.y);
        },

        createJunction: function () {
            let junction = {
                from: this.tracks[this.newJunction.from],
                to: this.tracks[this.newJunction.to]
            }
            this.$emit('junctionSaved', junction)
        }
    }
}
</script>