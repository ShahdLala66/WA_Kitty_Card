<template>
<div>
<div> 
<span v-for="(player, index) in players" :key="index" style="margin-right: 20px;">
  <strong :style="{ color: player.color }">{{ player.name }}:</strong> {{ player.score }} points
</span>
</div>
</div>
</template>


<script>
export default {
  name: 'ScoreBoard',
  props: {
    players: {
      type: Array,
      required: true
    }
  }
}


</script>