<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-12 col-sm-6 py-1">
        <div class="card shadow-sm player-state-card">
          <div class="card-body">Player 1: {{ state[1] }}</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 py-1">
        <div class="card shadow-sm player-state-card">
          <div class="card-body">Player 2: {{ state[2] }}</div>
        </div>
      </div>
      <div class="col-12 col-sm-12 py-1">
        <div>
          <div class="card shadow-sm player-state-card">
            <div class="card-body">Current Player: {{ state[0] }}</div>
          </div>
        </div>
      </div>
      <br>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerState',
  props: {
    state: {
      type: Array,
      required: true
    }
  }
}
</script>
