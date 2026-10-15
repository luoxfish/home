<template>
  <div class="weather" aria-live="polite">
    <template v-if="weatherData">
      <span
        >{{ weatherData.city }}&nbsp;{{ weatherData.weather }}&nbsp;{{
          weatherData.temperature
        }}℃</span
      >
      <span v-if="weatherData.winddirection" class="sm-hidden">
        &nbsp;{{ weatherData.winddirection
        }}{{ weatherData.winddirection.endsWith("风") ? "" : "风" }}
      </span>
      <span v-if="weatherData.windpower" class="sm-hidden"
        >&nbsp;{{ weatherData.windpower }}&nbsp;级</span
      >
    </template>
    <span v-else>{{ loading ? "天气加载中" : "天气暂不可用" }}</span>
  </div>
</template>

<script setup>
import { getWeatherData } from "@/api";
const weatherData = ref(null);
const loading = ref(true);
const controller = new AbortController();
onMounted(async () => {
  try {
    weatherData.value = await getWeatherData({ signal: controller.signal });
  } catch {
    weatherData.value = null;
  } finally {
    loading.value = false;
  }
});
onBeforeUnmount(() => controller.abort());
</script>
