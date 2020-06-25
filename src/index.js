

(() => {

    /**
     * Variable declaration starts
     */

    const socket = io('https://danny-tictactoe.herokuapp.com');
    const played = [];
    const cells = getElement('.cell');
    const result = getElement('#result');
    const player = getElement('#playerOne');
    const playerTwo =getElement('#playerTwo');
    const code = getElement('#code');
    const playAgainBtn = getElement("#play-again");
    const startBtn =getElement(".startBtn");
    const clearBtn = getElement(".clearBtn");
    const formCont = getElement('.form');
    const gameCont = getElement('.game');
    const joinBtn = getElement('.joinBtn');
    const backBtn = getElement('#backBtn');
    const createRoomBtn = getElement('#createRoomBtn');
    const joinRoomBtn = getElement('#joinRoomBtn');
    let welcomeScreen = true;
    let commonSelectedIndex = 0;
    const WINNERS = new Map();
    WINNERS.set('012', [0, 1, 2]);
    WINNERS.set('345', [3, 4, 5]);
    WINNERS.set('678', [6, 7, 8]);
    WINNERS.set('036', [0, 3, 6]);
    WINNERS.set('258', [2, 5, 8]);
    WINNERS.set('147', [1, 4, 7]);
    WINNERS.set('048', [0, 4, 8]);
    WINNERS.set('246', [2, 4, 6]);

    const X = 'X';
    const O = 'O';
    let xPlayer = true;
    let count = 0;
    let finish = false;
    let currPlayer = '';
    let roomId = null;
    let currTurn = false;
    let playerName = null;
    const gameState = {
        xState: [],
        yState: []
    };

    attachSocketEventHandlers(socket);

    const startGame = (msg) => {
        result.innerHTML = msg;
        gameCont.className = 'game show';
        formCont.className = 'form hide';
        welcomeScreen = false;
        cells.forEach(v => {
            v.addEventListener('click', clickHandler);
        });
        playAgainBtn.addEventListener('click', reset);

        currTurn = true;
        currPlayer = X;

    };


    const createGame = () => {
        playerName = player && player.value;
        socket.emit('createRoom', { name: name });
    }
    const joinRoom = () => {
        const codeVal = code && code.value;
        playerName = playerTwo && playerTwo.value;
        if (!codeVal) result.innerHTML += 'Please enter a code to join';
        if (!playerName) result.innerHTML += 'Please enter a name to continue';
        if (codeVal && playerName) {
            result.innerHTML = '';
            socket.emit('joinRoom', { name: playerName, room: codeVal });
        }
        currPlayer = O;
    }
    const endGame = (winner) => {
        let turnObj = {
            index: commonSelectedIndex,
            room: roomId
        };
        if (!winner) {
            socket.emit('play', turnObj);
            socket.emit('gameEnded', { room: roomId, message: 'Game Draw :(' });
        } else {
            let msg = `${playerName} Wins!`;
            result.innerHTML = msg;
            socket.emit('play', turnObj);
            socket.emit('gameEnded', { room: roomId, message: msg });
        }
        finish = true;
        playAgainBtn.className = 'show';
        playAgainBtn.removeClass('hide');
    }

    function showPlayAgainBtn(){
        playAgainBtn.removeClass('hide');
    }

    const checkGame = () => {
        const gameCheck = (xPlayer) ? gameState.xState : gameState.yState;
        for (let i of WINNERS.values()) {
            let won = i.every(v => gameCheck.indexOf(v.toString()) !== -1);
            if (won) {
                endGame(won);
                break;
            }
        }
    }

    const drawLetter = (selectedCell, selectedIndex) => {

        if (xPlayer) {
            selectedCell.innerHTML = X;
            gameState.xState.push(selectedIndex);

        } else {
            selectedCell.innerHTML = O;
            gameState.yState.push(selectedIndex);
        }
        count++;
        played.push(selectedIndex);
        commonSelectedIndex = selectedIndex;
        if (played.length > 4) checkGame();
        
        if (played.length > 8) endGame();

        let turnObj = {
            index: selectedIndex,
            room: roomId
        };
        
         currTurn = false;
        socket.emit('play', turnObj);



    }
    const handleOtherTurn = (index) => {
        played.push(index);
        let selectedCell = document.querySelector(`#cell-${index}`);
        if (xPlayer) {
            selectedCell.innerHTML = O;
            gameState.yState.push(index);

        } else {
            selectedCell.innerHTML = X;
            gameState.xState.push(index);
        }
        // if(played.length > 4) checkGame();
        if (played.length > 8) endGame();
    }
    const clickHandler = (event) => {
        if (finish || !currTurn) return false;
        const selectedCell = event && event.target;
        const selectedIndex = selectedCell && event.target.getAttribute && event.target.getAttribute('data-index') || -1;
        if (played.indexOf(selectedIndex) !== -1) return false;
        drawLetter(selectedCell, selectedIndex);

    }

    const reset = () => {
        location.reload();
    }

    
    startBtn.addEventListener('click', createGame);
    joinBtn.addEventListener('click', joinRoom);
    backBtn.addEventListener('click', goHome);

    
    joinRoomBtn.addEventListener('click', () => {
        startPlay('join');
    });
    createRoomBtn.addEventListener('click', () => {
        startPlay('create');
    });
    function goHome(){
        formCont.classList.add('hide');
        document.querySelector('#create-container').classList.add('hide');
        document.querySelector('#join-container').classList.add('hide');
        document.querySelector('#homeAction').classList.remove('hide');
    }
    function startPlay(type){
       formCont.classList.remove('hide');
       const containerStr = `${type}-container`;
       const container = document.querySelector(`#${containerStr}`);
       container.classList.remove('hide');
       document.querySelector('#homeAction').classList.add('hide');
    }
    function attachSocketEventHandlers(socket) {
        socket.on('newRoom', (data) => {
            result.innerHTML = `Hello ${data.name}. Use ${data.room} to invite friend`;
            xPlayer = true;
            roomId = data.room;

        });

        socket.on('player1', function (data) {
            var message = 'Hello, ' + playerName;
            result.innerHTML = message;
            currTurn = true;
            startGame(message);
        });
        socket.on('player2', function (data) {
            let msg = `Hello, ${data.name}`;
            roomId = data.room;
            result.innerHTML = msg;
            //Create game for player 2
            xPlayer = false;
            startGame(msg);
            currTurn = false;
        });
        socket.on('turnPlayed', function (data) {
            let dataIndex = data && data.index;
            console.log('te')
            console.dir(data);
            // var opponentType = player.getPlayerType() == P1 ? P2 : P1;
            handleOtherTurn(dataIndex);

            currTurn = !currTurn;
        });

        socket.on('gameEnd', function (data) {
            result.innerHTML = data && data.message || 'Other Player left!';
            showPlayAgainBtn();
            socket.close(data.room);
        })

        /**
         * End the game on any err event. 
         */
        socket.on('closed', function (data) {

            if (!data && !result.innerHTML && !welcomeScreen) {
                result.innerHTML = 'Other player left! Game over!';
                socket.close(roomId);
            }

        });
    }

    /**
     * Utility Functions
     */

    /**
     * Function used to get the element from HTML
     * @param {*} selector 
     */
    function getElement(selector){
        return document.querySelector(selector);
    }
})();