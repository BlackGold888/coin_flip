import React, { useEffect, useState } from 'react';
import Header from './header';
import './assets/game.css';
import Nav from './nav';
import { Emitter } from '../../Emitter';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Room from './Room';

function GameArea({ player, setPlayer, socket }) {
    const navigate = useNavigate();
    const [start, setStart] = useState(false);
    const [online, setOnline] = useState(0);
    const [rooms, setRooms] = useState([]);
    const [emitter, setEmitter] = useState(new Emitter())

    const changeBet = (e) => setPlayer({ ...player, bet: e.target.value });
    const changeBalance = (balance) => setPlayer({ ...player, balance });

    const createRoom = () => {
        console.log(player.id);

        let newRoom = {
            id: player.id,
            bet: player.bet,
        };
        socket.send(JSON.stringify({ eventName: 'create.room', payload: newRoom }));
    };

    useEffect(() => {
        if (player.name == null) {
            navigate('/');
        }

        emitter.on('online.update', (data) => {
            console.log('Online update', JSON.parse(data));
            setOnline(JSON.parse(data));
        });

        emitter.on('update.rooms', (data) => {
            console.log('==========================');
            console.log(data);
            setRooms(data);
        });

        emitter.on('notify', (data) => {
            notify(data);
        });

        emitter.on('start.game', (data) => {
            startGame(data);
        });

        emitter.on('player.init', (data) => {
            playerInit(data);
        });

        emitter.on('player.register.fail', () => {
            navigate('/');
        });

    }, []);

    const playerInit = (data) => {
        setPlayer(data)
    }


    useEffect(() => {
        if (socket) {
            socket.onmessage = (message) => {
                console.log('Message', message);
                const parsed = JSON.parse(message.data);
                const { eventName, payload } = parsed;
                emitter.emit(eventName, payload);
            }

            socket.onopen = () => {
                console.log('Socket open');
                socket.send(JSON.stringify({ eventName: 'player.register', payload: player.name }));
            }

            socket.close = () => {
                console.log('Socket closed');
            }
        }
    }, [socket])

    const notify = ({ status, message }) => {
        if (status) {
            toast.success(message);
        } else {
            toast.error(message);
        }
    }

    const joinRoom = (id) => {
        socket.send(JSON.stringify({ eventName: 'join.room', payload: {roomId: id} }));
    }

    const renderJoinRoom = (room) => {
        if (room.players[0] !== player.name && !room.players[1]) {
            return (<button onClick={() => joinRoom(room.id)}>Join Room</button>);
        }else if(room.players[1] || room.players[1] == player.name){
            return (
                <>
                    <span className={ 'owner-name' }>Name { room.players[1] }</span>
                    <span className={ 'room-bet' }>Bet { room.bet }$</span>
                </>)
        }else{
            return (<button disabled>Wait player</button>);
        }
    };

    const startGame = (data) => {
        setStart(true);
    }

        if  (start) {
           return  <Room />
        }else{
            return (<div id={ 'game' }>
                <div className="container">
                    <Header
                        player={ player }
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
                            { rooms.length > 0 ? rooms.map((room, index) =>
                                <li key={ index } className={ 'rooms-item' }>
                                    <div className="owner">
                                        <span className={ 'owner-name' }>Name { room.players[0] }</span>
                                        <span className={ 'room-bet' }>Bet { room.bet }$</span>
                                    </div>
                                    <div className="room-logo"></div>
                                    <div className="enemy">
                                        {renderJoinRoom(room)}
                                    </div>
                                </li>) : <div className="no-rooms">No rooms { rooms.length} </div> }
                        </ul>
                    </div>
                </div>
            </div>)
        }

}

export default GameArea;
