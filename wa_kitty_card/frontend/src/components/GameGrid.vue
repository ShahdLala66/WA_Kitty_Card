<template>
  <v-sheet class="grid-border elevation-10" color="transparent">
    <v-sheet class="grid-wrapper" color="transparent">
      <template v-for="row in 3" :key="'row-' + row">
        <template v-for="col in 3" :key="'col-' + col">
          <grid-cell v-bind="getCell(col - 1, row - 1)" @cellClicked="onCellClicked" @cardDropped="onCardDropped" />
        </template>
      </template>
    </v-sheet>
  </v-sheet>
</template>

<script>
import GridCell from './GridCell.vue';

export default {
  name: 'GameGrid',
  components: {
    GridCell
  },
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
          suitName: cell[4],
          placedByPlayer: cell[5] || null
        };
      }
      return { x, y, cardInfo: 'Empty', htmlColor: '', suitName: '', placedByPlayer: null };
    },
    onCellClicked(x, y) {
      this.$emit('cellClicked', x, y);
    },
    onCardDropped(x, y, cardIndex, card) {
      this.$emit('cardDropped', x, y, cardIndex, card);
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

@media screen and (max-width: 576px) {
  .grid-border {
    width: min(85vw, 40vh);
    max-width: calc(100vw - 2rem);
    transform: perspective(2000px) rotateX(15deg);
  }
}
</style>
