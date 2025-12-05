<template>
  <div class="player-hand-section">
    <div class="player-hand-row">
      <div 
        v-for="(card, index) in cards" 
        :key="index" 
        class="card-container" 
        :class="{ 'selected': selectedCardIndex === index, 'dragging': draggingIndex === index, 'disabled': !isMyTurn }"
        :data-card-index="index"
        :draggable="isMyTurn"
        @dragstart="onDragStart($event, index, card)"
        @dragend="onDragEnd"
        @click="onCardClick(index)"
      >
        <div class="card-display">
          <img :src="getCardImage(card)" :alt="card" class="card-image" />
          <div class="card-label">{{ card }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerHand',
  props: {
    cards: {
      type: Array,
      required: true
    },
    selectedCardIndex: {
      type: Number,
      default: null
    },
    isMyTurn: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      draggingIndex: null
    }
  },
  methods: {
    getCardImage(cardStr) {
      const parts = cardStr.split(" of ");
      if (parts.length === 2) {
        let value = parts[0];
        switch (value) {
          case "One": value = "1"; break;
          case "Two": value = "2"; break;
          case "Three": value = "3"; break;
          case "Four": value = "4"; break;
          case "Five": value = "5"; break;
          case "Six": value = "6"; break;
          case "Seven": value = "7"; break;
          default: value = "1";
        }
        const color = parts[1];
        return `/images/cards/${value}/${value}-${color}.png`;
      } else {
        return "";
      }
    },
    onDragStart(event, index, card) {
      this.draggingIndex = index;
      const data = {
        index: index,
        card: card
      };
      event.dataTransfer.setData('application/json', JSON.stringify(data));
      event.dataTransfer.effectAllowed = 'move';
    },
    onDragEnd() {
      this.draggingIndex = null;
      this.$emit('dragEnd');
    },
    onCardClick(index) {
      if (this.selectedCardIndex === index) {
        this.$emit('cardSelected', null);
      } else {
        this.$emit('cardSelected', index);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/colors";

.player-hand-section {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-container {
  width: clamp(120px, #{$card-width}, 220px);
  min-width: 100px;
  max-width: 300px;
  
  @media screen and (max-width: 576px) {
    position: absolute;
    width: 80px; 
    
    @for $i from 0 through 19 {
      $row: floor($i / 5); 
      $col: $i % 5; 
      
      &[data-card-index="#{$i}"] {
        left: calc(50vw - 200px + #{$col * 40}px); 
        top: #{$row * 60}px;
        z-index: #{20 - $i};
      }
    }
    
    &:hover {
      z-index: 21 !important;
    }
  }
}

.player-hand-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $card-spacing;
  flex-wrap: wrap;
  width: auto;
  max-width: 1200px;
  
  @media screen and (min-width: 577px) {
    flex-direction: row;
  }
  
  @media screen and (max-width: 576px) {
    position: relative;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0;
    height: 250px;
  }
}

.card-display {
  flex: 1 1 auto;
  aspect-ratio: 2 / 3;
  background: $white;
  border: 3px solid rgb(174, 145, 129);
  border-radius: $card-border-radius;
  box-shadow: $card-shadow;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: $font-dark;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: $card-shadow-hover;
    border-color: $pink-dark;
  }
}

.card-image {
  max-width: 100%;
  max-height: 80%;
  object-fit: contain;
  border-radius: 0.5rem;
}

.card-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: $font-dark;
  text-align: center;
  word-wrap: break-word;
  max-width: 100%;
  margin-top: 0.25rem;
}

.card-container.disabled {
  pointer-events: none;
  opacity: 0.5;
  filter: grayscale(50%);
  cursor: not-allowed;
  
  .card-display {
    &:hover {
      transform: none;
      box-shadow: $card-shadow;
      border-color: rgb(174, 145, 129);
    }
  }
}

.card-container {
    cursor: grab;
}

.card-container:active {
    cursor: grabbing;
}

.card-container.dragging {
    opacity: 0.5;
}

.card-container.selected .card-display {
    border-color: $font-dark;
    border-width: 4px;
}
</style>
