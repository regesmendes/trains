<template>
    <div class="flex-column">
        <div>Track Lib</div>
        <div v-for="(track, index) in tracks" :key="index">
            <label>{{ track.name }}</label>
            <button @click="loadTrack(index)">Load</button>
            <button @click="downloadTrack(track)">Download</button>
        </div>
    </div>
</template>
<script>

export default {
    data: function () {
        return {
        }
    },

    props: {
        tracks: Array,
    },

    methods: {
        loadTrack(index) {
            this.$emit('loadTrack', index)
        },

        downloadTrack(track) {
            let text = JSON.stringify(track);
            let filename = track.name.replaceAll(' ', '_').concat('.json');
            this.$emit('saveToFile', filename, text);
        }
    }
}
</script>