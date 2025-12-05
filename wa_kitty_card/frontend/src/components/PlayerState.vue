<template>
  <v-container class="py-10" max-width="600">
    <v-row>
      <v-col cols="12" sm="6" class="py-1">
        <v-card class="glass-card pa-3" elevation="2">
          <div class="text-body-1">Player 1: {{ state[1] }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" class="py-1">
        <v-card class="glass-card pa-3" elevation="2">
          <div class="text-body-1">Player 2: {{ state[2] }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" class="py-1">
        <v-card class="glass-card pa-3" elevation="2">
          <div class="text-body-1">Current Player: {{ state[0] }}</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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

<style lang="scss" scoped>
@import "@/styles/colors";

.glass-card {
  background: $white-transparent !important;
  backdrop-filter: blur(10px);
  border-radius: $border-radius;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: $font-dark;
}
</style>