(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    // Mode switching
    const localModeBtn = document.getElementById('local-mode-btn');
    const onlineModeBtn = document.getElementById('online-mode-btn');
    const localForm = document.getElementById('local-form');
    const onlineForm = document.getElementById('online-form');

    if (localModeBtn && onlineModeBtn) {
      localModeBtn.addEventListener('click', function() {
        localModeBtn.classList.add('active');
        onlineModeBtn.classList.remove('active');
        localForm.style.display = 'block';
        onlineForm.style.display = 'none';
        localStorage.setItem('gameMode', 'local');
      });

      onlineModeBtn.addEventListener('click', function() {
        onlineModeBtn.classList.add('active');
        localModeBtn.classList.remove('active');
        onlineForm.style.display = 'block';
        localForm.style.display = 'none';
        localStorage.setItem('gameMode', 'online');
      });
    }

    // Local multiplayer form
    const form = document.getElementById('player-names-form');
    if (form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();

        const player1Name = document.getElementById('player1Name').value;
        const player2Name = document.getElementById('player2Name').value;

        localStorage.setItem('gameMode', 'local');
        localStorage.removeItem('playerNumber');
        localStorage.removeItem('gameId');

        fetch(form.dataset.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player1Name: player1Name, player2Name: player2Name })
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'OK' && data.redirect) {
            window.location.href = data.redirect;
          }
        });
      });
    }

    // Online multiplayer - Create Game
    const createGameBtn = document.getElementById('create-game-btn');
    const shareLinkContainer = document.getElementById('share-link-container');
    const shareLink = document.getElementById('share-link');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const statusDiv = document.getElementById('connection-status');

    if (createGameBtn) {
      createGameBtn.addEventListener('click', async function() {
        const playerName = document.getElementById('onlinePlayerName').value;
        if (!playerName) {
          showStatus('Please enter your name', 'error');
          return;
        }

        try {
          const response = await fetch('/game/create');
          const data = await response.json();

          if (data.gameId) {
            localStorage.setItem('gameId', data.gameId);
            localStorage.setItem('playerNumber', '1');
            localStorage.setItem('playerName', playerName);
            localStorage.setItem('gameMode', 'online');

            shareLink.textContent = data.gameId;
            shareLinkContainer.style.display = 'block';
            createGameBtn.disabled = true;

            connectToGame(data.gameId, playerName);
            showStatus('Game created! Share the Game ID with your friend.', 'success');
          }
        } catch (error) {
          showStatus('Failed to create game', 'error');
        }
      });
    }

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', function() {
        const gameId = shareLink.textContent;
        navigator.clipboard.writeText(gameId).then(() => {
          copyLinkBtn.textContent = 'Copied!';
          setTimeout(() => { copyLinkBtn.textContent = 'Copy ID'; }, 2000);
        });
      });
    }

    // Online multiplayer - Join Game
    const joinGameBtn = document.getElementById('join-game-btn');
    const gameIdInput = document.getElementById('game-id-input');

    if (joinGameBtn) {
      joinGameBtn.addEventListener('click', async function() {
        const playerName = document.getElementById('joinPlayerName').value;
        const gameId = gameIdInput.value.trim();

        if (!playerName) {
          showStatus('Please enter your name', 'error');
          return;
        }
        if (!gameId) {
          showStatus('Please enter a Game ID', 'error');
          return;
        }

        try {
          const response = await fetch(`/game/${gameId}/join`);
          if (!response.ok) {
            const errorText = await response.text();
            showStatus(errorText || 'Cannot join game', 'error');
            return;
          }

          const data = await response.json();
          localStorage.setItem('gameId', gameId);
          localStorage.setItem('playerName', playerName);
          localStorage.setItem('gameMode', 'online');

          joinGameBtn.disabled = true;
          connectToGame(gameId, playerName);
          showStatus('Connecting to game...', 'success');
        } catch (error) {
          showStatus('Failed to join game', 'error');
        }
      });
    }

    function connectToGame(gameId, playerName) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/game/${gameId}/ws`);

      ws.onopen = () => {
        console.log('[WebSocket] Connected to game');
        showStatus('Connected! Waiting for opponent...', 'success');
        
        // Send player name to server immediately
        console.log('[WebSocket] Sending playerInfo with name:', playerName);
        ws.send(JSON.stringify({
          type: 'playerInfo',
          playerName: playerName
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Received:', data);

        switch (data.type) {
          case 'playerAssigned':
            localStorage.setItem('playerNumber', data.playerNumber);
            showStatus(`You are Player ${data.playerNumber}. Waiting for opponent...`, 'success');
            break;

          case 'playerJoined':
            showStatus(`Player ${data.playerNumber} joined!`, 'success');
            const waitingMsg = document.getElementById('waiting-message');
            if (waitingMsg) {
              waitingMsg.textContent = 'Opponent connected! Game starting soon...';
            }
            break;

          case 'playerInfoUpdate':
            console.log(`[WebSocket] Player ${data.playerNumber} is named: ${data.playerName}`);
            if (data.playerNumber !== parseInt(localStorage.getItem('playerNumber'))) {
              localStorage.setItem('opponentName', data.playerName);
            }
            break;

          case 'requestPlayerNames':
            // Server is requesting names - resend our name to trigger game start
            console.log('[WebSocket] Server requested player names, resending...');
            ws.send(JSON.stringify({
              type: 'playerInfo',
              playerName: playerName
            }));
            break;

          case 'gameStart':
            // Server started the game - redirect to game view with player number
            console.log('[WebSocket] Game started! Redirecting to game...');
            showStatus('Game starting! Redirecting...', 'success');
            
            // Get player number and redirect with it as query param
            const myNumber = localStorage.getItem('playerNumber');
            setTimeout(() => {
              window.location.href = `/combinedView?playerNumber=${myNumber}`;
            }, 500);
            break;

          case 'playerLeft':
            showStatus('Your opponent has disconnected.', 'error');
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        showStatus('Connection error', 'error');
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
      };

      window.gameSocket = ws;
    }

    function showStatus(message, type) {
      if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = 'status-message ' + type;
        statusDiv.style.display = 'block';
      }
    }
  });
})();
