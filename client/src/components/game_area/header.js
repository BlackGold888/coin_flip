import React from 'react';

function Header({name, balance, online }) {
    return (
        <div className="row header">
            <div className="game-header">
                Welcome to coin flip game, players online: {online}
            </div>
            <div className="player-info">
                <div className="player-name">
                    { name }
                </div>
                <div className="player-balance">
                    Balance: { balance }
                </div>
            </div>
        </div>
    );
}

export default Header;
