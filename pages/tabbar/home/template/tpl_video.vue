<template>
  <div class="layout" :style="wrapperStyle">
    <div class="video-shell" :style="boxStyle">
      <div
        class="video-ratio"
        :style="{ paddingBottom: aspectPadding + '%' }"
      >
        <div class="video-ratio-inner">
          <video
            v-if="item.videoUrl"
            class="video-media"
            :src="item.videoUrl"
            :poster="item.poster"
            :autoplay="!!item.autoplay"
            :controls="true"
            object-fit="cover"
          />
          <image
            v-else-if="item.poster"
            class="video-media"
            :src="item.poster"
            mode="aspectFill"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ res: any }>();

const DEFAULT_VIDEO_STYLE = {
  bgType: "color",
  bgColorStart: "#F5F5F5",
  bgColorEnd: "#F5F5F5",
  bgGradientDir: "horizontal",
  bgRadius: 0,
  bottomBgColor: "#F5F5F5",
  bgImage: "",
  margin: 0,
  padding: 0,
  borderShow: false,
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "#e5e5e5",
  shadowShow: false,
  shadowColor: "rgba(0,0,0,0.1)",
  shadowX: 0,
  shadowY: 0,
  shadowBlur: 10,
  shadowSpread: 0,
};

const ASPECT_RATIO_MAP: Record<string, number> = {
  "16:9": 56.25,
  "4:3": 75,
  "1:1": 100,
};

function ensureVideoItem(item: any) {
  if (!item.aspectRatio) item.aspectRatio = "16:9";
  if (!item.style) {
    item.style = { ...DEFAULT_VIDEO_STYLE };
    return;
  }
  Object.keys(DEFAULT_VIDEO_STYLE).forEach((key) => {
    if (item.style[key] === undefined) {
      item.style[key] = DEFAULT_VIDEO_STYLE[key as keyof typeof DEFAULT_VIDEO_STYLE];
    }
  });
}

function getVideoGradient(style: any) {
  const start = style.bgColorStart || "#F5F5F5";
  const end = style.bgColorEnd || start;
  const colors = `${start}, ${end}`;
  const dirMap: Record<string, string> = {
    horizontal: `linear-gradient(to right, ${colors})`,
    vertical: `linear-gradient(to bottom, ${colors})`,
    skewLeft: `linear-gradient(135deg, ${colors})`,
    skewRight: `linear-gradient(45deg, ${colors})`,
  };
  return dirMap[style.bgGradientDir] || dirMap.horizontal;
}

const item = computed(() => {
  const data = props.res.list[0] || {};
  ensureVideoItem(data);
  return data;
});

// 面板保存过样式字段（options 级）才启用新样式，老数据走 item.style 体系
const styled = computed(() => props.res && props.res.paddingTop !== undefined);

const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (styled.value) {
    const bg =
      !res.bgColor2 || res.bgColor1 === res.bgColor2
        ? res.bgColor1
        : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
    const radius = Number(res.borderRadius) || 0;
    return {
      padding: `${Number(res.paddingTop) || 0}rpx ${Number(res.paddingX) || 0}rpx ${Number(res.paddingBottom) || 0}rpx`,
      background: bg,
      borderRadius: `${radius}rpx`,
      marginBottom: `${Number(res.pageGap) || 0}rpx`,
      overflow: radius > 0 ? "hidden" : "visible",
      boxSizing: "border-box",
    };
  }
  const style = item.value.style;
  return {
    margin: `${style.margin || 0}px`,
    padding: `${style.padding || 0}px`,
    background: style.bottomBgColor || "#F5F5F5",
    boxSizing: "border-box",
  };
});

const boxStyle = computed(() => {
  if (styled.value) {
    return {
      borderRadius: `${Number(props.res.imgRadius) || 0}rpx`,
      overflow: "hidden",
      position: "relative",
      width: "100%",
    };
  }
  const style = item.value.style;
  const box: Record<string, string> = {
    borderRadius: `${style.bgRadius || 0}px`,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  };

  if (style.bgType === "image" && style.bgImage) {
    box.backgroundImage = `url(${style.bgImage})`;
    box.backgroundSize = "cover";
    box.backgroundPosition = "center";
  } else {
    box.background = getVideoGradient(style);
  }

  if (style.borderShow) {
    box.border = `${style.borderWidth || 1}px ${style.borderStyle || "solid"} ${
      style.borderColor || "#e5e5e5"
    }`;
  }

  if (style.shadowShow) {
    box.boxShadow = `${style.shadowX || 0}px ${style.shadowY || 0}px ${
      style.shadowBlur || 10
    }px ${style.shadowSpread || 0}px ${style.shadowColor || "rgba(0,0,0,0.1)"}`;
  }

  return box;
});

const aspectPadding = computed(
  () => ASPECT_RATIO_MAP[item.value.aspectRatio] || ASPECT_RATIO_MAP["16:9"]
);
</script>
<style lang="scss" scoped>
@import "./tpl.scss";

.layout {
  padding: 0;
  margin: 0;
  background: transparent;
}

.video-shell {
  width: 100%;
}

.video-ratio {
  width: 100%;
  height: 0;
  position: relative;
}

.video-ratio-inner {
  position: absolute;
  inset: 0;
}

.video-media {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
