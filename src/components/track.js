export class Track {
    id = 0;
    name = 'NoName Track';
    color = 0x0000ff;
    path = null;

    constructor(path) {
        this.path = path;
    }

    setColor = function (color) {
        this.color = color;
    }

    setName = function (name) {
        this.name = name;
    }

    setId = function (id) {
        this.id = id;
    }

    setPath = function (path) {
        this.path = path;
    }
}