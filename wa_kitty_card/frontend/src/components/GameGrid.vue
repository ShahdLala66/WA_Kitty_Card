<template>
  <div class="grid-border">
    <div class="grid-wrapper">
      <template v-for="row in 3" :key="'row-' + row">
        <template v-for="col in 3" :key="'col-' + col">
          <button 
            type="button"
            class="btn grid-item rounded-1 shadow"
            :class="getDragClasses(col-1, row-1)"
            :style="{ '--card-color': getCell(col-1, row-1).htmlColor }"
            :data-card="getCell(col-1, row-1).cardInfo"
            :data-suit="getCell(col-1, row-1).suitName"
            :data-player="getCell(col-1, row-1).placedByPlayer"
            @dragover.prevent="onDragOver($event, col-1, row-1)"
            @dragenter="onDragEnter(col-1, row-1)"
            @dragleave="onDragLeave(col-1, row-1)"
            @drop.prevent="onDrop($event, col-1, row-1)"
            @click="$emit('cellClicked', col-1, row-1)"
          >
            <div class="small text-muted position-relative">
              <div>({{ col-1 }}, {{ row-1 }})</div>
              <div>{{ getCell(col-1, row-1).cardInfo }}</div>
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
@import "@/styles/grid.scss";
</style>
