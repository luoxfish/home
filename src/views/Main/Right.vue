<template>
  <div :class="store.mobileOpenState ? 'right' : 'right hidden'">
    <!-- 移动端 Logo -->
    <div class="logo text-hidden" @click="store.mobileFuncState = !store.mobileFuncState">
      <span class="bg">{{ siteUrl[0] }}</span>
      <span class="sm">.{{ siteUrl[1] }}</span>
    </div>
    <!-- 功能区 -->
    <Func />
    <!-- 网站链接 -->
    <Link />
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import Func from "@/views/Func/index.vue";
import Link from "@/components/Links.vue";
const store = mainStore();

// 站点链接
const siteUrl = computed(() => {
  const url = import.meta.env.VITE_SITE_URL;
  if (!url) return "imsyy.top".split(".");
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const urlFormat = url.replace(/^(https?:\/\/)/, "");
    return urlFormat.split(".");
  }
  return url.split(".");
});
</script>

<style lang="scss" scoped>
.right {
  width: 50%;
  margin-left: 0.75rem;

  .logo {
    width: 100%;
    font-family: "Pacifico-Regular";
    font-size: 2.25rem;
    // 移动端：固定在顶部，不随内容滚动
    position: fixed;
    top: 0;
    left: 0;
    height: 72px;
    line-height: 72px;
    text-align: center;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 5;
    transition: transform 0.3s;
    animation: fade 0.5s;

    &:active {
      transform: scale(0.95);
    }

    @media (min-width: 721px) {
      display: none;
    }

    @media (max-width: 480px) {
      font-size: 1.75rem;
      height: 60px;
      line-height: 60px;
    }

    @media (max-width: 360px) {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 720px) {
    margin-left: 0;
    width: 100%;
    &.hidden {
      display: none;
    }
  }
}
</style>
