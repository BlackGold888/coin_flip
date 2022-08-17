import React from 'react';

function Nav({ player, changeBet, rooms, createRoom }) {
    return (
        <div className="row game-nav">
            <input onChange={changeBet} type="number" className={'bet-input'} placeholder={ 'Bet input value' }/>
            <button className={ 'btn bet' } onClick={createRoom}>Create Room { player.bet }</button>
        </div>
    );
}

export default Nav;
