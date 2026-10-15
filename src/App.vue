<template>
  <!-- 加载 -->
  <Transition name="fade"><Loading v-if="!store.pageReady" /></Transition>
  <!-- 壁纸 -->
  <Background />
  <!-- 主界面 -->
  <main id="main">
    <div class="container" v-show="!store.backgroundShow">
      <section class="all" v-show="!store.setOpenState">
        <MainLeft />
        <MainRight v-show="!store.boxOpenState" />
        <Box v-if="store.boxOpenState" />
      </section>
      <section
        class="more"
        v-show="store.setOpenState"
        @click="store.setOpenState = false"
      >
        <MoreSet v-if="store.setOpenState" />
      </section>
    </div>
    <!-- 移动端菜单按钮 -->
    <button
      type="button"
      aria-label="切换移动端菜单"
      :aria-expanded="store.mobileOpenState"
      class="menu"
      size="24"
      v-show="!store.backgroundShow"
      @click="store.mobileOpenState = !store.mobileOpenState"
    >
      <component :is="store.mobileOpenState ? CloseSmall : HamburgerButton" />
    </button>
    <!-- 页脚 -->
    <Transition name="fade" mode="out-in">
      <Footer
        class="f-ter"
        v-show="!store.backgroundShow && !store.setOpenState"
      />
    </Transition>
    <Teleport to="body">
      <button
        type="button"
        class="wallpaper-toggle"
        :aria-label="store.backgroundShow ? '返回主页' : '查看壁纸'"
        @click="store.backgroundShow = !store.backgroundShow"
      >{{ store.backgroundShow ? '返回主页' : '查看壁纸' }}</button>
    </Teleport>
  </main>
</template>

<script setup>
import { helloInit, checkDays } from "@/utils/getTime.js";
import { HamburgerButton, CloseSmall } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import Loading from "@/components/Loading.vue";
import MainLeft from "@/views/Main/Left.vue";
import MainRight from "@/views/Main/Right.vue";
import Background from "@/components/Background.vue";
import Footer from "@/components/Footer.vue";
const Box = defineAsyncComponent(() => import("@/views/Box/index.vue"));
const MoreSet = defineAsyncComponent(() => import("@/views/MoreSet/index.vue"));
import cursorInit from "@/utils/cursor.js";
import config from "@/../package.json";
import { useDialog } from "@/composables/useDialog.js";

const store = mainStore();
let cursor;
useDialog(() => store.setOpenState, () => { store.setOpenState = false; }, ".set");
const handleMiddleClick = (event) => {
  if (event.button !== 1 || (event.target instanceof Element && event.target.closest("a, button, input, textarea, select"))) return;
  store.backgroundShow = !store.backgroundShow;
};
const handleEscape = (event) => {
  if (event.key === "Escape") store.backgroundShow = false;
};

// 页面宽度
const getWidth = () => {
  store.setInnerWidth(window.innerWidth);
};

// 监听宽度变化
watch(
  () => store.innerWidth,
  (value) => {
    if (value < 721) {
      store.boxOpenState = false;
      store.setOpenState = false;
    }
  },
);

onMounted(() => {
  store.setPageReady(true);
  helloInit();
  checkDays();
  if (
    window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    ).matches
  ) {
    cursor = cursorInit();
  }

  // 监听当前页面宽度
  getWidth();
  window.addEventListener("resize", getWidth);
  window.addEventListener("mousedown", handleMiddleClick);
  window.addEventListener("keydown", handleEscape);

  // 控制台输出
  const styleTitle1 =
    "font-size: 20px;font-weight: 600;color: rgb(244,167,89);";
  const styleTitle2 = "font-size:12px;color: rgb(244,167,89);";
  const styleContent = "color: rgb(30,152,255);";
  const title1 = "無名の主页";
  const title2 = `
 _____ __  __  _______     ____     __
|_   _|  \\/  |/ ____\\ \\   / /\\ \\   / /
  | | | \\  / | (___  \\ \\_/ /  \\ \\_/ /
  | | | |\\/| |\\___ \\  \\   /    \\   /
 _| |_| |  | |____) |  | |      | |
|_____|_|  |_|_____/   |_|      |_|`;
  const content = `\n\n版本: ${config.version}\n主页: ${config.home}\nGithub: ${config.github}`;
  console.info(
    `%c${title1} %c${title2} %c${content}`,
    styleTitle1,
    styleTitle2,
    styleContent,
  );
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", getWidth);
  window.removeEventListener("mousedown", handleMiddleClick);
  window.removeEventListener("keydown", handleEscape);
  cursor?.destroy();
});
</script>

<style lang="scss" scoped>
#main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // 使用 dvh 解决移动端地址栏遮挡问题
  @supports (height: 100dvh) {
    height: 100dvh;
  }
  transform: scale(1.2);
  transition: transform 0.3s;
  animation: fade-blur-main-in 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    forwards;
  animation-delay: 0s;
  overflow: hidden; // 彻底禁止主区域滚动

  .container {
    width: 100%;
    height: 100vh;
    @supports (height: 100dvh) {
      height: 100dvh;
    }
    margin: 0 auto;
    padding: 0 0.5vw;

    .all {
      width: 100%;
      height: 100%;
      padding: 0 0.75rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }

    .more {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #00000080;
      backdrop-filter: blur(20px);
      z-index: 2;
      animation: fade 0.5s;
    }

    @media (max-width: 1200px) {
      padding: 0 2vw;
    }
  }

  // 移动端菜单按钮 —— 始终固定在安全区域内
  .menu {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    // 使用 safe-area-inset 适配底部刘海/Home 条
    bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
    left: 50%;
    transform: translateX(-50%);
    width: 56px;
    height: 34px;
    background: rgb(0 0 0 / 20%);
    backdrop-filter: blur(10px);
    border-radius: 6px;
    transition: transform 0.3s;
    animation: fade 0.5s;
    z-index: 10;
    &:active {
      transform: translateX(-50%) scale(0.95);
    }
    .i-icon {
      transform: translateY(2px);
    }
    @media (min-width: 721px) {
      display: none;
    }
  }

  // 移动端竖向布局：内容区上下滚动（仅在内容超出时出现滚动条）
  @media (max-width: 720px) {
    overflow-y: auto;
    overflow-x: hidden;

    .container {
      height: auto;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 0;
      display: flex;
      flex-direction: column;

      .all {
        flex: 1;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        padding: 0 0.75rem;
        // 顶部留出 Logo 区域，底部留出菜单按钮 + footer
        padding-top: 80px;
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 100px);
      }

      .more {
        height: 100%;
        min-height: 100dvh;
      }
    }

    .f-ter {
      // footer 固定在底部菜单按钮上方
      position: fixed;
      bottom: calc(env(safe-area-inset-bottom, 0px) + 56px);
      left: 0;
      width: 100%;
    }
  }
}
</style>
