export class Train {
    id = 0
    speed = 0
    autoPilot = 0
    reverse = false
    priority = false
    failedTry = 0
    cars = []
    points = []
    paths = []
    locator = 0
    carOffset = 1 // requires callibration
    cutOff = -1
    debug = false
    reached = true
    scene = null
    autoReverse = {
        active: true,
        delay: 4000
    }

    constructor (scene) {
        this.scene = scene
    }

    carPosition = function (n) {
        let offset = n * this.carOffset
        let position =
            n > 0
                ? (this.locator < offset ? this.points.length : 0) +
                (this.locator - offset)
                : this.locator
        return this.points[position]
    }

    resumeMovement = function () {
        if (this.autoPilot > this.speed) {
            this.speed++
            this.scene.time.addEvent({
                delay: 1000,
                callback: this.resumeMovement,
                callbackScope: this,
                args: []
            })
        } else {
            this.autoPilot = 0
            this.failedTry = 0
        }
    }

    reverseMotion = function () {
        this.reverse = !this.reverse
    }

    moveLocator = function () {
        if (this.autoReverse.active) {
            if (this.locator === this.cars.length * this.carOffset - 1 || this.locator === this.points.length - 1) {
                this.reverseMotion()
            }
        }

        this.locator = this.reverse
            ? this.locator > 0
                ? --this.locator
                : this.points.length - 1
            : ++this.locator % this.points.length

        if (this.recallibrateCarOffset === this.locator) {
            this.recallibrateCarOffset = -1
            this.callibrateCarOffset()
        }

        if (this.cutOff === this.locator) {
            this.cutOff = -1
            if (this.reverse) {
                this.removePath(this.paths[this.paths.length - 1].name)
            } else {
                this.removePath(this.paths[0].name)
            }
        }
    }

    startMoving = function () {
        let speedRate = 10 // px/s for each speed point
        let speed = this.speed * speedRate
        // distance tolerance, the faster it moves, the more tolerance is required.
        let tolerance = Math.max(this.speed, 2)

        this.cars.forEach((car, index) => {
            if (car.body) {
                let target = this.carPosition(index)
                let distance = global.Phaser.Math.Distance.Between(
                    car.x,
                    car.y,
                    target.x,
                    target.y
                )
                if (index === 0) {
                    this.reached = distance < tolerance
                }

                if (this.reached) {
                    if (this.debug) console.log('car reset: ', index, target.x, target.y, car.body.speed)
                    car.body.reset(target.x, target.y)
                } else {
                    if (this.debug) console.log('moving car ', index, ' to ', target.x, target.y, car.body.speed)
                    this.scene.physics.moveToObject(car, target, speed)
                }
            }
        })

        if (this.speed && this.reached) {
            if (this.debug) console.log('moving locator...')
            this.moveLocator()
        }
    }

    destroyTrain = function () {
        this.speed = 0
        this.cars.forEach((car) => car.destroy())
    }

    addPath = function (track, replacing = true, reversed = false) {
        let path = track.path
        let pieces = 50
        let distance = 0
        const trainSize = this.cars.length * (this.carOffset + 3)
        const min = 4
        const max = 5

        while (distance < min || distance > max) {
            path.points = path.getSpacedPoints(pieces).slice(0, parseInt(pieces))
            distance = global.Phaser.Math.Distance.Between(
                path.points[0].x,
                path.points[0].y,
                path.points[1].x,
                path.points[1].y
            )
            pieces *= distance / ((min + max) / 2)
        }
        if (replacing) {
            if (reversed) {
                this.cutOff = path.points.length - trainSize
                this.recallibrateCarOffset = path.points.length - 2
            } else {
                this.cutOff = this.points.length + trainSize
                this.recallibrateCarOffset = this.points.length + 2
            }
        }
        if (reversed) {
            this.locator += path.points.length
            this.paths = [track, ...this.paths]
            this.points = [...path.points, ...this.points]
        } else {
            this.paths.push(track)
            this.points = [...this.points, ...path.points]
        }
    }

    removePath = function (name) {
        let bookmark = this.carPosition(0)
        this.paths = this.paths.filter((p) => p.name !== name)
        this.points = this.paths.reduce((l, p) => [...l, ...p.path.points], [])
        this.points.forEach((p, i) => {
            if (p.x === bookmark.x && p.y === bookmark.y) {
                this.locator = i
            }
        })
    }

    callibrateCarOffset = function () {
        this.carOffset = 0
        for (let d = 0; d < 20;) {
            this.carOffset++
            let car1 = this.carPosition(1)
            let car2 = this.carPosition(2)
            d = global.Phaser.Math.Distance.Between(
                car1.x,
                car1.y,
                car2.x,
                car2.y
            )
        }
    }

    addCars = function (qty = 1) {
        this.callibrateCarOffset()
        this.locator = qty * this.carOffset
        for (let i = 0; this.cars.length < qty; i++) {
            let position = this.carPosition(i)
            let car = this.scene.physics.add.image(position.x, position.y, "red")
            this.cars.push(car)
        }
    }

    handleTrainsCollision = function () {
        /**
         * this method handles train collisions
         * it considers mainly front collisions making the priority to wait a little longer while the other reverses and go away
         */
        this.autoPilot = Math.max(this.autoPilot, Math.min(this.speed, 7))
        this.failedTry++
        if (this.failedTry === 1) {
            this.speed = 0
            if (!this.priority) {
                this.reverseMotion()
            }

            this.scene.time.addEvent({
                delay: this.priority ? 4500 : 1500,
                callback: this.resumeMovement,
                callbackScope: this,
                args: [],
            })
        }
    }

    handleSemaphore = function (semaphore, carList) {
        if (carList.length) {
            let isThisTrain = carList.filter(
                car => car.gameObject.body && this.cars.filter(car2 => car2.body && car.gameObject.body.center.x === car2.body.center.x && car.gameObject.body.center.y === car2.body.center.y).length
            ).length

            if (isThisTrain) {
                semaphore.handleCollision(this)
            } else if (semaphore.train && semaphore.train.id === this.id) {
                // this train is not on collision, but still holds the semaphore, shall release it
                semaphore.release()
            }
        } else {
            semaphore.release()
        }
    }

    setupCollisions = function (trainList, deep = true) {
        trainList.forEach((train) => {
            train.cars.forEach((car) => {
                this.scene.physics.add.overlap(
                    this.cars[0],
                    car,
                    function () {
                        train.handleTrainsCollision()
                    },
                    null,
                    this
                )

                this.scene.physics.add.overlap(
                    this.cars[this.cars.length - 1],
                    car,
                    function () {
                        train.handleTrainsCollision()
                    },
                    null,
                    this
                )
            })
            if (deep) {
                train.setupCollisions([this], false)
            }
        })
    }

    setPriority = function (priority) {
        this.priority = priority
    }

    getItinerary = function () {
        if (this.reverse) {
            return this.paths.map((p) => p.name).reverse()
        }
        return this.paths.map((p) => p.name)
    }

    setSpeed = function (speed) {
        this.speed = speed
    }

    setAutoPilot = function (speed) {
        this.autoPilot = speed
    }

    toggleDebug = function () {
        this.debug = !this.debug
    }

    toggleAutoReverse = function () {
        this.autoReverse.active = !this.autoReverse.active
    }

    setAutoReverse = function (status) {
        this.autoReverse.active = status
    }

    getLocation = function () {
        let location = 0;
        let seeker = this.locator;
        do {
            seeker -= this.paths[location].path.points.length
            if (seeker > 0) location++
        } while (seeker > 0)
        return this.paths[location].name
    }
}
