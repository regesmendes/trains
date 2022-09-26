<template>
    <div class="track-editor flex-column">
        <div>
            <label @click="showJunctions = !showJunctions">Junctions</label>
            <button @click="showForm = !showForm">🞧</button>
        </div>
        <div v-show="showForm" class="track-editor flex-column">
            <div>
                <select v-model="newJunction.from">
                    <option v-for="(track, index) in tracks" :key="index" :value="index">{{ track.name }}</option>
                </select>
                <div> → </div>
                <select v-model="newJunction.to">
                    <option v-for="(track, index) in tracks" :key="index" :value="index">{{ track.name }}</option>
                </select>
            </div>
            <button @click="createJunction">Create</button>
        </div>
        <div v-for="(junction, index) in junctions" :key="index" v-show="showJunctions" class="junction-card">
            <div>
                {{ junction.from ? junction.from.name : 'n/a' }} → {{ junction.to ? junction.to.name : 'n/a' }}
            </div>
            <button @click="$emit('removeJunction', index)">🞮</button>
        </div>
    </div>
</template>

<script>
export default {
    data: function () {
        return {
            newJunction: {
                from: null,
                to: null,
            },
            showJunctions: false,
            showForm: false
        }
    },

    props: {
        tracks: Array,
        junctions: Array
    },

    methods: {
        createJunction: function () {
            let junction = {
                from: this.tracks[this.newJunction.from],
                to: this.tracks[this.newJunction.to]
            }
            this.$emit('junctionSaved', junction)
        },

    }
}
</script>