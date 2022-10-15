export class Track {
    id = 0;
    name = 'NoName Track';
    color = '#000000';
    pathDefinition = null;
    path = null;

    setColor = function (color) {
        this.color = color;
    }

    getColorInt = function () {
        return parseInt(this.color.slice(1), 16);
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

    setPathDefinition = function (pathDefinition) {
        this.pathDefinition = pathDefinition;
    }

    toExport = function () {
        return {
            name: this.name,
            path: this.pathDefinition,
            color: this.color
        };
    }
}