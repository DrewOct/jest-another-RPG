const inquirer = require("inquirer");
const Enemy = require("./Enemy");
const Player = require("./Player");

const roundNumber = 0;

function Game() {
  this.roundNumber = 0;
  this.isPlayerTurn = false;
  this.enemies = [];
  this.currentEnemy;
  this.player;
}

Game.prototype.initializeGame = function () {
  this.enemies.push(new Enemy("goblin", "sword"));
  this.enemies.push(new Enemy("orc", "baseball bat"));
  this.enemies.push(new Enemy("skeleton", "axe"));

  this.currentEnemy = this.enemies[0];

  inquirer
    .prompt({
      type: "text",
      name: "name",
      message: "What is your name?",
    })
    // destructure name from the prompt object
    .then(({ name }) => {
      this.player = new Player(name);
      this.startNewBattle();
    });
};

Game.prototype.startNewBattle = function () {
  if (this.player.agility > this.currentEnemy.agility) {
    this.isPlayerTurn = true;
  } else {
    this.isPlayerTurn = false;
  }
  console.log("Your stats are as follows:");
  console.table(this.player.getStats());

  console.log(this.currentEnemy.getDescription());

  this.battle();
};

Game.prototype.battle = function () {
  if (this.isPlayerTurn) {
    // player prompts will go here
    inquirer
      .prompt({
        type: "list",
        message: "What would you like to do?",
        name: "action",
        choices: ["Attack", "Use potion"],
      })
      .then(({ action }) => {
        if (action === "Use potion") {
          // follow-up prompt will go here
          if (!this.player.getInventory()) {
            console.log("You don't have any potions!");

            // Player's turn ends
            this.isPlayerTurn = false;
            this.battle();

            return;
          }

          inquirer
            .prompt({
              type: "list",
              message: "Which potion would you like to use?",
              name: "action",
              choices: this.player
                .getInventory()
                .map((item, index) => `${index + 1}: ${item.name}`),
            })
            .then({});
        } else {
          const damage = this.player.getAttackValue();
          this.currentEnemy.reduceHealth(damage);

          console.log(`You attacked the ${this.currentEnemy.name}`);
          console.log(this.currentEnemy.getHealth());

          // Player's turn ends
          this.isPlayerTurn = false;
          this.battle();
        }
      });
  } else {
    const damage = this.currentEnemy.getAttackValue();
    this.player.reduceHealth(damage);

    console.log(`You were attacked by the ${this.currentEnemy.name}`);
    console.log(this.player.getHealth());

    // Enemy's turn ends
    this.isPlayerTurn = true;
    this.battle();
  }
};

Game.prototype.checkEndOfBattle = function () {
  if (this.isPlayerTurn) {
    inquirer.prompt().then(({ action }) => {
      if (action === "Use potion") {
        if (!this.player.getInventory()) {
          // after player sees their empty inventory...

          return this.checkEndOfBattle();
        }
        inquirer.prompt().then(({ action }) => {
          // after player uses a potion...

          this.checkEndOfBattle();
        });
      } else {
        // after player attacks...

        this.checkEndOfBattle();
      }
    });
  } else {
    // after enemy attacks...
    this.checkEndOfBattle();
  }
  if (this.player.isAlive() && this.currentEnemy.isAlive()) {
    console.log(`You've defeated the ${this.currentEnemy.name}`);

    this.player.addPotion(this.currentEnemy.potion);
    console.log
    this.isPlayerTurn = !this.isPlayerTurn;
    this.battle();
  }
};

module.exports = Game;
