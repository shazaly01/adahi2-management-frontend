<!-- src\views\reports\PrintDistributionsReport.vue -->
<template>
  <div class="print-container">
    <!-- زر الطباعة (يظهر فقط على الشاشة) -->
    <div class="print-button-bar no-print">
      <button @click="window.print()" class="btn-print">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 inline-block mr-1"
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

    <!-- محتوى التقرير (يظهر في الطباعة والشاشة) -->
    <div class="report-page">
      <!-- ترويسة التقرير -->
      <div class="report-header">
        <img src="/MainLogo.png" alt="شعار المؤسسة" class="logo" />
        <div class="header-text">
          <h1>كشف صرف وتوزيع الأضاحي</h1>
          <p class="report-date">
            التاريخ: {{ reportDate }} |
            <span v-if="query.group_by === 'location'">تجميع حسب: مكان التسليم</span>
            <span v-else-if="query.group_by === 'group'">تجميع حسب: المجموعة</span>
            <span v-else-if="query.group_by === 'entity'">تجميع حسب: جهة التوزيع</span>
            <span v-else>كشف عام</span>
            <span v-if="query.entity_name"> | جهة التوزيع: {{ query.entity_name }}</span>
            <span v-if="query.start_date || query.end_date">
              | الفترة: {{ query.start_date || '...' }} إلى {{ query.end_date || '...' }}
            </span>
          </p>
        </div>
      </div>

      <!-- ملخص الإحصائيات -->
      <div class="summary-cards">
        <div class="card">
          <span class="card-label">إجمالي ما تم توزيعه</span>
          <span class="card-value">{{ reportData?.summary?.total_distributed ?? 0 }} أضحية</span>
        </div>
        <div class="card">
          <span class="card-label">الرصيد المتبقي (المتاح)</span>
          <span class="card-value">{{ reportData?.summary?.current_balance ?? 0 }} أضحية</span>
        </div>
      </div>

      <!-- جدول مجمع حسب المجموعة/المكان/الجهة (يظهر دائماً) -->
      <div v-if="reportData?.grouped_data?.length" class="grouped-section">
        <h2 class="section-title">إحصائية التوزيع الإجمالية</h2>
        <table class="report-table summary-table">
          <colgroup>
            <col style="width: 60%" />
            <col style="width: 20%" />
            <col style="width: 20%" />
          </colgroup>
          <thead>
            <tr>
              <th>البيان</th>
              <th>عدد المستفيدين</th>
              <th>إجمالي الكميات الموزعة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(group, idx) in reportData.grouped_data" :key="idx">
              <td class="font-bold">{{ group.group_name }}</td>
              <td>{{ group.beneficiaries?.length ?? 0 }} مستفيد</td>
              <td>{{ group.total_group_quantity }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>المجموع الكلي</th>
              <th>{{ totalBeneficiaries }} مستفيد</th>
              <th>{{ totalQuantity }}</th>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- تفاصيل المستفيدين حسب كل مجموعة (تظهر فقط إذا showDetails = '1') -->
      <div v-if="showDetailsParam && reportData?.grouped_data?.length" class="details-section">
        <h2 class="section-title">تفاصيل المستفيدين حسب كل {{ groupByLabel }}</h2>
        <div
          v-for="(group, idx) in reportData.grouped_data"
          :key="'det-' + idx"
          class="group-detail"
        >
          <h3 class="group-name">
            {{ group.group_name }} (إجمالي الكمية: {{ group.total_group_quantity }})
          </h3>
          <table class="report-table details-table">
            <colgroup>
              <col style="width: 50%" />
              <col style="width: 15%" />
              <col style="width: 35%" />
            </colgroup>
            <thead>
              <tr>
                <th>اسم المستفيد / الرقم الوطني</th>
                <th>الكمية</th>
                <th>تفاصيل الأصناف</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ben, bIdx) in group.beneficiaries" :key="bIdx">
                <td>
                  <div class="beneficiary-name">{{ ben.beneficiary_name }}</div>
                  <div class="national-id">{{ ben.national_id }}</div>
                </td>
                <td>{{ ben.total_quantity }}</td>
                <td>
                  <span v-for="(det, dIdx) in ben.details" :key="dIdx" class="detail-item">
                    {{ det.sacrifice_type }} ({{ det.quantity }})<span
                      v-if="dIdx < ben.details.length - 1"
                      >،
                    </span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- حالة عدم وجود بيانات -->
      <div
        v-if="!loading && (!reportData || reportData.grouped_data?.length === 0)"
        class="no-data"
      >
        لا توجد بيانات تطابق الفلاتر المحددة.
      </div>

      <!-- مؤشر التحميل -->
      <div v-if="loading" class="loading">جاري تحميل البيانات...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import reportService from '@/services/reportService'

const route = useRoute()
const query = computed(() => route.query)

const loading = ref(true)
const reportData = ref(null)

// قراءة معامل إظهار التفاصيل (القيمة '1' تعني true)
const showDetailsParam = computed(() => query.value.showDetails === '1')

const reportDate = new Date().toLocaleDateString('ar-EG', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const fetchReportData = async () => {
  loading.value = true
  try {
    const params = {
      group_by: query.value.group_by || 'all',
      distribution_entity_id: query.value.distribution_entity_id || null,
      start_date: query.value.start_date || '',
      end_date: query.value.end_date || '',
    }
    const response = await reportService.getDistributionsReport(params)
    reportData.value = response.data.data
  } catch (error) {
    console.error('خطأ في جلب بيانات التقرير للطباعة:', error)
  } finally {
    loading.value = false
  }
}

const totalBeneficiaries = computed(() => {
  let total = 0
  reportData.value?.grouped_data?.forEach((g) => {
    total += g.beneficiaries?.length || 0
  })
  return total
})

const totalQuantity = computed(() => {
  let total = 0
  reportData.value?.grouped_data?.forEach((g) => {
    total += Number(g.total_group_quantity) || 0
  })
  return total
})

const groupByLabel = computed(() => {
  const map = {
    location: 'مكان التسليم',
    group: 'المجموعة',
    entity: 'جهة التوزيع',
    all: 'الكل',
  }
  return map[query.value.group_by] || 'المجموعة'
})

onMounted(() => {
  fetchReportData()
})
</script>

<style scoped>
/* متغيرات عامة للطباعة والشاشة */
:root {
  --text-color: #1f2937;
  --border-color: #000000;
}

/* زر الطباعة - يظهر فقط على الشاشة */
@media screen {
  .no-print {
    display: block;
  }
  .print-button-bar {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .btn-print {
    background: #1e293b;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }
  .btn-print:hover {
    background: #334155;
  }
}

@media print {
  .no-print {
    display: none !important;
  }
}

/* تنسيق صفحة التقرير */
.report-page {
  max-width: 210mm;
  margin: 0 auto;
  padding: 20px 25px;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  color: #1f2937;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  min-height: 297mm;
}

@media print {
  .report-page {
    box-shadow: none;
    padding: 0;
    max-width: none;
  }
}

/* ترويسة التقرير */
.report-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  border-bottom: 3px double #000;
  padding-bottom: 20px;
  margin-bottom: 25px;
}

.logo {
  height: 70px;
  width: auto;
}

.header-text {
  text-align: center;
}

.header-text h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 5px 0;
  letter-spacing: 1px;
  color: #111;
}

.report-date {
  font-size: 14px;
  color: #555;
  margin: 0;
}

/* بطاقات الملخص */
.summary-cards {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
}

.card {
  border: 2px solid #000;
  padding: 15px 25px;
  border-radius: 8px;
  text-align: center;
  min-width: 180px;
  background: #f9fafb;
}

.card-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
}

.card-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #111;
}

/* عناوين الأقسام */
.section-title {
  font-size: 20px;
  font-weight: 700;
  margin: 30px 0 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #000;
  color: #111;
}

/* جداول التقرير (عام) */
.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
  font-size: 14px;
  table-layout: fixed; /* يجعل عرض الأعمدة ثابتاً حسب colgroup */
}

.report-table th,
.report-table td {
  border: 1px solid #000;
  padding: 10px 12px;
  vertical-align: middle;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* جدول المجاميع: توسيط العناوين والبيانات */
.summary-table th,
.summary-table td {
  text-align: center;
}

.summary-table thead th {
  background-color: #f3f4f6;
  font-weight: 700;
  color: #111;
  font-size: 15px;
}

.summary-table tbody td {
  color: #1f2937;
}

.summary-table tfoot th {
  background-color: #e5e7eb;
  font-weight: 700;
}

/* جدول التفاصيل: توسيط محدود لأعمدة الكمية والتفاصيل */
.details-table th,
.details-table td {
  text-align: center;
}

/* العمود الأول (اسم المستفيد) في جدول التفاصيل يمكن أن يكون بمحاذاة يمين إن أردنا، لكن سنبقيه في المنتصف أو يمين حسب الرغبة، لكن المحتوى اسمه طويل فليكن بمحاذاة يمين أفضل للقراءة. سأجعله بمحاذاة يمين. */
.details-table td:first-child {
  text-align: right;
}

/* لضمان ظهور النص في الخلايا بشكل لائق */
.font-bold {
  font-weight: 700;
  color: #111;
}

.beneficiary-name {
  font-weight: 700;
}

.national-id {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  font-family: monospace;
}

.detail-item {
  white-space: nowrap;
}

.group-name {
  font-size: 18px;
  font-weight: 700;
  margin: 25px 0 10px;
  padding: 8px 15px;
  background: #f3f4f6;
  border-left: 5px solid #000;
  color: #111;
}

.no-data,
.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #6b7280;
}

@media print {
  .summary-cards .card {
    background: white;
    border: 2px solid #000;
  }
  .report-table thead th {
    background-color: #eee;
  }
  .group-name {
    background: #f9fafb;
    border-left-color: #000;
  }
}
</style>
