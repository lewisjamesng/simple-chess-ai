# simple-chess-ai
A simple chess AI using chess.js and chessboard.js for move generation and visualisation

Implementation order:
1. Implemented random movement
2. Implemented a minMax full tree search
3. Implemented alpha-beta pruning on the minMax tree
4. Improved the evaluation function to take into account the position of the pieces

The final iteration uses the matrices found in pos_val_white.txt, adds the corresponding value multiplied by 
the positional coefficient (I used 0.1) and then added it to the previous evaluation.

Libraries used:
* chess.js        -->  https://github.com/jhlywa/chess.js/blob/master/README.md
* chessboard.js   -->  https://chessboardjs.com/
