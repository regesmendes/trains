<template>
    <div class="flex-column">
        <button @click="newTrainForm = !newTrainForm">New Train</button>
        <train-form
            v-show="newTrainForm"
            :tracks="tracks"
            @trainCreated="addTrain"
            :scene="scene"
        ></train-form>

        <button @click="viewJsonTracks = !viewJsonTracks">Import/Export JSON</button>
        <div v-show="viewJsonTracks" class="flex-column">
            <label>Current Track Stuff</label>
            <div class="exported-json">{{ exportedJson }}</div>
            <textarea v-model="jsonTracks" class="json-tracks"></textarea>
            <button @click="importJSON">Import</button>
        </div>

        <button @click="trackEditor = !trackEditor">Track Editor</button>
        <track-editor
            v-show="trackEditor"
            :active="trackEditor"
            :factory="factory"
            :graphics="graphics"
            :scene="scene"
            :tracks="tracks"
            :semaphores="semaphores"
            :junctions="junctions"
            @trackSaved="addTrack"
            @junctionSaved="addJunction"
            @removeJunction="removeJunction"
            @semaphoreSaved="addSemaphore"
            @removeSemaphore="removeSemaphore"
        ></track-editor>

        <button @click="trainControls = !trainControls">Train Controls</button>
        <div v-show="trainControls" class="flex-column">
            <train-monitor
                v-for="(train, index) in trains"
                :key="index"
                :train="train"
                class="flex-column"
                :selected="this.selectedTrain == index"
                :tracks="tracks"
                :junctions="junctions"
                @highlight="this.selectedTrain = index"
                @trainDeleted="removeTrain"
            ></train-monitor>
        </div>
    </div>
</template>

<script>
var graphics = null;
var factory = null;
var scene = null;

import { Semaphore } from "./components/semaphore";
import TrainMonitor from "./components/TrainMonitor.vue";
import TrainForm from "./components/TrainForm.vue";
import TrackEditor from "./components/TrackEditor.vue";

export default {
    name: "App",

    components: {
        TrainMonitor,
        TrainForm,
        TrackEditor
    },

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
            selectedTrain: -1,
            tracks: [],
            junctions: [],
            trackEditor: false,
            newTrainForm: false,
            trainControls: false,
            viewJsonTracks: false,
            jsonTracks: "",
            scene: null,
            factory: null,
            graphics: null,
        };
    },

    mounted() {
        let self = this;
        this.game = new global.Phaser.Game(this.config);

        // loading default track set
        setTimeout(function () {
            self.scene = scene;
            self.factory = factory;
            self.graphics = graphics;
            self.importJSON();
        }, 1000);
        this.jsonTracks =
            '{"tracks":[{"name":"Depot 01","autoClose":false,"curves":[{"type":"LineCurve","points":[250,150,520,150]},{"type":"EllipseCurve","x":520,"y":-30,"xRadius":180,"yRadius":180,"startAngle":90,"endAngle":59.99999999999999,"clockwise":true,"rotation":0},{"type":"EllipseCurve","x":700.0000000000001,"y":281.76914536239786,"xRadius":180,"yRadius":180,"startAngle":239.99999999999997,"endAngle":270,"clockwise":false,"rotation":0}]},{"name":"Track 01","autoClose":true,"curves":[{"type":"EllipseCurve","x":700,"y":250,"xRadius":150,"yRadius":150,"startAngle":270,"endAngle":0,"clockwise":false,"rotation":0},{"type":"LineCurve","points":[850,249.99999999999997,850,550]},{"type":"EllipseCurve","x":700,"y":550,"xRadius":150,"yRadius":150,"startAngle":0,"endAngle":180,"clockwise":false,"rotation":0},{"type":"EllipseCurve","x":400,"y":550,"xRadius":150,"yRadius":150,"startAngle":0,"endAngle":270,"clockwise":true,"rotation":0},{"type":"LineCurve","points":[400,400,300,400]},{"type":"EllipseCurve","x":300,"y":250,"xRadius":150,"yRadius":150,"startAngle":90,"endAngle":270,"clockwise":false,"rotation":0},{"type":"LineCurve","points":[300,100,700,100]}]},{"name":"Track 02","autoClose":true,"curves":[{"type":"LineCurve","points":[700,100,800,100]},{"type":"EllipseCurve","x":800,"y":250,"xRadius":150,"yRadius":150,"startAngle":270,"endAngle":0,"clockwise":false,"rotation":0},{"type":"LineCurve","points":[950,249.99999999999997,950,650]},{"type":"EllipseCurve","x":800,"y":650,"xRadius":150,"yRadius":150,"startAngle":0,"endAngle":90,"clockwise":false,"rotation":0},{"type":"LineCurve","points":[800,800,200,800]},{"type":"EllipseCurve","x":200,"y":650,"xRadius":150,"yRadius":150,"startAngle":90,"endAngle":180,"clockwise":false,"rotation":0},{"type":"LineCurve","points":[50,650,50,250]},{"type":"EllipseCurve","x":200,"y":250,"xRadius":150,"yRadius":150,"startAngle":180,"endAngle":270,"clockwise":false,"rotation":0},{"type":"LineCurve","points":[199.99999999999997,100,700,100]}]},{"name":"Track 03","autoClose":false,"curves":[{"type":"LineCurve","points":[700,70,800,70]},{"type":"EllipseCurve","x":800,"y":250,"xRadius":180,"yRadius":180,"startAngle":270,"endAngle":0,"clockwise":false,"rotation":0},{"type":"LineCurve","points":[980,249.99999999999994,980,650]},{"type":"EllipseCurve","x":800,"y":650,"xRadius":180,"yRadius":180,"startAngle":0,"endAngle":90,"clockwise":false,"rotation":0},{"type":"LineCurve","points":[800,830,200,830]},{"type":"EllipseCurve","x":200,"y":650,"xRadius":180,"yRadius":180,"startAngle":90,"endAngle":180,"clockwise":false,"rotation":0},{"type":"LineCurve","points":[20,650,20,250]},{"type":"EllipseCurve","x":200,"y":249.99999999999997,"xRadius":180,"yRadius":180,"startAngle":180,"endAngle":270,"clockwise":false,"rotation":0},{"type":"LineCurve","points":[199.99999999999997,69.99999999999997,700,70]}]}],"semaphores":[{"detectors":[{"x":621,"y":120},{"x":606,"y":100},{"x":775,"y":120},{"x":785,"y":100},{"x":703,"y":100}],"lights":[{"x":806,"y":128},{"x":807,"y":89},{"x":609,"y":139},{"x":585,"y":109}]},{"detectors":[{"x":224,"y":120},{"x":215,"y":100},{"x":272,"y":100},{"x":341,"y":100}],"lights":[{"x":218,"y":139},{"x":195,"y":110},{"x":357,"y":91}]}],"junctions":[{"from":"Depot 01","to":"Track 01"},{"from":"Track 01","to":"Track 02"},{"from":"Depot 01","to":"Track 02"},{"from":"Track 02","to":"Track 01"}]}';
    },

    computed: {
        allCars() {
            return this.trains.reduce((l, t) => [...l, ...t.cars], []);
        },

        exportedJson() {
            let tracks = this.tracks.map((track) => ({
                type: track.type,
                name: track.name,
                autoClose: track.autoClose,
                x: track.x,
                y: track.y,
                curves: track.curves,
            }));
            return JSON.stringify({
                tracks: tracks,
                semaphores: this.semaphores.map(s => ({
                    detectors: s.detectors.map(d => ({ x: d.x, y: d.y })),
                    lights: s.trafficLights.map(l => ({ x: l.x, y: l.y }))
                })),
                junctions: this.junctions.map((junction) => {
                    return { from: junction.from.name, to: junction.to.name };
                }),
            });
        },
    },

    methods: {
        removeTrain: function (train) {
            this.trains = this.trains.filter(
                (checking) => checking.id !== train.id
            );
        },

        addTrain: function (train) {
            train.id = this.trains.length
                ? this.trains[this.trains.length - 1].id + 1
                : 1;
            train.setPriority(this.trains.length < 1);
            if (this.trains.length) {
                train.setupCollisions(this.trains);
            }

            this.trains.push(train);
            this.selectedTrain = this.trains.length - 1;
        },

        updateScene: function () {
            this.liveSemaphores();

            this.trains.forEach((train) => {
                train.startMoving();
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

        drawTracks: function () {
            graphics.clear();
            graphics.lineStyle(1, 0x000000, 1);
            this.tracks.forEach((track) => {
                track.draw(graphics);
            });
        },

        addTrack: function (track) {
            this.tracks.push(track);
        },

        addSemaphore: function (position) {
            let semaphore = new Semaphore(
                this.scene,
                position.x,
                position.y
            );
            this.semaphores.push(semaphore);
        },

        removeSemaphore: function (index) {
            this.semaphores[index].detectors.forEach((d) => d.detector.destroy());
            if (index === 0) {
                this.semaphores = this.semaphores.slice(1);
            } else if (index == this.semaphores.length - 1) {
                this.semaphores = this.semaphores.slice(0, -1);
            } else {
                this.semaphores = [
                    ...this.semaphores.slice(0, index),
                    ...this.semaphores.slice(index + 1),
                ];
            }
        },

        addJunction: function (junction) {
            this.junctions.push(junction);
        },

        removeJunction: function (index) {
            if (index === 0) {
                this.junctions = this.junctions.slice(1);
            } else if (index == this.junctions.length - 1) {
                this.junctions = this.junctions.slice(0, -1);
            } else {
                this.junctions = [
                    ...this.junctions.slice(0, index),
                    ...this.junctions.slice(index + 1),
                ];
            }
        },

        importJSON: function () {
            this.tracks = [];
            this.semaphores = [];
            this.junctions = [];
            let parsed = JSON.parse(this.jsonTracks);
            parsed.tracks.forEach((track, index) => {
                let trackObj = new global.Phaser.Curves.Path(track);
                trackObj.name = track.name ? track.name : "T" + index;
                this.tracks.push(trackObj);
            });
            parsed.semaphores.forEach((semaphore) => {
                let semObj = new Semaphore(this.scene);
                semaphore.detectors.forEach(detector => {
                    semObj.newDetector(detector.x, detector.y);
                });
                semaphore.lights.forEach(light => {
                    semObj.newTrafficLight(light.x, light.y)
                });
                this.semaphores.push(semObj);
            });
            parsed.junctions.forEach((junction) => {
                let junctionObj = {
                    from: null,
                    to: null,
                };
                for (let x = 0; x < this.tracks.length; x++) {
                    if (junction.from === this.tracks[x].name) {
                        junctionObj.from = this.tracks[x];
                    }
                    if (junction.to === this.tracks[x].name) {
                        junctionObj.to = this.tracks[x];
                    }
                }
                if (junctionObj.from && junctionObj.to) {
                    this.junctions.push(junctionObj);
                }
            });
            this.drawTracks();
            this.jsonTracks = "";
        },

        liveSemaphores: function () {
            this.semaphores.forEach((semaphore) => {
                let cars = semaphore.detectors.reduce((cars, detector) => {
                    let list = this.scene.physics.overlapCirc(
                        detector.x,
                        detector.y,
                        10,
                        true,
                        true
                    );
                    return list.length ? [...cars, ...list] : [...cars];
                }, []);
                if (!cars.length) {
                    semaphore.release();
                } else {
                    this.trains.forEach((train) => {
                        train.handleSemaphore(semaphore, cars);
                    });
                }
            });
        },
    },
};
</script>
