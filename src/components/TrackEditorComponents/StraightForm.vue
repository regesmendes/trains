<template>
    <div class="track-editor flex-column">
        <label @click="showForm = !showForm">Straight</label>
        <div class="flex-column" v-show="showForm">
            <div>
                <label for="straightAngle">Angle: </label>
                <input
                    type="number"
                    id="straightAngle"
                    v-model="straight.angle"
                />
            </div>
            <div>
                <label for="straightX">x: </label>
                <input
                    type="number"
                    id="straightX"
                    v-model="straight.x"
                />
                <button @click="tanXrd">tg \</button>
                <button @click="tanXru">tg /</button>
            </div>
            <div>
                <label for="straightY">y: </label>
                <input
                    type="number"
                    id="straightY"
                    v-model="straight.y"
                />
                <button @click="tanYru">tg /</button>
                <button @click="tanYrd">tg \</button>
            </div>
            <div>
                <button @click="drawLine">Draw</button>
                <button @click="$emit('undoLastAction')">Undo</button>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    data: function () {
        return {
            straight: {
                x: 0,
                y: 0,
                angle: 0,
            },
            showForm: false
        }
    },

    props: {
        origin: Object
    },

    methods: {
        drawLine: function () {
            console.log(this.origin.x, this.origin.y, this.straight.x, this.straight.y)
            let node = {
                type: "LineCurve",
                points: [
                    this.origin.x,
                    this.origin.y,
                    this.straight.x,
                    this.straight.y,
                ],
            };
            this.$emit('drawTrack', node)
        },

        tanYru: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newY = Math.tan(alpha) * (this.origin.x - this.straight.x);
            this.straight.y = parseInt(this.origin.y + newY);
        },

        tanYrd: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newY = Math.tan(alpha) * (this.straight.x - this.origin.x);
            this.straight.y = parseInt(this.origin.y + newY);
        },

        tanXru: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newX = (this.origin.y - this.straight.y) / Math.tan(alpha);
            this.straight.x = parseInt(this.origin.x + newX);
        },

        tanXrd: function () {
            let alpha = (Math.abs(this.straight.angle) * Math.PI) / 180;
            let newX = (this.straight.y - this.origin.y) / Math.tan(alpha);
            this.straight.x = parseInt(this.origin.x + newX);
        },
    }
}
</script>