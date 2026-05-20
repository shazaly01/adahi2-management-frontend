<!--src\views\reports\DistributionsReport.vue--->
<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">
          تقرير التوزيع والمستفيدين
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          عرض لحظي لإحصائيات التوزيع مفصلة حسب المجموعات أو الجهات.
        </p>
      </div>
      <button
        @click="printReport"
        class="bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-blue-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg"
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

    <div class="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
      <h1 class="text-2xl font-bold text-black">كشف صرف وتوزيع الأضاحي</h1>
      <p class="text-sm text-black mt-2">
        التاريخ: {{ new Date().toLocaleDateString('ar-EG') }} |
        <span v-if="filters.group_by === 'location'">تجميع حسب: مكان التسليم</span>
        <span v-else-if="filters.group_by === 'group'">تجميع حسب: المجموعة</span>
        <span v-else-if="filters.group_by === 'entity'">تجميع حسب: جهة التوزيع</span>
        <span v-else>كشف عام</span>
      </p>
    </div>

    <div
      class="bg-surface-section p-6 rounded-2xl border border-surface-border shadow-md print:hidden relative overflow-hidden"
    >
      <div
        class="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"
      ></div>

      <div class="flex justify-between items-center mb-5">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">
          محددات التقرير (تحديث تلقائي)
        </h3>

        <label
          class="flex items-center cursor-pointer gap-3 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >إظهار تفاصيل المستفيدين</span
          >
          <div class="relative">
            <input type="checkbox" v-model="showDetails" class="sr-only peer" />
            <div
              class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            ></div>
          </div>
        </label>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <AppDropdown
          id="group_by"
          label="تجميع البيانات حسب"
          v-model="filters.group_by"
          :options="groupByOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختر طريقة العرض"
        />

        <AppDropdown
          id="entity"
          label="جهة التوزيع"
          v-model="filters.distribution_entity_id"
          :options="entities"
          optionLabel="name"
          optionValue="id"
          placeholder="كل الجهات"
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >من تاريخ</label
          >
          <input
            type="date"
            v-model="filters.start_date"
            class="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >إلى تاريخ</label
          >
          <input
            type="date"
            v-model="filters.end_date"
            class="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-20 print:hidden">
      <div class="relative">
        <div
          class="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"
        ></div>
        <div
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full animate-pulse blur-sm"
        ></div>
      </div>
    </div>

    <div v-else-if="reportData" class="space-y-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:mb-6">
        <div
          class="bg-surface-section p-6 rounded-2xl border border-blue-500/20 flex items-center gap-5 shadow-sm print:border-black print:rounded-none"
        >
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-blue-500/10 text-blue-500 print:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7"
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
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 print:text-black">
              إجمالي ما تم توزيعه
            </p>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mt-1 print:text-black">
              {{ reportData.summary.total_distributed }}
              <span class="text-lg font-normal text-gray-500 print:text-black">أضحية</span>
            </h3>
          </div>
        </div>

        <div
          class="bg-surface-section p-6 rounded-2xl border border-orange-500/20 flex items-center gap-5 shadow-sm print:border-black print:rounded-none"
        >
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-orange-500/10 text-orange-500 print:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7"
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
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 print:text-black">
              الرصيد المتبقي (المتاح)
            </p>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mt-1 print:text-black">
              {{ reportData.summary.current_balance }}
              <span class="text-lg font-normal text-gray-500 print:text-black">أضحية</span>
            </h3>
          </div>
        </div>
      </div>

      <div
        v-if="!showDetails"
        class="bg-surface-section rounded-2xl border border-surface-border overflow-hidden shadow-sm print:border-black print:rounded-none print:shadow-none"
      >
        <div
          class="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-surface-border flex justify-between items-center print:bg-white print:border-black"
        >
          <h2 class="text-xl font-bold text-gray-800 dark:text-white print:text-black">
            إحصائية التوزيع الإجمالية
          </h2>
          <button
            @click="printReport"
            class="print:hidden bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all font-bold shadow-md"
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
            طباعة كشف الصرف (A4)
          </button>
        </div>

        <AppTable
          :headers="summaryTableHeaders"
          :items="reportData.grouped_data"
          :rowClickable="false"
          :isPrintable="true"
        >
          <template #cell-group_name="{ item }">
            <span class="font-bold text-gray-900 dark:text-white text-base print:text-black">{{
              item.group_name
            }}</span>
          </template>

          <template #cell-beneficiaries_count="{ item }">
            <span class="text-gray-700 dark:text-gray-300 font-medium print:text-black"
              >{{ item.beneficiaries.length }} مستفيد</span
            >
          </template>

          <template #cell-total_group_quantity="{ item }">
            <span
              class="inline-flex items-center justify-center px-4 py-1.5 text-base font-bold rounded-lg bg-blue-500/10 text-blue-700 border border-blue-500/20 print:border-none print:bg-transparent print:text-black print:p-0"
            >
              {{ item.total_group_quantity }}
            </span>
          </template>
        </AppTable>
      </div>

      <div v-else class="space-y-8">
        <div
          v-for="(group, index) in reportData.grouped_data"
          :key="'detail-' + index"
          class="bg-surface-section rounded-2xl border border-surface-border overflow-hidden shadow-sm print:border-black print:rounded-none print:shadow-none print:mb-8"
        >
          <div
            class="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-surface-border flex justify-between items-center print:bg-gray-100 print:border-black"
          >
            <div>
              <span class="text-xs text-gray-500 dark:text-gray-400 mb-1 block print:text-black">
                <span v-if="filters.group_by === 'location'">مكان التسليم</span>
                <span v-else-if="filters.group_by === 'group'">المجموعة</span>
                <span v-else-if="filters.group_by === 'entity'">جهة التوزيع</span>
              </span>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white print:text-black">
                {{ group.group_name }}
              </h2>
            </div>
            <div
              class="text-center bg-blue-500/10 px-6 py-2 rounded-xl border border-blue-500/20 print:border-black print:bg-transparent print:rounded-none"
            >
              <span
                class="block text-xs text-blue-600 dark:text-blue-400 font-medium print:text-black"
                >إجمالي الكمية</span
              >
              <span
                class="block text-2xl font-bold text-blue-700 dark:text-blue-300 print:text-black"
              >
                {{ group.total_group_quantity }}
              </span>
            </div>
          </div>

          <AppTable
            :headers="detailsTableHeaders"
            :items="group.beneficiaries"
            :rowClickable="false"
            :isPrintable="true"
          >
            <template #cell-beneficiary_name="{ item }">
              <div class="font-bold text-gray-900 dark:text-gray-100 text-base print:text-black">
                {{ item.beneficiary_name }}
              </div>
              <div class="text-xs text-gray-500 mt-0.5 font-mono print:text-black">
                {{ item.national_id }}
              </div>
            </template>

            <template #cell-total_quantity="{ item }">
              <span
                class="inline-flex items-center justify-center px-3 py-1 text-sm font-bold rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 print:border-none print:bg-transparent print:text-black print:p-0"
              >
                {{ item.total_quantity }}
              </span>
            </template>

            <template #cell-details="{ item }">
              <div class="flex flex-wrap gap-1.5 print:gap-1">
                <span
                  v-for="(detail, i) in item.details"
                  :key="i"
                  class="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-600 print:border-none print:bg-transparent print:text-black print:p-0"
                >
                  {{ detail.sacrifice_type }} ({{ detail.quantity }})<span
                    v-if="i < item.details.length - 1"
                    class="print:inline hidden"
                    >،
                  </span>
                </span>
              </div>
            </template>
          </AppTable>
        </div>
      </div>

      <div v-if="reportData.grouped_data.length === 0" class="text-center py-16 print:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto text-gray-400 mb-4 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">لا توجد بيانات</h3>
        <p class="text-gray-500 mt-1">لا توجد توزيعات مطابقة للفلاتر المحددة حالياً.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import reportService from '@/services/reportService'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTable from '@/components/ui/AppTable.vue'

// حالة العرض (إظهار التفاصيل أم المجاميع فقط)
const showDetails = ref(true)

// حالة الفلاتر
const filters = ref({
  group_by: 'all',
  distribution_entity_id: null,
  start_date: '',
  end_date: '',
})

// خيارات القوائم المنسدلة
const groupByOptions = [
  { label: 'الكل (بدون تجميع)', value: 'all' },
  { label: 'حسب مكان التسليم', value: 'location' },
  { label: 'حسب المجموعة', value: 'group' },
  { label: 'حسب جهة التوزيع', value: 'entity' },
]

const entities = ref([])
const loading = ref(false)
const reportData = ref(null)

// إعدادات جدول التفاصيل
const detailsTableHeaders = [
  { key: 'beneficiary_name', label: 'اسم المستفيد / الرقم الوطني' },
  { key: 'total_quantity', label: 'إجمالي الكمية' },
  { key: 'details', label: 'تفاصيل الأصناف' },
]

// إعدادات جدول المجاميع (الجديد)
const summaryTableHeaders = [
  { key: 'group_name', label: 'البيان (حسب التجميع)' },
  { key: 'beneficiaries_count', label: 'عدد المستفيدين' },
  { key: 'total_group_quantity', label: 'إجمالي الكميات الموزعة' },
]

// دالة جلب البيانات
const fetchReport = async () => {
  loading.value = true
  try {
    const response = await reportService.getDistributionsReport(filters.value)
    reportData.value = response.data.data
  } catch (error) {
    console.error('خطأ في جلب التقرير', error)
  } finally {
    loading.value = false
  }
}

// التحديث التلقائي عند تغيير الفلاتر
watch(
  filters,
  () => {
    fetchReport()
  },
  { deep: true },
)

const getEntityName = (id) => {
  if (!id) return 'كل الجهات'
  const entity = entities.value.find((e) => e.id === id)
  return entity ? entity.name : 'جهة غير معروفة'
}

// أضف هذه الدالة داخل الـ script setup
const printReport = () => {
  const cleanParams = {}

  if (filters.value.group_by) {
    cleanParams.group_by = filters.value.group_by
  }

  if (
    filters.value.distribution_entity_id !== null &&
    filters.value.distribution_entity_id !== undefined
  ) {
    cleanParams.distribution_entity_id = filters.value.distribution_entity_id
  }

  if (filters.value.start_date) {
    cleanParams.start_date = filters.value.start_date
  }
  if (filters.value.end_date) {
    cleanParams.end_date = filters.value.end_date
  }

  if (filters.value.distribution_entity_id) {
    cleanParams.entity_name = getEntityName(filters.value.distribution_entity_id)
  }

  // السطر الجديد: إرسال حالة إظهار التفاصيل
  cleanParams.showDetails = showDetails.value ? '1' : '0'

  const queryParams = new URLSearchParams(cleanParams).toString()
  window.open(`/print/distributions-report?${queryParams}`, '_blank')
}

onMounted(() => {
  fetchReport()
  // distributionEntityService.get().then(res => entities.value = res.data.data)
})
</script>

<style scoped>
/* إعدادات الطباعة الدقيقة لورقة A4 */
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm;
  }
  body,
  html {
    background-color: white !important;
    color: black !important;
  }
  .print\:hidden {
    display: none !important;
  }
  .print\:block {
    display: block !important;
  }

  /* مسح جميع الخلفيات الداكنة والتأثيرات وجعلها مناسبة للورق الأبيض */
  .bg-surface-section,
  .dark\:bg-slate-900,
  .dark\:bg-slate-800\/50,
  table,
  th,
  td {
    background-color: transparent !important;
    color: black !important;
    box-shadow: none !important;
  }

  /* رسم خطوط الجداول باللون الأسود الواضح */
  table {
    border-collapse: collapse !important;
    width: 100% !important;
  }
  th,
  td {
    border: 1px solid black !important;
    padding: 8px !important;
  }

  /* منع انقسام الجدول بين صفحتين إذا أمكن */
  tr {
    page-break-inside: avoid;
  }
}
</style>
