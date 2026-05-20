<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div
      class="neon-card bg-slate-900/50 p-6 rounded-2xl border border-blue-500/30 relative overflow-hidden group"
    >
      <div
        class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"
      ></div>
      <div class="flex justify-between items-start">
        <div>
          <p class="text-blue-400 text-sm font-medium uppercase tracking-wider">
            إجمالي المستفيدين
          </p>
          <h3 class="text-4xl font-bold mt-2 text-white">{{ stats.total_beneficiaries || 0 }}</h3>
        </div>
        <div class="p-3 bg-blue-500/20 rounded-xl text-blue-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <div
      class="neon-card bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden group"
    >
      <div
        class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"
      ></div>
      <div class="flex justify-between items-start">
        <div>
          <p class="text-emerald-400 text-sm font-medium uppercase tracking-wider">ما تم توزيعه</p>
          <h3 class="text-4xl font-bold mt-2 text-white">{{ stats.total_distributed || 0 }}</h3>
        </div>
        <div class="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
      </div>
    </div>

    <div
      class="neon-card bg-slate-900/50 p-6 rounded-2xl border border-orange-500/30 relative overflow-hidden group"
    >
      <div
        class="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"
      ></div>
      <div class="flex justify-between items-start">
        <div>
          <p class="text-orange-400 text-sm font-medium uppercase tracking-wider">
            الرصيد المتاح حالياً
          </p>
          <h3 class="text-4xl font-bold mt-2 text-white">{{ stats.current_global_stock || 0 }}</h3>
        </div>
        <div class="p-3 bg-orange-500/20 rounded-xl text-orange-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ stats: Object })
</script>

<style scoped>
.neon-card {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}
.neon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 25px rgba(59, 130, 246, 0.1);
}
</style>
