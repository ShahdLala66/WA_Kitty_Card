(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const drawBtn = document.getElementById('draw-btn');

    if (undoBtn) {
      undoBtn.addEventListener('click', function() {
        performAction('/undo');
      });
    }

    if (redoBtn) {
      redoBtn.addEventListener('click', function() {
        performAction('/redo');
      });
    }

    if (drawBtn) {
      drawBtn.addEventListener('click', function() {
        performAction('/draw');
      });
    }

    function performAction(url) {
      fetch(url, {
        method: 'POST'
      })
      .then(response => {
        if (response.redirected) {
          window.location.href = response.url;
        } else if (response.ok) {
          window.location.reload();
        } else {
          console.error('Action failed:', response.status, response.statusText);
          return response.text().then(text => {
            console.error('Response body:', text);
            alert('Action failed. Please try again.');
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      });
    }
  });
})();
