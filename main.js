// Ninja Fruit Game using Phaser.js and Gravity

// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB', // Sky blue background
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Gravity applied
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

const game = new Phaser.Game(config);

// Game Variables
let fruits;
let score = 0;
let scoreText;
let blade;
let fruitSpeedY = -500; // Başlangıç meyve hızı
let fruitSpeedX = 100;  // Başlangıç yatay hız
let fruitCount = 0; // Meyve sayacı
let fruitSize = 0.3; // Meyve ve bombaların boyutları

// Sabit boyutlar için box boyutu (Örneğin, 100x100 piksel)
const boxWidth = 100;
const boxHeight = 100;

function preload() {
    // Load assets
    this.load.image('background', 'assets/background.jpg'); // Background image
    this.load.image('fruit1', 'assets/fruit1.jpg'); // First fruit
    this.load.image('fruit2', 'assets/fruit2.jpg'); // Second fruit
    this.load.image('fruit3', 'assets/fruit3.jpg'); // Third fruit
    this.load.image('fruit4', 'assets/fruit4.jpg'); // Fourth fruit
    this.load.image('blade', 'assets/blade.png'); // Blade or ninja cutter
    this.load.image('bomb', 'assets/bomb.png'); // Bomb image
}

function create() {
    // Add background
    this.add.image(400, 300, 'background').setScale(0.5); // Scale down the background

    // Add score text with a larger font size and bold color
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '48px',  // Bigger font size
        fontStyle: 'bold', // Bold font style
        fill: '#000',   // Red color to make it more visible
    });

    // Add blade image and make it follow the pointer
    blade = this.add.image(0, 0, 'blade').setScale(0.1); // Smaller blade size
    this.input.on('pointermove', (pointer) => {
        blade.setPosition(pointer.x, pointer.y);
    });

    // Add fruits group
    fruits = this.physics.add.group();

    // Spawn fruits periodically
    this.time.addEvent({
        delay: 1000, // Spawn every second
        callback: spawnFruit,
        callbackScope: this,
        loop: true,
    });

    // Enable blade slicing
    this.input.on('pointermove', sliceFruit, this);
}


function update() {
    // Remove fruits if they fall below the screen
    fruits.children.iterate((fruit) => {
        if (fruit && fruit.y > 600) {
            fruit.destroy(); // Remove fruit from the game
        }

        // Prevent fruits and bombs from falling below the top of the screen
        if (fruit && fruit.y < 0) {
            fruit.destroy(); // Destroy fruit or bomb when it reaches the top
        }
    });

    // Increase the fruit speed after every 5 seconds
    if (fruitCount % 5 === 0 && fruitCount > 0) {
        increaseFruitSpeed();
        fruitCount = 0; // Reset counter after speed increase
    }
}

function spawnFruit() {
    fruitCount++; // Increase fruit count on each spawn

    // Random x position
    const x = Phaser.Math.Between(100, 700);

    // Random fruit type (including new fruits)
    const fruitType = Phaser.Math.Between(1, 4); // Adjusted to include fruit3 and fruit4

    // Add fruit to the game
    const fruit = fruits.create(x, 600, `fruit${fruitType}`); // Spawn from the bottom

    // Set the same scale for all fruits and bombs
    fruit.setScale(fruitSize);

    // Resize to fit inside a fixed-size box (100x100)
    fruit.displayWidth = boxWidth;
    fruit.displayHeight = boxHeight;

    // Set velocity for fruit to move upwards
    fruit.setVelocity(Phaser.Math.Between(-fruitSpeedX, fruitSpeedX), fruitSpeedY);

    // Random chance to create a bomb (10% chance)
    const isBomb = Phaser.Math.Between(1, 10) === 1; // 1 out of 10 chance for bomb

    if (isBomb) {
        fruit.setTexture('bomb');
    }

    // Make sure the bomb's size stays consistent (it might have been resized earlier)
    fruit.displayWidth = boxWidth;
    fruit.displayHeight = boxHeight;
}


function sliceFruit(pointer) {
    const bladeX = pointer.x;
    const bladeY = pointer.y;

    // Check collision with fruits
    fruits.children.iterate((fruit) => {
        if (fruit && Phaser.Geom.Intersects.RectangleToRectangle(fruit.getBounds(), new Phaser.Geom.Rectangle(bladeX, bladeY, 5, 5))) {
            // Bomb slicing
            if (fruit.texture.key === 'bomb') {
                // Bomb exploded, decrease score
                score -= 30;
                scoreText.setText(`Score: ${score}`);
                fruit.destroy(); // Destroy bomb
            } else {
                // Fruit slicing
                const leftHalf = this.add.image(fruit.x - 10, fruit.y, fruit.texture.key).setScale(fruit.scaleX).setRotation(-0.5);
                const rightHalf = this.add.image(fruit.x + 10, fruit.y, fruit.texture.key).setScale(fruit.scaleX).setRotation(0.5);

                // Enable physics on the fruit halves
                this.physics.world.enable(leftHalf);
                this.physics.world.enable(rightHalf);

                leftHalf.body.setVelocity(-100, 200);
                rightHalf.body.setVelocity(100, 200);

                // Destroy the halves after a short delay
                this.time.delayedCall(1000, () => {
                    leftHalf.destroy();
                    rightHalf.destroy();
                });

                // Destroy the original fruit
                fruit.destroy();

                // Increase score
                score += 10;
                scoreText.setText(`Score: ${score}`);
            }
        }
    });
}

function increaseFruitSpeed() {
    // Increase the speed of fruits
    fruitSpeedY -= 50; // Decrease the velocity on the y-axis to make fruits move faster
    fruitSpeedX += 20;  // Increase the horizontal velocity
}
