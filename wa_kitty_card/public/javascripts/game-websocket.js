(function($) {
  'use strict';

  let websocket = null;
  let sessionId = null;
  let playerId = null;
  let playerNumber = null;
  let isMyTurn = true;

  function initGameSession() {
    const urlParams = new URLSearchParams(window.location.search);
    
    sessionId = sessionStorage.getItem('sessionId') || urlParams.get('sessionId');
    playerId = sessionStorage.getItem('playerId') || urlParams.get('playerId');
    playerNumber = sessionStorage.getItem('playerNumber') || urlParams.get('playerNumber');
    
    if (sessionId && !sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', sessionId);
    }
    if (playerId && !sessionStorage.getItem('playerId')) {
      sessionStorage.setItem('playerId', playerId);
    }
    if (playerNumber && !sessionStorage.getItem('playerNumber')) {
      sessionStorage.setItem('playerNumber', playerNumber);
    }
    
    if (sessionId && playerId) {
      connectWebSocket();
      updateTurnIndicator();
      restoreGridPlayerAttributes();
    }
  }
  
  function restoreGridPlayerAttributes() {
    const gridState = localStorage.getItem(`grid_${sessionId}`);
    if (gridState) {
      try {
        const placements = JSON.parse(gridState);
        placements.forEach(placement => {
          const gridItem = document.querySelector(`.grid-item[data-card]:nth-child(${placement.y * 3 + placement.x + 1})`);
          if (gridItem && gridItem.classList.contains('card-placed')) {
            gridItem.setAttribute('data-player', placement.player);
          }
        });
      } catch (e) {
        console.error('[GameWebSocket] Failed to restore grid state:', e);
      }
    }
  }
  
  function saveGridPlacement(x, y, player) {
    const gridState = localStorage.getItem(`grid_${sessionId}`);
    let placements = gridState ? JSON.parse(gridState) : [];
    placements = placements.filter(p => !(p.x === x && p.y === y));
    placements.push({ x, y, player });
    localStorage.setItem(`grid_${sessionId}`, JSON.stringify(placements));
  }

  function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${sessionId}/${playerId}`;
    
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = function() {
    };
    
    websocket.onmessage = function(event) {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    
    websocket.onerror = function(error) {
      console.error('WebSocket error:', error);
    };
    
    websocket.onclose = function() {
      setTimeout(connectWebSocket, 3000);
    };
  }

  function handleWebSocketMessage(data) {
    // Check if game is over and redirect
    if (data.gameOver) {
      window.location.href = '/gameOver';
      return;
    }
    
    if (data.action) {
      if (data.state && window.updatePlayerState) {
        window.updatePlayerState(data.state);
      }
      if (data.grid && window.updateGrid) {
        window.updateGrid(data.grid);
      }
      
      switch(data.action) {
        case 'placeCard':
          if (data.placedAt) {
            updateGridCell(data.placedAt.x, data.placedAt.y, data);
          }
          isMyTurn = true;
          break;
        case 'drawCard':
          if (data.hand && window.updateHand) {
            window.updateHand(data.hand, playerNumber);
          }
          isMyTurn = true;
          break;
        case 'undo':
        case 'redo':
          location.reload();
          break;
      }
      
      // Update hand if provided - use action-specific player number
      if (data.hand && window.updateHand) {
        // For opponent broadcasts, this is THEIR updated hand
        window.updateHand(data.hand, null); // null = update regardless of player check
      }
      
      if (data.state && data.state.length > 0) {
        updateTurnIndicator(data.state[0]);
      }
    }
    
    if (data.type === 'player-joined' || data.type === 'player-left') {
    }
  }

  function updateGridCell(x, y, data) {
    const $grid = $(`.grid-item`).filter(function() {
      const coords = $(this).find('.text-muted div').first().text();
      const match = coords.match(/\((\d+),\s*(\d+)\)/);
      return match && parseInt(match[1]) === x && parseInt(match[2]) === y;
    });
    
    if ($grid.length > 0 && data.grid) {
      const gridCell = data.grid.find(cell => cell.x === x && cell.y === y);
      if (gridCell) {
        $grid.addClass('card-placed has-card').data('card', gridCell.card);
        if (data.placedByPlayer) {
          $grid.attr('data-player', data.placedByPlayer);
          saveGridPlacement(x, y, data.placedByPlayer);
        }
        const coords = $grid.find('.text-muted div').first().text();
        $grid.find('.text-muted').html(`<div>${coords}</div><div class="fw-bold">${gridCell.card}</div>`);
      }
    }
  }

  function updateTurnIndicator(currentPlayerName) {
    if (!currentPlayerName) {
      const cardBodies = $('.card-body');
      cardBodies.each(function() {
        const text = $(this).text();
        if (text.includes('Current Player:')) {
          currentPlayerName = text.replace('Current Player:', '').trim();
        }
      });
      
      if (!currentPlayerName) return;
    }
    
    let turnIndicator = $('#turn-indicator');
    if (turnIndicator.length === 0) {
      $('body').prepend('<div id="turn-indicator"></div>');
      turnIndicator = $('#turn-indicator');
    }
    
    const cardBodies = $('.card-body');
    let player1Name = '';
    let player2Name = '';
    
    cardBodies.each(function() {
      const text = $(this).text();
      if (text.includes('Player 1:')) {
        player1Name = text.replace('Player 1:', '').trim();
      } else if (text.includes('Player 2:')) {
        player2Name = text.replace('Player 2:', '').trim();
      }
    });
    
    const myPlayerNumber = parseInt(playerNumber);
    const myName = myPlayerNumber === 1 ? player1Name : player2Name;
    
    isMyTurn = (currentPlayerName === myName);
    
    if (isMyTurn) {
      turnIndicator.text('Your Turn!').removeClass('not-your-turn').addClass('your-turn');
      $('.card-container').removeClass('disabled');
    } else {
      turnIndicator.text('Opponent\'s Turn').removeClass('your-turn').addClass('not-your-turn');
      $('.card-container').addClass('disabled');
    }
    
    turnIndicator.show();
  }

  function showTurnWarning() {
    const warning = $('<div class="turn-warning">It\'s not your turn!</div>');
    $('body').append(warning);
    warning.fadeIn(200);
    setTimeout(() => {
      warning.fadeOut(200, function() { $(this).remove(); });
    }, 2000);
  }

  function getSessionInfo() {
    return {
      sessionId: sessionId,
      playerId: playerId,
      playerNumber: playerNumber,
      isMyTurn: isMyTurn
    };
  }

  function setTurnState(myTurn) {
    isMyTurn = myTurn;
  }

  let isDrawing = false;

  function drawCard() {
    if (isDrawing) {
      return;
    }

    if (!isMyTurn) {
      showTurnWarning();
      return;
    }

    if (!sessionId || !playerId) {
      alert('Session not initialized');
      return;
    }

    isDrawing = true;
    const drawBtn = document.getElementById('draw-btn');
    if (drawBtn) drawBtn.disabled = true;

    fetch('/draw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sessionId: sessionId,
        playerId: playerId
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.gameOver) {
        window.location.href = '/gameOver';
      } else if (data.success) {
        if (data.hand && window.updateHand) {
          window.updateHand(data.hand, playerNumber);
        }
        setTurnState(false);
        if (data.state && data.state.length > 0) {
          updateTurnIndicator(data.state[0]);
        }
      } else if (data.message) {
        alert(data.message);
      }
    })
    .catch(err => {
      console.error('Error drawing card:', err);
      alert('Failed to draw card: ' + err.message);
    })
    .finally(() => {
      isDrawing = false;
      const drawBtn = document.getElementById('draw-btn');
      if (drawBtn) drawBtn.disabled = false;
    });
  }

  window.GameWebSocket = {
    initGameSession: initGameSession,
    connectWebSocket: connectWebSocket,
    updateTurnIndicator: updateTurnIndicator,
    showTurnWarning: showTurnWarning,
    getSessionInfo: getSessionInfo,
    setTurnState: setTurnState,
    drawCard: drawCard,
    saveGridPlacement: saveGridPlacement
  };

})(jQuery);
