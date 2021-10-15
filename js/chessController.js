function init () {

    let board0, board1, board2, board3
    board0 = board1 = board2 = board3 = null
    const boardList = [board0, board1, board2, board3]

    const gameList = []
    for (let i = 0; i < 4; i++) {
        gameList[i] = new Chess()
    }

    let $status0 = $('#status0')
    let $status1 = $('#status1')
    let $status2 = $('#status2')
    let $status3 = $('#status3')
    const statusList = [$status0, $status1, $status2, $status3]

    let $fen0 = $('#fen0')
    let $fen1 = $('#fen1')
    let $fen2 = $('#fen2')
    let $fen3 = $('#fen3')
    const fenList = [$fen0, $fen1, $fen2, $fen3]

    let $pgn0 = $('#pgn0')
    let $pgn1 = $('#pgn1')
    let $pgn2 = $('#pgn2')
    let $pgn3 = $('#pgn3')
    const pgnList = [$pgn0, $pgn1, $pgn2, $pgn3]

    function onDragStart0(source, piece, position, orientation) {
        onDragStart(source, piece, position, orientation, 0)
    }
    function onDragStart1(source, piece, position, orientation) {
        onDragStart(source, piece, position, orientation, 1)
    }
    function onDragStart2(source, piece, position, orientation) {
        onDragStart(source, piece, position, orientation, 2)
    }
    function onDragStart3(source, piece, position, orientation) {
        onDragStart(source, piece, position, orientation, 3)
    }
    const onDragStartList = [onDragStart0, onDragStart1, onDragStart2, onDragStart3]
    function onDragStart(source, piece, position, orientation, boardNumber) {

        const game = gameList[boardNumber]

        // do not pick up pieces if the game is over
        if (game.game_over()) return false

        // only pick up pieces for the side to move
        if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false
        }
    }

    function onDrop0(source, target) {
        onDrop(source, target, 0)
    }
    function onDrop1(source, target) {
        onDrop(source, target, 1)
    }
    function onDrop2(source, target) {
        onDrop(source, target, 2)
    }
    function onDrop3(source, target) {
        onDrop(source, target, 3)
    }
    const onDropList = [onDrop0, onDrop1, onDrop2, onDrop3]
    function onDrop(source, target, boardNumber) {
        const game = gameList[boardNumber]

        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) return 'snapback'

        updateStatus(boardNumber)

        if(!game.game_over()) {
            switch (boardNumber) {
                case 0:
                    useRandom(0)
                    break
                case 1:
                    useMinMax(3, 'b', boardNumber)
                    break
                case 2:
                    useAlphaBeta(3, 'b', boardNumber, false)
                    break
                case 3:
                    console.log("start")
                    useAlphaBeta(3, 'b', boardNumber, true)
                    console.log("done")
                    break
            }
            updateStatus(boardNumber)
        }
    }

    function useRandom(boardNumber) {
        const game = gameList[boardNumber]
        const moves = game.moves()
        game.move(moves[Math.floor(Math.random() * moves.length)])
    }

    function useMinMax(depth, color, boardNumber, positional) {
        const game = gameList[boardNumber]

        const maxing = (color === 'w')
        let bestMove = minMax(game, depth, maxing, true)
        game.move(bestMove)
    }

    function useAlphaBeta(depth, color, boardNumber, positional) {
        const game = gameList[boardNumber]
        let bestMove = alphaBeta(game, -99999, 99999, depth, color === 'w', true, positional)
        game.move(bestMove)
    }

    function minMax(game, depth, maxing, root) {
        if (depth === 0) return evaluatePosition(game, false)

        const sign = maxing ? 1 : -1;
        const moves = game.moves()
        let currentBest = 99999 * -sign
        let bestMove = moves[0]

        for (let i = 0; i < moves.length; i++) {

            game.move(moves[i])
            const eval = minMax(game,depth - 1, !maxing, false)
            if (eval * sign > currentBest * sign) {
                currentBest = eval
                bestMove = moves[i]
            }
            game.undo()
        }

        return root ? bestMove : currentBest
    }

    function alphaBeta(game, alpha, beta, depth, maxing, root, positional) {
        if (depth === 0) {
            return evaluatePosition(game, positional)
        }

        const moves = game.moves()

        const sign = maxing ? 1 : -1
        let bestMove = moves[0]

        let value = 99999 * -sign
        for (let i = 0; i < moves.length; i++) {
            game.move(moves[i])
            const retVal = alphaBeta(game, alpha, beta, depth-1, !maxing, false, positional)
            game.undo()

            if (value * sign < retVal * sign) {
                value = retVal
                bestMove = moves[i]
            }

            if (maxing) {
                if (value >= beta) break
                alpha = Math.max(alpha, value)
            } else {
                if (value <= alpha) break
                beta = Math.min(beta, value)
            }
        }

        return root ? bestMove : value
    }

    const pawnPosition = [
        [0,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1],
        [0.2,0.2,0.4,0.6,0.6,0.4,0.2,0.2],
        [0.1, 0.1, 0.2, 0.5, 0.5, 0.2, 0.1, 0.1],
        [0,0,0,0.4,0.4,0,0,0],
        [0.1, 0, -0.2, 0, 0, -0.2, 0, 0.1],
        [0.1, 0.2, 0.2, -0.4, -0.4, 0.2, 0.2, 0.1],
        [0,0,0,0,0,0,0,0]
      ]

    const knightPosition = [
      [-1, -0.8, -0.6, -0.6, -0.6, -0.6, -0.8, -1],
      [-0.8, -0.4, 0, 0, 0, 0, -0.4, -0.8],
      [-0.6, 0, 0.2, 0.3, 0.3, 0.2, 0, -0.6],
      [-0.6, 0.1, 0.3, 0.4, 0.4, 0.3, 0.1, -0.6],
        [-0.6, 0.1, 0.3, 0.4, 0.4, 0.3, 0.1, -0.6],
        [-0.6, 0, 0.2, 0.3, 0.3, 0.2, 0, -0.6],
        [-0.8, -0.4, 0, 0, 0, 0, -0.4, -0.8],
        [-1, -0.8, -0.6, -0.6, -0.6, -0.6, -0.8, -1]
    ]

    const bishopPosition = [
        [-1, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -1],
        [-0.5,0,0,0,0,0,0,-0.5],
        [-0.5, 0, 0.25, 0.5, 0.5, 0.25, 0, -0.5],
        [-0.5, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25, -0.5],
        [-0.5, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25, -0.5],
        [-0.5, 0, 0.25, 0.5, 0.5, 0.25, 0, -0.5],
        [-0.5,0.5,0,0,0,0,0.5,-0.5],
        [-1, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -1]
    ]

    const kingPosition = [
      [-0.6, -0.8, -0.8, -1, -1, -0.8, -0.8, -0.6],
        [-0.6, -0.8, -0.8, -1, -1, -0.8, -0.8, -0.6],
        [-0.6, -0.8, -0.8, -1, -1, -0.8, -0.8, -0.6],
        [-0.6, -0.8, -0.8, -1, -1, -0.8, -0.8, -0.6],
        [-0.4, -0.6, -0.6, -0.8, -0.8, -0.6, -0.6, -0.4],
        [-0.2,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.2],
        [0.4,0.4,-0.05,-0.05,-0.05,-0.05,0.4,0.4],
        [0.4, 0.6, -0.05, -0.05, 0 ,-0.05, 0.6, 0.4]
    ]

    const queenPosition = [
      [-0.4,-0.2,-0.2,-0.1,-0.1,-0.2,-0.2,-0.4],
        [-0.2, 0, 0, 0, 0, 0, 0, -0.2],
        [-0.2, 0, 0.1, 0.1, 0.1, 0.1, 0, -0.2],
        [-0.1, 0, 0.1, 0.1, 0.1, 0.1, 0, -0.1],
        [0,0,0.1,0.1,0.1,0.1,0,-0.1],
        [-0.2,0.1,0.1,0.1,0.1,0.1,0,-0.2],
        [-0.2, 0, 0.1, 0, 0, 0, 0, -0.2],
        [-0.4, -0.2, -0.2, -0.1, -0.1, -0.2, -0.2, -0.4]
    ]

    const rookPosition = [
        [0,0,0,0,0,0,0,0],
        [0.5,1,1,1,1,1,1,0.5],
        [-0.5,0,0,0,0,0,0,-0.5],
        [-0.5,0,0,0,0,0,0,-0.5],
        [-0.5,0,0,0,0,0,0,-0.5],
        [-0.5,0,0,0,0,0,0,-0.5],
        [-0.5,0,0,0,0,0,0,-0.5],
        [0,0,0,0.5,0.5,0,0,0]
    ]


    function evaluatePosition(game, positional) {
        const grid = game.board()
        let current = 0.0;

        function positionalVal (piece, i, j) {
            if (piece == null) return 0.0;
            let matrix = [[]]
            let uselessnessMultiplier = 1.0
            let pieceImportance = 0.1
            let base = 0.0

            switch (piece.type) {
                case 'p':
                    base = 1.0
                    matrix = pawnPosition
                    uselessnessMultiplier = 1.0
                    break
                case 'n':
                    base = 3.0
                    matrix = knightPosition
                    uselessnessMultiplier = 1.0
                    break
                case 'b':
                    base = 3.3
                    matrix = bishopPosition
                    uselessnessMultiplier = 1.0
                    break
                case 'r':
                    base = 5.0
                    matrix = rookPosition
                    uselessnessMultiplier = 1.0
                    break
                case 'q':
                    base = 9.0
                    matrix = queenPosition
                    uselessnessMultiplier = 1.0
                    break
                case 'k':
                    base = 90.0
                    matrix = kingPosition
                    uselessnessMultiplier = 4.0
                    break
            }

            let sign = -1.0

            if (piece.color === 'b') {
                matrix = matrix.reverse()
            } else {
                sign = 1.0
            }

            return (base + matrix[i][j] * uselessnessMultiplier * pieceImportance) * sign
        }

        function pieceVal (piece) {
            if (piece == null) return 0;
            let base = 0

            switch (piece.type) {
                case 'p':
                    base = 1
                    break
                case 'n':
                    base = 3
                    break
                case 'b':
                    base = 3.3
                    break
                case 'r':
                    base = 5
                    break
                case 'q':
                    base = 9
                    break
                case 'k':
                    base = 90
                    break
            }

            let sign = 1

            if (piece.color === 'b') {
            } else {
                sign = -1
            }

            return base * sign
        }

        if (positional) {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    current += positionalVal(grid[i][j], i, j)
                }
            }
        } else {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    current += pieceVal(grid[i][j])
                }
            }
        }
        return current
    }

// update the board position after the piece snap
// for castling, en passant, pawn promotion

    function onSnapEnd0() {
        onSnapEnd(0)
    }
    function onSnapEnd1() {
        onSnapEnd(1)
    }
    function onSnapEnd2() {
        onSnapEnd(2)
    }
    function onSnapEnd3() {
        onSnapEnd(3)
    }

    const onSnapEndList = [onSnapEnd0, onSnapEnd1, onSnapEnd2, onSnapEnd3]

    function onSnapEnd(boardNumber) {
        const board = boardList[boardNumber]
        const game = gameList[boardNumber]
        board.position(game.fen())
    }

    function updateStatus(boardNumber) {
        var status = ''
        const game = gameList[boardNumber]
        const statusObj = statusList[boardNumber]
        const fenObj = fenList[boardNumber]
        const pgnObj = pgnList[boardNumber]

        var moveColor = 'White'

        if (game.turn() === 'b') {
            moveColor = 'Black'
        }

        // checkmate?
        if (game.in_checkmate()) {
            status = 'Game over, ' + moveColor + ' is in checkmate.'
        }

        // draw?
        else if (game.in_draw()) {
            status = 'Game over, drawn position'
        }

        // game still on
        else {
            status = moveColor + ' to move'

            // check?
            if (game.in_check()) {
                status += ', ' + moveColor + ' is in check'
            }
        }

        statusObj.html(status)
        fenObj.html(game.fen())
        pgnObj.html(game.pgn())
    }

    function config(boardNumber) {
        return {
            draggable: true,
            position: 'start',
            onDragStart: onDragStartList[boardNumber],
            onDrop: onDropList[boardNumber],
            onSnapEnd: onSnapEndList[boardNumber]
        }
    }

    function resetGame(boardNumber) {
        boardList[boardNumber].start()
        gameList[boardNumber].reset()
        updateStatus(boardNumber)
    }

    for (let i = 0; i < boardList.length; i++) {

        boardList[i] = new Chessboard("board" + i, config(i))
        $('#startBtn' + i).on('click', () => resetGame(i))
        updateStatus(i)
    }

}
$(document).ready(init)