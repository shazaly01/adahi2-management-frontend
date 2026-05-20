<template>
  <div class="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-8">
    <div>
      <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span class="w-2 h-6 bg-blue-500 rounded-full"></span>
        توزيع الكميات حسب النوع
      </h3>
      <div class="space-y-4">
        <div v-for="type in charts.distributions_by_type" :key="type.name" class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-slate-300">{{ type.name }}</span>
            <span class="text-white font-bold">{{ type.total }}</span>
          </div>
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000"
              :style="{ width: calculatePercent(type.total) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span class="w-2 h-6 bg-emerald-500 rounded-full"></span>
        أكثر الجهات توزيعاً
      </h3>
      <div class="grid grid-cols-1 gap-3">
        <div
          v-for="(entity, index) in charts.top_entities"
          :key="index"
          class="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
        >
          <div class="flex items-center gap-3">
            <span
              class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 border border-emerald-500/20"
            >
              #{{ index + 1 }}
            </span>
            <span class="text-slate-200">{{ entity.name }}</span>
          </div>
          <span class="text-emerald-400 font-mono font-bold">{{ entity.total }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ charts: Object })

const calculatePercent = (val) => {
  const max = Math.max(...props.charts.distributions_by_type.map((t) => t.total), 1)
  return (val / max) * 100
}
</script>
