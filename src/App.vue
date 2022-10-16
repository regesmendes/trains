<template>
    <div class="flex-column">
        <button @click="clearTracks">Clear Tracks</button>
        <button @click="newTrainForm = !newTrainForm">New Train</button>
        <train-form
            v-show="newTrainForm"
            :tracks="tracks"
            @trainCreated="addTrain"
            :scene="scene"
        ></train-form>

        <button @click="viewTrackLib = !viewTrackLib">{{viewTrackLib ? 'Hide' : 'Show'}} Track Lib</button>
        <div v-show="viewTrackLib" class="form">
            <track-lib
                :tracks="trackLib"
                @loadTrack="importTrackFromLib"
                @saveToFile="saveToFile"
            ></track-lib>
        </div>

        <button @click="viewJsonTracks = !viewJsonTracks">Import JSON</button>
        <div v-show="viewJsonTracks" class="flex-column form">
            <input type="file" name="jsonTrackFile" id="jsonTrackFile" ref="jsonTrackFile">
            <button @click="importTrackFromFile">Import</button>
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

        <br><br>

        <button @click="trackControls = !trackControls">Track Controls</button>
        <div v-show="trackControls" class="flex-column form">
            <div v-for="(track, index) in tracks" :key="index">
                <div><input type="color" v-model="track.color" @change="drawTracks"></div>
                <div>{{ track.name }}</div>
            </div>
            <button @click="saveCustomTrack">Download as Custom Track</button>
        </div>

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

import { Branch } from './components/branch';
import { Semaphore } from "./components/semaphore";
import TrainMonitor from "./components/TrainMonitor.vue";
import TrainForm from "./components/TrainForm.vue";
import TrackEditor from "./components/TrackEditor.vue";
import TrackLib from "./components/TrackLib.vue";

export default {
    name: "App",

    components: {
        TrainMonitor,
        TrainForm,
        TrackEditor,
        TrackLib,
    },

    data: function () {
        return {
            config: {
                type: global.Phaser.AUTO,
                width: 1200,
                height: 900,
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
            trackLib: [],
            junctions: [],
            trackEditor: false,
            newTrainForm: false,
            trainControls: false,
            trackControls: false,
            viewJsonTracks: false,
            viewTrackLib: false,
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
            self.trackLib.push(self.scene.cache.json.get('track1'));
        }, 1000);
    },

    computed: {
        allCars() {
            return this.trains.reduce((l, t) => [...l, ...t.cars], []);
        },

        exportedJson() {
            let tracks = this.tracks.map(track => track.toExport());
            return JSON.stringify({
                name: "Custom Track",
                branches: tracks,
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

        clearTracks: function () {
            this.tracks = [];
            if (this.semaphores.length) {
                this.semaphores.forEach(semaphore => semaphore.clear())
            }
            this.semaphores = [];
            this.junctions = [];
            graphics.clear();
        },

        drawTracks: function () {
            this.tracks.forEach((branch) => {
                graphics.lineStyle(1, branch.getColorInt(), 1);
                branch.path.draw(graphics);
            });
        },

        addTrack: function (branch) {
            this.tracks.push(branch);
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

        importTrackFromLib: function (index) {
            this.importJSON(this.trackLib[index])
        },

        importTrackFromFile: function () {
            let self = this;
            for(let i = 0; i < this.$refs.jsonTrackFile.files.length; i++) {
                this.$refs.jsonTrackFile.files[i].text().then(
                    jsonTrack => {
                        self.importJSON(JSON.parse(jsonTrack))
                    }
                )
            }
        },

        importJSON: function (parsed) {
            if (parsed.branches) {
                parsed.branches.forEach((track, index) => {
                    let branch = new Branch();
                    branch.setPathDefinition(track.path);
                    branch.setPath(new global.Phaser.Curves.Path(track.path));
                    branch.setName(track.name ? track.name : "T" + index);
                    branch.setId(this.tracks.length + 1);
                    if (track.color) {
                        branch.setColor(track.color);
                    }
                    this.tracks.push(branch);
                });
            }
            if (parsed.semaphores) {
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
            }
            if (parsed.junctions) {
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
            }
            this.drawTracks();
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

        saveCustomTrack: function () {
            this.saveToFile('Custom_Track.json', this.exportedJson);
        },

        saveToFile: function(filename, text) {
            let element = document.createElement('a');

            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();

            document.body.removeChild(element);
        }
    },
};
</script>
