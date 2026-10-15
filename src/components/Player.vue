<template>
  <div v-if="loadError" role="alert" class="player-error">
    <p>{{ loadError }}</p>
    <button type="button" @click="initialize">重试加载歌单</button>
  </div>
  <p v-else-if="!playList.length" role="status">歌单加载中</p>
  <APlayer
    v-else
    ref="player"
    :audio="playList"
    :autoplay="store.playerAutoplay"
    :theme="theme"
    :autoSwitch="false"
    :loop="store.playerLoop"
    :order="store.playerOrder"
    :volume="volume"
    :showLrc="true"
    :listFolded="listFolded"
    :listMaxHeight="listMaxHeight"
    :noticeSwitch="false"
    @play="onPlay"
    @pause="onPause"
    @timeupdate="onTimeUp"
    @error="loadMusicError"
  />
</template>

<script setup>
import { MusicOne, PlayWrong } from "@icon-park/vue-next";
import { getPlayerList } from "@/api";
import { mainStore } from "@/store";
import APlayer from "@worstone/vue-aplayer";

const store = mainStore();

// 获取播放器 DOM
const player = ref(null);

// 歌曲播放列表
const playList = ref([]);

// 歌曲播放项
const playIndex = ref(0);
const loadError = ref("");
let controller;

// 配置项
const props = defineProps({
  // 主题色
  theme: {
    type: String,
    default: "#efefef",
  },
  // 默认音量
  volume: {
    type: Number,
    default: 0.7,
    validator: (value) => {
      return value >= 0 && value <= 1;
    },
  },
  // 歌曲服务器 ( netease-网易云, tencent-qq音乐 )
  songServer: {
    type: String,
    default: "netease", //'netease' | 'tencent'
  },
  // 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 )
  songType: {
    type: String,
    default: "playlist",
  },
  // id
  songId: {
    type: String,
    default: "7452421335",
  },
  // 列表是否默认折叠
  listFolded: {
    type: Boolean,
    default: false,
  },
  // 列表最大高度
  listMaxHeight: {
    type: Number,
    default: 420,
  },
});

const listHeight = computed(() => {
  return props.listMaxHeight + "px";
});

const initialize = async () => {
  controller?.abort();
  controller = new AbortController();
  const currentController = controller;
  loadError.value = "";
  store.musicIsOk = false;
  try {
    const tracks = await getPlayerList(
      props.songServer,
      props.songType,
      props.songId,
      { signal: currentController.signal },
    );
    if (currentController.signal.aborted) return;
    playList.value = tracks;
    await nextTick();
    store.musicIsOk = Boolean(player.value);
  } catch (error) {
    if (!currentController.signal.aborted)
      loadError.value = error.message || "播放器加载失败";
  }
};
onMounted(initialize);
onBeforeUnmount(() => {
  controller?.abort();
  store.musicIsOk = false;
  store.playerState = false;
});

// 播放
const onPlay = () => {
  playIndex.value = player.value.aplayer.index;
  // 播放状态
  store.setPlayerState(player.value.audioRef.paused);
  // 储存播放器信息
  store.setPlayerData(
    playList.value[playIndex.value].name,
    playList.value[playIndex.value].artist,
  );
  ElMessage({
    message: store.getPlayerData.name + " - " + store.getPlayerData.artist,
    grouping: true,
    icon: h(MusicOne, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

// 暂停
const onPause = () => {
  store.setPlayerState(player.value.audioRef.paused);
};

// 音频时间更新事件
const onTimeUp = () => {
  if (!player.value) return;
  let lyrics = player.value.aplayer.lyrics[player.value.aplayer.index];
  let lyricIndex = player.value.aplayer.lyricIndex;
  if (!lyrics || !lyrics[lyricIndex]) {
    return;
  }
  let lrc = lyrics[lyricIndex][1];
  if (lrc === "Loading") {
    lrc = "歌词加载中";
  } else if (lrc === "Not available") {
    lrc = "歌词加载失败";
  }
  store.setPlayerLrc(lrc);
};

// 切换播放暂停事件
const playToggle = () => {
  player.value?.toggle();
};

// 切换音量事件
const changeVolume = (value) => {
  player.value?.setVolume(value, false);
};

// 切换上下曲
const changeSong = (type) => {
  if (!player.value) return;
  type === 0 ? player.value.skipBack() : player.value.skipForward();
  nextTick(() => {
    player.value?.play();
  });
};

// 切换歌曲列表状态
const toggleList = () => {
  player.value?.toggleList();
};

// 加载音频错误
const loadMusicError = () => {
  let notice = "";
  if (playList.value.length > 1) {
    notice = "歌曲暂不可用，请尝试切换下一首";
  } else {
    notice = "播放歌曲出现错误";
  }
  ElMessage({
    message: notice,
    grouping: true,
    duration: 2000,
    icon: h(PlayWrong, {
      theme: "filled",
      fill: "#EFEFEF",
    }),
  });
};

// 暴露子组件方法
defineExpose({ playToggle, changeVolume, changeSong, toggleList });
</script>

<style lang="scss" scoped>
.aplayer {
  width: 80%;
  border-radius: 6px;
  font-family: "HarmonyOS_Regular", sans-serif !important;
  :deep(.aplayer-body) {
    background-color: transparent;
    .aplayer-pic {
      display: none;
    }
    .aplayer-info {
      margin-left: 0;
      background-color: #ffffff40;
      border-color: transparent !important;
      .aplayer-music {
        flex-grow: initial;
        margin-bottom: 2px;
        overflow: initial;
        .aplayer-title {
          font-size: 16px;
          margin-right: 6px;
        }
        .aplayer-author {
          color: #efefef;
        }
      }
      .aplayer-lrc {
        text-align: left;
        margin: 7px 0 6px 6px;
        height: 44px;
        mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        -webkit-mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        &::before,
        &::after {
          display: none;
        }
        p {
          color: #efefef;
        }
        .aplayer-lrc-current {
          font-size: 0.95rem;
          margin-bottom: 4px !important;
        }
      }
      .aplayer-controller {
        display: none;
      }
    }
  }
  :deep(.aplayer-list) {
    margin-top: 6px;
    height: v-bind(listHeight);
    background-color: transparent;
    ol {
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      li {
        border-color: transparent;
        &.aplayer-list-light {
          background: #ffffff40;
          border-radius: 6px;
        }
        &:hover {
          background: #ffffff26 !important;
          border-radius: 6px !important;
        }
        .aplayer-list-index,
        .aplayer-list-author {
          color: #efefef;
        }
      }
    }
  }
}
</style>
