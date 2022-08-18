export class Room {
    /**
     *
     * @param id - room id equals to player id
     * @param bet
     * @param player - first player name who created room
     */
    constructor(id, bet, player) {
        this.id = id;
        this.players = [player];
        this.bet = bet;
        this.maxPlayers = 2;
        this.choose = {};
    }

    /**
     *
     * @param name
     * @param choose
     * @returns {null|number}
     */
    setChoose = (name, choose) => {
        this.choose[name] = choose;
        if (Object.keys(this.choose).length == this.maxPlayers) {
            let winner = this.getWinner();
            return winner;
        }
        return null;
    }

    getWinner = () => {
        let winnerNum = Math.floor(Math.random() * this.maxPlayers);

        // if 0 - player1 win
        // if 1 - player2 win
        // if 2 - no winners
        let winner = 2;

        const [player1, player2] = this.players;
        if (this.choose[player1] == winnerNum) {
            winner = 0
        }

        if (this.choose[player2] == winnerNum) {
            winner = 1
        }

        if (this.choose[player1] == this.choose[player2]) {
            winner = 2
        }

        return winner;
    }
}
