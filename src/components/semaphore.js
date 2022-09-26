export class Semaphore {
    train = 0
    releasing = false
    scene = null
    detectors = []

    constructor(scene, x, y) {
        let detector = {
            x: x,
            y: y,
            detector: scene.add.circle(x, y, 10).setStrokeStyle(2, 0xffff00)
        }
        this.scene = scene
        this.detectors.push(detector)
    }

    newDetector = function (x, y) {
        let detector = {
            x: x,
            y: y,
            detector: this.scene.add.circle(x, y, 10).setStrokeStyle(2, 0xffff00)
        }
        this.detectors.push(detector)
    }

    removeDetector = function (detector) {
        let removing = this.detectors.find(removing => detector.x === removing.x && detector.y === removing.y)
        removing.detector.destroy()
        this.detectors = this.detectors.filter(filtering => detector.x !== filtering.x || detector.y !== filtering.y)
    }

    isOpen = function () {
        return !this.train
    }

    handleCollision = function (train) {
        if (!this.train) {
            this.train = train
            train.resumeMovement(this.scene)
        } else if (this.train.id !== train.id) {
            train.autoPilot = Math.max(train.autoPilot, Math.min(train.speed, 7))
            train.speed = 0
        }
    }

    release = function () {
        if (this.train && !this.releasing) {
            this.releasing = true
            this.scene.time.addEvent({
                delay: 2000,
                callback: function () {
                    this.releasing = false
                    this.train = null
                },
                callbackScope: this,
            })
        }
    }
}
