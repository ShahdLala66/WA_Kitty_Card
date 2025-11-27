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
    
    if (sessionId) sessionStorage.setItem('sessionId', sessionId);
    if (playerId) sessionStorage.setItem('playerId', playerId);
    if (playerNumber) sessionStorage.setItem('playerNumber', playerNumber);
    
    if (sessionId && playerId) {
      connectWebSocket();
      updateTurnIndicator();
      restoreGridPlayerAttributes();
    }
  }
  
  function restoreGridPlayerAttributes() {
    const gridState = localStorage.getItem(`grid_${sessionId}`);
    if (!gridState) return;
    
    const placements = JSON.parse(gridState);
    placements.forEach(placement => {
      const gridItem = document.querySelector(`.grid-item[data-card]:nth-child(${placement.y * 3 + placement.x + 1})`);
      if (gridItem && gridItem.classList.contains('card-placed')) {
        gridItem.setAttribute('data-player', placement.player);
      }
    });
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
    websocket = new WebSocket(`${protocol}//${window.location.host}/ws/${sessionId}/${playerId}`);
    
    websocket.onmessage = (event) => handleWebSocketMessage(JSON.parse(event.data));
    websocket.onclose = () => setTimeout(connectWebSocket, 3000);
  }

  function handleWebSocketMessage(data) {
    if (data.gameOver) {
      window.location.href = '/gameOver';
      return;
    }
    
    if (!data.action) return;
    
    if (data.state && window.updatePlayerState) window.updatePlayerState(data.state);
    if (data.grid && window.updateGrid) window.updateGrid(data.grid);
    
    switch(data.action) {
      case 'placeCard':
        if (data.placedAt) updateGridCell(data.placedAt.x, data.placedAt.y, data);
        isMyTurn = true;
        break;
      case 'drawCard':
        if (data.hand && window.updateHand) window.updateHand(data.hand, playerNumber);
        isMyTurn = true;
        break;
      case 'undo':
      case 'redo':
        location.reload();
        break;
    }
    
    if (data.hand && window.updateHand) window.updateHand(data.hand, null);
    if (data.state && data.state.length > 0) updateTurnIndicator(data.state[0]);
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
      $('.card-body').each(function() {
        const text = $(this).text();
        if (text.includes('Current Player:')) {
          currentPlayerName = text.replace('Current Player:', '').trim();
        }
      });
      if (!currentPlayerName) return;
    }
    
    let turnIndicator = $('#turn-indicator');
    if (!turnIndicator.length) {
      turnIndicator = $('<div id="turn-indicator"></div>').prependTo('body');
    }
    
    let player1Name = '', player2Name = '';
    $('.card-body').each(function() {
      const text = $(this).text();
      if (text.includes('Player 1:')) player1Name = text.replace('Player 1:', '').trim();
      else if (text.includes('Player 2:')) player2Name = text.replace('Player 2:', '').trim();
    });
    
    const myName = parseInt(playerNumber) === 1 ? player1Name : player2Name;
    isMyTurn = (currentPlayerName === myName);
    
    turnIndicator.text(isMyTurn ? 'Your Turn!' : "Opponent's Turn")
      .toggleClass('your-turn', isMyTurn)
      .toggleClass('not-your-turn', !isMyTurn)
      .show();
    $('.card-container').toggleClass('disabled', !isMyTurn);
  }

  function showTurnWarning() {
    $('<div class="turn-warning">It\'s not your turn!</div>')
      .appendTo('body')
      .fadeIn(200)
      .delay(2000)
      .fadeOut(200, function() { $(this).remove(); });
  }

  function getSessionInfo() {
    return { sessionId, playerId, playerNumber, isMyTurn };
  }

  function setTurnState(myTurn) {
    isMyTurn = myTurn;
  }

  let isDrawing = false;

  function drawCard() {
    if (isDrawing) return;
    if (!isMyTurn) return showTurnWarning();
    if (!sessionId || !playerId) return alert('Session not initialized');

    isDrawing = true;
    const drawBtn = document.getElementById('draw-btn');
    if (drawBtn) drawBtn.disabled = true;

    fetch('/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerId })
    })
    .then(response => response.ok ? response.json() : Promise.reject(`HTTP ${response.status}`))
    .then(data => {
      if (data.gameOver) return window.location.href = '/gameOver';
      if (data.success) {
        if (data.hand && window.updateHand) window.updateHand(data.hand, playerNumber);
        setTurnState(false);
        if (data.state && data.state.length > 0) updateTurnIndicator(data.state[0]);
      } else if (data.message) alert(data.message);
    })
    .catch(err => alert('Failed to draw card: ' + err))
    .finally(() => {
      isDrawing = false;
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
