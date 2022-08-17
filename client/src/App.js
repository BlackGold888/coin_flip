import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './components/login/Login';
import GameArea from './components/game_area/GameArea';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emitter as Emitter } from './Emitter';
import { GameSocket } from './GameSocket';

function App() {
    const navigate = useNavigate();
    const [online, setOnline] = useState(0);
    const [player, setPlayer] = useState({ name: '', balance: 0, id: 0, roomId: 0, bet: 0 });
    const [rooms, setRooms] = useState([]);
    const [socket, setSocket] = useState(new GameSocket('ws://localhost:3000'));

    const changeBet = (e) => setPlayer({ ...player, bet: e.target.value });
    const changeName = (name) => setPlayer({ ...player, name });
    const changeBalance = (balance) => setPlayer({ ...player, balance });
    const changeRoomId = (roomId) => setPlayer({ ...player, roomId });
    const changeId = (id) => setPlayer({ ...player, id });

    const createRoom = () => {
        const isRoomExist = rooms.find(room => room.id === player.id);

        if (isRoomExist) {
            alert('You are already in room');
            return;
        }

        let newRoom = {
            id: player.id,
            bet: player.bet,
            players: [player],
            maxPlayers: 2
        }
        console.log(newRoom);
        //TODO add update rooms via socket
        setRooms([...rooms, newRoom]);
    }

    const login = () => {
        changeBalance(100);
        localStorage.setItem('player', JSON.stringify(player));
        navigate('/game');
    };

    useEffect(() => {
        Emitter.on('online.update', (data) => {
            console.log('Online update', JSON.parse(data));
        });
    }, []);

    return (
        <div className="App">
            <Routes>>
                <Route path="/" element={ <Login login={ login } changeName={ changeName }/> }/>
                <Route path="/game" element={
                    <GameArea
                        online={ online }
                        player={ player }
                        rooms={rooms}
                        changeBet={changeBet}
                        createRoom={createRoom}
                    />
                }/>
            </Routes>
        </div>
    );
}

export default App;
