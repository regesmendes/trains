<template>
    <div v-show="train" class="train">
        <div class="train-header">
            <div>Train {{ train.id }}</div>
            <div>
                Speed:
                <input
                    type="number"
                    :value="train.speed"
                    @input="train.setSpeed(parseInt($event.target.value))"
                    min="0"
                    max="10"
                />
            </div>
        </div>
        <div class="flex-column">
            <div>Itinerary</div>
            <div v-for="(location, index) in train.getItinerary()" :key="index">
                <div :class="{'bold': location === train.getLocation()}">{{ location }}</div>
                <button v-if="location !== train.getLocation()" @click="train.removePath(location)">🞮</button>
            </div>
        </div>
        <div class="train">
            <button @click="newTrackAddingMode = !newTrackAddingMode">{{ newTrackAddingMode ? 'Adding' : 'Replacing' }}</button>
            <label>{{ newTrackAddingMode ? 'Add route' : 'Move to' }}</label>
            <select name="newTrack" v-model="targetTrack">
                <option v-for="(newTrack, index) in availableTracks" :key="index" :value="newTrack">{{ newTrack }}</option>
            </select>
            <button @click="addNewTrack">Ok</button>
        </div>
        <button @click="train.toggleDebug()">
            Debug Movement {{ train.debug ? 'On' : 'Off' }}
        </button>
        <button @click="train.toggleAutoReverse()">Autoreverse {{ train.autoReverse.active ? 'On' : 'Off' }}</button>
        <button @click="train.reverseMotion()">Reverse</button>
        <button @click="removeTrain">Remove</button>
        <button v-show="!selected" @click="$emit('highlight')">Highlight</button>
    </div>
</template>

<script>
import { Train } from './train'

export default {
    data: function() {
        return {
            targetTrack: 0,
            newTrackAddingMode: false
        }
    },

    props: {
        train: {
            type: Train,
            default: null
        },

        selected: {
            type: Boolean,
            default: false
        },

        tracks: {
            type: Array,
            default: () => []
        },

        junctions: {
            type: Array,
            default: () => []
        }
    },

    computed: {
        availableTracks: function () {
            let location = this.train.paths[this.train.paths.length -1].name
            let normal = this.junctions.filter(junction => junction.from.name === location).map(dest => dest.to.name)
            let reverse = this.junctions.filter(junction => junction.to.name === location).map(dest => dest.from.name + ' (rev)')
            return [...normal, ...reverse]
        }
    },

    methods: {
        removeTrain: function () {
            this.train.destroyTrain();
            this.$emit('trainDeleted', this.train);
        },

        addNewTrack: function () {
            let rev = this.targetTrack.indexOf(' (rev)') > 0
            if (rev && !this.train.reverse) {
                this.train.setAutoReverse(true)
            }
            let search = this.targetTrack.replace(' (rev)', '')
            let track = this.tracks.find(track => track.name === search)
            this.train.addPath(track, !this.newTrackAddingMode, rev);
        }
    }
}
</script>
