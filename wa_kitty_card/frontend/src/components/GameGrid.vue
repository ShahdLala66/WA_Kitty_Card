<template>
  <div class="grid-border">
    <div class="grid-wrapper">
      <template v-for="row in 3" :key="'row-' + row">
        <template v-for="col in 3" :key="'col-' + col">
          <button type="button" class="btn grid-item rounded-1 shadow" :class="getDragClasses(col - 1, row - 1)"
            :style="{ '--card-color': getCell(col - 1, row - 1).htmlColor }" :data-card="getCell(col - 1, row - 1).cardInfo"
            :data-suit="getCell(col - 1, row - 1).suitName" :data-player="getCell(col - 1, row - 1).placedByPlayer"
            @dragover.prevent="onDragOver($event, col - 1, row - 1)" @dragenter="onDragEnter(col - 1, row - 1)"
            @dragleave="onDragLeave(col - 1, row - 1)" @drop.prevent="onDrop($event, col - 1, row - 1)"
            @click="$emit('cellClicked', col - 1, row - 1)">
            <div class="small text-muted position-relative">
              <div>({{ col - 1 }}, {{ row - 1 }})</div>
              <div>{{ getCell(col - 1, row - 1).cardInfo }}</div>
            </div>
          </button>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameGrid',
  props: {
    gridData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      dragOverCell: null,
      dragValid: false
    }
  },
  methods: {
    getCell(x, y) {
      const cell = this.gridData.find(t => t[0] === x && t[1] === y);
      if (cell) {
        return {
          x: cell[0],
          y: cell[1],
          cardInfo: cell[2],
          htmlColor: cell[3],
          suitName: cell[4],
          placedByPlayer: cell[5] || null
        };
      }
      return { x, y, cardInfo: 'Empty', htmlColor: '', suitName: '', placedByPlayer: null };
    },
    getDragClasses(x, y) {
      const cell = this.getCell(x, y);
      const classes = {};

      if (cell.cardInfo !== 'Empty') {
        classes['card-placed'] = true;
      }

      if (this.dragOverCell && this.dragOverCell.x === x && this.dragOverCell.y === y) {
        classes['drag-over'] = true;
        classes['drop-valid'] = this.dragValid;
        classes['drop-invalid'] = !this.dragValid;
      }

      return classes;
    },
    onDragOver(event, x, y) {
      event.preventDefault();
    },
    onDragEnter(x, y) {
      const cell = this.getCell(x, y);
      const isEmpty = cell.cardInfo === 'Empty';
      this.dragOverCell = { x, y };
      this.dragValid = isEmpty;
    },
    onDragLeave(x, y) {
      if (this.dragOverCell && this.dragOverCell.x === x && this.dragOverCell.y === y) {
        this.dragOverCell = null;
        this.dragValid = false;
      }
    },
    onDrop(event, x, y) {
      const cell = this.getCell(x, y);
      if (cell.cardInfo !== 'Empty') {
        this.dragOverCell = null;
        this.dragValid = false;
        return;
      }

      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      this.$emit('cardDropped', x, y, data.index, data.card);

      this.dragOverCell = null;
      this.dragValid = false;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/colors";

.grid-border {
  border: 5px solid rgb(174, 145, 129);
  border-radius: $border-radius / 2;
  padding: 0;
  margin: 0 auto;
  width: min(40vh);
  aspect-ratio: 1 / 1;
  max-width: 500px;
  border-bottom: 2vh solid rgb(134, 106, 66);
  box-sizing: border-box;

  transform: perspective(2000px) rotateX(25deg);
  transform-style: preserve-3d;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.15),
    0 5px 15px rgba(0, 0, 0, 0.1);
}

.grid-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  position: relative;
  box-sizing: border-box;
  z-index: 10;
  height: 100%;
}

.grid-item {
  background-color: var(--card-color) !important;
  border: none !important;
  position: relative;
  aspect-ratio: 1 / 1;
  pointer-events: auto;
  z-index: 1;
}

.grid-item .small {
  font-size: 0.7rem;
  line-height: 1.2;
  text-align: center;
}

.grid-item:hover {
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light !important;
  transform: scale(1.02);
}

.grid-item.card-placed::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
  z-index: 10;
  opacity: 1;
}

.grid-item.card-placed[data-player="player1"]::after {
  background-image: url('~@/assets/images/player-one.gif');
}

.grid-item.card-placed[data-player="player2"]::after {
  background-image: url('~@/assets/images/player-two.gif');
}

@media screen and (max-width: 576px) {
  .grid-border {
    width: min(85vh, 40vh);
    transform: perspective(2000px) rotateX(15deg);
  }


}

.grid-item {
    position: relative;
    border: 2px solid transparent;
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
