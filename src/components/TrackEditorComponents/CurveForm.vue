<template>
    <div class="track-editor flex-column">
        <label @click="showForm = !showForm">Ellipse</label>
        <div class="flex-column" v-show="showForm">
            <div>
                <label for="ellipseX">X Radius: </label>
                <input
                    type="number"
                    id="ellipseX"
                    v-model="ellipse.xRadius"
                />
            </div>
            <div>
                <label for="ellipseY">Y Radius: </label>
                <input
                    type="number"
                    id="ellipseY"
                    v-model="ellipse.yRadius"
                />
            </div>
            <div>
                <label for="ellipseStartAngle">Start Angle: </label>
                <input
                    type="number"
                    id="ellipseStartAngle"
                    v-model="ellipse.startAngle"
                />
            </div>
            <div>
                <label for="ellipseEndAngle">End Angle: </label>
                <input
                    type="number"
                    id="ellipseEndAngle"
                    v-model="ellipse.endAngle"
                />
            </div>
            <div>
                <label for="ellipseClockwise">Clockwise: </label>
                <input
                    type="checkbox"
                    id="ellipseClockwise"
                    v-model="ellipse.clockwise"
                />
            </div>
            <div>
                <button @click="drawEllipse">Draw</button>
                <button @click="$emit('undoLastAction')">Undo</button>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    data: function () {
        return {
            ellipse: {
                xRadius: 100,
                yRadius: 100,
                startAngle: 0,
                endAngle: 90,
                clockwise: true,
                rotation: 0,
            },
            showForm: false
        }
    },

    props: {
        origin: Object
    },

    methods: {
        drawEllipse: function () {
            let alpha = (this.ellipse.startAngle * Math.PI) / 180;
            let newX =
                Math.cos(alpha) * this.ellipse.xRadius * -1 + this.origin.x;
            let newY =
                Math.sin(alpha) * this.ellipse.yRadius * -1 + this.origin.y;
            const node = {
                type: "EllipseCurve",
                x: newX,
                y: newY,
                xRadius: this.ellipse.xRadius,
                yRadius: this.ellipse.yRadius,
                startAngle: this.ellipse.startAngle,
                endAngle: this.ellipse.endAngle,
                clockwise: !this.ellipse.clockwise,
                rotation: this.ellipse.rotation,
            };
            this.$emit('drawTrack', node);
        }
    }
}
</script>