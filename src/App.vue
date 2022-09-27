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

import { Track } from './components/track';
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
                        this.load.json("track1", "./track1.json");
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
            self.jsonTracks = JSON.stringify(self.scene.cache.json.get('track1'));
            self.importJSON();
        }, 1000);
    },

    computed: {
        allCars() {
            return this.trains.reduce((l, t) => [...l, ...t.cars], []);
        },

        exportedJson() {
            let tracks = this.tracks.map((track) => ({
                name: track.name,
                path: {
                    type: track.path.type,
                    autoClose: track.path.autoClose,
                    x: track.path.x,
                    y: track.path.y,
                    curves: track.path.curves
                }
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
                track.path.draw(graphics);
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
                let trackObj = new Track(new global.Phaser.Curves.Path(track.path));
                trackObj.setName(track.name ? track.name : "T" + index);
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
