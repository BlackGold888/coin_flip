import React, { useEffect, useState } from 'react';
import Header from './header';
import './assets/game.css';
import Nav from './nav';
import { emitter as Emitter } from '../../Emitter';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Room from './Room';

function GameArea({ player, setPlayer, socket }) {
    const navigate = useNavigate();
    const [start, setStart] = useState(false);
    const [online, setOnline] = useState(0);
    const [rooms, setRooms] = useState([]);

    const changeBet = (e) => setPlayer({ ...player, bet: e.target.value });
    const changeBalance = (balance) => setPlayer({ ...player, balance });

    const createRoom = () => {
        console.log(player.id);

        let newRoom = {
            id: player.id,
            bet: player.bet,
        };
        console.log(newRoom);
        socket.send(JSON.stringify({ eventName: 'create.room', payload: newRoom }));
    };

    useEffect(() => {
        if (player.name == null) {
            navigate('/');
        }

        Emitter.on('online.update', (data) => {
            console.log('Online update', JSON.parse(data));
            setOnline(JSON.parse(data));
        });

        Emitter.on('update.rooms', (data) => {
            setRooms(data);
        });

        Emitter.on('notify', (data) => {
            notify(data);
        });

        Emitter.on('start.game', (data) => {
            startGame(data);
        });

    }, []);


    useEffect(() => {
        if (socket) {
            socket.onmessage = (message) => {
                console.log('Message', message);
                const parsed = JSON.parse(message.data);
                const { eventName, payload } = parsed;
                Emitter.emit(eventName, payload);
            }

            socket.onopen = () => {
                console.log('Socket open');
                socket.send(JSON.stringify({ eventName: 'player.login', payload: player }));
            }

            socket.close = () => {
                console.log('Socket closed');
                socket.send(JSON.stringify({ eventName: 'player.logout', payload: player }));
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
        if (!room.players[1] && room.players[0].id !== player.id) {
            return (<button onClick={() => joinRoom(room.id)}>Join Room</button>);
        }else if(room.players[1]){
            return (
                <>
                    <span className={ 'owner-name' }>Name { room.players[1]?.name }</span>
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
                            { rooms.length > 0 ? rooms.map((room, index) =>
                                <li key={ index } className={ 'rooms-item' }>
                                    <div className="owner">
                                        <span className={ 'owner-name' }>Name { room.players[0]?.name }</span>
                                        <span className={ 'room-bet' }>Bet { room.bet }$</span>
                                    </div>
                                    <div className="room-logo"></div>
                                    <div className="enemy">
                                        {renderJoinRoom(room)}
                                    </div>
                                </li>) : <div className="no-rooms">No rooms</div> }
                        </ul>
                    </div>
                </div>
            </div>)
        }

}

export default GameArea;
