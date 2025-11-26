(function($) {
  'use strict';

  let selectedCard = null;
  let websocket = null;
  let sessionId = null;
  let playerId = null;
  let playerNumber = null;
  let isMyTurn = true;

  function initGameSession() {
    // Retrieve session info from sessionStorage or URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    sessionId = sessionStorage.getItem('sessionId') || urlParams.get('sessionId');
    playerId = sessionStorage.getItem('playerId') || urlParams.get('playerId');
    playerNumber = sessionStorage.getItem('playerNumber') || urlParams.get('playerNumber');
    
    // Store in sessionStorage if found in URL
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
    }
  }

  function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${sessionId}/${playerId}`;
    
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = function() {
      console.log('Game WebSocket connected');
    };
    
    websocket.onmessage = function(event) {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    
    websocket.onerror = function(error) {
      console.error('WebSocket error:', error);
    };
    
    websocket.onclose = function() {
      console.log('WebSocket closed');
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };
  }

  function handleWebSocketMessage(data) {
    console.log('Received WebSocket message:', data);
    
    if (data.action) {
      // Update game state from other player's action
      if (data.success && window.updateGameStateFromAjax) {
        window.updateGameStateFromAjax(data);
      }
      
      // Handle specific actions
      switch(data.action) {
        case 'placeCard':
          if (data.placedAt) {
            updateGridCell(data.placedAt.x, data.placedAt.y, data);
          }
          // After opponent places card, it becomes our turn
          isMyTurn = true;
          break;
        case 'drawCard':
          // After opponent draws, it becomes our turn
          isMyTurn = true;
          break;
        case 'undo':
        case 'redo':
          // Refresh the page or update UI
          location.reload();
          break;
      }
      
      // Update turn indicator after action
      if (data.state && data.state.length > 0) {
        updateTurnStatus(data.state[0]);
      }
    }
    
    if (data.type === 'player-joined' || data.type === 'player-left') {
      // Handle player connection changes
      console.log('Player connection update:', data.type);
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
        if (data.placedByPlayer) $grid.attr('data-player', data.placedByPlayer);
        $grid.css('background-color', gridCell.color);
        const coords = $grid.find('.text-muted div').first().text();
        $grid.find('.text-muted').html(`<div>${coords}</div><div class="fw-bold">${gridCell.card}</div>`);
      }
    }
  }

  function updateTurnStatus(currentPlayerName) {
    // Get current player name from the state display
    const cardBodies = $('.card-body');
    let currentPlayer = '';
    
    cardBodies.each(function() {
      const text = $(this).text();
      if (text.includes('Current Player:')) {
        currentPlayer = text.replace('Current Player:', '').trim();
      }
    });
    
    console.log('[DEBUG] updateTurnStatus - current player from DOM:', currentPlayer);
    if (currentPlayer) {
      updateTurnIndicator(currentPlayer);
    }
  }
  
  function updateTurnIndicator(currentPlayerName) {
    let turnIndicator = $('#turn-indicator');
    if (turnIndicator.length === 0) {
      $('body').prepend('<div id="turn-indicator"></div>');
      turnIndicator = $('#turn-indicator');
    }
    
    // Get player names from card-body divs (not p tags)
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
    
    // Determine if it's this player's turn
    const myPlayerNumber = parseInt(playerNumber);
    const myName = myPlayerNumber === 1 ? player1Name : player2Name;
    
    console.log('[DEBUG] updateTurnIndicator:', {
      currentPlayerName,
      myPlayerNumber,
      myName,
      player1Name,
      player2Name,
      sessionPlayerNumber: playerNumber
    });
    
    isMyTurn = (currentPlayerName === myName);
    
    console.log('[DEBUG] isMyTurn calculated:', isMyTurn, myName, 'vs', currentPlayerName);
    
    if (isMyTurn) {
      turnIndicator.text('Your Turn!').removeClass('not-your-turn').addClass('your-turn');
      $('.card-container').removeClass('disabled');
    } else {
      turnIndicator.text('Opponent\'s Turn').removeClass('your-turn').addClass('not-your-turn');
      $('.card-container').addClass('disabled');
    }
    
    turnIndicator.show();
  }

  function canInteract() {
    // Always allow interaction - let the SERVER validate the turn
    // The disabled class is just visual feedback
    console.log('[DEBUG] canInteract - always returning true, server will validate');
    return true;
  }

  function initCardPlacement() {
    $('.card-container').off('dragstart dragend click');
    $('.grid-item').off('dragover dragenter dragleave drop click');

    $('.card-container')
      .attr('draggable', true)
      .on('dragstart', function(e) {
        $(this).addClass('dragging');
        const data = {
          index: $(this).data('card-index'),
          card: $(this).find('.card-label').text()
        };
        e.originalEvent.dataTransfer.setData('application/json', JSON.stringify(data));
      })
      .on('dragend', function() {
        $(this).removeClass('dragging');
        $('.grid-item').removeClass('drag-over drop-valid drop-invalid');
      })
      .on('click', function(e) {
        e.preventDefault();
        $('.card-container').removeClass('selected');
        if (selectedCard === this) {
          selectedCard = null;
        } else {
          selectedCard = this;
          $(this).addClass('selected');
        }
      });

    $('.grid-item')
      .on('dragover', function(e) {
        e.preventDefault();
        return false;
      })
      .on('dragenter', function() {
        const isEmpty = $(this).data('card') === 'Empty';
        $(this).addClass(isEmpty ? 'drag-over drop-valid' : 'drag-over drop-invalid');
      })
      .on('dragleave', function() {
        $(this).removeClass('drag-over drop-valid drop-invalid');
      })
      .on('drop', function(e) {
        e.preventDefault();
        const $grid = $(this);
        if ($grid.data('card') !== 'Empty') {
          $grid.removeClass('drag-over drop-valid drop-invalid');
          return false;
        }
        const data = JSON.parse(e.originalEvent.dataTransfer.getData('application/json'));
        placeCard($grid, data);
        return false;
      })
      .on('click', function() {
        if (!selectedCard || $(this).data('card') !== 'Empty') return;
        const $card = $(selectedCard);
        placeCard($(this), {
          index: $card.data('card-index'),
          card: $card.find('.card-label').text()
        });
        $card.removeClass('selected');
        selectedCard = null;
      });
  }

  function placeCard($grid, data) {
    const coords = $grid.find('.text-muted div').first().text();
    const match = coords.match(/\((\d+),\s*(\d+)\)/);
    
    if (!match) {
      console.error('Invalid coordinates:', coords);
      alert('Invalid grid position');
      return;
    }
    
    const x = parseInt(match[1]);
    const y = parseInt(match[2]);
    const cardIndex = data.index;

    const requestBody = { 
      cardIndex: cardIndex, 
      x: x, 
      y: y
    };
    
    // Add session info if available
    if (sessionId && playerId) {
      requestBody.sessionId = sessionId;
      requestBody.playerId = playerId;
    }
    
    console.log('[DEBUG] Sending placeCard request:', requestBody);

    fetch('/placeCard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(responseData => {
      if (responseData.success) {
        $grid.addClass('card-placed has-card').removeClass('drag-over drop-valid drop-invalid').data('card', data.card);
        if (responseData.placedByPlayer) $grid.attr('data-player', responseData.placedByPlayer);
        $grid.find('.text-muted').html(`<div>${coords}</div><div class="fw-bold">${data.card}</div>`);
        
        // Remove the card from MY hand immediately
        $(`.card-container[data-card-index="${cardIndex}"]`).fadeOut(300, function() { 
          $(this).remove(); 
        });
        
        // Update game state (grid, player state) but NOT hand
        if (window.updateGameStateFromAjax) window.updateGameStateFromAjax(responseData);
        
        // After placing card, it's no longer our turn
        isMyTurn = false;
        if (responseData.state && responseData.state.length > 0) {
          updateTurnStatus(responseData.state[0]);
        }
      } else if (responseData.message) {
        alert(responseData.message);
      }
    })
    .catch(err => {
      console.error('Error placing card:', err);
      alert('Failed to place card. Please try again.');
    });
  }

  function showTurnWarning() {
    const warning = $('<div class="turn-warning">It\'s not your turn!</div>');
    $('body').append(warning);
    warning.fadeIn(200);
    setTimeout(() => {
      warning.fadeOut(200, function() { $(this).remove(); });
    }, 2000);
  }

  $(document).ready(function() { 
    initGameSession();
    initCardPlacement(); 
  });
  
  window.initCardPlacement = initCardPlacement;
  window.initGameSession = initGameSession;

})(jQuery);
