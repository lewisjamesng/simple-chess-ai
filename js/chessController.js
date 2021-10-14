function init () {

    let board0, board1, board2, board3
    board0 = board1 = board2 = board3 = null

    let game0, game1, game2, game3
    game0 = game1 = game2 = game3 = new Chess()
    const gameList = [game0, game1, game2, game3]

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

    let posCounter = 0

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
            }
            updateStatus(boardNumber)
        }
    }

    function useRandom(boardNumber) {
        const game = gameList[boardNumber]
        const moves = game.moves()
        game.move(moves[Math.floor(Math.random() * moves.length)])
    }

    function useMinMax(depth, color, boardNumber) {
        const game = gameList[boardNumber]

        const maxing = (color === 'w')
        posCounter = 0
        let bestMove = minMax(game, depth, maxing, true)
        game.move(bestMove)
    }

    function minMax(game, depth, maxing, root) {
        if (depth === 0) return evaluatePosition(game)

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

    // function alphaBeta(alpha, beta, dept, maxing, root) {
    //
    // }

    function evaluatePosition(game, positional) {
        const grid = game.board()
        let current = 0;

        function positionalVal (piece, i, j) {
            return 0
        }

        function pieceVal(piece) {
            if (piece === null) return 0
            var val;

            switch (piece.type) {
                case 'p':
                    val = 1
                    break
                case 'n':
                    val = 3
                    break
                case 'b':
                    val = 3.5
                    break
                case 'r':
                    val = 5
                    break
                case 'q':
                    val = 9
                    break
                case 'k':
                    val = 90
                    break
            }

            return val * (piece.color === "w" ? 1 : -1)
        }

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                current += pieceVal(grid[i][j]) + ((positional && grid[i][j] != null) ? positionalVal(grid[i][j], i, j) : 0)
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

    const fen = "1rb3kr/pp1p1p2/2p2B1p/8/4Q3/P4N2/1PP2PPP/nN2R1K1 w - - 4 23"

    function config(boardNumber) {
        return {
            draggable: true,
            position: fen,
            onDragStart: onDragStartList[boardNumber],
            onDrop: onDropList[boardNumber],
            onSnapEnd: onSnapEndList[boardNumber]
        }
    }

    board0 = Chessboard('board0', config(0))
    board1 = Chessboard('board1', config(1))
    // board2 = Chessboard('board2', config(2))
    // board3 = Chessboard('board3', config(3))

    const boardList = [board0, board1, board2, board3]

    $('#startBtn0').on('click', () => resetGame(0))
    $('#startBtn1').on('click', () => resetGame(1))
    // $('#startBtn2').on('click', board2.start)
    // $('#startBtn3').on('click', board3.start)



    function resetGame(boardNumber) {
        boardList[boardNumber].start()
        gameList[boardNumber].reset()
    }

    gameList[1].load(fen)

    updateStatus(0)
    updateStatus(1)
}
$(document).ready(init)