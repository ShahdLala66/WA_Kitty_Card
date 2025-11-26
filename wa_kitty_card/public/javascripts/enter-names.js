(function() {
  'use strict';

  //nochmal überprüfen ob legal 
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
    
    // Toggle between create and join forms
    createGameBtn.addEventListener('click', function() {
      createGameBtn.classList.add('active');
      joinGameBtn.classList.remove('active');
      createGameForm.style.display = 'block';
      joinGameForm.style.display = 'none';
      errorMessage.style.display = 'none';
    });
    
    joinGameBtn.addEventListener('click', function() {
      joinGameBtn.classList.add('active');
      createGameBtn.classList.remove('active');
      joinGameForm.style.display = 'block';
      createGameForm.style.display = 'none';
      errorMessage.style.display = 'none';
    });
    
    // Create game
    createForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const playerName = document.getElementById('create-player-name').value;
      
      fetch('/createGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK') {
          sessionId = data.sessionId;
          playerId = data.playerId;
          playerNumber = data.playerNumber;
          
          // Store in sessionStorage
          sessionStorage.setItem('sessionId', sessionId);
          sessionStorage.setItem('playerId', playerId);
          sessionStorage.setItem('playerNumber', playerNumber);
          
          // Show waiting room
          createForm.style.display = 'none';
          waitingRoom.style.display = 'block';
          gameIdInput.value = sessionId;
          
          // Connect to WebSocket
          connectWebSocket();
        } else {
          showError('Failed to create game. Please try again.');
        }
      })
      .catch(err => {
        showError('Error creating game: ' + err.message);
      });
    });
    
    // Join game
    joinForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const gameId = document.getElementById('join-game-id').value.trim().toUpperCase();
      const playerName = document.getElementById('join-player-name').value;
      
      fetch('/joinGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: gameId, playerName: playerName })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK') {
          sessionId = data.sessionId;
          playerId = data.playerId;
          playerNumber = data.playerNumber;
          
          // Store in sessionStorage
          sessionStorage.setItem('sessionId', sessionId);
          sessionStorage.setItem('playerId', playerId);
          sessionStorage.setItem('playerNumber', playerNumber);
          
          // Connect to WebSocket and redirect
          connectWebSocket();
          
          // Game should start automatically, redirect to game view with session info
          setTimeout(() => {
            window.location.href = `/combinedView?sessionId=${sessionId}&playerId=${playerId}&playerNumber=${playerNumber}`;
          }, 500);
        } else {
          showError(data.message || 'Failed to join game. Please check the Game ID.');
        }
      })
      .catch(err => {
        showError('Error joining game: ' + err.message);
      });
    });
    
    // Copy game ID
    copyGameIdBtn.addEventListener('click', function() {
      gameIdInput.select();
      document.execCommand('copy');
      copyGameIdBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyGameIdBtn.textContent = 'Copy ID';
      }, 2000);
    });
    
    function connectWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/${sessionId}/${playerId}`;
      
      websocket = new WebSocket(wsUrl);
      
      websocket.onopen = function() {
        console.log('WebSocket connected');
      };
      
      websocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.type === 'player-joined') {
          console.log('Player joined:', data.playerId);
          // If we're waiting and player 2 joined, redirect to game
          if (waitingRoom.style.display !== 'none') {
            window.location.href = `/combinedView?sessionId=${sessionId}&playerId=${playerId}&playerNumber=${playerNumber}`;
          }
        }
      };
      
      websocket.onerror = function(error) {
        console.error('WebSocket error:', error);
      };
      
      websocket.onclose = function() {
        console.log('WebSocket closed');
      };
    }
    
    function showError(message) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    }
  });
})();
