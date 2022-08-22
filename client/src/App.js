import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './components/login/Login';
import GameArea from './components/game_area/GameArea';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const navigate = useNavigate();
    const [player, setPlayer] = useState({ name: null, balance: 0,bet: 0, id: 0, roomId: 0, room: null, isReady: false  });
    const [name, setName] = useState('');
    const [socket, setSocket] = useState(null);

    const changeName = (name) => setPlayer({ ...player, name });

    const login = async () => {
        if (player.name.length < 3) {
            alert('Name must be at least 3 characters');
            return;
        }

        setConnection();
        navigate('/game');
    };

    const setConnection = () => {
        setSocket(new WebSocket('ws://localhost:3002/'));
    }

    return (
        <div className="App">
            <Routes>>
                <Route path="/" element={ <Login login={ login } changeName={ changeName }/> }/>
                <Route path="/game" element={
                    <GameArea
                        player={ player }
                        socket={ socket }
                        setPlayer={ setPlayer }
                    />
                }/>
            </Routes>
            <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={false}
                theme={'dark'}
            />
        </div>
    );
}

export default App;
