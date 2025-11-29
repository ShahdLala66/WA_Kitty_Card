(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const createGameBtn = document.getElementById('create-game-btn');
    const joinGameBtn = document.getElementById('join-game-btn');
    const createGameForm = document.getElementById('create-game-form');
    const joinGameForm = document.getElementById('join-game-form');
    const createForm = document.getElementById('create-form');
    const joinForm = document.getElementById('join-form');
    const waitingRoom = document.getElementById('waiting-room');
    const gameIdInput = document.getElementById('game-id-input');
    const copyGameIdBtn = document.getElementById('copy-game-id-btn');
    const errorMessage = document.getElementById('error-message');
    
    let sessionId = null;
    let playerId = null;
    let playerNumber = null;
    let websocket = null;
    
    const toggleForms = (showCreate) => {
      createGameBtn.classList.toggle('active', showCreate);
      joinGameBtn.classList.toggle('active', !showCreate);
      createGameForm.style.display = showCreate ? 'block' : 'none';
      joinGameForm.style.display = showCreate ? 'none' : 'block';
      errorMessage.style.display = 'none';
    };
    
    createGameBtn.addEventListener('click', () => toggleForms(true));
    joinGameBtn.addEventListener('click', () => toggleForms(false));
    
    createForm.addEventListener('submit', (e) => {
      e.preventDefault();
      fetch('/createGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: document.getElementById('create-player-name').value })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status !== 'OK') return showError('Failed to create game. Please try again.');
        
        ({ sessionId, playerId, playerNumber } = data);
        sessionStorage.setItem('sessionId', sessionId);
        sessionStorage.setItem('playerId', playerId);
        sessionStorage.setItem('playerNumber', playerNumber);
        
        createForm.style.display = 'none';
        waitingRoom.style.display = 'block';
        gameIdInput.value = sessionId;
        connectWebSocket();
      })
      .catch(err => showError('Error creating game: ' + err.message));
    });
    
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const gameId = document.getElementById('join-game-id').value.trim().toUpperCase();
      const playerName = document.getElementById('join-player-name').value;
      
      fetch('/joinGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: gameId, playerName })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status !== 'OK') return showError(data.message || 'Failed to join game. Please check the Game ID.');
        
        ({ sessionId, playerId, playerNumber } = data);
        sessionStorage.setItem('sessionId', sessionId);
        sessionStorage.setItem('playerId', playerId);
        sessionStorage.setItem('playerNumber', playerNumber);
        
        connectWebSocket();
        setTimeout(() => window.location.href = `/combinedView?sessionId=${sessionId}&playerId=${playerId}&playerNumber=${playerNumber}`, 500);
      })
      .catch(err => showError('Error joining game: ' + err.message));
    });
    
    copyGameIdBtn.addEventListener('click', () => {
      gameIdInput.select();
      document.execCommand('copy');
      copyGameIdBtn.textContent = 'Copied!';
      setTimeout(() => copyGameIdBtn.textContent = 'Copy ID', 2000);
    });
    
    function connectWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      websocket = new WebSocket(`${protocol}//${window.location.host}/ws/${sessionId}/${playerId}`);
      
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'player-joined' && waitingRoom.style.display !== 'none') {
          window.location.href = `/combinedView?sessionId=${sessionId}&playerId=${playerId}&playerNumber=${playerNumber}`;
        }
      };
    }
    
    const showError = (message) => {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    };
  });
})();
