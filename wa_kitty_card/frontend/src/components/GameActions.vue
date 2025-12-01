<template>
  <div class="game-actions">
    <button id="undo-btn" class="action-button undo-button" type="button" @click="$emit('undo')">
      <span class="button-text">Undo</span>
    </button>
    
    <button id="redo-btn" class="action-button redo-button" type="button" @click="$emit('redo')">
      <span class="button-text">Redo</span>
    </button>
    
    <button id="draw-btn" class="action-button draw-button" type="button" @click="$emit('draw')">
      <span class="button-text">Draw Card</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'GameActions'
}
</script>

<style lang="scss" scoped>
@import "@/styles/game-actions.scss";
</style>
