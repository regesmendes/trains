export class Semaphore {
    train = 0
    releasing = false
    scene = null
    detectors = []
    trafficLights = []
    needsRefresh = false

    constructor(scene, x, y) {
        this.scene = scene
        if (x && y) {
            this.newDetector(x, y)
        }
    }

    newDetector = function (x, y) {
        let detector = {
            x: x,
            y: y,
            detector: this.scene.add.circle(x, y, 10) // .setStrokeStyle(1, 0xffff00)
        }
        this.detectors.push(detector)
    }

    removeDetector = function (detector) {
        let removing = this.detectors.find(removing => detector.x === removing.x && detector.y === removing.y)
        removing.detector.destroy()
        this.detectors = this.detectors.filter(filtering => detector.x !== filtering.x || detector.y !== filtering.y)
    }

    newTrafficLight = function (x, y) {
        let light = {
            x: x,
            y: y,
            light: this.scene.add.circle(x, y, 5).setFillStyle(this.getLightColor())
        }
        this.trafficLights.push(light)
    }

    getLightColor = function () {
        return this.isOpen() ? 0x00ff00 : 0xff0000
    }

    removeTrafficLight = function (trafficLight) {
        let removing = this.trafficLights.find(removing => trafficLight.x === removing.x && trafficLight.y === removing.y)
        removing.light.destroy()
        this.trafficLights = this.trafficLights.filter(filtering => trafficLight.x !== filtering.x || trafficLight.y !== filtering.y)
    }

    isOpen = function () {
        return !this.train;
    }

    handleCollision = function (train) {
        if (!this.train) {
            this.lock(train);
            // train.resumeMovement(this.scene);
        } else if (this.train.id !== train.id) {
            train.autoPilot = Math.max(train.autoPilot, Math.min(train.speed, 7));
            train.speed = 0;
            train.failedTry++;
            if (train.failedTry === 1) {
                train.resumeMovement()
            }
        }
    }

    lock = function (train) {
        this.train = train;
        this.refreshLights();
    }

    refreshLights = function () {
        this.trafficLights.forEach(trafficLight => {
            trafficLight.light.destroy();
            trafficLight.light = this.scene.add.circle(trafficLight.light.x, trafficLight.light.y, 5).setFillStyle(this.getLightColor());
        });
    }

    release = function () {
        if (this.train && !this.releasing) {
            this.releasing = true
            this.scene.time.addEvent({
                delay: 500,
                callback: function () {
                    this.releasing = false
                    this.train = null
                    this.refreshLights()
                },
                callbackScope: this,
            })
        }
    }
}
