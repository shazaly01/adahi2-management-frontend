<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">دفتر حركة وأرصدة المخزون</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          مراقبة دقيقة لكل حركات الدخول والخروج في المخازن المركزية وعُهد الجهات.
        </p>
      </div>
      <button
        @click="printReport"
        class="bg-surface-section border border-surface-border hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors print:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        طباعة التقرير
      </button>
    </div>

    <div
      class="bg-surface-section p-5 rounded-xl border border-surface-border shadow-sm print:hidden"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AppDropdown
          id="warehouse"
          label="المخزن المركزي"
          v-model="filters.warehouse_id"
          :options="warehouses"
          optionLabel="name"
          optionValue="id"
          placeholder="كل المخازن"
        />

        <AppDropdown
          id="entity"
          label="جهة التوزيع (العُهدة)"
          v-model="filters.distribution_entity_id"
          :options="entities"
          optionLabel="name"
          optionValue="id"
          placeholder="كل الجهات"
        />

        <AppDropdown
          id="sacrifice_type"
          label="نوع الأضحية"
          v-model="filters.sacrifice_type_id"
          :options="sacrificeTypes"
          optionLabel="name"
          optionValue="id"
          placeholder="كل الأنواع"
        />

        <AppDropdown
          id="movement_type"
          label="نوع الحركة"
          v-model="filters.movement_type"
          :options="movementTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="الكل (وارد ومنصرف)"
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >من تاريخ</label
          >
          <input
            type="date"
            v-model="filters.start_date"
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-surface-ground dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >إلى تاريخ</label
          >
          <input
            type="date"
            v-model="filters.end_date"
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-surface-ground dark:text-white"
          />
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="fetchReport"
          :disabled="loading"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <span v-if="loading">جاري المعالجة...</span>
          <span v-else>تحديث الدفتر</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg
        class="animate-spin h-10 w-10 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
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
    </div>

    <div v-else-if="reportData" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          class="bg-surface-section p-6 rounded-2xl border border-surface-border flex items-center gap-4 shadow-sm"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">إجمالي الوارد (In)</p>
            <h3 class="text-2xl font-bold text-emerald-600">{{ reportData.summary.total_in }}</h3>
          </div>
        </div>

        <div
          class="bg-surface-section p-6 rounded-2xl border border-surface-border flex items-center gap-4 shadow-sm"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-100 text-rose-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">إجمالي المنصرف (Out)</p>
            <h3 class="text-2xl font-bold text-rose-600">{{ reportData.summary.total_out }}</h3>
          </div>
        </div>

        <div
          class="bg-surface-section p-6 rounded-2xl border border-surface-border flex items-center gap-4 shadow-sm"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">الرصيد الصافي</p>
            <h3 class="text-2xl font-bold text-blue-600">{{ reportData.summary.net_balance }}</h3>
          </div>
        </div>
      </div>

      <div class="bg-surface-section rounded-xl border border-surface-border shadow-sm">
        <div class="p-4 border-b border-surface-border">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white">سجل الحركات التفصيلي</h2>
        </div>

        <AppTable
          :headers="tableHeaders"
          :items="reportData.movements"
          :rowClickable="false"
          :isPrintable="true"
        >
          <template #cell-movement_type="{ item }">
            <span
              v-if="item.movement_type === 'in'"
              class="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full dark:bg-emerald-900 dark:text-emerald-300"
            >
              وارد &rarr;
            </span>
            <span
              v-else
              class="px-2 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full dark:bg-rose-900 dark:text-rose-300"
            >
              منصرف &larr;
            </span>
          </template>

          <template #cell-quantity="{ item }">
            <span class="font-bold text-gray-900 dark:text-white">{{ item.quantity }}</span>
          </template>

          <template #cell-sacrifice_type="{ item }">
            <span class="text-gray-700 dark:text-gray-200">{{
              item.sacrifice_type?.name || 'غير محدد'
            }}</span>
          </template>

          <template #cell-location="{ item }">
            <div v-if="item.warehouse" class="text-xs text-blue-600 font-semibold">
              مخزن: {{ item.warehouse.name }}
            </div>
            <div v-if="item.distribution_entity" class="text-xs text-orange-600 font-semibold">
              جهة: {{ item.distribution_entity.name }}
            </div>
          </template>

          <template #cell-created_at="{ item }">
            <span class="text-xs text-gray-500" dir="ltr">{{
              new Date(item.created_at).toLocaleString('ar-EG')
            }}</span>
          </template>
        </AppTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import reportService from '@/services/reportService'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTable from '@/components/ui/AppTable.vue'

// --- حالة الفلاتر ---
const filters = ref({
  warehouse_id: null,
  distribution_entity_id: null,
  sacrifice_type_id: null,
  movement_type: '',
  start_date: '',
  end_date: '',
})

// --- خيارات القوائم المنسدلة ---
const movementTypes = [
  { label: 'الكل', value: '' },
  { label: 'وارد فقط (In)', value: 'in' },
  { label: 'منصرف فقط (Out)', value: 'out' },
]

// هذه المصفوفات يجب تعبئتها من الـ APIs الخاصة بها لاحقاً
const warehouses = ref([])
const entities = ref([])
const sacrificeTypes = ref([])

const loading = ref(false)
const reportData = ref(null)

// --- إعدادات جدول AppTable ---
const tableHeaders = [
  { key: 'created_at', label: 'التاريخ والوقت' },
  { key: 'movement_type', label: 'الحركة' },
  { key: 'sacrifice_type', label: 'الصنف' },
  { key: 'quantity', label: 'الكمية' },
  { key: 'location', label: 'الموقع' },
  { key: 'user.name', label: 'المستخدم' }, // يعتمد على أن AppTable يدعم dot notation، أو يمكنك تخصيص Slot لها
]

// --- الدوال ---

const fetchReport = async () => {
  loading.value = true
  reportData.value = null
  try {
    const response = await reportService.getInventoryReport(filters.value)
    reportData.value = response.data.data
  } catch (error) {
    console.error('خطأ في جلب تقرير المخزون', error)
  } finally {
    loading.value = false
  }
}

const printReport = () => {
  window.print()
}

onMounted(() => {
  // هنا يمكنك استدعاء دوال جلب (المخازن، الجهات، وأنواع الأضاحي) لتعبئة قوائم الفلاتر
  // مثال:
  // warehouseService.get().then(res => warehouses.value = res.data.data)
  // distributionEntityService.get().then(res => entities.value = res.data.data)
  // sacrificeTypeService.get().then(res => sacrificeTypes.value = res.data.data)

  // جلب البيانات الأولية للتقرير
  fetchReport()
})
</script>

<style scoped>
@media print {
  /* تحسينات الطباعة لضمان ظهور الجدول بشكل ممتاز على الورق */
  body {
    background-color: white !important;
  }
  .bg-surface-section {
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
  }
}
</style>
