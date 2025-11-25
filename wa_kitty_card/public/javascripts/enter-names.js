(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('player-names-form');
    if (!form) return;

    form.addEventListener('submit', function(event) {
      event.preventDefault();

      const player1Name = document.getElementById('player1Name').value;
      const player2Name = document.getElementById('player2Name').value;

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
  });
})();
