(function($) {
  'use strict';

  let selectedCard = null;

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
    const sessionInfo = window.GameWebSocket.getSessionInfo();
    
    // Build request with optional session info
    const requestBody = { 
      cardIndex: data.index, 
      x, 
      y,
      ...(sessionInfo.sessionId && sessionInfo.playerId && {
        sessionId: sessionInfo.sessionId,
        playerId: sessionInfo.playerId
      })
    };

    fetch('/placeCard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.ok ? response.json() : Promise.reject(`HTTP ${response.status}`))
    .then(responseData => {
      if (responseData.gameOver) return window.location.href = '/gameOver';
      if (responseData.message) return alert(responseData.message);
      
      // Update grid UI
      $grid.addClass('card-placed has-card')
           .removeClass('drag-over drop-valid drop-invalid')
           .data('card', data.card)
           .find('.text-muted').html(`<div>${coords}</div><div class="fw-bold">${data.card}</div>`);
      
      if (responseData.placedByPlayer) {
        $grid.attr('data-player', responseData.placedByPlayer);
        window.GameWebSocket.saveGridPlacement(x, y, responseData.placedByPlayer);
      }
      
      // Remove played card and update hand
      $(`.card-container[data-card-index="${data.index}"]`).fadeOut(300, function() { 
        $(this).remove();
        if (responseData.hand && window.updateHand) {
          window.updateHand(responseData.hand, sessionInfo.playerNumber);
        }
        if (responseData.state && responseData.state.length > 0) {
          window.GameWebSocket.updateTurnIndicator(responseData.state[0]);
        }
      });
    })
    .catch(err => alert('Failed to place card: ' + err));
  }

  $(document).ready(function() { 
    window.GameWebSocket.initGameSession();
    initCardPlacement(); 
  });
  
  window.initCardPlacement = initCardPlacement;

})(jQuery);
