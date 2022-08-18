import React from 'react';
import './assets/room.css';
import coin_0 from './assets/img/0.png';
import coin_1 from './assets/img/1.png';

function Room({ player, opponent, socket, flip }) {

    const makeChoose = (choose) => {
        socket.send(JSON.stringify({ eventName: 'make.choose', payload: choose }))
    }

    return (
        <div id={ 'room-player' }>
            <div className="col-6 player1">
                <div className="player-info">
                    <span>{ player.name }</span>
                    <span>#{ player.id }</span>
                </div>
                { player.isReady ? (null) : (<div className="choose-buttons">
                    <button onClick={() => makeChoose(1)}>1 Орёл</button>
                    <button onClick={() => makeChoose(0)}>0 Решко</button>
                </div>) }
            </div>
            <div className="coin">
                <img src={flip ? coin_1 : coin_0} alt=""/>
            </div>
            { opponent ? (<div className="col-6 opponent">
                <div className="player-info">
                    <span>{ opponent }</span>
                </div>
            </div>) :  (<div className={'col-6 opponent'}>No opponent</div>) }
        </div>
    );
}

export default Room;
