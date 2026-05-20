<template>
  <div class="p-6 space-y-8 bg-slate-950 min-h-screen text-slate-200">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white glow-text">
          لوحة التحكم الاستراتيجية
        </h1>
        <p class="text-slate-400 mt-1">مرحباً بك، إليك ملخص العمليات اللحظي للنظام.</p>
      </div>
      <button
        @click="loadData"
        class="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-primary transition-all"
      >
        <svg v-if="loading" class="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>

    <KpiStats :stats="dashboardData.kpis" :loading="loading" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <DistributionCharts :charts="dashboardData.charts" :loading="loading" />

      <RecentActivity :activities="dashboardData.recent_activities" :loading="loading" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import reportService from '@/services/reportService'
import KpiStats from './components/KpiStats.vue'
import DistributionCharts from './components/DistributionCharts.vue'
import RecentActivity from './components/RecentActivity.vue'

const loading = ref(true)
const dashboardData = ref({
  kpis: {},
  charts: { distributions_by_type: [], top_entities: [] },
  recent_activities: [],
})

const loadData = async () => {
  loading.value = true
  try {
    const response = await reportService.getDashboardData()
    dashboardData.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style>
.glow-text {
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}
</style>
