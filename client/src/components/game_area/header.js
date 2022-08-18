import React from 'react';

function Header({online, player }) {
    return (
        <div className="row header">
            <div className="game-header">
                Welcome to coin flip game, players online: { online }
            </div>
            <div className="player-info">
                <div className="player-name">
                    { player.name } # { player.id }
                </div>
                <div className="player-balance">
                    Balance: { player.balance }
                </div>
            </div>
        </div>
    );
}

export default Header;
