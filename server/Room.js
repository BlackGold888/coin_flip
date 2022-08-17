export class Room {
    /**
     *
     * @param id - room id equals to player id
     * @param bet
     * @param handle - first handle who created room
     */
    constructor(id, bet, handle) {
        this.id = id;
        this.players = [handle];
        this.bet = bet;
        this.maxPlayers = 2;
    }
}
