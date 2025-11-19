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
    const cardIndex = data.index;

    fetch('/placeCard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ cardIndex: cardIndex, x: x, y: y })
    })
    .then(response => response.json())
    .then(responseData => {
      if (responseData.success) {
        $grid.addClass('card-placed has-card').removeClass('drag-over drop-valid drop-invalid').data('card', data.card);
        $grid.find('.text-muted').html(`<div>${coords}</div><div class="fw-bold">${data.card}</div>`);
        $(`.card-container[data-card-index="${cardIndex}"]`).fadeOut(300, function() { $(this).remove(); });
        if (window.updateGameStateFromAjax) window.updateGameStateFromAjax(responseData);
      }
    });
  }

  $(document).ready(function() { initCardPlacement(); });
  window.initCardPlacement = initCardPlacement;

})(jQuery);
