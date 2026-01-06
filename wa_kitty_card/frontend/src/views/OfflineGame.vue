<template>
    <v-container fluid class="fill-height d-flex align-center justify-center">
        <v-card class="glass-card " width="100%" max-width="800">
            <v-card-title class="text-h4 font-weight-bold text-center">
                You are Offline :c
            </v-card-title>

            <v-card-text class="text-center">
                <p class="text-body-1 text-medium-emphasis">
                    Click the kitty while you wait! :3 (Backend is not reachable)
                </p>

                <v-container class="cat-clicker" @click="clickCat">
                    <img src="/images/kitty.png" class="clickable-cat" :class="{ clicked: justClicked }" />
                </v-container>

                <v-container>
                    <h2 class="text-h2 font-weight-bold text-deep-purple-lighten-1">{{ score }}</h2>
                    <p class="text-body-2 text-medium-emphasis mb-4">clicks</p>
                </v-container>

                <v-btn color="deep-purple-lighten-1" @click="retryConnection" size="large" block class="mb-3">
                    Try Again
                </v-btn>

                <v-btn to="/" variant="outlined" color="deep-purple-lighten-1" size="large" block>
                    Home
                </v-btn>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
export default {
    name: 'OfflineGame',
    data() {
        return {
            score: 0,
            justClicked: false
        }
    },
    methods: {
        clickCat() {
            if (this.score < 69) {
                this.score++
            }
            this.justClicked = true
            setTimeout(() => this.justClicked = false, 200)
        },
        retryConnection() {
            this.$router.push('/enterNames')
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
}

.clickable-cat {
    width: 180px;
    height: 180px;
    transition: transform 0.15s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));

    &.clicked {
        animation: bounce 0.2s ease;
    }
}

@keyframes bounce {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.15);
    }
}
</style>
