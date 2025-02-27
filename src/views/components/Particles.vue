<template>
  <div class="particles-container">
    <Particles 
      v-if="init" 
      id="tsparticles"
      :options="particlesOptions"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Particles from 'tsparticles';
import { loadSlim } from '@tsparticles/slim';

export default {
  name: 'CoverParticles',
  setup() {
    const init = ref(false);
    const particlesOptions = ref({
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 80,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
    });

    onMounted(async () => {
      await loadSlim(Particles);
      init.value = true;
    });

    return {
      init,
      particlesOptions,
    };
  },
};
</script>

<style scoped>
.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
