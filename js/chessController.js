function init () {

    var board = null
    var game = new Chess()
    var $status = $('#status')
    var $fen = $('#fen')
    var $pgn = $('#pgn')

    function onDragStart(source, piece, position, orientation) {
        // do not pick up pieces if the game is over
        if (game.game_over()) return false

        // only pick up pieces for the side to move
        if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false
        }
    }

    function onDrop(source, target) {
        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) return 'snapback'

        updateStatus()

        makeRandomMove();
    }

    function makeRandomMove() {
        const moves = game.moves()
        game.move(moves[Math.floor(Math.random() * moves.length)])
        updateStatus()
    }

    // function makeBestMove(depth) {
    //     var bestMove = findBestMove(depth, true)
    //     game.move(bestMove)
    //     updateStatus()
    // }
    //
    // function findBestMove(depth, maxing) {
    //
    //
    // }
    //
    // function minMax(depth, maxing) {
    //     if (depth === 0) return evaluatePosition()
    // }

    // function evaluatePosition() {
    //     const grid = game.board()
    //
    //     let current = 0;
    //
    //     for (let i = 0; i < 8; i++) {
    //         for (let j = 0; j < 8; j++) {
    //             current += pieceVal(board[i][j])
    //         }
    //     }
    //
    //     return current
    // }
    //
    // function pieceVal(piece) {
    //     if (piece === null) return 0
    //     var val;
    //
    //     switch (piece.type) {
    //         case 'p':
    //             val = 1
    //         case 'n':
    //             val = 3
    //         case 'b':
    //             val = 3.5
    //         case 'r':
    //             val = 5
    //         case 'q':
    //             val = 9
    //         case 'k':
    //             val = 999
    //     }
    //
    //     return val * (piece.color === "w" ? 1 : -1)
    // }

// update the board position after the piece snap
// for castling, en passant, pawn promotion
    function onSnapEnd() {
        board.position(game.fen())
    }

    function updateStatus() {
        var status = ''

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

        $status.html(status)
        $fen.html(game.fen())
        $pgn.html(game.pgn())
    }

    var config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    }

    board = Chessboard('board', config)

    $('#startBtn').on('click', board.start)
    $('#clearBtn').on('click', board.clear)

    updateStatus()
}
$(document).ready(init)