<template>
  <div class="print-wrapper min-h-screen bg-gray-100 font-sans" dir="rtl">
    <div
      class="no-print bg-white shadow-md p-4 sticky top-0 z-50 flex justify-between items-center"
    >
      <div>
        <h2 class="text-2xl font-bold text-indigo-700">معاينة الإيصالات (A4 كامل)</h2>
        <p class="text-sm text-gray-500 mt-1">
          تم تحديث النظام ليدعم السوق الليبي (د.ل). الإيصال الآن يغطي ورقة A4 كاملة. يرجى التأكد من
          أن إعداد الطباعة Portrait.
        </p>
      </div>
      <div class="flex gap-4">
        <button
          @click="window.close()"
          class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
        >
          إغلاق
        </button>
        <button
          @click="executePrint"
          :disabled="loading || error"
          class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
        >
          <span class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                clip-rule="evenodd"
              />
            </svg>
            طباعة ملونة الآن
          </span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col justify-center items-center h-[80vh] no-print">
      <div
        class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"
      ></div>
      <p class="text-xl font-bold text-indigo-800">جاري تجهيز الإيصالات...</p>
    </div>

    <div
      v-if="error"
      class="flex flex-col justify-center items-center h-[80vh] no-print text-red-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-24 w-24 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-2xl font-bold mb-2">عذراً، حدث خطأ!</p>
      <p class="text-lg">{{ error }}</p>
    </div>

    <div
      v-else
      class="print-container py-8 mx-auto flex flex-col gap-8 items-center print:py-0 print:gap-0"
    >
      <div
        v-for="(receipt, index) in receipts"
        :key="receipt.id"
        class="receipt-card bg-white overflow-hidden relative"
      >
        <!-- الترويسة المحدثة: شعار في المنتصف وكبير -->
        <div
          class="flex flex-col items-center justify-center pt-16 pb-8 border-b-4 border-indigo-100"
        >
          <img src="/MainLogo.png" alt="شعار المؤسسة" class="h-32 w-auto object-contain mb-6" />

          <h1 class="text-4xl font-black text-indigo-900 tracking-tight drop-shadow-sm mb-4">
            إيصال استلام أضحية
          </h1>

          <div class="flex gap-4 items-center mb-4">
            <div class="bg-indigo-50 border-2 border-indigo-100 rounded-xl px-6 py-2">
              <span class="text-lg text-indigo-500 font-bold ml-2">رقم الإيصال:</span>
              <span class="text-2xl font-black text-indigo-700 font-mono">
                #{{ receipt.receipt_number }}
              </span>
            </div>

            <span
              class="text-lg px-4 py-2 rounded-xl font-bold shadow-sm"
              :class="
                isBulkReceipt(receipt)
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-indigo-100 text-indigo-700'
              "
            >
              {{ isBulkReceipt(receipt) ? 'جهة / مشروع' : 'إيصال فردي' }}
            </span>
          </div>

          <p class="text-lg font-bold text-gray-500 mt-2">
            تاريخ الإصدار: {{ formatDate(receipt.created_at) }}
          </p>
        </div>

        <!-- محتوى الإيصال الموزع على عمودين مع تكبير الخطوط -->
        <div
          class="px-4 md:px-12 py-6 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 relative z-10 flex-grow"
        >
          <!-- بيانات المستفيد -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-3 h-8 bg-indigo-500 rounded-full"></div>
              <h3 class="text-2xl font-bold text-gray-800">بيانات المستفيد</h3>
            </div>

            <div class="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 shadow-inner space-y-4">
              <div class="flex justify-between border-b border-gray-200 pb-3">
                <span class="text-gray-500 font-bold text-lg">
                  {{ isBulkReceipt(receipt) ? 'اسم الجهة / المشروع:' : 'الاسم الرباعي:' }}
                </span>
                <span class="font-black text-gray-900 text-lg">{{
                  receipt.beneficiary?.name
                }}</span>
              </div>

              <div
                class="flex justify-between border-b border-gray-200 pb-3"
                v-if="receipt.beneficiary?.national_id"
              >
                <span class="text-gray-500 font-bold text-lg">الرقم الوطني:</span>
                <span class="font-bold text-gray-900 text-lg">{{
                  receipt.beneficiary.national_id
                }}</span>
              </div>

              <div
                class="flex justify-between border-b border-gray-200 pb-3"
                v-if="receipt.beneficiary?.phone"
              >
                <span class="text-gray-500 font-bold text-lg">رقم الهاتف:</span>
                <span class="font-bold text-gray-900 text-lg" dir="ltr">
                  {{ receipt.beneficiary.phone }}
                </span>
              </div>

              <!-- الحقل الجديد: العنوان -->
              <div class="flex justify-between pb-3" v-if="receipt.beneficiary?.address">
                <span class="text-gray-500 font-bold text-lg">العنوان:</span>
                <span class="font-bold text-gray-900 text-lg">{{
                  receipt.beneficiary.address
                }}</span>
              </div>
            </div>
          </div>

          <!-- بيانات الصرف -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-3 h-8 bg-emerald-500 rounded-full"></div>
              <h3 class="text-2xl font-bold text-gray-800">بيانات الصرف</h3>
            </div>

            <div
              class="bg-emerald-50/50 p-6 rounded-2xl border-2 border-emerald-100 shadow-inner space-y-4"
            >
              <div class="flex justify-between border-b border-emerald-100 pb-3">
                <span class="text-gray-600 font-bold text-lg">نوع الأضحية:</span>
                <span
                  class="font-black text-emerald-700 bg-white px-3 py-1 rounded shadow-sm text-lg"
                >
                  {{ receipt.sacrifice_type?.name }}
                </span>
              </div>

              <div class="flex justify-between border-b border-emerald-100 pb-3">
                <span class="text-gray-600 font-bold text-lg">العدد (الكمية):</span>
                <span
                  class="font-black text-gray-900 bg-white px-4 py-1 rounded shadow-sm border border-gray-200 font-mono text-xl"
                >
                  {{ receipt.quantity || 1 }}
                </span>
              </div>

              <div class="flex justify-between border-b border-emerald-100 pb-3">
                <span class="text-gray-600 font-bold text-lg">طريقة الدفع:</span>
                <span class="font-bold text-gray-900 text-lg">
                  {{ getPaymentMethodLabel(receipt.payment_method) }}
                </span>
              </div>

              <!-- الحقل الجديد: مكان التسليم -->
              <div
                class="flex justify-between border-b border-emerald-100 pb-3"
                v-if="receipt.delivery_location"
              >
                <span class="text-gray-600 font-bold text-lg">مكان التسليم:</span>
                <span class="font-bold text-gray-900 text-lg">{{ receipt.delivery_location }}</span>
              </div>

              <!-- حقل تاريخ التسليم -->
              <div
                class="flex justify-between border-b border-emerald-100 pb-3"
                v-if="receipt.delivery_date"
              >
                <span class="text-gray-600 font-bold text-lg">تاريخ التسليم:</span>
                <span class="font-bold text-gray-900 text-lg">{{
                  formatDate(receipt.delivery_date)
                }}</span>
              </div>

              <div class="flex justify-between pb-3 pt-2">
                <span class="text-gray-600 font-bold text-lg">الإجمالي المطلوب:</span>
                <span class="font-black text-gray-900 text-2xl">
                  {{ receipt.payment_method === 'free' ? '0' : receipt.actual_price }}
                  <span class="text-lg text-gray-500 font-normal">د.ل</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- بيانات الأقساط إن وجدت -->
        <div
          v-if="receipt.installment_contract"
          class="px-4 md:px-12 pb-6 md:pb-12 relative z-10 mt-auto w-full"
        >
          <div
            class="bg-indigo-50/50 border-2 border-indigo-200 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-2 shadow-sm text-center sm:text-right"
          >
            <div class="w-full sm:w-auto">
              <span class="text-base md:text-lg text-indigo-800 font-bold block mb-1 md:mb-2"
                >إجمالي مبلغ التقسيط</span
              >
              <span class="text-2xl md:text-3xl font-black text-indigo-900">
                {{ receipt.installment_contract.total_amount }} د.ل
              </span>
            </div>
            <div class="hidden sm:block w-px h-16 bg-indigo-200"></div>
            <div class="w-full sm:w-auto">
              <span class="text-base md:text-lg text-indigo-800 font-bold block mb-1 md:mb-2"
                >المُسدد مقدماً</span
              >
              <span class="text-2xl md:text-3xl font-black text-emerald-600">
                {{ receipt.installment_contract.paid_amount }} د.ل
              </span>
            </div>
            <div class="hidden sm:block w-px h-16 bg-indigo-200"></div>
            <div class="w-full sm:w-auto">
              <span class="text-base md:text-lg text-indigo-800 font-bold block mb-1 md:mb-2"
                >حالة العقد</span
              >
              <span
                class="text-lg md:text-xl font-bold text-indigo-900 bg-white px-4 py-2 rounded-xl shadow-sm inline-block"
              >
                {{
                  receipt.installment_contract.status === 'active' ? 'قيد السداد (نشط)' : 'مكتمل'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import distributionService from '@/services/distributionService'

const route = useRoute()
const receipts = ref([])
const loading = ref(true)
const error = ref(null)

const paymentMethodsMap = {
  free: 'توزيع مجاني',
  cash: 'دفع نقدي',
  installments: 'دفع بالأقساط',
}

const getPaymentMethodLabel = (val) => {
  return paymentMethodsMap[val] || val
}

const isBulkReceipt = (receipt) => {
  return !receipt.beneficiary?.national_id || Number(receipt.quantity || 1) > 1
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-LY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const executePrint = () => {
  window.print()
}

const fetchReceiptsData = async () => {
  try {
    const idsParam = route.query.ids
    if (!idsParam) throw new Error('لم يتم تمرير أرقام إيصالات للطباعة.')

    const idsArray = idsParam.split(',').map((id) => id.trim())

    const response = await distributionService.getReceipts(idsArray)
    receipts.value = response.data?.data || response.data

    setTimeout(() => {
      executePrint()
    }, 800)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'فشل تحميل بيانات الإيصالات'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReceiptsData()
})
</script>

<style scoped>
/* إعدادات الشاشة للمعاينة */
/* إعدادات الشاشة للمعاينة للموبايل */
.print-container {
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
}

.receipt-card {
  width: 100%;
  box-shadow:
    0 20px 25px -5px rgba(79, 70, 229, 0.1),
    0 10px 10px -5px rgba(79, 70, 229, 0.04);
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

/* تفعيل مقاسات الـ A4 الصارمة عند تصفح المعاينة من الكمبيوتر فقط */
@media (min-width: 768px) {
  .print-container {
    max-width: 21cm;
    padding-left: 0;
    padding-right: 0;
  }
  .receipt-card {
    min-height: 29.7cm; /* فرض ارتفاع ورقة الـ A4 في الكمبيوتر */
  }
}

/* ====================================================
   إعدادات الطباعة لورقة A4 كاملة
==================================================== */
@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }

  html,
  body,
  .print-wrapper,
  .print-container {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background-color: #ffffff !important;
    min-height: auto !important;
  }

  .no-print {
    display: none !important;
  }

  .print-container {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
    gap: 0 !important;
  }

  .receipt-card {
    height: 29.7cm !important; /* إجبار ارتفاع الورقة بالكامل */
    width: 21cm !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    page-break-after: always !important; /* فصل كل إيصال في ورقة جديدة */
  }

  /* إزالة الفصل للصفحة الأخيرة حتى لا تخرج ورقة بيضاء */
  .receipt-card:last-child {
    page-break-after: auto !important;
  }
}
</style>
