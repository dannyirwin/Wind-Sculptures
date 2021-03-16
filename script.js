const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let sculptures = [];

let spokeTestTemplate = [[50, -0.5], [50, 0.349066], [50, 0.88], [50, -0.349066], [50, -0.349066]];

const minSpeed = 0.002;
const maxSpeed = 0.05;
const minFrameCount = 420;
const maxFrameCount = 3000;

const maxSpokeAngle = 0.785398; //45 degrees
const minSpokeAngle = maxSpokeAngle * -1;
const minSpokeLength = 10;
const maxSpokeLength = 50;
const minNOfSpokes = 5;
const maxNOfSpokes = 20;

//==========Classes==========

class Sculpture {
    constructor(spoke = spokeTestTemplate, x = canvas.width / 2, y = canvas.height / 2, isParent = true, nOfSpokes = Math.floor(getRandom(minNOfSpokes, maxNOfSpokes)), speed = 0.005) {
        this.nOfSpokes = nOfSpokes;
        this.x = x;
        this.y = y;
        this.angle = 6.28319 / this.nOfSpokes;
        this.currentRotation = 0;
        this.speed = speed;
        this.targetSpeed = maxSpeed;
        this.direction = 1;
        this.frameCount = 0;
        this.maxFrameCount = 300;
        this.spoke = spoke;
        this.isParent = isParent;
        this.mirror;
        this.createMirror();
    }
    drawSpoke(startingRotation, spokeArr) {
        let startX = this.x;
        let startY = this.y;
        let angle = startingRotation;

        for (let i in spokeArr) {

            angle += spokeArr[i][1];
            let length = spokeArr[i][0];

            let endX = calcXFromAngle(length, angle) + startX;
            let endY = calcYFromAngle(length, angle) + startY;

            this.drawSpokeSegment(startX, startY, endX, endY);

            startX = endX;
            startY = endY;
        }
    }

    drawSpokeSegment(startX, startY, endX, endY) {

        ctx.strokeStyle = "black";

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    drawAllSpokes(spokeArr) {
        for (let i = 0; i < this.nOfSpokes; i++) {
            this.drawSpoke((this.angle * i) + this.currentRotation, spokeArr);
        }
    }
    handleSpeed(delta) {
        this.currentRotation += this.speed * delta * this.direction;
        this.frameCount += delta;


        if (this.speed < this.targetSpeed) {
            this.speed *= 1.01;
            if (this.targetSpeed - this.speed < this.minSpeed) {
                this.speed = this.targetSpeed;
            }
        }

        if (this.speed > this.targetSpeed) {
            this.speed *= 0.99;
            if (this.targetSpeed - this.speed < this.minSpeed) {
                this.speed = this.targetSpeed;
            }
        }

        if (this.frameCount >= this.maxFrameCount) {
            this.targetSpeed = 0;
        }

        if (this.speed < minSpeed * 0.1 && this.frameCount > this.maxFrameCount) {
            this.direction *= -1;
            this.speed = minSpeed * 0.15;
            this.frameCount = 0;
            this.targetSpeed = getRandom(minSpeed, maxSpeed);
            this.maxFrameCount = getRandom(minFrameCount, maxFrameCount);
        }
    }
    update(delta) {
        this.handleSpeed(delta);
        if (this.isParent) {
            this.mirror.update(delta);
        }
    }
    render() {
        this.drawAllSpokes(this.spoke);
        if (this.isParent) {
           this.mirror.render();
        }
    }
    randomizeSpoke() {

    }
    createMirror() {
        if (this.isParent) {
            this.mirror = new Sculpture(this.spoke.map(arr => [arr[0], arr[1] * -1]), this.x, this.y, false, this.nOfSpokes, this.speed * 0.75)
        }
    }

}

//==========Math Functions==========

function calcXFromAngle(length, angle) {
    return length * Math.cos(angle);
}

function calcYFromAngle(length, angle) {
    return length * Math.sin(angle);
}

function getRandom(min, max) {
    return (Math.random() * (max - min) + min);
}


//==========Animation Loop Functions==========
const fps = 60;
const FRAME_DURATION = 1000 / fps;
const getTime = typeof performance === 'function' ? performance.now : Date.now;

let lastUpdate = getTime();

function step() {
    const now = getTime();
    const delta = (now - lastUpdate) / FRAME_DURATION;

    drawBackground();
    sculptures.forEach(sculpture => {
        sculpture.update(delta);
        sculpture.render();
    })

    lastUpdate = now;
    window.requestAnimationFrame(step);
}

//==========App Functions==========

function init() {
    createSculptureGrid(3, 3);
    step();

}

function drawBackground() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.height, canvas.width);
}

function createRandomSpokeArray(length) {
    let newSpoke = []
    for (let i = 0; i < length - 1; i++) {
        newSpoke.push([
            getRandom(minSpokeLength, maxSpokeLength), getRandom(minSpokeAngle, maxSpokeAngle)]);
    }
    return newSpoke;
}

function createSculptureGrid(rows, cols) {
    let coords = generateGridCoords(rows, cols);
    coords.forEach(arr => {
        sculptures.push(new Sculpture(
            createRandomSpokeArray(5),
            arr[0], arr[1]
        ))

    })
}

function generateGridCoords(rows, cols) {
    let result = [];
    for (let r = 0; r < rows; r++) {
        x = (canvas.width / (rows + 1)) * (r + 1);
        for (let c = 0; c < cols; c++) {
            y = (canvas.height / (cols + 1)) * (c + 1);
            result.push([x, y])
        }
    }
    return result
}

//==========||==========

init();

