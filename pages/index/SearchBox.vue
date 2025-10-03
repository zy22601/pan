<template>
  <section class="search">
    <div class="search__box" :class="{ focused: isFocused }">
      <span class="search__icon">🔎</span>
      <input
        ref="inputEl"
        :value="modelValue"
        :placeholder="placeholder"
        autofocus
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keyup.enter="handleSearch"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd" />
      <button
        v-if="modelValue"
        class="btn btn--ghost"
        type="button"
        @click="
          $emit('update:modelValue', '');
          $emit('reset');
        "
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd">
        重置
      </button>
      <button
        class="btn btn--primary"
        type="button"
        :disabled="!modelValue || loading"
        @click="handleSearch"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd">
        {{ loading ? "搜索中…" : "搜索" }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  loading: boolean;
  placeholder: string;
}>();
const emit = defineEmits(["update:modelValue", "search", "reset"]);

const isFocused = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);
const touchStartTime = ref(0);

// 处理搜索按钮点击
function handleSearch() {
  // iOS Safari兼容性：确保输入框失去焦点
  if (
    typeof window !== "undefined" &&
    document.activeElement instanceof HTMLInputElement
  ) {
    document.activeElement.blur();
  }

  // 添加小延迟确保焦点处理完成
  setTimeout(() => {
    emit("search");
  }, 50);
}

// 处理触摸开始事件
function handleTouchStart() {
  touchStartTime.value = Date.now();
}

// 处理触摸结束事件
function handleTouchEnd() {
  const touchDuration = Date.now() - touchStartTime.value;
  // 如果触摸时间太短，可能是误触，不执行操作
  if (touchDuration < 50) {
    return;
  }
}

onMounted(() => {
  // 等待一帧后再聚焦，避免与 SSR/过渡阶段冲突
  requestAnimationFrame(() => {
    // iOS Safari兼容性：使用setTimeout确保DOM完全渲染
    setTimeout(() => {
      inputEl.value?.focus();
    }, 100);
  });
});
</script>

<style scoped>
.search {
  margin-top: 16px;
}
.search__box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  /* iOS Safari兼容性：防止缩放 */
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}
.search__box.focused {
  box-shadow: 0 10px 30px rgba(38, 132, 255, 0.12);
}
.search__icon {
  opacity: 0.6;
  /* iOS Safari兼容性：防止图标被缩放 */
  -webkit-user-select: none;
  user-select: none;
}
.search__box input {
  flex: 1;
  border: 0;
  outline: none;
  font-size: 16px;
  /* iOS Safari兼容性：防止输入框缩放 */
  -webkit-appearance: none;
  -webkit-border-radius: 0;
  border-radius: 0;
  /* iOS Safari兼容性：防止自动缩放 */
  -webkit-text-size-adjust: 100%;
  /* iOS Safari兼容性：改善输入体验 */
  -webkit-tap-highlight-color: transparent;
}
.btn {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111;
  border-radius: 10px;
  cursor: pointer;
  /* iOS Safari兼容性：防止按钮缩放 */
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  /* iOS Safari兼容性：改善触摸体验 */
  -webkit-user-select: none;
  user-select: none;
  /* iOS Safari兼容性：防止按钮被缩放 */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}
.btn:hover {
  background: #f6f7f9;
}
.btn:active {
  /* iOS Safari兼容性：触摸反馈 */
  background: #e5e7eb;
  transform: scale(0.98);
}
.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--primary {
  background: #111;
  color: #fff;
  border-color: #111;
}
.btn--primary:hover {
  background: #000;
}
.btn--primary:active {
  background: #000;
}
.btn--ghost {
  background: transparent;
}

/* 小屏优化：按钮换行、输入占满 */
@media (max-width: 640px) {
  .search__box {
    flex-wrap: wrap;
    gap: 6px;
  }
  .search__icon {
    display: none;
  }
  .search__box input {
    width: 100%;
    font-size: 15px;
    /* iOS Safari兼容性：确保输入框在小屏幕上正常工作 */
    -webkit-appearance: none;
    -webkit-border-radius: 0;
  }
  .btn {
    padding: 8px 10px;
    font-size: 14px;
    /* iOS Safari兼容性：确保按钮在小屏幕上正常工作 */
    min-height: 44px;
    min-width: 44px;
  }
}

/* iOS Safari特定优化 */
@supports (-webkit-touch-callout: none) {
  .search__box input {
    /* iOS Safari兼容性：防止输入框出现默认样式 */
    -webkit-appearance: none;
    -webkit-border-radius: 0;
    border-radius: 0;
  }

  .btn {
    /* iOS Safari兼容性：确保按钮有足够的触摸区域 */
    min-height: 44px;
    min-width: 44px;
    /* iOS Safari兼容性：防止按钮出现默认样式 */
    -webkit-appearance: none;
    -webkit-border-radius: 10px;
  }
}
</style>
