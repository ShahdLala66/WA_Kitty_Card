<template>
  <v-sheet class="grid-item d-flex justify-center rounded cursor-pointer border"
    :class="[dragClasses, cardInfo !== 'Empty' ? 'align-end pb-1' : 'align-center']"
    :style="{ backgroundColor: htmlColor + ' !important' }"
    :data-card="cardInfo" 
    :data-suit="suitName"
    :data-player="placedByPlayer"
    @dragover.prevent
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    @click="$emit('cellClicked', x, y)" 
    v-ripple>
    
    <v-img v-if="placedByPlayer && cardInfo !== 'Empty'"
      :src="`/images/${placedByPlayer === 'player1' ? 'player-one.gif' : 'player-two.gif'}`"
      class="player-avatar-overlay" cover></v-img>

    <div class="text-caption font-weight-bold text-center" style="z-index: 2; pointer-events: none;">
      <div v-if="cardInfo === 'Empty'" class="text-medium-emphasis">
        ({{ x }}, {{ y }})
      </div>
      <div v-else class="text-white" style="text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
        {{ cardInfo }}
      </div>
    </div>
  </v-sheet>
</template>

<script>
export default {
  name: 'GridCell',
  props: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    cardInfo: { type: String, default: 'Empty' },
    htmlColor: { type: String, default: '' },
    suitName: { type: String, default: '' },
    placedByPlayer: { type: String, default: null }
  },
  data() {
    return {
      isDragOver: false
    }
  },
  computed: {
    isValidDrop() {
      return this.cardInfo === 'Empty';
    },
    dragClasses() {
      const classes = {};
      if (this.cardInfo !== 'Empty') {
        classes['card-placed'] = true;
      }
      if (this.isDragOver) {
        classes['drag-over'] = true;
        classes['drop-valid'] = this.isValidDrop;
        classes['drop-invalid'] = !this.isValidDrop;
      }
      return classes;
    }
  },
  methods: {
    onDragEnter() {
      this.isDragOver = true;
    },
    onDragLeave() {
      this.isDragOver = false;
    },
    onDrop(event) {
      this.isDragOver = false;
      if (!this.isValidDrop) return;

      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      this.$emit('cardDropped', this.x, this.y, data.index, data.card);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/colors";

.grid-item {
  position: relative;
  aspect-ratio: 1 / 1;
  pointer-events: auto;
  z-index: 1;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.grid-item:hover {
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light !important;
  transform: scale(1.02);
  z-index: 2;
}

.player-avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.grid-item.drag-over,
.grid-item.drop-valid,
.grid-item.drop-invalid {
  transform: none !important;
  z-index: 10;
}

.grid-item.drag-over:hover,
.grid-item.drop-valid:hover,
.grid-item.drop-invalid:hover {
  transform: none !important;
}

.grid-item.drop-valid {
  border-color: #10b981 !important;
}

.grid-item.drop-invalid {
  border-color: #ef4444 !important;
  cursor: not-allowed;
}

.grid-item.has-card {
  border-color: var(--card-color, #6b7280) !important;
  border-width: 3px !important;
}
</style>