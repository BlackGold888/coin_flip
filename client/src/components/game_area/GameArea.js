import React from 'react';
import Header from './header';
import './assets/game.css';
import Nav from './nav';

function GameArea({ player, changeBet, rooms, createRoom, online }) {
    return (
        <div id={ 'game' }>
            <div className="container">
                <Header
                    name={ player.name }
                    balance={ player.balance }
                    online={ online }
                />
                <Nav
                    player={ player }
                    changeBet={ changeBet }
                    rooms={ rooms }
                    createRoom={ createRoom }
                />
                <div className="row rooms">
                    <ul className={ 'rooms-list' }>
                        { rooms.length > 0 ? rooms.map((room, index) => <li key={ index } className={ 'rooms-item' }>
                            <div className="owner">
                                <span className={ 'owner-name' }>Name { room.players[0]?.name }</span>
                                <span className={ 'room-bet' }>Bet { room.bet }$</span>
                            </div>
                            <div className="room-logo"></div>
                            <div className="enemy">
                                <span className={ 'enemy-name' }>{ room.players[1] ? room.players[1].name :
                                    <button>Join Room</button> }</span>
                            </div>
                        </li>) : <div className="no-rooms">No rooms</div> }
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default GameArea;
