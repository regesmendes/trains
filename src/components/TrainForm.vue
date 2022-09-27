<template>
    <div class="train-form flex-column">
        <div class="train-header">
            <div>New Train</div>
            <div>
                <label for="trainSize">Size: </label>
                <input
                    type="number"
                    id="trainSize"
                    v-model="trainSize"
                />
            </div>
        </div>
        <div class="train-header">
            <div>
                <label for="trainTrack">Deploy to</label>
                <select
                    name="trainTrack"
                    id="trainTrack"
                    v-model="trainTrack"
                >
                    <option
                        v-for="(track, index) in tracks"
                        :value="index"
                        :key="index"
                    >
                        {{ track.name }}
                    </option>
                </select>
            </div>
            <button @click="addTrain">Deploy</button>
        </div>

    </div>
</template>
<script>

import { Train } from './train';

export default {
    data: function () {
        return {
            trainSize: 11,
            trainTrack: 0,
        }
    },

    props: {
        tracks: Array,
        scene: Object
    },

    methods: {
        addTrain: function () {
            if (this.tracks.length && this.tracks[this.trainTrack]) {
                let train = new Train(this.scene);
                train.addPath(this.tracks[this.trainTrack], false);
                train.addCars(this.trainSize);
                this.$emit('trainCreated', train);
            }
        },
    }

}
</script>