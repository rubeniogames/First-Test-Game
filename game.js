const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const rollButton = document.getElementById('rollButton');
const endTurnButton = document.getElementById('endTurnButton');
const die1 = document.getElementById('die1');
const die2 = document.getElementById('die2');
const currentPlayerDisplay = document.getElementById('currentPlayer');

// Адаптация размера canvas под экран
const resizeCanvas = () => {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.7;
};
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const boardWidth = canvas.width;
const boardHeight = canvas.height;

const pointWidth = boardWidth / 15;
const pointHeight = boardHeight / 2;
const checkersRadius = pointWidth / 2.5;

const board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // top points
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]   // bottom points
];

// Начальная расстановка фишек по правилам длинных нард
const initialSetup = () => {
    for (let i = 0; i < 15; i++) {
        board[0][i] = -1; // Черные фишки (верхние)
        board[1][i] = 1;  // Белые фишки (нижние)
    }
};

let selectedChecker = null;
let currentPlayer = 1; // 1 - игрок, -1 - компьютер
let dice = [0, 0];
let movesRemaining = [];

const rollDice = () => {
    return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
};

const drawBoard = () => {
    ctx.clearRect(0, 0, boardWidth, boardHeight);

    // Рисуем точки
    for (let i = 0; i < 15; i++) {
        // Верхние точки
        ctx.fillStyle = (i % 2 === 0) ? 'white' : 'black';
        ctx.beginPath();
        ctx.moveTo(i * pointWidth, 0);
        ctx.lineTo((i + 1) * pointWidth, 0);
        ctx.lineTo((i + 0.5) * pointWidth, pointHeight);
        ctx.fill();

        // Нижние точки
        ctx.beginPath();
        ctx.moveTo(i * pointWidth, boardHeight);
        ctx.lineTo((i + 1) * pointWidth, boardHeight);
        ctx.lineTo((i + 0.5) * pointWidth, boardHeight - pointHeight);
        ctx.fill();
    }

    // Рисуем бар
    ctx.fillStyle = 'gray';
    ctx.fillRect(boardWidth / 2 - pointWidth / 2, 0, pointWidth, boardHeight);
};

const drawCheckers = () => {
    for (let i = 0; i < 15; i++) {
        if (board[0][i] !== 0) {
            drawChecker(i, 0, board[0][i]);
        }
        if (board[1][i] !== 0) {
            drawChecker(i, 1, board[1][i]);
        }
    }
};

const drawChecker = (point, row, count) => {
    const isTop = row === 0;
    const color = count > 0 ? 'white' : 'black';
    const absCount = Math.abs(count);

    for (let i = 0; i < absCount; i++) {
        const x = point * pointWidth + pointWidth / 2;
        const y = isTop ? checkersRadius + i * 2 * checkersRadius : boardHeight - checkersRadius - i * 2 * checkersRadius;

        ctx.beginPath();
        ctx.arc(x, y, checkersRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
    }
};

const getCheckerAt = (x, y) => {
    const point = Math.floor(x / pointWidth);
    const isTop = y < boardHeight / 2 ? 0 : 1;
    return { point, isTop };
};

const moveChecker = (from, to) => {
    const fromRow = from.isTop ? 0 : 1;
    const toRow = to.isTop ? 0 : 1;

    const checker = board[fromRow][from.point];
    board[fromRow][from.point] = 0;
    board[toRow][to.point] = checker;

    drawBoard();
    drawCheckers();
};

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const { point, isTop } = getCheckerAt(touch.clientX, touch.clientY);

    if ((isTop === 0 && board[0][point] < 0) || (isTop === 1 && board[1][point] > 0)) {
        selectedChecker = { point, isTop };
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (selectedChecker) {
        const touch = e.touches[0];
        const target = getCheckerAt(touch.clientX, touch.clientY);

        // Проверка, допустимо ли перемещение на цель
        const moveDistance = Math.abs(target.point - selectedChecker.point);
        if (movesRemaining.includes(moveDistance)) {
            moveChecker(selectedChecker, target);
            movesRemaining.splice(movesRemaining.indexOf(moveDistance), 1);
            selectedChecker = null;
            if (movesRemaining.length === 0) {
                currentPlayer *= -1; // Переключаем игрока
            }
        }
    }
});

rollButton.addEventListener('click', () => {
    dice = rollDice();
    die1.textContent = dice[0];
    die2.textContent = dice[1];
    movesRemaining = dice;
    console.log(`Бросок кубиков: ${dice[0]}, ${dice[1]}`);
});

endTurnButton.addEventListener('click', () => {
    currentPlayer *= -1;
    if (currentPlayer === -1) {
        setTimeout(computerMove, 1000);
    }
    updateCurrentPlayerDisplay();
});

const computerMove = () => {
    dice = rollDice();
    die1.textContent = dice[0];
    die2.textContent = dice[1];
    movesRemaining = dice;
    console.log(`Кубики компьютера: ${dice[0]}, ${dice[1]}`);
    // TODO: Реализовать логику перемещения компьютера с использованием AI
    currentPlayer *= -1;
    updateCurrentPlayerDisplay();
};

const updateCurrentPlayerDisplay = () => {
    currentPlayerDisplay.textContent = currentPlayer === 1 ? 'Ваш ход' : 'Ход компьютера';
};

initialSetup();
drawBoard();
drawCheckers();
updateCurrentPlayerDisplay();