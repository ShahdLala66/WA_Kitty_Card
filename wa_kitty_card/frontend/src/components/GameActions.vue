<template>
  <div class="game-actions">
    <v-btn
      class="action-button text-none font-weight-bold"
      color="#fca6c0"
      @click="$emit('undo')"
      elevation="4"
      size="large"
      rounded="lg"
      border
    >
      Undo
    </v-btn>
    
    <v-btn
      class="action-button text-none font-weight-bold"
      color="#a1ccea"
      @click="$emit('redo')"
      elevation="4"
      size="large"
      rounded="lg"
      border
    >
      Redo
    </v-btn>
    
    <v-btn
      class="action-button text-none font-weight-bold"
      color="#a8e6cf"
      @click="$emit('draw')"
      elevation="4"
      size="large"
      rounded="lg"
      border
    >
      Draw Card
    </v-btn>
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
  padding: 5px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.action-button {
  color: #333 !important;
  border: 2px solid #333 !important;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}
</style>
