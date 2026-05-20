<template>
  <div class="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
    <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
      <span class="w-2 h-6 bg-orange-500 rounded-full"></span>
      أحدث حركات التوزيع
    </h3>

    <div class="overflow-x-auto">
      <table class="w-full text-right">
        <thead>
          <tr class="text-slate-500 text-sm border-b border-slate-800">
            <th class="pb-4 font-medium">المستفيد</th>
            <th class="pb-4 font-medium">الجهة</th>
            <th class="pb-4 font-medium text-center">الكمية</th>
            <th class="pb-4 font-medium text-left">التاريخ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/50">
          <tr
            v-for="act in activities"
            :key="act.id"
            class="group hover:bg-white/5 transition-colors"
          >
            <td class="py-4">
              <p class="text-sm font-bold text-slate-200">{{ act.beneficiary_name }}</p>
              <p class="text-xs text-slate-500">{{ act.receipt_number }}</p>
            </td>
            <td class="py-4 text-sm text-slate-400">{{ act.entity_name }}</td>
            <td class="py-4 text-center">
              <span
                class="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs font-bold border border-orange-500/20"
              >
                {{ act.quantity }}
              </span>
            </td>
            <td class="py-4 text-left text-xs text-slate-500 font-mono">
              {{ act.date }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activities.length === 0" class="text-center py-12 text-slate-600">
      لا توجد نشاطات مسجلة حالياً.
    </div>
  </div>
</template>

<script setup>
defineProps({ activities: Array })
</script>
