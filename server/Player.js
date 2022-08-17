export class Player {

    /**
     *
     * @param name
     * @param balance
     * @param bet
     * @param id
     */
    constructor(name, balance, bet, id) {
        this.name = name;
        this.balance = balance;
        this.bet = bet;
        this.id = id;
        this.roomId = null;
        this.room = null;
    }
}
