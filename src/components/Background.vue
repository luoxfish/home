<template>
  <div :class="store.backgroundShow ? 'cover show' : 'cover'">
    <img
      v-show="imageVisible"
      :src="bgUrl"
      class="bg"
      alt=""
      decoding="async"
      @load="imgLoadComplete"
      @error="imgLoadError"
    />
    <div :class="store.backgroundShow ? 'gray hidden' : 'gray'" />
    <Transition name="fade" mode="out-in">
      <a
        v-if="store.backgroundShow && store.coverType != '3'"
        class="down"
        :href="bgUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        下载壁纸
      </a>
    </Transition>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
const store = mainStore();
const defaultBg = "/images/background1.jpg";
const bgUrl = ref(defaultBg);
const imageVisible = ref(false);
let timeout;
const clearImageTimeout = () => clearTimeout(timeout);
const imgLoadComplete = () => {
  clearImageTimeout();
  imageVisible.value = true;
};
const imgLoadError = () => {
  clearImageTimeout();
  imageVisible.value = false;
  if (bgUrl.value !== defaultBg) {
    bgUrl.value = defaultBg;
    timeout = setTimeout(clearImageTimeout, 8000);
  }
};
watch(
  () => store.coverType,
  (type) => {
    clearImageTimeout();
    imageVisible.value = false;
    bgUrl.value =
      {
        0: "/images/background" + Math.ceil(Math.random() * 10 || 1) + ".jpg",
        1: "https://api.dujin.org/bing/1920.php",
        2: "https://api.vvhan.com/api/wallpaper/views",
        3: "https://api.vvhan.com/api/wallpaper/acg",
      }[type] || defaultBg;
    timeout = setTimeout(imgLoadError, 8000);
  },
  { immediate: true },
);
onBeforeUnmount(clearImageTimeout);
</script>

<style lang="scss" scoped>
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: 0.25s;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    filter: blur(20px) brightness(0.3);
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: fade-blur-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: 0.45s;
  }
  .gray {
    opacity: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);

    transition: 1.5s;
    &.hidden {
      opacity: 0;
      transition: 1.5s;
    }
  }
  .down {
    font-size: 16px;
    color: white;
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: block;
    padding: 20px 26px;
    border-radius: 8px;
    background-color: #00000030;
    width: 120px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      transform: scale(1.05);
      background-color: #00000060;
    }
    &:active {
      transform: scale(1);
    }
  }
}
</style>
