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
@import "@/styles/player-hand.scss";
</style>
