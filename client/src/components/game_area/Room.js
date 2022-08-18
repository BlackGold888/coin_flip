import React from 'react';
import './assets/room.css';


function Room({ player, opponent, socket }) {

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
                    <button onClick={() => makeChoose(1)}>1</button>
                    <button onClick={() => makeChoose(0)}>0</button>
                </div>) }
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
