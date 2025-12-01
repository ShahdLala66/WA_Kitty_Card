<template>
  <div class="grid-border">
    <div class="grid-wrapper">
      <template v-for="row in 3" :key="'row-' + row">
        <template v-for="col in 3" :key="'col-' + col">
          <button 
            type="button"
            class="btn grid-item rounded-1 shadow"
            :class="{ 'card-placed': getCell(col-1, row-1).cardInfo !== 'Empty' }"
            :style="{ '--card-color': getCell(col-1, row-1).htmlColor }"
            :data-card="getCell(col-1, row-1).cardInfo"
            :data-suit="getCell(col-1, row-1).suitName"
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
  methods: {
    getCell(x, y) {
      const cell = this.gridData.find(t => t[0] === x && t[1] === y);
      if (cell) {
        return {
          x: cell[0],
          y: cell[1],
          cardInfo: cell[2],
          htmlColor: cell[3],
          suitName: cell[4]
        };
      }
      return { x, y, cardInfo: 'Empty', htmlColor: '', suitName: '' };
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/grid.scss";
</style>
