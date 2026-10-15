<template>
  <!-- 音乐控制面板 -->
  <div
    class="music"
    @mouseenter="volumeShow = true"
    @mouseleave="volumeShow = false"
    v-show="store.musicOpenState"
  >
    <div class="btns">
      <button type="button" @click="openMusicList">音乐列表</button>
      <button type="button" @click="store.musicOpenState = false">
        回到一言
      </button>
    </div>
    <div class="control">
      <button
        type="button"
        aria-label="上一首"
        :disabled="!store.musicIsOk"
        @click="changeMusicIndex(0)"
      >
        <go-start theme="filled" size="30" fill="#efefef" />
      </button>
      <Transition name="fade" mode="out-in">
        <button
          type="button"
          :key="store.playerState"
          class="state"
          :aria-label="store.playerState ? '暂停' : '播放'"
          :disabled="!store.musicIsOk"
          @click="changePlayState"
        >
          <play-one
            theme="filled"
            size="50"
            fill="#efefef"
            v-show="!store.playerState"
          />
          <pause
            theme="filled"
            size="50"
            fill="#efefef"
            v-show="store.playerState"
          />
        </button>
      </Transition>
      <button
        type="button"
        aria-label="下一首"
        :disabled="!store.musicIsOk"
        @click="changeMusicIndex(1)"
      >
        <go-end theme="filled" size="30" fill="#efefef" />
      </button>
    </div>
    <div class="menu">
      <div class="name" v-show="!volumeShow">
        <span>{{
          store.getPlayerData.name
            ? store.getPlayerData.name + " - " + store.getPlayerData.artist
            : "未播放音乐"
        }}</span>
      </div>
      <div class="volume" v-show="volumeShow">
        <div class="icon">
          <volume-mute
            theme="filled"
            size="24"
            fill="#efefef"
            v-if="volumeNum == 0"
          />
          <volume-small
            theme="filled"
            size="24"
            fill="#efefef"
            v-else-if="volumeNum > 0 && volumeNum < 0.7"
          />
          <volume-notice theme="filled" size="24" fill="#efefef" v-else />
        </div>
        <el-slider
          v-model="volumeNum"
          :show-tooltip="false"
          :min="0"
          :max="1"
          :step="0.01"
        />
      </div>
    </div>
  </div>
  <!-- 音乐列表弹窗 -->
  <Teleport to="body">
    <Transition name="fade" mode="out-in">
      <div class="music-list" v-show="musicListShow" @click="closeMusicList()">
        <Transition name="zoom">
          <div
            class="list"
            v-show="musicListShow"
            role="dialog"
            aria-modal="true"
            aria-label="音乐列表"
            @click.stop
          >
            <button
              type="button"
              class="close"
              aria-label="关闭音乐列表"
              @click="closeMusicList"
            >
              <close-one theme="filled" size="28" fill="#ffffff60" />
            </button>
            <Player
              ref="playerRef"
              :songServer="playerData.server"
              :songType="playerData.type"
              :songId="playerData.id"
              :volume="volumeNum"
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import {
  GoStart,
  PlayOne,
  Pause,
  GoEnd,
  CloseOne,
  VolumeMute,
  VolumeSmall,
  VolumeNotice,
} from "@icon-park/vue-next";
import Player from "@/components/Player.vue";
import { mainStore } from "@/store";
import { useDialog } from "@/composables/useDialog.js";
const store = mainStore();
const volumeShow = ref(false);
const volumeNum = ref(store.musicVolume ?? 0.7);
const musicListShow = computed({
  get: () => store.musicListOpen,
  set: (value) => {
    store.musicListOpen = value;
  },
});
const playerRef = ref(null);
const playerData = {
  server: import.meta.env.VITE_SONG_SERVER,
  type: import.meta.env.VITE_SONG_TYPE,
  id: import.meta.env.VITE_SONG_ID,
};
const openMusicList = () => {
  musicListShow.value = true;
};
const closeMusicList = () => {
  musicListShow.value = false;
};
const changePlayState = () => {
  if (store.musicIsOk) playerRef.value?.playToggle();
};
const changeMusicIndex = (type) => {
  if (store.musicIsOk) playerRef.value?.changeSong(type);
};
const handleKeydown = (event) => {
  if (
    event.code !== "Space" ||
    event.repeat ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    !store.musicIsOk
  )
    return;
  if (
    event.target instanceof Element &&
    event.target.closest(
      'input, textarea, select, button, a, [contenteditable="true"], [role="slider"]',
    )
  )
    return;
  event.preventDefault();
  changePlayState();
};
onMounted(() => window.addEventListener("keydown", handleKeydown));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  store.musicListOpen = false;
});
useDialog(() => store.musicListOpen, closeMusicList, ".music-list .list");
watch(volumeNum, (value) => {
  store.musicVolume = value;
  playerRef.value?.changeVolume(value);
});
</script>

<style lang="scss" scoped>
.music {
  width: 100%;
  height: 100%;
  background: #00000040;
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  animation: fade 0.5s;
  .btns {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    button {
      background: #ffffff26;
      padding: 2px 8px;
      border-radius: 6px;
      margin: 0px 6px;
      text-overflow: ellipsis;
      overflow-x: hidden;
      white-space: nowrap;
      &:hover {
        background: #ffffff4d;
      }
    }
  }
  .control {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
    .state {
      transition: opacity 0.1s;
      .i-icon {
        width: 50px;
        height: 50px;
        display: block;
      }
    }
    .i-icon {
      width: 36px;
      height: 36px;
      display: flex;
      border-radius: 6px;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transform: scale(1);
      &:hover {
        background: #ffffff33;
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }
  .menu {
    height: 26px;
    width: 100%;
    line-height: 26px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .name {
      width: 100%;
      text-align: center;
      text-overflow: ellipsis;
      overflow-x: hidden;
      white-space: nowrap;
      animation: fade 0.3s;
    }
    .volume {
      width: 100%;
      padding: 0 12px;
      display: flex;
      align-items: center;
      flex-direction: row;
      animation: fade 0.3s;
      .icon {
        margin-right: 12px;
        span {
          width: 24px;
          height: 24px;
          display: block;
        }
      }
      :deep(*) {
        transition: none;
      }
      :deep(.el-slider__button) {
        transition: 0.3s;
      }
      .el-slider {
        margin-right: 12px;
        --el-slider-main-bg-color: #efefef;
        --el-slider-runway-bg-color: #ffffff40;
        --el-slider-button-size: 16px;
      }
    }
  }
}
.music-list {
  position: fixed;
  top: 0;
  left: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  backdrop-filter: blur(20px);
  z-index: 100;
  .list {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    left: calc(50% - 320px);
    width: 640px;
    height: min(600px, 90dvh);
    max-height: 90vh;
    top: 50%;
    translate: 0 -50%;
    background-color: #ffffff66;
    border-radius: 6px;
    z-index: 999;
    @media (max-width: 720px) {
      left: calc(50% - 45%);
      width: 90%;
    }
    .close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      display: block;
      &:hover {
        transform: scale(1.2);
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }
}

// 弹窗动画
.zoom-enter-active {
  animation: zoom 0.4s ease-in-out;
}
.zoom-leave-active {
  animation: zoom 0.3s ease-in-out reverse;
}
@keyframes zoom {
  0% {
    opacity: 0;
    transform: scale(0) translateY(-600px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
