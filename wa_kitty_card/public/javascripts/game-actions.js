(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const drawBtn = document.getElementById('draw-btn');

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
      button.disabled = true;
      const originalText = button.querySelector('.button-text').textContent;
      button.querySelector('.button-text').textContent = 'Loading...';

      fetch(url, { method: 'POST', headers: { 'Accept': 'application/json' } })
      .then(response => response.json())
      .then(data => {
        if (data.success) updateGameState(data);
      })
      .finally(() => {
        button.disabled = false;
        button.querySelector('.button-text').textContent = originalText;
      });
    }

    function updateGameState(data) {
      if (data.state) updatePlayerState(data.state);
      if (data.grid) updateGrid(data.grid);
      if (data.hand) updateHand(data.hand);
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
  });
})();
