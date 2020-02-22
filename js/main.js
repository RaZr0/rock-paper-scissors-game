document.addEventListener('DOMContentLoaded', function () {
    RPCapp = {
        init: function () {
            function initModalEvents() {
                const rulesModalEl = document.getElementById('rules-modal');
                const rulesButtonEl = document.getElementById('rules-button');
                const rulesModalCloseButton = rulesModalEl.querySelector('.rules-modal__close');
                rulesButtonEl.addEventListener('click', function () {
                    rulesModalEl.style.display = 'block';

                });
                rulesModalCloseButton.addEventListener('click', function () {
                    rulesModalEl.style.display = 'none';
                });
            }
            var game = (function () {
                const Shapes = {
                    rock: "rock",
                    paper: "paper",
                    scissors: "scissors"
                };
                const ShapeValidator = {
                    isValidShape: function (name) {
                        const isShapeFound = Shapes[name];
                        return isShapeFound ? true : false;
                    }
                }
                const ShapeRules = {
                    rules: [{
                        shape: Shapes.rock,
                        beats: [
                            Shapes.scissors
                        ]
                    },
                    {
                        shape: Shapes.paper,
                        beats: [
                            Shapes.rock
                        ]
                    },
                    {
                        shape: Shapes.scissors,
                        beats: [
                            Shapes.paper
                        ]
                    }
                    ],
                    betterShape: function (left, right) {
                        if (!ShapeValidator.isValidShape(left) || !ShapeValidator.isValidShape(right))
                            throw `invalid shape/s`;
                        if (left === right)
                            return 0
                        if (this.rules.find((rule) => { return rule.shape === left }).beats.find((shape) => { return shape === right }))
                            return -1;
                        return 1;
                    }
                }

                class Player {
                    constructor() {
                        this._selectedShape = null;
                    }

                    get selectedShape() {
                        return this._selectedShape;
                    }

                    selectShape(shapeName) {
                        if (!ShapeValidator.isValidShape(shapeName))
                            throw `invalid shape : [${shapeName}]`;
                        this._selectedShape = Shapes[shapeName];
                    }
                }
                class Computer extends Player {
                    constructor() {
                        super(null);
                        this.shapes = Object.values(Shapes);
                    }

                    selectRandomShape() {
                        const rand = Math.floor(Math.random() * Object.keys(Shapes).length);
                        super.selectShape(this.shapes[rand]);
                        return this.shapes[rand];
                    }
                }

                class GameHandler {
                    constructor() {
                        this._score = 0;
                        this.user = new Player();
                        this.computer = new Computer();
                        this._currentRoundWinner = null;
                    }

                    get score() {
                        return this._score;
                    }

                    get currentRoundWinner() {
                        return this._currentRoundWinner;
                    }

                    updateRoundState() {
                        const betterShape = ShapeRules.betterShape(this.user.selectedShape, this.computer.selectedShape);
                        if (betterShape === -1) {
                            this._currentRoundWinner = 'user';
                            this._score++;
                        } else if (betterShape === 0)
                            this._currentRoundWinner = 'draw';
                        else
                            this._currentRoundWinner = 'computer';
                    }
                }

                class UiHandler {
                    constructor() {
                        this._userSelectionStepEl = document.getElementById('user-selection-step');
                        this._gameWizardEl = document.getElementById('game-wizard-step');
                        this._computerShapeEl = document.getElementById('computer-shape');
                        this._userShapeEl = document.getElementById('user-shape');
                        this._gameStateEl = document.getElementById('game-state');
                        this._gameStateWhoWonEL = this._gameStateEl.querySelector('.game-state__who-won');
                        this._playAgainButton = document.getElementById('play-again');
                        this._gameScoreEl = document.getElementById('game-score');
                        this.initPlayAgainListener();
                    }

                    initPlayAgainListener() {
                        this._playAgainButton.addEventListener('click', function () {
                            this.backToUserSelectionStep();
                        }.bind(this));
                    }


                    userSelectShapeListener(callback) {
                        this._userSelectionStepEl.querySelectorAll('.shape').forEach((shape) => {
                            shape.addEventListener('click', function () {
                                callback(this.dataset['shape']);
                            });
                        });
                    }


                    updateUserScore(score) {
                        this._gameScoreEl.innerHTML = score;
                        this._gameScoreEl.classList.toggle('score__number--updated');
                        setTimeout(()=>{
                            this._gameScoreEl.classList.toggle('score__number--updated');
                        },1000);
                    }

                    computerSelectShape(shape, callback) {
                        setTimeout(() => {
                            this._computerShapeEl.dataset['shape'] = shape;
                            callback();
                        }, 1000)
                    }

                    updateGameState(whoWon, score) {
                        if (whoWon === 'user') {
                            this._userShapeEl.classList.add('shape-selection__shape--winner');
                            this._gameStateWhoWonEL.innerHTML = 'YOU WIN';
                            this.updateUserScore(score);

                        } else if (whoWon === 'computer') {
                            this._computerShapeEl.classList.add('shape-selection__shape--winner');
                            this._gameStateWhoWonEL.innerHTML = 'YOU LOSE';

                        } else
                            this._gameStateWhoWonEL.innerHTML = 'DRAW';
                        this._gameStateEl.style.visibility = 'visible';
                    }

                    userSelectShape(shape) {
                        this._userShapeEl.dataset['shape'] = shape;
                    }

                    backToUserSelectionStep() {
                        this._userShapeEl.dataset['shape'] = null;
                        this._computerShapeEl.dataset['shape'] = null;
                        this.resetUi();
                    }

                    moveToGameWizard() {
                        this._userSelectionStepEl.style.display = 'none';
                        this._gameWizardEl.style.display = 'block';
                        this._gameWizardEl.classList.toggle('round-end')
                    }

                    resetUi() {
                        this._userSelectionStepEl.style.display = 'block';
                        this._gameWizardEl.style.display = 'none';
                        this._gameWizardEl.classList.toggle('round-end')
                        this._gameStateEl.style.visibility = 'hidden';
                        this._userShapeEl.classList.remove('shape-selection__shape--winner');
                        this._computerShapeEl.classList.remove('shape-selection__shape--winner');
                    }
                }


                class GameFacade {
                    constructor() {
                        this._gameHandler = new GameHandler();
                        this._uiHandler = new UiHandler();
                    }

                    start() {
                        this._uiHandler.userSelectShapeListener(function (shape) {
                            this._gameHandler.user.selectShape(shape);
                            this._uiHandler.userSelectShape(shape);
                            this._gameHandler.computer.selectRandomShape();
                            this._uiHandler.moveToGameWizard();
                            this._uiHandler.computerSelectShape(this._gameHandler.computer.selectedShape, function () {
                                this._gameHandler.updateRoundState();
                                this._uiHandler.updateGameState(this._gameHandler.currentRoundWinner, this._gameHandler.score);
                            }.bind(this));
                        }.bind(this));
                    }
                }
                return new GameFacade();
            })();
            game.start();
            initModalEvents();
        }
    }
    RPCapp.init();
});