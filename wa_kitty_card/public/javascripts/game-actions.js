(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const drawBtn = document.getElementById('draw-btn');

    // Check if we're in online mode
    const isOnlineMode = localStorage.getItem('gameMode') === 'online';
    // Use server-assigned player number if available, fallback to localStorage
    const serverPlayerNumber = window.serverPlayerNumber || 0;
    const playerNumber = serverPlayerNumber > 0 ? serverPlayerNumber.toString() : localStorage.getItem('playerNumber');
    const gameId = localStorage.getItem('gameId');
    
    // Store the resolved player number in localStorage and window
    if (serverPlayerNumber > 0) {
      localStorage.setItem('playerNumber', serverPlayerNumber.toString());
    }
    window.myPlayerNumber = parseInt(playerNumber) || 0;
    
    console.log('[game-actions] Player number:', window.myPlayerNumber, 'Online mode:', isOnlineMode);

    // Reconnect to WebSocket if in online mode
    if (isOnlineMode && gameId) {
      connectToGame(gameId);
    }

    if (undoBtn) {
      undoBtn.addEventListener('click', function() {
        performAction('/undo', undoBtn);
      });
    }

    if (redoBtn) {
      redoBtn.addEventListener('click', function() {
        performAction('/redo', redoBtn);
      });
    }

    if (drawBtn) {
      drawBtn.addEventListener('click', function() {
        performAction('/draw', drawBtn);
      });
    }

    function performAction(url, button) {
      // Check if it's my turn in online mode
      const isOnline = localStorage.getItem('gameMode') === 'online';
      if (isOnline) {
        // We'll let the server validate whose turn it is
        console.log('[performAction] Online mode, player:', playerNumber);
      }
      
      button.disabled = true;
      const originalText = button.querySelector('.button-text').textContent;
      button.querySelector('.button-text').textContent = 'Loading...';

      // Add player number as query param for online mode - ALWAYS include it
      const actionUrl = playerNumber ? `${url}?playerNumber=${playerNumber}` : url;

      fetch(actionUrl, { method: 'POST', headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          updateGameState(data);
          // In online mode, broadcast the action to opponent
          if (isOnlineMode && window.gameSocket) {
            window.gameSocket.send(JSON.stringify({
              type: 'gameAction',
              action: url,
              playerNumber: playerNumber,
              state: data
            }));
          }
        }
      })
      .finally(() => {
        button.disabled = false;
        button.querySelector('.button-text').textContent = originalText;
      });
    }

    function updateGameState(data) {
      if (data.state) updatePlayerState(data.state);
      if (data.grid) updateGrid(data.grid);
      // Only update hand if the response is for this player
      // Check if playerNumber in response matches our session player number
      const myNumber = window.myPlayerNumber || parseInt(localStorage.getItem('playerNumber')) || 0;
      const responsePlayerNumber = data.playerNumber || 0;
      
      console.log('[updateGameState] My player:', myNumber, 'Response player:', responsePlayerNumber);
      
      // Update hand if it's our own data (playerNumber matches or not specified)
      if (data.hand && (responsePlayerNumber === 0 || responsePlayerNumber === myNumber)) {
        console.log('[updateGameState] Updating hand for player', myNumber);
        updateHand(data.hand);
      } else if (data.hand) {
        console.log('[updateGameState] Skipping hand update - not my data');
      }
    }

    window.updateGameStateFromAjax = updateGameState;

    function updatePlayerState(state) {
      if (!state || state.length < 3) return;
      const cardBodies = document.querySelectorAll('.player-state-card .card-body');
      if (cardBodies.length >= 3) {
        cardBodies[0].textContent = `Player 1: ${state[1]}`;
        cardBodies[1].textContent = `Player 2: ${state[2]}`;
        cardBodies[2].textContent = `Current Player: ${state[0]}`;
      }
    }

    function updateGrid(gridData) {
      gridData.forEach(cell => {
        const gridItem = document.querySelector(`.grid-item[data-card]:nth-child(${cell.y * 3 + cell.x + 1})`);
        if (gridItem) {
          gridItem.setAttribute('data-card', cell.card);
          gridItem.setAttribute('data-suit', cell.suit);
          gridItem.style.setProperty('--card-color', cell.color);
          const textDiv = gridItem.querySelector('.text-muted');
          if (textDiv) textDiv.innerHTML = `<div>(${cell.x}, ${cell.y})</div><div>${cell.card}</div>`;
          gridItem.classList.toggle('card-placed', cell.card !== 'Empty');
        }
      });
    }

    function updateHand(hand) {
      const handSection = document.querySelector('.player-hand-section .player-hand-row');
      if (!handSection) return;
      handSection.innerHTML = '';
      hand.forEach((card, index) => {
        const parts = card.split(' of ');
        const valueMap = { 'One': '1', 'Two': '2', 'Three': '3', 'Four': '4', 'Five': '5', 'Six': '6', 'Seven': '7' };
        const colorMap = { 'Blue': 'Blau', 'Brown': 'Braun', 'Green': 'Grün', 'Purple': 'Lila', 'Red': 'Rot' };
        const value = valueMap[parts[0]] || '1';
        const color = colorMap[parts[1]] || 'Blau';
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        cardContainer.setAttribute('data-card-index', index);
        cardContainer.innerHTML = `<div class="card-display"><img src="/assets/images/cards/${value}/${value}-${color}.png" alt="${card}" class="card-image" /><div class="card-label">${card}</div></div>`;
        handSection.appendChild(cardContainer);
      });
      if (window.initCardPlacement) window.initCardPlacement();
    }

    function connectToGame(gameId) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/game/${gameId}/ws`);

      ws.onopen = () => {
        console.log('Connected to game session');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Game message:', data);

        switch (data.type) {
          case 'playerAssigned':
            localStorage.setItem('playerNumber', data.playerNumber);
            break;

          case 'gameAction':
            // Opponent performed an action - only update grid and state, NOT hand
            if (data.playerNumber !== playerNumber && data.state) {
              if (data.state.state) updatePlayerState(data.state.state);
              if (data.state.grid) updateGrid(data.state.grid);
              // DO NOT update hand - players only see their own cards
            }
            break;

          case 'cardPlayed':
            // Opponent played a card - update grid only
            if (data.playerNumber !== playerNumber) {
              // Refresh grid from server
              refreshGridOnly();
            }
            break;

          case 'turnChanged':
            // Update current player indicator
            if (data.currentPlayer) {
              updateCurrentPlayerIndicator(data.currentPlayer);
            }
            break;

          case 'playerLeft':
            alert('Your opponent has disconnected.');
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Disconnected from game');
      };

      window.gameSocket = ws;
    }

    // Function to refresh only the grid (not hands)
    async function refreshGridOnly() {
      try {
        const response = await fetch('/gridColors');
        // The response updates the grid display
        // This is handled by the page refresh or AJAX update
      } catch (error) {
        console.error('Failed to refresh grid:', error);
      }
    }

    function updateCurrentPlayerIndicator(currentPlayer) {
      const cardBodies = document.querySelectorAll('.player-state-card .card-body');
      if (cardBodies.length >= 3) {
        cardBodies[2].textContent = `Current Player: ${currentPlayer}`;
      }
    }

    // Expose function to send card placement to opponent
    window.broadcastCardPlacement = function(cardIndex, x, y) {
      if (isOnlineMode && window.gameSocket) {
        window.gameSocket.send(JSON.stringify({
          type: 'cardPlayed',
          cardIndex: cardIndex,
          x: x,
          y: y,
          playerNumber: playerNumber
        }));
      }
    };
  });
})();
