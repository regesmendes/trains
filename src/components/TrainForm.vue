<template>
    <div class="train-form flex-column">
        <div>New Train</div>
        <div>
            <label for="trainSize">Size: </label>
            <input
                type="number"
                id="trainSize"
                v-model="trainSize"
            />
        </div>
        <div>
            <label for="trainTrack">Track: </label>
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
        <button @click="addTrain">Add</button>

    </div>
</template>
<script>

import { Train } from './train';

export default {
    data: function () {
        return {
            trainSize: 5,
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