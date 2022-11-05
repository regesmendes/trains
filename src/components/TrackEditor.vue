<template>
    <div class="track-editor flex-column">
        <!-- branches -->
        <div class="form flex-column">
            <div>New Branch</div>
            <div class="flex-column">
                <label>Current position:</label>
                <!-- <div>{{ newTrack.x }}, {{ newTrack.y }}</div> -->
                <div class="flex">
                    <label>x: </label>
                    <input type="number" v-model="newTrack.x">
                </div>
                <div class="flex">
                    <label>y: </label>
                    <input type="number" v-model="newTrack.y">
                </div>
            </div>
            <div>
                <button @click="positionCursor(newTrack)">Show Cursor</button>
                <button @click="callibratingClick = !callibratingClick">{{callibratingClick ? 'Click on the red dot...' : 'Callibrate' }}</button>
            </div>

            <straight-form
                :origin="trackCursor"
                @undoLastAction="undoLastAction"
                @drawTrack="drawLine"
            ></straight-form>

            <curve-form
                :origin="trackCursor"
                @undoLastAction="undoLastAction"
                @drawTrack="drawEllipse"
            ></curve-form>

            <div class="track-editor flex-column">
                <label>Save Branch</label>
                <div>
                    <label for="trackName">Name</label>
                    <input type="text" id="trackName" v-model="newTrack.name" />
                </div>
                <div>
                    <button @click="saveTrack">Done</button>
                    <button @click="cancelTrack">Cancel</button>
                </div>
            </div>
        </div>

        <!-- semaphores -->
        <semaphore-monitor
            :origin="trackCursor"
            :semaphores="semaphores"
            @positionCursor="positionCursor"
            @removeSemaphore="removeSemaphore"
            @semaphoreSaved="addSemaphore"
        ></semaphore-monitor>

        <!-- junctions -->
        <junctions-manager
            :tracks="tracks"
            :junctions="junctions"
            @junctionSaved="createJunction"
            @removeJunction="removeJunction"
        ></junctions-manager>
    </div>
</template>

<script>
import CurveForm from './TrackEditorComponents/CurveForm.vue'
import StraightForm from './TrackEditorComponents/StraightForm.vue'
import SemaphoreMonitor from './TrackEditorComponents/SemaphoreMonitor.vue'
import JunctionsManager from './TrackEditorComponents/JunctionsManager.vue'

export default {
    data: function() {
        return {
            newTrack: {
                x: 200,
                y: 200,
                track: this.emptyJasonTrack(),
                name: "",
                showCurrentTracks: true,
            },
            trackCursor: null,
            cursorOffset: {
                x: 0,
                y: 0
            },
            callibratingClick: false,
            positionHistory: []
        }
    },

    props: {
        graphics: Object,
        factory: Object,
        scene: Object,
        tracks: Array,
        semaphores: Array,
        junctions: Array,
        active: Boolean
    },

    components: {
        StraightForm,
        CurveForm,
        SemaphoreMonitor,
        JunctionsManager
    },

    watch: {
        scene() {
            let self = this;
            if (self.scene) self.scene.input.on("pointerdown", function (pointer) {
                self.pointerClicked(pointer.x, pointer.y);
            });
            this.positionCursor();
        }
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
            if (this.callibratingClick) {
                this.cursorOffset = {
                    x: x - this.trackCursor.x,
                    y: y - this.trackCursor.y
                }
                this.callibratingClick = false
            }
            let position = {
                x: parseInt(x - this.cursorOffset.x),
                y: parseInt(y - this.cursorOffset.y)
            };
            this.newTrack.x = position.x
            this.newTrack.y = position.y
            this.positionCursor(position);
        },

        resetTrack: function () {
            let track = this.emptyJasonTrack();
            this.newTrack = {
                x: track.x,
                y: track.y,
                track: track,
                name: "",
                showCurrentTracks: true,
            };
            this.resetTrackEditorView();
        },

        createTrack: function () {
            this.graphics.lineStyle(2, 0xff0000, 1);
            this.positionCursor();
        },

        drawLine: function (line) {
            this.positionHistory.push([this.newTrack.x, this.newTrack.y]);
            this.newTrack.track.curves.push(line);
            this.newTrack.x = line.points[line.points.length -2];
            this.newTrack.y = line.points[line.points.length -1];
            let track = new global.Phaser.Curves.Path(this.newTrack.track);
            track.draw(this.graphics);
            this.positionCursor(this.newTrack);
        },

        drawEllipse: function (curve) {
            this.positionHistory.push([this.newTrack.x, this.newTrack.y]);
            this.newTrack.track.curves.push(curve);

            let track = new global.Phaser.Curves.Path(this.newTrack.track);
            track.draw(this.graphics);
            let position = track.getEndPoint();
            this.newTrack.x = parseInt(position.x);
            this.newTrack.y = parseInt(position.y);
            this.positionCursor();
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

        positionCursor: function (position) {
            if (this.trackCursor) {
                this.trackCursor.destroy();
            }
            if (this.active) {
                this.trackCursor = this.factory.polygon(
                    position && position.x ? position.x : this.newTrack.x,
                    position && position.y ? position.y : this.newTrack.y,
                    [0, 0, 0, 5, 5, 5, 5, 0],
                    0xff0000
                );

                this.scene.tweens.add({
                    targets: this.trackCursor,
                    repeat: -1,
                    alpha: 0,
                });
            }
        },

        createJunction: function (junction) {
            this.$emit('junctionSaved', junction)
        },

        removeJunction: function (junctionIndex) {
            this.$emit('removeJunction', junctionIndex)
        },

        addSemaphore: function (position) {
            this.$emit('semaphoreSaved', position)
        },

        removeSemaphore: function (semaphoreIndex) {
            this.$emit('removeSemaphore', semaphoreIndex)
        }
    }
}
</script>