<template>
  <v-app>
    <NavBar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import NavBar from './components/NavBar.vue'

export default {
  name: 'App',
  components: {
    NavBar
  }
}
</script>

<style lang="scss">
@import "./styles/colors";

* {
  font-family: $font-display !important;
}

body {
  text-align: center;
  background: linear-gradient(to bottom, $primary-blue 0%, $pink-light 50%, $pink-dark 100%);
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

.v-application {
  background: transparent !important;
}

h1 {
  background: $white-transparent;
  backdrop-filter: blur(10px);
  line-height: 1.6;
  transition: transform $transition-fast ease, box-shadow $transition-fast ease;
  border-radius: $border-radius;
  width: 100%;
  padding: 1.2vh 3rem;
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light;
  margin: 2rem auto;
  text-align: center;

  &:hover {
    transform: translateY(-0.2vh);
    box-shadow: 0 $box-shadow-blur $base-size $black-shadow-dark;
  }
}

a {
  color: $font-dark;
  text-decoration: none;
  transition: color $transition-fast ease;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.info-card {
  background: $white-transparent;
  backdrop-filter: blur(10px);
  border-radius: $border-radius;
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light;
  padding: 2rem 3rem;
  text-align: left;
  line-height: 1.6;
  transition: transform $transition-fast ease, box-shadow $transition-fast ease;
  width: clamp(60vw, 50vw, 40vw);

  &:hover {
    transform: translateY(-0.2vh);
    box-shadow: 0 $box-shadow-blur $base-size $black-shadow-dark;
  }
}

.card {
  background: $white-transparent !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light !important;
  text-align: left !important;
  transition: transform $transition-fast ease, box-shadow $transition-fast ease !important;

  &:hover {
    transform: translateY(-0.2vh);
    box-shadow: 0 $box-shadow-blur $base-size $black-shadow-dark;
  }
}

.section-title {
  text-align: center;
  font-family: $font-display;
  margin-bottom: 1rem;
  color: $font-dark;
}

ul {
  list-style-type: "🐾 ";
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
}

.cute-button {
  border: none;
  background: $white-transparent;
  border-radius: $border-radius;
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light;
  padding: 10px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-0.2vh);
    box-shadow: 0 $box-shadow-blur $base-size $black-shadow-dark;
  }

  img {
    border-radius: 1rem;
    transition: transform 0.3s ease;
  }

}

.card-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: $font-dark;
}

.card-title::before,
.card-title::after {
  content: "";
  flex: 1 1 auto;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.18), transparent);
  margin: 0 0.5rem;
  border-radius: 2px;
}

.card-title strong {
  display: inline-block;
  padding: 0 0.6rem;
  background: transparent;
  position: relative;
}

.card-title strong::before,
.card-title strong::after {
  content: "୨ৎ";
  display: inline-block;
  margin: 0 0.25rem;
  font-size: 0.95rem;
  vertical-align: middle;
}

.player-state-card {
  margin: 0 auto;
  max-height: 45px;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;

}

.player-state-card .card-body {
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
}

.transparent-card {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.cloud {
  position: absolute;
  width: 15vw;
  height: 6vw;
  left: 70vw;
  top: 40vh;

  background: linear-gradient(to bottom right, #ffffff 0%, #f5f9ff 100%);
  border-radius: 8vw;

  &::before,
  &::after {
    content: "";
    position: absolute;
    background: inherit;
    border-radius: 50%;
    box-shadow: inherit;
  }

  &::before {
    width: 5vw;
    height: 5vw;
    top: -2.5vw;
  }

  &::after {
    width: 6vw;
    height: 6vw;
    top: -3vw;
    left: 2vw;
  }

  animation: cloudFloat 6s ease-in-out infinite alternate;
  will-change: transform;
}

.cat-container {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 8vw;
  pointer-events: auto;
  transition: transform 0.3s ease;
  z-index: 10;
}

.cat-container:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.cat-container img {
  height: 100%;
}

.thought-bubble {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, -10px);
  background: #fff;
  border-radius: 20px;
  padding: 10px 15px;
  min-width: 120px;
  text-align: center;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(0.7rem, 2vw, 1rem);
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.cat-container:hover .thought-bubble {
  opacity: 1;
  transform: translate(-50%, -25px);
}

.turn-warning {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(244, 67, 54, 0.95);
  color: white;
  padding: 20px 40px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  display: none;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

/* Player identity banner */
.player-info-banner {
  position: fixed;
  top: 80px;
  left: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 999;
  display: none;
}

.player-info-banner.player-1 {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
}

.player-info-banner.player-2 {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
}

.player-identity strong {
  font-size: 18px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Turn indicator */
#turn-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 30px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: all 0.3s ease;
  display: none;
}

#turn-indicator.your-turn {
  background: #4CAF50;
  color: white;
  animation: pulse 2s infinite;
}

#turn-indicator.not-your-turn {
  background: #9E9E9E;
  color: white;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

/* Disable interaction when not player's turn */
.card-container.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.grid-item.disabled {
  cursor: not-allowed;
}

/* Session info display */
.session-info {
  position: fixed;
  top: 20px;
  left: 20px;
  background: white;
  padding: 10px 15px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  z-index: 1000;
}

.session-info .session-id {
  font-weight: bold;
  color: #4CAF50;
}

.session-info .player-number {
  color: #666;
  margin-top: 5px;
}
</style>
