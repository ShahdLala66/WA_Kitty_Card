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
@import "@/styles/colors";

.game-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding: 20px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.action-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border: 2px solid #333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.undo-button {
  background-color: $pink-dark;
  color: #333;
}

.redo-button {
  background-color: $primary-blue;
  color: #333;
}

.draw-button {
  background-color: $green;
  color: #333;
}

.button-text {
  display: inline-block;
  pointer-events: none;
}

</style>
