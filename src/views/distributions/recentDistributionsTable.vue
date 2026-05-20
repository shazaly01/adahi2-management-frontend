<!--src\views\distributions\recentDistributionsTable.vue--->
<template>
  <AppCard
    class="h-full border-t-4 border-t-gray-800 shadow-md bg-gray-50 dark:bg-gray-900/50 flex flex-col"
  >
    <div class="flex justify-between items-center mb-4 border-b pb-3">
      <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">سجل اليوم</h3>

      <button
        @click="emitBulkPrint"
        :disabled="selectedForPrint.length === 0"
        class="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-all hover:bg-gray-700"
      >
        طباعة المحددة ({{ selectedForPrint.length }})
      </button>
    </div>

    <div class="mb-3">
      <AppInput
        id="search-distributions"
        v-model="searchQuery"
        type="text"
        placeholder="بحث بالاسم، الهاتف، الرقم الوطني، أو المجموعة..."
      />
    </div>

    <div class="mb-4">
      <label
        for="whatsapp-template"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        قالب رسالة الواتساب المستهدفة:
      </label>
      <textarea
        id="whatsapp-template"
        v-model="whatsappTemplate"
        rows="5"
        class="block w-full rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-emerald-500 dark:focus:border-emerald-500 custom-scrollbar"
        placeholder="اكتب نص الرسالة هنا... يمكنك استخدام {name}, {receipt}, {location}, {quantity}"
      ></textarea>
    </div>

    <div class="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
      <div
        v-if="distributions.length === 0"
        class="text-center text-gray-500 py-10 text-sm font-bold"
      >
        لا توجد عمليات مسجلة حالياً...
      </div>

      <div
        v-for="item in distributions"
        :key="item.id"
        class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3"
      >
        <input
          type="checkbox"
          :value="item.id"
          v-model="selectedForPrint"
          class="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
        />
        <div class="flex-grow">
          <div class="font-bold text-sm text-gray-800 dark:text-gray-100">
            {{ item.beneficiary?.name || 'مستفيد غير معروف' }}
          </div>
          <!-- عرض الهاتف، الرقم الوطني، والمجموعة -->
          <div
            class="flex flex-wrap gap-2 mt-1.5 mb-1 text-[11px] font-medium text-gray-600 dark:text-gray-400"
          >
            <span
              v-if="item.beneficiary?.phone"
              class="bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600"
            >
              📞 {{ item.beneficiary.phone }}
            </span>
            <span
              v-if="item.beneficiary?.national_id"
              class="bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600"
            >
              💳 {{ item.beneficiary.national_id }}
            </span>
            <span
              v-if="item.group"
              class="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800"
            >
              🏷️ {{ item.group }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="emitEdit(item)"
            class="text-gray-400 hover:text-amber-600 transition-colors"
            title="تعديل"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            @click="emitSinglePrint(item.id)"
            class="text-gray-400 hover:text-indigo-600 transition-colors"
            title="طباعة فورية"
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
          </button>

          <button
            v-if="item.beneficiary?.phone"
            @click="openWhatsApp(item)"
            class="text-gray-400 hover:text-emerald-500 transition-colors"
            title="إرسال إشعار عبر الواتساب"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.99 0c3.196.001 6.201 1.244 8.461 3.498 2.261 2.254 3.5 5.256 3.499 8.45-.004 6.644-5.34 11.992-11.935 11.992-2.004-.001-3.973-.504-5.714-1.463L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.832.001-2.625-1.023-5.092-2.884-6.951-1.862-1.86-4.334-2.885-6.953-2.886-5.438 0-9.862 4.414-9.865 9.833-.001 1.748.47 3.454 1.365 4.965l-.991 3.616 3.708-.97c1.479.807 3.12 1.229 4.732 1.229zm5.45-12.01c-.138-.308-.285-.315-.417-.321l-.354-.005c-.243 0-.638.091-.973.455-.335.364-1.277 1.248-1.277 3.042 0 1.794 1.308 3.526 1.49 3.769.183.243 2.511 4.072 6.136 5.495 3.012 1.182 3.626.947 4.912.828 1.285-.118 4.16-1.7 4.742-3.333.582-1.633.582-3.033.407-3.333-.175-.3-.638-.482-1.336-.828z"
              />
            </svg>
          </button>

          <!-- زر الحذف المضاف حديثاً -->
          <button
            @click="emitDelete(item)"
            class="text-gray-400 hover:text-red-600 transition-colors"
            title="حذف كلي وعكس الحركات"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'

const router = useRouter()
const props = defineProps({
  distributions: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const emit = defineEmits(['print-single', 'print-bulk', 'edit-item', 'search', 'delete-item'])

const selectedForPrint = ref([])
const searchQuery = ref('')

// قالب الرسالة الافتراضي متعدد الأسطر
const whatsappTemplate = ref(`السلام عليكم
الجهاز الوطني للتنمية
كل عام و انتم بخير

المستفيد المحترم {name}، تم صرف طلبكم بموجب إيصال رقم #{receipt}.
موقع التسليم: {location}
العدد المخصص: {quantity} أضاحي
تاريخ التسليم: {date}
للاطلاع على الإيصال (PDF):
{link}`)

// مراقبة حقل البحث وإرسال الكلمة المفتاحية مع تأخير 400ms (Debounce)
let searchTimeout
watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', newVal)
  }, 400)
})

const paymentMethodsMap = {
  free: 'توزيع مجاني',
  cash: 'دفع نقدي',
  installments: 'دفع بالأقساط',
}

const getPaymentMethodLabel = (val) => {
  return paymentMethodsMap[val] || val
}

// دالة معالجة الرقم الليبي وتجهيز الرسالة وفتح الرابط فوراً
// دالة معالجة الرقم الليبي وتجهيز الرسالة وفتح الرابط فوراً
const openWhatsApp = (item) => {
  const rawPhone = item.beneficiary?.phone
  if (!rawPhone) return

  // تنظيف النص من الفراغات
  let cleanedPhone = rawPhone.trim()

  // معالجة الرقم الليبي ذو الـ 10 خانات
  if (cleanedPhone.length === 10 && cleanedPhone.startsWith('0')) {
    cleanedPhone = '218' + cleanedPhone.substring(1)
  } else if (!cleanedPhone.startsWith('218')) {
    cleanedPhone = '218' + cleanedPhone
  }

  // توليد الرابط الكامل لصفحة الطباعة (Domain + Route)
  const routeData = router.resolve({ name: 'DistributionPrint', query: { ids: item.id } })
  const absoluteLink = window.location.origin + routeData.href

  // استبدال الرموز الديناميكية بالبيانات الفعلية
  let messageText = whatsappTemplate.value
    .replace(/{name}/g, item.beneficiary?.name || '')
    .replace(/{receipt}/g, item.receipt_number || '')
    .replace(/{location}/g, item.delivery_location || 'غير محدد')
    .replace(/{date}/g, item.delivery_date ? item.delivery_date.split(' ')[0] : 'غير محدد')
    .replace(/{quantity}/g, item.quantity || 1)
    .replace(/{link}/g, absoluteLink) // دمج رابط الـ PDF هنا

  // تشفير النص ليكون متوافقاً مع روابط الويب URL
  const encodedMessage = encodeURIComponent(messageText)

  // إنشاء الرابط وفتحه في علامة تبويب جديدة
  const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`
  window.open(whatsappUrl, '_blank')
}

const emitSinglePrint = (id) => {
  emit('print-single', id)
}

const emitBulkPrint = () => {
  if (selectedForPrint.value.length > 0) {
    emit('print-bulk', [...selectedForPrint.value])
    selectedForPrint.value = []
  }
}

const emitEdit = (item) => {
  emit('edit-item', item)
}

const emitDelete = (item) => {
  emit('delete-item', item)
}

const setSearchQuery = (query) => {
  searchQuery.value = query
}

defineExpose({
  clearSelection: () => {
    selectedForPrint.value = []
  },
  setSearchQuery,
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
