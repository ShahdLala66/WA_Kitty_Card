<template>
  <v-sheet class="player-hand-container d-flex align-center justify-center bg-transparent">
    <v-slide-group show-arrows center-active class="pa-0" style="width: 100%;">
      <v-slide-group-item v-for="(card, index) in cards" :key="index">
        <v-card :class="[
          'mx-2',
          'card-transition',
          {
            'selected-card': selectedCardIndex === index,
            'disabled-card': !isMyTurn,
            'dragging': draggingIndex === index
          }
        ]" :height="cardHeight" :width="cardWidth" :draggable="isMyTurn" @dragstart="onDragStart($event, index, card)"
          @dragend="onDragEnd" @click="onCardClick(index)" elevation="4" rounded="lg" border>
          <div class="d-flex flex-column align-center justify-center fill-height pa-2">
            <v-img :src="getCardImage(card)" :height="imageHeight" width="100%" contain class="mb-2"></v-img>
            <div class="text-caption font-weight-bold text-center text-wrap">{{ card }}</div>
          </div>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>
  </v-sheet>
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
  computed: {
    isMobile() {
      return window.innerWidth <= 576;
    },
    cardHeight() {
      return this.isMobile ? 160 : 200;
    },
    cardWidth() {
      return this.isMobile ? 110 : 140;
    },
    imageHeight() {
      return this.isMobile ? 100 : 120;
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

.player-hand-container {
  max-width: 100vw;
  width: 100%;
  padding: 0;
  overflow: hidden;
  height: fit-content;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.v-slide-group__content) {
  padding-top: 15px !important;
  padding-bottom: 15px !important;
  justify-content: center !important;
  display: flex !important;
  overflow: visible !important;
}

:deep(.v-slide-group__wrapper) {
  justify-content: center !important;
  overflow: visible !important;
}

.card-transition {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: grab;
  position: relative;
  z-index: 1;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
    border-color: $pink-dark !important;
    z-index: 100 !important;
  }

  &:active {
    cursor: grabbing;
  }
}

.selected-card {
  border-color: $font-dark !important;
  border-width: 3px !important;
  transform: translateY(-5px);
}

@media screen and (max-width: 576px) {
  .card-transition {
    &:hover {
      transform: translateY(-10px);
    }
  }
  
  .selected-card {
    transform: translateY(-10px);
  }
}

.disabled-card {
  pointer-events: none;
  opacity: 0.5;
  cursor: not-allowed;
  transform: scale(0.95);
}

.dragging {
  opacity: 0.4;
}
</style>
