import React from 'react';
import './assets/login.css';

function Login({ changeName, login }) {
    return (
        <div id={'login'}>
            <label htmlFor="">Enter your name</label>
            <input type={'text'} onChange={(e) => changeName(e.target.value)} />
            <button className={'btn start'} onClick={login}>Start</button>
        </div>
    );
}

export default Login;
