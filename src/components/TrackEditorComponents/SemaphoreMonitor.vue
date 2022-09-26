<template>
    <div class="track-editor flex-column">
        <div>
            <label @click="showSemaphores = !showSemaphores">Semaphores</label>
            <button @click="newSemaphore" class="cursor-pointer">🞧</button>
        </div>
        <div
            v-for="(semaphore, semaphoreIndex) in semaphores"
            :key="semaphoreIndex"
            class="track-editor flex-column"
            v-show="showSemaphores"
        >
            <div>
                <label>Semaphore {{ semaphoreIndex }}</label>
                <button @click="removeSemaphore(semaphoreIndex)" class="cursor-pointer">🞮</button>
            </div>
            <div>
                <div>Detectors</div>
                <button @click="newDetector(semaphoreIndex)" class="cursor-pointer">🞧</button>
            </div>
            <ul class="point-list">
                <li
                    v-for="(detector, detectorIndex) in semaphore.detectors"
                    :key="detectorIndex"
                >
                    <div>
                        <div>({{ detector.x }}, {{ detector.y }})</div>
                        <div @click="$emit('positionCursor', detector)" class="cursor-pointer">🔎</div>
                        <div @click="removeDetector(detector, semaphoreIndex)" class="cursor-pointer">🞮</div>
                    </div>
                </li>
            </ul>
            <div>
                Status: {{ semaphore.isOpen() ? "open" : "closed" }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            showSemaphores: false
        }
    },

    props: {
        origin: Object,
        semaphores: Array
    },

    methods: {
        newSemaphore: function () {
            let semaphore = {
                x: this.origin.x,
                y: this.origin.y
            }
            this.$emit('semaphoreSaved', semaphore);
        },

        removeSemaphore: function (index) {
            if (confirm('Remove the Semaphore ' + index + ' with all Detectors?')) {
                this.$emit('removeSemaphore', index)
            }
        },

        newDetector: function (sempahoreIndex) {
            this.semaphores[sempahoreIndex].newDetector(this.origin.x, this.origin.y);
        },

        removeDetector: function (detector, sempahoreIndex) {
            if (confirm('Remove the Detector (' + detector.x + ', ' + detector.y + ')?')) {
                this.semaphores[sempahoreIndex].removeDetector(detector)
            }
        },
    }
}
</script>