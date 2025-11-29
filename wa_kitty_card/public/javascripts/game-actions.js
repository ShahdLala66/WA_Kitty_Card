(function() {
  'use strict';

  let myPlayerNumber = null;

  document.addEventListener('DOMContentLoaded', function() {
    myPlayerNumber = sessionStorage.getItem('playerNumber') || new URLSearchParams(window.location.search).get('playerNumber');
    console.log('[game-actions] Initialized with playerNumber:', myPlayerNumber);

    const drawBtn = document.getElementById('draw-btn');
    if (drawBtn) {
      drawBtn.addEventListener('click', function() {
        if (window.GameWebSocket && window.GameWebSocket.drawCard) {
          window.GameWebSocket.drawCard();
        }
      });
    }

    window.updatePlayerState = function(state) {
      if (!state || state.length < 3) return;
      const bodies = document.querySelectorAll('.player-state-card .card-body');
      if (bodies.length >= 3) {
        [bodies[0].textContent, bodies[1].textContent, bodies[2].textContent] = 
          [`Player 1: ${state[1]}`, `Player 2: ${state[2]}`, `Current Player: ${state[0]}`];
      }
    };

    window.updateGrid = function(gridData) {
      gridData.forEach(cell => {
        const gridItem = document.querySelector(`.grid-item[data-card]:nth-child(${cell.y * 3 + cell.x + 1})`);
        if (!gridItem) return;
        
        const wasPlaced = gridItem.classList.contains('card-placed');
        const existingPlayer = gridItem.getAttribute('data-player');
        
        gridItem.setAttribute('data-card', cell.card);
        gridItem.setAttribute('data-suit', cell.suit);
        gridItem.style.setProperty('--card-color', cell.color);
        const textDiv = gridItem.querySelector('.text-muted');
        if (textDiv) textDiv.innerHTML = `<div>(${cell.x}, ${cell.y})</div><div>${cell.card}</div>`;
        
        gridItem.classList.toggle('card-placed', cell.card !== 'Empty');
        if (cell.card !== 'Empty' && wasPlaced && existingPlayer) {
          gridItem.setAttribute('data-player', existingPlayer);
        } else if (cell.card === 'Empty') {
          gridItem.removeAttribute('data-player');
        }
      });
    };

    window.updateHand = function(hand, forPlayerNumber) {
      if (forPlayerNumber !== null && forPlayerNumber && myPlayerNumber && forPlayerNumber !== myPlayerNumber) return;
      
      const handSection = document.querySelector('.player-hand-section .player-hand-row');
      if (!handSection) return;
      
      const valueMap = { 'One': '1', 'Two': '2', 'Three': '3', 'Four': '4', 'Five': '5', 'Six': '6', 'Seven': '7' };
      handSection.innerHTML = hand.map((card, index) => {
        const [cardValue, color] = card.split(' of ');
        const value = valueMap[cardValue] || '1';
        return `<div class="card-container" data-card-index="${index}"><div class="card-display"><img src="/assets/images/cards/${value}/${value}-${color}.png" alt="${card}" class="card-image" /><div class="card-label">${card}</div></div></div>`;
      }).join('');
      
      if (window.initCardPlacement) window.initCardPlacement();
    };
  });
})();
