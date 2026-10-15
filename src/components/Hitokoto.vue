<template>
  <div
    class="hitokoto cards"
    v-show="!store.musicOpenState"
    @mouseenter="openMusicShow = true"
    @mouseleave="openMusicShow = false"
    @click.stop
  >
    <!-- 打开音乐面板 -->
    <Transition name="el-fade-in-linear">
      <button
        type="button"
        class="open-music"
        v-show="hasPlayer && (openMusicShow || store.innerWidth < 721)"
        @click="
          store.musicOpenState = true;
          store.musicListOpen = !store.musicIsOk;
        "
      >
        <music-menu theme="filled" size="18" fill="#efefef" />
        <span>打开音乐播放器</span>
      </button>
    </Transition>
    <!-- 一言内容 -->
    <Transition name="el-fade-in-linear" mode="out-in">
      <button
        type="button"
        :key="hitokotoData.text"
        class="content"
        aria-label="换一条一言"
        @click="updateHitokoto"
      >
        <span class="text">{{ hitokotoData.text }}</span>
        <span class="from">-「&nbsp;{{ hitokotoData.from }}&nbsp;」</span>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { MusicMenu, Error as ErrorIcon } from "@icon-park/vue-next";
import { getHitokoto } from "@/api";
import { mainStore } from "@/store";
import debounce from "@/utils/debounce.js";

const store = mainStore();
const hasPlayer = Boolean(
  import.meta.env.VITE_SONG_ID && import.meta.env.VITE_SONG_API,
);
const controller = new AbortController();

// 开启音乐面板按钮显隐
const openMusicShow = ref(false);

// 一言数据
const hitokotoData = reactive({
  text: "这里应该显示一句话",
  from: "無名",
});

// 获取一言数据
const getHitokotoData = async () => {
  try {
    const result = await getHitokoto({ signal: controller.signal });
    if (!result?.hitokoto || typeof result.hitokoto !== "string")
      throw new Error("无效的一言内容");
    hitokotoData.text = result.hitokoto;
    hitokotoData.from = result.from;
  } catch {
    if (controller.signal.aborted) return;
    ElMessage({
      message: "一言获取失败",
      icon: h(ErrorIcon, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
    hitokotoData.text = "这里应该显示一句话";
    hitokotoData.from = "無名";
  }
};

// 更新一言数据
const updateHitokoto = debounce(getHitokotoData, 500);
onBeforeUnmount(() => {
  controller.abort();
  updateHitokoto.cancel();
});

onMounted(() => {
  getHitokotoData();
});
</script>

<style lang="scss" scoped>
.hitokoto {
  width: 100%;
  height: 100%;
  padding: 20px;
  animation: fade 0.5s;
  .open-music {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #00000026;
    padding: 4px 0;
    border-radius: 8px 8px 0 0;
    .i-icon {
      width: 18px;
      height: 18px;
      display: block;
      margin-right: 8px;
    }
    span {
      font-size: 0.95rem;
    }
  }
  .content {
    width: 100%;
    text-align: left;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    .text {
      font-size: 1.1rem;
      word-break: break-all;
      text-overflow: ellipsis;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    .from {
      margin-top: 10px;
      font-weight: bold;
      align-self: flex-end;
      font-size: 1.1rem;
    }
  }
}
</style>
