<template>
  <v-sheet class="d-flex align-center justify-center fill-height bg-transparent pa-2">
    <v-slide-group show-arrows center-active class="pa-4" style="max-width: 100%;">
      <v-slide-group-item v-for="(card, index) in cards" :key="index">
        <v-card :class="[
          'ma-2',
          'card-transition',
          {
            'selected-card': selectedCardIndex === index,
            'disabled-card': !isMyTurn,
            'dragging': draggingIndex === index
          }
        ]" height="200" width="140" :draggable="isMyTurn" @dragstart="onDragStart($event, index, card)"
          @dragend="onDragEnd" @click="onCardClick(index)" elevation="4" rounded="lg" border>
          <div class="d-flex flex-column align-center justify-center fill-height pa-2">
            <v-img :src="getCardImage(card)" height="120" width="100%" contain class="mb-2"></v-img>
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

:deep(.v-slide-group__content) {
  padding-top: 15px !important;
  padding-bottom: 15px !important;
}

.card-transition {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: grab;
  position: relative;
  z-index: 1;

  &:hover {
    transform: translateY(-10px);
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
  transform: translateY(-10px);
}

.disabled-card {
  pointer-events: none;
  opacity: 0.6;
  filter: grayscale(40%);
  cursor: not-allowed;
}

.dragging {
  opacity: 0.4;
}
</style>
