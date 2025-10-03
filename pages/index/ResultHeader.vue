<template>
  <section class="result-header">
    <div class="left" v-if="hasResults">
      <div class="platforms">
        <button
          :class="['pill-btn', { active: currentFilter === 'all' }]"
          @click="$emit('change-filter', 'all')">
          全部
        </button>
        <button
          v-for="p in platforms"
          :key="p"
          :class="['pill-btn', { active: currentFilter === p }]"
          @click="$emit('change-filter', p)">
          {{ platformName(p) }}
        </button>
      </div>
    </div>
    <div class="right">
      <span v-if="deepLoading" class="deep-pill">持续搜索中…</span>
      <div class="stats" v-if="total > 0 && elapsedMs > 0">
        <span
          >结果: <strong>{{ total }}</strong></span
        >
        <span
          >用时: <strong>{{ elapsedMs }}ms</strong></span
        >
      </div>
      <div class="sorter" v-if="hasResults">
        <label
          >排序
          <select
            :value="currentSort"
            @change="
              $emit('change-sort', ($event.target as HTMLSelectElement).value)
            ">
            <option value="default">默认</option>
            <option value="date-desc">时间(新→旧)</option>
            <option value="date-asc">时间(旧→新)</option>
            <option value="name-asc">名称(A→Z)</option>
            <option value="name-desc">名称(Z→A)</option>
          </select>
        </label>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  total: number;
  elapsedMs: number;
  platforms: string[];
  hasResults: boolean;
  platformName: (p: string) => string;
  model: { sortType: string; filterPlatform: string };
  deepLoading?: boolean;
}>();
defineEmits(["update:model", "change-filter", "change-sort"]);

const currentFilter = computed(() =>
  typeof props.model.filterPlatform === "object" &&
  (props.model.filterPlatform as any).value !== undefined
    ? (props.model.filterPlatform as any).value
    : props.model.filterPlatform
);
const currentSort = computed(() =>
  typeof props.model.sortType === "object" &&
  (props.model.sortType as any).value !== undefined
    ? (props.model.sortType as any).value
    : props.model.sortType
);

// 交互通过事件通知父组件处理，避免在子组件内直接修改 props
</script>

<style scoped>
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 14px 2px;
}
.right {
  display: flex;
  gap: 12px;
  align-items: center;
}
.deep-pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  margin-right: 8px;
}
.platforms {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.pill-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  padding: 4px 10px;
  cursor: pointer;
}
.pill-btn.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

/* 小屏优化 */
@media (max-width: 640px) {
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .left {
    width: 100%;
  }
  .right {
    width: 100%;
    justify-content: space-between;
  }
  .platforms {
    flex-wrap: wrap;
    gap: 6px 8px;
    align-content: flex-start;
  }
  .pill-btn {
    white-space: nowrap;
    padding: 4px 8px;
    font-size: 12px;
  }
}

.deep-pill {
  white-space: nowrap;
  flex: 0 0 auto;
  order: 99; /* 放在平台 pill 之后显示 */
}
</style>
