<template>
  <div class="game-over-container">
    <h1>Game Over</h1>
    <h2>Winner: {{ winnerName }}</h2>
    <a href="/enterNames" class="btn btn-primary">New Game</a>
    <a href="/" class="btn btn-secondary">Home</a>
  </div>
</template>

<script>
export default {
  name: 'GameOver',
  data() {
    return {
      winnerName: 'Unknown'
    }
  },
  created() {
    if (window.initialData && window.initialData.winnerName) {
      this.winnerName = window.initialData.winnerName;
    }
  }
}
</script>

<style lang="scss" scoped>
.game-over-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  min-height: 50vh;
  padding: 2rem;

  .btn {
    margin: 0.5rem;
  }
}
</style>
