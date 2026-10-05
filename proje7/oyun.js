"use strict";

(() => {
    const canvas = document.querySelector("#game-canvas");
    const context = canvas.getContext("2d");
    const title = document.querySelector("#game-title");
    const description = document.querySelector("#game-description");
    const scoreLabel = document.querySelector("#game-score");
    const bestScoreLabel = document.querySelector("#best-score");
    const statusLabel = document.querySelector("#game-status");
    const helpLabel = document.querySelector("#game-help");
    const controls = document.querySelector("#touch-controls");
    const restartButton = document.querySelector("#restart-button");
    const pauseButton = document.querySelector("#pause-button");
    const soundButton = document.querySelector("#sound-button");
    const tetrisExtras = document.querySelector("#tetris-extras");
    const nextPieceCanvas = document.querySelector("#next-piece");
    const nextPieceContext = nextPieceCanvas.getContext("2d");
    const tetrisLevelLabel = document.querySelector("#tetris-level");

    const gameDefinitions = {
        pacman: {
            title: "PAC-MAN",
            description: "Labirentteki noktaları topla, hayaletlerden kaç!",
            help: "Kontrol: Ok tuşları veya WASD. Esc / P ile duraklat. Telefonda yön düğmelerini kullan.",
            width: 800,
            height: 520,
            buttons: ["left", "up", "down", "right"],
        },
        tetris: {
            title: "TETRIS",
            description: "Blokları yerleştir, sıraları tamamla ve puanları topla.",
            help: "Kontrol: ← → hareket, ↑ döndür, ↓ hızlandır, Boşluk bırak. Esc / P ile duraklat.",
            width: 320,
            height: 640,
            buttons: ["left", "down", "right", "up", "space"],
        },
        platform: {
            title: "PLATFORM MACERASI",
            description: "Platformlarda ilerle, yıldızları topla ve bayrağa ulaş!",
            help: "Kontrol: ← → veya A/D hareket, ↑ / W / Boşluk zıpla. Esc / P duraklatır.",
            width: 800,
            height: 450,
            buttons: ["left", "right", "space"],
        },
        space: {
            title: "UZAY SAVUNMASI",
            description: "Uzay gemini hareket ettir ve istilacıları vur!",
            help: "Kontrol: ← → veya A/D hareket, Boşluk ateş. Esc / P duraklatır.",
            width: 800,
            height: 520,
            buttons: ["left", "right", "space"],
        },
    };

    const requestedGame = new URLSearchParams(window.location.search).get("oyun");
    const mode = Object.prototype.hasOwnProperty.call(gameDefinitions, requestedGame) ? requestedGame : "pacman";
    const definition = gameDefinitions[mode];
    const keys = new Set();
    let game;
    let lastFrame = 0;
    let accumulator = 0;
    let paused = false;
    let soundEnabled = false;
    let audioContext = null;
    let bestScore = 0;
    let storageError = false;
    let recordTimer = 0;

    canvas.width = definition.width;
    canvas.height = definition.height;
    canvas.style.maxWidth = `${definition.width}px`;
    canvas.style.marginInline = "auto";
    canvas.setAttribute("aria-label", `${definition.title} oyun alanı`);
    title.textContent = definition.title;
    description.textContent = definition.description;
    helpLabel.textContent = definition.help;
    document.title = `${definition.title} — Retro Arcade`;
    tetrisExtras.hidden = mode !== "tetris";

    function recordKey() {
        return `retro-arcade-best-${mode}`;
    }

    function readBestScore() {
        try {
            const storedScore = Number(window.localStorage.getItem(recordKey()));
            return Number.isFinite(storedScore) && storedScore > 0 ? storedScore : 0;
        } catch (error) {
            storageError = true;
            statusLabel.textContent = "REKOR KAYDI KAPALI";
            return 0;
        }
    }

    function updateBestScoreLabel() {
        bestScoreLabel.textContent = storageError && bestScore === 0 ? "REKOR: OTURUM" : `REKOR: ${bestScore}`;
    }

    bestScore = readBestScore();
    updateBestScoreLabel();

    function playTone(frequency, duration = 0.08, type = "square", volume = 0.035) {
        if (!soundEnabled || !audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    function saveBestScore(value) {
        bestScore = value;
        updateBestScoreLabel();
        window.clearTimeout(recordTimer);
        recordTimer = window.setTimeout(persistBestScore, 250);
    }

    function persistBestScore() {
        if (!bestScore) return;
        try {
            window.localStorage.setItem(recordKey(), String(bestScore));
            storageError = false;
            updateBestScoreLabel();
        } catch (error) {
            storageError = true;
            updateBestScoreLabel();
            status("REKOR KAYDI ENGELLENDİ");
        }
    }

    window.addEventListener("pagehide", () => {
        window.clearTimeout(recordTimer);
        persistBestScore();
    });

    function toggleSound() {
        soundEnabled = !soundEnabled;
        soundButton.setAttribute("aria-pressed", String(soundEnabled));
        soundButton.textContent = soundEnabled ? "SES: AÇIK" : "SES: KAPALI";
        if (soundEnabled) {
            const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextConstructor) {
                soundEnabled = false;
                soundButton.setAttribute("aria-pressed", "false");
                soundButton.textContent = "SES DESTEKLENMİYOR";
                status("TARAYICI SESİ DESTEKLEMİYOR");
                return;
            }
            if (!audioContext) audioContext = new AudioContextConstructor();
            if (audioContext.state === "suspended") audioContext.resume();
            playTone(660, 0.12);
        }
    }

    function togglePause() {
        if (game.ended) return;
        paused = !paused;
        keys.clear();
        pauseButton.textContent = paused ? "DEVAM ET" : "DURAKLAT";
        pauseButton.setAttribute("aria-pressed", String(paused));
        status(paused ? "DURAKLATILDI" : "OYUNDA");
        drawCurrentGame();
    }

    function drawCurrentGame() {
        if (mode === "pacman") drawPacman();
        if (mode === "tetris") drawTetris();
        if (mode === "platform") drawPlatform();
        if (mode === "space") drawSpace();
    }

    const keyMap = {
        ArrowLeft: "left",
        KeyA: "left",
        ArrowRight: "right",
        KeyD: "right",
        ArrowUp: "up",
        KeyW: "up",
        ArrowDown: "down",
        KeyS: "down",
        Space: "space",
    };

    function makeTouchControls() {
        const labels = {
            left: "←",
            right: "→",
            up: "↑",
            down: "↓",
            space: mode === "platform" ? "ZIPLA" : mode === "space" ? "ATEŞ" : "BIRAK",
        };

        definition.buttons.forEach((control) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = labels[control];
            const accessibleLabels = {
                left: "Sola",
                right: "Sağa",
                up: "Yukarı",
                down: "Aşağı",
                space: mode === "platform" ? "Zıpla" : mode === "space" ? "Ateş et" : "Bloğu bırak",
            };
            button.setAttribute("aria-label", accessibleLabels[control]);
            button.addEventListener("pointerdown", (event) => {
                event.preventDefault();
                button.setPointerCapture(event.pointerId);
                pressControl(control);
            });
            button.addEventListener("pointerup", () => releaseControl(control));
            button.addEventListener("pointercancel", () => releaseControl(control));
            button.addEventListener("lostpointercapture", () => releaseControl(control));
            button.addEventListener("click", (event) => {
                if (event.detail !== 0) return;
                pressControl(control);
                window.setTimeout(() => releaseControl(control), 120);
            });
            controls.append(button);
        });
    }

    function pressControl(control) {
        if (paused || game.ended) return;
        keys.add(control);
        if (mode === "tetris" && control === "up") rotatePiece();
        if (mode === "tetris" && control === "space") hardDrop();
        if (mode === "space" && control === "space") fireShot();
    }

    function releaseControl(control) {
        keys.delete(control);
    }

    window.addEventListener("keydown", (event) => {
        if (event.code === "Escape" && !event.repeat) {
            event.preventDefault();
            togglePause();
            return;
        }
        const control = keyMap[event.code];
        if (control) {
            event.preventDefault();
            if (!keys.has(control)) {
                pressControl(control);
            }
        }

        if (event.code === "KeyP" && !event.repeat) {
            togglePause();
        }
        if (event.code === "KeyM" && !event.repeat) {
            toggleSound();
        }
    });

    window.addEventListener("keyup", (event) => {
        const control = keyMap[event.code];
        if (control) releaseControl(control);
    });

    window.addEventListener("blur", () => {
        keys.clear();
        if (!game.ended && !paused) togglePause();
    });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && !game.ended && !paused) togglePause();
    });
    restartButton.addEventListener("click", resetGame);
    pauseButton.addEventListener("click", togglePause);
    soundButton.addEventListener("click", toggleSound);

    function setScore(value) {
        scoreLabel.textContent = `SKOR: ${value}`;
        if (value > bestScore) saveBestScore(value);
    }

    function status(text) {
        statusLabel.textContent = text;
    }

    function resetGame() {
        keys.clear();
        accumulator = 0;
        paused = false;
        pauseButton.textContent = "DURAKLAT";
        pauseButton.setAttribute("aria-pressed", "false");
        accumulator = 0;
        if (mode === "pacman") setupPacman();
        if (mode === "tetris") setupTetris();
        if (mode === "platform") setupPlatform();
        if (mode === "space") setupSpace();
        if (storageError) status("REKOR KAYDI ENGELLENDİ");
    }

    function wallAt(x, y) {
        return !game.map[y] || game.map[y][x] !== ".";
    }

    function setupPacman() {
        const map = [
            "###############",
            "#.............#",
            "#.###.#.###.#.#",
            "#.....#.......#",
            "###.#.#.#.###.#",
            "#...#...#.....#",
            "#.#.#####.#.#.#",
            "#.#.......#.#.#",
            "#.###.#.###.#.#",
            "#.....#.......#",
            "#.###.#.###.#.#",
            "#.............#",
            "###############",
        ];
        const dots = new Set();
        map.forEach((row, y) => {
            [...row].forEach((cell, x) => {
                if (cell === "." && !(x === 1 && y === 1)) dots.add(`${x},${y}`);
            });
        });
        game = {
            map,
            dots,
            player: { x: 1, y: 1, direction: null, nextDirection: null },
            ghosts: [
                { x: 7, y: 5, color: "#ff4c85", direction: "left" },
                { x: 7, y: 7, color: "#66eaff", direction: "up" },
                { x: 11, y: 9, color: "#ffae55", direction: "left" },
            ],
            score: 0,
            tick: 0,
            ended: false,
        };
        setScore(0);
        status("NOKTALARI TOPLA");
        drawPacman();
    }

    function pacStep() {
        if (game.ended) return;
        const directionVectors = {
            left: [-1, 0],
            right: [1, 0],
            up: [0, -1],
            down: [0, 1],
        };
        const player = game.player;
        if (keys.has("left")) player.nextDirection = "left";
        if (keys.has("right")) player.nextDirection = "right";
        if (keys.has("up")) player.nextDirection = "up";
        if (keys.has("down")) player.nextDirection = "down";

        const nextVector = player.nextDirection ? directionVectors[player.nextDirection] : null;
        if (nextVector && !wallAt(player.x + nextVector[0], player.y + nextVector[1])) {
            player.direction = player.nextDirection;
        }
        const vector = player.direction ? directionVectors[player.direction] : null;
        if (vector && !wallAt(player.x + vector[0], player.y + vector[1])) {
            player.x += vector[0];
            player.y += vector[1];
        }

        const point = `${player.x},${player.y}`;
        if (game.dots.delete(point)) {
            game.score += 10;
            setScore(game.score);
            playTone(520 + (game.score % 5) * 55, 0.055);
        }

        game.tick += 1;
        if (game.tick % 2 === 0) {
            game.ghosts.forEach((ghost) => {
                const options = Object.entries(directionVectors).filter(([, delta]) => !wallAt(ghost.x + delta[0], ghost.y + delta[1]));
                if (options.length) {
                    const candidates = options.filter(([, delta]) =>
                        ghost.x + delta[0] !== ghost.previousX || ghost.y + delta[1] !== ghost.previousY);
                    const available = candidates.length ? candidates : options;
                    const [direction, delta] = Math.random() < 0.72
                        ? available.reduce((best, candidate) => {
                            const [, move] = candidate;
                            const [, bestMove] = best;
                            const distance = Math.abs(ghost.x + move[0] - player.x) + Math.abs(ghost.y + move[1] - player.y);
                            const bestDistance = Math.abs(ghost.x + bestMove[0] - player.x) + Math.abs(ghost.y + bestMove[1] - player.y);
                            return distance < bestDistance ? candidate : best;
                        })
                        : available[Math.floor(Math.random() * available.length)];
                    ghost.previousX = ghost.x;
                    ghost.previousY = ghost.y;
                    ghost.direction = direction;
                    ghost.x += delta[0];
                    ghost.y += delta[1];
                }
            });
        }

        if (game.ghosts.some((ghost) => ghost.x === player.x && ghost.y === player.y)) {
            game.ended = true;
            status("YAKALANDIN! YENİDEN DENE");
            playTone(150, 0.35, "sawtooth");
        } else if (game.dots.size === 0) {
            game.ended = true;
            game.score += 100;
            setScore(game.score);
            status("LABİRENT TAMAMLANDI!");
            playTone(880, 0.35, "triangle");
        }
        drawPacman();
    }

    function drawPacman() {
        const tile = 32;
        const originX = (canvas.width - game.map[0].length * tile) / 2;
        const originY = (canvas.height - game.map.length * tile) / 2;
        context.fillStyle = "#100a20";
        context.fillRect(0, 0, canvas.width, canvas.height);
        game.map.forEach((row, y) => {
            [...row].forEach((cell, x) => {
                const px = originX + x * tile;
                const py = originY + y * tile;
                if (cell === "#") {
                    context.fillStyle = "#27205a";
                    context.fillRect(px + 2, py + 2, tile - 4, tile - 4);
                    context.strokeStyle = "#00dff5";
                    context.lineWidth = 1.5;
                    context.strokeRect(px + 4, py + 4, tile - 8, tile - 8);
                } else if (game.dots.has(`${x},${y}`)) {
                    context.fillStyle = "#ffe99a";
                    context.beginPath();
                    context.arc(px + tile / 2, py + tile / 2, 3, 0, Math.PI * 2);
                    context.fill();
                }
            });
        });

        const playerX = originX + (game.player.x + 0.5) * tile;
        const playerY = originY + (game.player.y + 0.5) * tile;
        const angle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[game.player.direction] || 0;
        context.fillStyle = "#ffe047";
        context.beginPath();
        context.moveTo(playerX, playerY);
        context.arc(playerX, playerY, 12, angle + 0.3, angle + Math.PI * 2 - 0.3);
        context.closePath();
        context.fill();

        game.ghosts.forEach((ghost) => {
            const gx = originX + (ghost.x + 0.5) * tile;
            const gy = originY + (ghost.y + 0.5) * tile;
            context.fillStyle = ghost.color;
            context.beginPath();
            context.arc(gx, gy, 11, Math.PI, 0);
            context.lineTo(gx + 11, gy + 9);
            context.lineTo(gx + 5, gy + 5);
            context.lineTo(gx, gy + 9);
            context.lineTo(gx - 5, gy + 5);
            context.lineTo(gx - 11, gy + 9);
            context.closePath();
            context.fill();
            context.fillStyle = "#fff";
            context.fillRect(gx - 5, gy - 2, 4, 5);
            context.fillRect(gx + 2, gy - 2, 4, 5);
        });
        if (paused) drawOverlay("DURAKLATILDI");
        if (game.ended) drawOverlay(game.dots.size === 0 ? "BÖLÜM TAMAM" : "OYUN BİTTİ");
    }

    const tetrominoes = [
        { color: "#00f0ff", shape: [[1, 1, 1, 1]] },
        { color: "#f20089", shape: [[1, 1], [1, 1]] },
        { color: "#a393eb", shape: [[0, 1, 0], [1, 1, 1]] },
        { color: "#6be0cb", shape: [[0, 1, 1], [1, 1, 0]] },
        { color: "#ff805d", shape: [[1, 1, 0], [0, 1, 1]] },
        { color: "#f9e75e", shape: [[1, 0, 0], [1, 1, 1]] },
        { color: "#79b7ff", shape: [[0, 0, 1], [1, 1, 1]] },
    ];

    function newPiece() {
        const piece = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
        return {
            shape: piece.shape.map((row) => [...row]),
            color: piece.color,
            x: 3,
            y: 0,
        };
    }

    function setupTetris() {
        game = {
            board: Array.from({ length: 20 }, () => Array(10).fill(null)),
            piece: newPiece(),
            nextPiece: newPiece(),
            score: 0,
            lines: 0,
            dropTimer: 0,
            ended: false,
        };
        setScore(0);
        status("SIRALARI TAMAMLA");
        updateTetrisLevel();
        if (collides(game.piece, 0, 0, game.piece.shape)) endTetris();
        drawTetris();
    }

    function collides(piece, dx, dy, shape) {
        return shape.some((row, y) => row.some((cell, x) => {
            if (!cell) return false;
            const boardX = piece.x + x + dx;
            const boardY = piece.y + y + dy;
            return boardX < 0 || boardX >= 10 || boardY >= 20 || (boardY >= 0 && game.board[boardY][boardX]);
        }));
    }

    function rotatePiece() {
        if (mode !== "tetris" || game.ended || paused) return;
        const rotated = game.piece.shape[0].map((_, index) => game.piece.shape.map((row) => row[index]).reverse());
        if (!collides(game.piece, 0, 0, rotated)) {
            game.piece.shape = rotated;
            playTone(430, 0.045);
        }
        drawTetris();
    }

    function lockPiece() {
        game.piece.shape.forEach((row, y) => row.forEach((cell, x) => {
            if (cell && game.piece.y + y >= 0) {
                game.board[game.piece.y + y][game.piece.x + x] = game.piece.color;
            }
        }));

        let cleared = 0;
        game.board = game.board.filter((row) => {
            if (row.every(Boolean)) {
                cleared += 1;
                return false;
            }
            return true;
        });
        while (game.board.length < 20) game.board.unshift(Array(10).fill(null));
        if (cleared) {
            game.lines += cleared;
            game.score += [0, 100, 300, 500, 800][cleared] * Math.ceil(game.lines / 10);
            setScore(game.score);
            updateTetrisLevel();
            playTone(660 + cleared * 120, 0.18, "triangle");
        }

        game.piece = game.nextPiece;
        game.nextPiece = newPiece();
        if (collides(game.piece, 0, 0, game.piece.shape)) endTetris();
        drawNextPiece();
        updateTetrisLevel();
    }

    function endTetris() {
        game.ended = true;
        status("OYUN BİTTİ");
    }

    function hardDrop() {
        if (mode !== "tetris" || game.ended || paused) return;
        while (!collides(game.piece, 0, 1, game.piece.shape)) game.piece.y += 1;
        playTone(260, 0.07);
        lockPiece();
        drawTetris();
    }

    function tetrisUpdate(delta) {
        if (game.ended || paused) return;
        ["left", "right"].forEach((direction) => {
            const held = keys.has(direction);
            const timerName = `${direction}Timer`;
            const wasHeldName = `${direction}WasHeld`;
            if (held) {
                if (!game[wasHeldName] || game[timerName] >= 130) {
                    const shift = direction === "left" ? -1 : 1;
                    if (!collides(game.piece, shift, 0, game.piece.shape)) game.piece.x += shift;
                    game[timerName] = 0;
                } else {
                    game[timerName] += delta;
                }
                game[wasHeldName] = true;
            } else {
                game[wasHeldName] = false;
                game[timerName] = 0;
            }
        });

        game.softDropTimer = (game.softDropTimer || 0) + delta;
        if (keys.has("down") && game.softDropTimer >= 65) {
            if (!collides(game.piece, 0, 1, game.piece.shape)) {
                game.piece.y += 1;
                game.score += 1;
                setScore(game.score);
            }
            game.softDropTimer = 0;
        } else if (!keys.has("down")) {
            game.softDropTimer = 0;
        }

        game.dropTimer += delta;
        const speed = Math.max(100, 700 - Math.floor(game.lines / 5) * 55);
        if (game.dropTimer >= speed) {
            game.dropTimer = 0;
            if (!collides(game.piece, 0, 1, game.piece.shape)) game.piece.y += 1;
            else lockPiece();
        }
        drawTetris();
    }

    function drawTetris() {
        const cell = 32;
        context.fillStyle = "#100a20";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "rgba(163, 147, 235, 0.12)";
        for (let x = 0; x <= 10; x += 1) {
            context.beginPath();
            context.moveTo(x * cell, 0);
            context.lineTo(x * cell, canvas.height);
            context.stroke();
        }
        for (let y = 0; y <= 20; y += 1) {
            context.beginPath();
            context.moveTo(0, y * cell);
            context.lineTo(canvas.width, y * cell);
            context.stroke();
        }

        game.board.forEach((row, y) => row.forEach((color, x) => {
            if (color) drawBlock(x, y, color, cell);
        }));
        if (game.piece) {
            let ghostY = game.piece.y;
            while (!collides({ ...game.piece, y: ghostY }, 0, 1, game.piece.shape)) ghostY += 1;
            game.piece.shape.forEach((row, y) => row.forEach((filled, x) => {
                if (!filled) return;
                context.strokeStyle = "rgba(255, 255, 255, 0.34)";
                context.strokeRect((game.piece.x + x) * cell + 5, (ghostY + y) * cell + 5, cell - 10, cell - 10);
            }));
            game.piece.shape.forEach((row, y) => row.forEach((filled, x) => {
                if (filled) drawBlock(game.piece.x + x, game.piece.y + y, game.piece.color, cell);
            }));
        }
        if (paused) drawOverlay("DURAKLATILDI");
        if (game.ended) drawOverlay("OYUN BİTTİ");
        drawNextPiece();
    }

    function drawNextPiece() {
        if (mode !== "tetris" || !game.nextPiece) return;
        nextPieceContext.fillStyle = "#100a20";
        nextPieceContext.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        const cell = 16;
        const shape = game.nextPiece.shape;
        const offsetX = (nextPieceCanvas.width - shape[0].length * cell) / 2;
        const offsetY = (nextPieceCanvas.height - shape.length * cell) / 2;
        shape.forEach((row, y) => row.forEach((filled, x) => {
            if (!filled) return;
            nextPieceContext.fillStyle = game.nextPiece.color;
            nextPieceContext.fillRect(offsetX + x * cell + 1, offsetY + y * cell + 1, cell - 2, cell - 2);
            nextPieceContext.fillStyle = "rgba(255, 255, 255, 0.25)";
            nextPieceContext.fillRect(offsetX + x * cell + 3, offsetY + y * cell + 3, cell - 6, 2);
        }));
    }

    function updateTetrisLevel() {
        if (mode !== "tetris" || !game) return;
        const level = Math.floor(game.lines / 5) + 1;
        tetrisLevelLabel.innerHTML = `SEVİYE ${level}<br>${game.lines} SATIR`;
    }

    function drawBlock(x, y, color, size) {
        context.fillStyle = color;
        context.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
        context.fillStyle = "rgba(255, 255, 255, 0.22)";
        context.fillRect(x * size + 4, y * size + 4, size - 8, 3);
    }

    function drawOverlay(text) {
        context.fillStyle = "rgba(10, 4, 22, 0.78)";
        context.fillRect(0, canvas.height / 2 - 38, canvas.width, 76);
        context.fillStyle = "#00f0ff";
        context.font = '16px "Press Start 2P", monospace';
        context.textAlign = "center";
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 6);
        context.textAlign = "start";
    }

    const platforms = [
        { x: 0, y: 390, w: 390, h: 60 },
        { x: 470, y: 390, w: 350, h: 60 },
        { x: 900, y: 390, w: 370, h: 60 },
        { x: 1350, y: 390, w: 350, h: 60 },
        { x: 1780, y: 390, w: 500, h: 60 },
        { x: 210, y: 305, w: 145, h: 18 },
        { x: 535, y: 300, w: 125, h: 18 },
        { x: 735, y: 245, w: 130, h: 18 },
        { x: 1010, y: 310, w: 145, h: 18 },
        { x: 1220, y: 245, w: 145, h: 18 },
        { x: 1480, y: 305, w: 130, h: 18 },
        { x: 1690, y: 240, w: 145, h: 18 },
        { x: 1920, y: 300, w: 130, h: 18 },
    ];
    const platformCoins = [
        { x: 280, y: 265 }, { x: 590, y: 260 }, { x: 790, y: 205 },
        { x: 1075, y: 270 }, { x: 1285, y: 205 }, { x: 1540, y: 265 },
        { x: 1750, y: 200 }, { x: 1980, y: 260 }, { x: 2220, y: 345 },
    ];

    function setupPlatform() {
        game = {
            player: { x: 50, y: 340, w: 25, h: 34, vx: 0, vy: 0, grounded: false },
            coins: platformCoins.map((coin) => ({ ...coin, collected: false })),
            camera: 0,
            score: 0,
            lives: 3,
            ended: false,
            won: false,
            jumpLock: false,
        };
        setScore(0);
        status("YILDIZLARI TOPLA");
        drawPlatform();
    }

    function platformUpdate(delta) {
        if (game.ended) return;
        const player = game.player;
        const dt = Math.min(delta / 1000, 0.04);
        player.vx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
        player.x += player.vx * 220 * dt;
        player.x = Math.max(0, Math.min(2280 - player.w, player.x));

        const wantsJump = keys.has("space") || keys.has("up");
        if (wantsJump && player.grounded && !game.jumpLock) {
            player.vy = -430;
            player.grounded = false;
            game.jumpLock = true;
        } else if (!wantsJump) game.jumpLock = false;

        const oldBottom = player.y + player.h;
        player.vy += 1050 * dt;
        player.y += player.vy * dt;
        player.grounded = false;
        if (player.vy >= 0) {
            platforms.forEach((platform) => {
                const overlapsX = player.x + player.w > platform.x && player.x < platform.x + platform.w;
                const crossedTop = oldBottom <= platform.y && player.y + player.h >= platform.y;
                if (overlapsX && crossedTop) {
                    player.y = platform.y - player.h;
                    player.vy = 0;
                    player.grounded = true;
                }
            });
        }

        game.coins.forEach((coin) => {
            if (!coin.collected && Math.hypot(player.x + player.w / 2 - coin.x, player.y + player.h / 2 - coin.y) < 25) {
                coin.collected = true;
                game.score += 10;
                setScore(game.score);
                playTone(740, 0.09, "triangle");
            }
        });

        if (player.y > canvas.height + 100) {
            game.lives -= 1;
            playTone(170, 0.25, "sawtooth");
            if (game.lives <= 0) {
                game.ended = true;
                status("OYUN BİTTİ");
            } else {
                player.x = Math.max(50, player.x - 100);
                player.y = 300;
                player.vy = 0;
                status(`KALAN CAN: ${game.lives}`);
            }
        }
        if (player.x > 2220 && player.y + player.h <= 390) {
            game.ended = true;
            game.won = true;
            game.score += 50;
            setScore(game.score);
            status("BÖLÜM TAMAMLANDI!");
        }
        game.camera = Math.max(0, Math.min(2280 - canvas.width, player.x - 260));
        drawPlatform();
    }

    function drawPlatform() {
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#17143d");
        gradient.addColorStop(1, "#381e54");
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#fff";
        for (let i = 0; i < 45; i += 1) {
            const x = ((i * 137) % 2400) - game.camera * 0.35;
            const wrappedX = ((x % canvas.width) + canvas.width) % canvas.width;
            const y = (i * 67) % 210;
            context.fillRect(wrappedX, y, 2, 2);
        }

        context.save();
        context.translate(-game.camera, 0);
        platforms.forEach((platform) => {
            context.fillStyle = "#543878";
            context.fillRect(platform.x, platform.y, platform.w, platform.h);
            context.fillStyle = "#00f0ff";
            context.fillRect(platform.x, platform.y, platform.w, 5);
        });
        game.coins.forEach((coin) => {
            if (coin.collected) return;
            context.fillStyle = "#ffe047";
            context.beginPath();
            context.arc(coin.x, coin.y, 9, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = "#fff7b2";
            context.fillRect(coin.x - 2, coin.y - 5, 3, 7);
        });

        context.fillStyle = "#f20089";
        context.fillRect(2250, 300, 5, 90);
        context.beginPath();
        context.moveTo(2255, 302);
        context.lineTo(2300, 317);
        context.lineTo(2255, 332);
        context.closePath();
        context.fillStyle = "#00f0ff";
        context.fill();

        const player = game.player;
        context.fillStyle = "#f9e75e";
        context.fillRect(player.x, player.y, player.w, player.h);
        context.fillStyle = "#f20089";
        context.fillRect(player.x + 4, player.y + 4, player.w - 8, 9);
        context.fillStyle = "#17102d";
        context.fillRect(player.x + 16, player.y + 8, 4, 4);
        context.restore();

        context.fillStyle = "#00f0ff";
        context.font = '12px "Press Start 2P", monospace';
        context.fillText(`CAN: ${game.lives}`, 14, 25);
        if (paused) drawOverlay("DURAKLATILDI");
        if (game.ended) drawOverlay(game.won ? "TEBRİKLER!" : "OYUN BİTTİ");
    }

    function setupSpace() {
        game = {
            player: { x: canvas.width / 2 - 22, y: canvas.height - 54, w: 44, h: 28 },
            bullets: [],
            enemyBullets: [],
            enemies: [],
            enemyDirection: 1,
            enemySpeed: 32,
            fireCooldown: 0,
            enemyFireTimer: 0,
            playerHitCooldown: 0,
            particles: [],
            animationTime: 0,
            score: 0,
            lives: 3,
            wave: 1,
            ended: false,
        };
        createInvaders();
        setScore(0);
        status("SAVUNMAYA HAZIR");
        drawSpace();
    }

    function createInvaders() {
        game.enemies = [];
        for (let row = 0; row < 4; row += 1) {
            for (let col = 0; col < 9; col += 1) {
                game.enemies.push({
                    x: 105 + col * 65,
                    y: 65 + row * 47,
                    w: 30,
                    h: 23,
                    color: row === 0 ? "#f20089" : row < 3 ? "#a393eb" : "#00f0ff",
                });
            }
        }
    }

    function fireShot() {
        if (mode !== "space" || game.ended || game.fireCooldown > 0) return;
        game.bullets.push({ x: game.player.x + game.player.w / 2 - 2, y: game.player.y - 8, w: 4, h: 14 });
        game.fireCooldown = 220;
        playTone(520, 0.045);
    }

    function burstParticles(x, y, color) {
        for (let i = 0; i < 10; i += 1) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 35 + Math.random() * 95;
            game.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.35 + Math.random() * 0.25,
                color,
            });
        }
    }

    function spaceUpdate(delta) {
        if (game.ended) return;
        const dt = Math.min(delta / 1000, 0.05);
        game.animationTime += delta;
        game.player.x += ((keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0)) * 330 * dt;
        game.player.x = Math.max(12, Math.min(canvas.width - game.player.w - 12, game.player.x));
        game.fireCooldown = Math.max(0, game.fireCooldown - delta);
        game.enemyFireTimer += delta;
        game.playerHitCooldown = Math.max(0, game.playerHitCooldown - delta);
        if (keys.has("space")) fireShot();

        let hitEdge = false;
        game.enemies.forEach((enemy) => {
            enemy.x += game.enemyDirection * game.enemySpeed * dt;
            if (enemy.x < 20 || enemy.x + enemy.w > canvas.width - 20) hitEdge = true;
        });
        if (hitEdge) {
            game.enemyDirection *= -1;
            game.enemies.forEach((enemy) => enemy.y += 15);
        }

        game.bullets.forEach((bullet) => bullet.y -= 470 * dt);
        game.bullets = game.bullets.filter((bullet) => bullet.y + bullet.h > 0);
        game.bullets.forEach((bullet) => {
            const enemyIndex = game.enemies.findIndex((enemy) =>
                bullet.x < enemy.x + enemy.w && bullet.x + bullet.w > enemy.x &&
                bullet.y < enemy.y + enemy.h && bullet.y + bullet.h > enemy.y);
            if (enemyIndex !== -1) {
                const hitEnemy = game.enemies[enemyIndex];
                burstParticles(hitEnemy.x + hitEnemy.w / 2, hitEnemy.y + hitEnemy.h / 2, hitEnemy.color);
                game.enemies.splice(enemyIndex, 1);
                bullet.y = -100;
                game.score += 10;
                game.enemySpeed += 0.3;
                setScore(game.score);
                playTone(260, 0.075, "triangle");
            }
        });
        game.bullets = game.bullets.filter((bullet) => bullet.y > -50);
        game.particles.forEach((particle) => {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.life -= dt;
        });
        game.particles = game.particles.filter((particle) => particle.life > 0);

        if (game.enemyFireTimer >= 850 && game.enemies.length) {
            const shooter = game.enemies[Math.floor(Math.random() * game.enemies.length)];
            game.enemyBullets.push({ x: shooter.x + shooter.w / 2 - 2, y: shooter.y + shooter.h, w: 4, h: 12 });
            game.enemyFireTimer = 0;
        }
        game.enemyBullets.forEach((bullet) => bullet.y += 260 * dt);
        game.enemyBullets = game.enemyBullets.filter((bullet) => bullet.y < canvas.height);
        if (game.playerHitCooldown === 0) {
            const hitIndex = game.enemyBullets.findIndex((bullet) =>
                bullet.x < game.player.x + game.player.w && bullet.x + bullet.w > game.player.x &&
                bullet.y < game.player.y + game.player.h && bullet.y + bullet.h > game.player.y);
            if (hitIndex !== -1) {
                game.enemyBullets.splice(hitIndex, 1);
                game.lives -= 1;
                game.playerHitCooldown = 1000;
                playTone(130, 0.25, "sawtooth");
                if (game.lives <= 0) {
                    game.ended = true;
                    status("GEMİ DÜŞTÜ!");
                }
            }
        }

        if (!game.ended && game.enemies.some((enemy) => enemy.y + enemy.h >= game.player.y)) {
            game.ended = true;
            status("İSTİLACILAR İLERLEDİ!");
        } else if (!game.ended && game.enemies.length === 0) {
            game.score += 100;
            setScore(game.score);
            playTone(780, 0.28, "triangle");
            if (game.wave >= 3) {
                game.ended = true;
                status("GALAKSİ KURTULDU!");
            } else {
                game.wave += 1;
                game.enemySpeed += 14;
                game.enemyFireTimer = 0;
                game.enemyBullets = [];
                createInvaders();
                game.enemies.forEach((enemy) => enemy.y += (game.wave - 1) * 18);
                status(`DALGA ${game.wave} BAŞLIYOR`);
            }
        }
        drawSpace();
    }

    function drawSpace() {
        context.fillStyle = "#0d1027";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#fff";
        for (let i = 0; i < 65; i += 1) {
            context.fillRect((i * 127) % canvas.width, (i * 71) % canvas.height, 2, 2);
        }
        game.enemies.forEach((enemy) => {
            context.fillStyle = enemy.color;
            context.fillRect(enemy.x + 5, enemy.y, enemy.w - 10, 6);
            context.fillRect(enemy.x, enemy.y + 7, enemy.w, 10);
            context.fillRect(enemy.x + 4, enemy.y + 18, 6, 5);
            context.fillRect(enemy.x + enemy.w - 10, enemy.y + 18, 6, 5);
            context.fillStyle = "#0d1027";
            context.fillRect(enemy.x + 7, enemy.y + 9, 4, 4);
            context.fillRect(enemy.x + enemy.w - 11, enemy.y + 9, 4, 4);
        });
        context.fillStyle = "#00f0ff";
        game.bullets.forEach((bullet) => context.fillRect(bullet.x, bullet.y, bullet.w, bullet.h));
        context.fillStyle = "#f20089";
        game.enemyBullets.forEach((bullet) => context.fillRect(bullet.x, bullet.y, bullet.w, bullet.h));
        game.particles.forEach((particle) => {
            context.globalAlpha = Math.min(1, particle.life * 2);
            context.fillStyle = particle.color;
            context.fillRect(particle.x, particle.y, 4, 4);
        });
        context.globalAlpha = 1;

        const player = game.player;
        context.fillStyle = "#00f0ff";
        context.beginPath();
        context.moveTo(player.x + player.w / 2, player.y);
        context.lineTo(player.x + player.w, player.y + player.h);
        context.lineTo(player.x + player.w / 2, player.y + player.h - 7);
        context.lineTo(player.x, player.y + player.h);
        context.closePath();
        context.fill();
        context.fillStyle = "#f20089";
        context.fillRect(player.x + player.w / 2 - 4, player.y + 16, 8, 13);

        context.fillStyle = "#f9e75e";
        context.font = '12px "Press Start 2P", monospace';
        context.fillText(`CAN: ${game.lives}`, 14, 24);
        context.textAlign = "right";
        context.fillText(`DALGA: ${game.wave}/3`, canvas.width - 14, 24);
        context.textAlign = "start";
        if (game.playerHitCooldown > 0 && Math.floor(game.playerHitCooldown / 100) % 2 === 0) {
            context.fillStyle = "rgba(255, 255, 255, 0.25)";
            context.fillRect(player.x, player.y, player.w, player.h);
        }
        if (paused) drawOverlay("DURAKLATILDI");
        if (game.ended) drawOverlay(game.wave >= 3 && game.enemies.length === 0 ? "GALAKSİ KURTULDU" : "OYUN BİTTİ");
    }

    function drawOverlay(text) {
        context.fillStyle = "rgba(10, 4, 22, 0.76)";
        context.fillRect(0, canvas.height / 2 - 34, canvas.width, 68);
        context.fillStyle = "#00f0ff";
        context.font = '14px "Press Start 2P", monospace';
        context.textAlign = "center";
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 6);
        context.textAlign = "start";
    }

    function update(delta) {
        if (paused) return;
        if (mode === "pacman") {
            accumulator += delta;
            while (accumulator >= 145) {
                pacStep();
                accumulator -= 145;
            }
        } else if (mode === "tetris") {
            tetrisUpdate(delta);
        } else if (mode === "platform") {
            platformUpdate(delta);
        } else {
            spaceUpdate(delta);
        }
    }

    function frame(timestamp) {
        const delta = Math.min(timestamp - lastFrame, 50);
        lastFrame = timestamp;
        update(delta);
        window.requestAnimationFrame(frame);
    }

    makeTouchControls();
    resetGame();
    window.requestAnimationFrame((timestamp) => {
        lastFrame = timestamp;
        window.requestAnimationFrame(frame);
    });
})();
