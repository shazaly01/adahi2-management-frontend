<!--src\views\distributions\DistributionsList.vue-->
<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <!-- القسم الأيمن (70%): مساحة عمل الإدخال السريع والتعديل -->
    <div class="col-span-1 lg:col-span-6 space-y-6">
      <!-- شريط الرصيد اللحظي للعهدة الخاصة بالجهة الموزعة -->
      <AppCard
        class="bg-slate-900 border-l-4 border-l-emerald-500 text-white p-5 rounded-xl shadow-xl dark:bg-slate-950 transition-all"
        :class="{ 'opacity-75 animate-pulse': isLoadingStocks }"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 class="font-bold text-base flex items-center gap-2 text-emerald-400">
            <span>📊</span> رصيد العُهدة اللحظي لجهة:
            <span class="text-white underline decoration-emerald-500/50">{{
              currentEntityName || 'جاري التحقق...'
            }}</span>
          </h3>
          <span
            v-if="isLoadingStocks"
            class="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded"
          >
            جاري التحديث اللحظي...
          </span>
          <span
            v-else
            class="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-1 rounded font-mono"
          >
            مُحدث الآن
          </span>
        </div>

        <div
          v-if="myEntityStocks.length === 0 && !isLoadingStocks"
          class="text-slate-400 text-sm text-center py-2"
        >
          ⚠️ لا توجد عُهد مسجلة لهذه الجهة حالياً في النظام.
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div
            v-for="stock in myEntityStocks"
            :key="stock.sacrifice_type_id"
            class="bg-slate-800/50 p-4 rounded-lg border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <span class="text-xs text-slate-400 font-bold block truncate">{{
              stock.sacrifice_type_name
            }}</span>
            <div class="flex items-baseline justify-between mt-2">
              <span class="text-2xl font-black text-white tracking-tight">{{
                stock.current_custody
              }}</span>
              <span class="text-[11px] text-slate-500 font-medium"
                >منصرف: {{ stock.total_distributed }}</span
              >
            </div>
          </div>
        </div>
      </AppCard>
      <!-- شريط تنبيه وضع التعديل -->
      <div
        v-if="editingDistributionId"
        class="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-lg flex justify-between items-center shadow-sm"
      >
        <div class="font-bold">
          <span class="text-xl mr-2">✏️</span> أنت الآن في وضع تعديل الإيصال رقم:
          <span class="text-amber-900">#{{ editingReceiptNumber }}</span>
        </div>
        <AppButton
          type="button"
          variant="secondary"
          @click="cancelEdit"
          class="text-sm px-4 py-2 bg-white hover:bg-gray-50 border-amber-200"
        >
          إلغاء التعديل
        </AppButton>
      </div>

      <!-- 1. مكون بيانات المستفيد -->
      <AppCard
        class="border-t-4 border-t-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-none transition-all"
        :class="{ 'ring-2 ring-amber-400': editingDistributionId }"
      >
        <BeneficiarySection
          ref="beneficiarySectionRef"
          @beneficiary-confirmed="handleBeneficiaryConfirmed"
          @beneficiary-reset="handleBeneficiaryReset"
          @beneficiary-has-receipt="handleBeneficiaryHasReceipt"
        />
      </AppCard>

      <!-- 2. مكون تفاصيل التوزيع -->
      <AppCard
        class="border-t-4 border-t-emerald-500 shadow-lg shadow-emerald-100 dark:shadow-none transition-all"
        :class="{
          'opacity-50 pointer-events-none': !beneficiaryId,
          'ring-2 ring-amber-400': editingDistributionId,
        }"
      >
        <DistributionDetailsSection
          ref="distributionDetailsSectionRef"
          :sacrificeTypes="sacrificeTypeStore.sacrificeTypes"
          :isLoadingTypes="sacrificeTypeStore.loading"
          @update="handleDistributionUpdate"
        />

        <!-- زر تنفيذ التوزيع النهائي (إضافة أو تعديل) -->
        <div class="mt-8 flex justify-end gap-3">
          <AppButton
            type="button"
            @click="submitDistribution"
            :disabled="isSubmitting || !isFormValid"
            class="w-full md:w-auto px-10 py-4 text-lg font-bold"
          >
            <span v-if="isSubmitting">جاري الحفظ...</span>
            <span v-else-if="editingDistributionId">حفظ التعديلات (F2)</span>
            <span v-else>حفظ وإصدار أمر الصرف (F2)</span>
          </AppButton>
        </div>
      </AppCard>
    </div>

    <!-- القسم الأيسر (30%): سجل العمليات الأخيرة -->
    <div class="col-span-1 lg:col-span-6 h-full">
      <RecentDistributionsTable
        ref="recentDistributionsTableRef"
        :distributions="recentDistributions"
        @search="handleSearch"
        @print-single="printSingle"
        @print-bulk="printBulk"
        @edit-item="startEdit"
        @delete-item="handleDeleteDistribution"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

// المكونات
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import BeneficiarySection from './beneficiarySection.vue'
import DistributionDetailsSection from './distributionDetailsSection.vue'
import RecentDistributionsTable from './recentDistributionsTable.vue'

// Services & Stores
import distributionService from '@/services/distributionService'
import { useSacrificeTypeStore } from '@/stores/sacrificeTypeStore'
import stockReportService from '@/services/stockReportService' // لطلب التقرير اللحظي
import apiClient from '@/services/apiClient' // لجلب بيانات المستخدم الحالي

const toast = useToast()
const sacrificeTypeStore = useSacrificeTypeStore()
const router = useRouter()

// --- State ---
const beneficiaryId = ref(null)
const distributionDetails = ref({})
const isSubmitting = ref(false)
const recentDistributions = ref([])
const myEntityStocks = ref([])
const currentEntityName = ref('')
const isLoadingStocks = ref(false)
const searchQuery = ref('')

// Edit Mode State
const editingDistributionId = ref(null)
const editingReceiptNumber = ref('')

// --- Refs لتصفير وحقن الأبناء ---
const beneficiarySectionRef = ref(null)
const distributionDetailsSectionRef = ref(null)
const recentDistributionsTableRef = ref(null)

// --- جلب البيانات الأولية ---
const fetchInitialData = async () => {
  // جلب أنواع الأضاحي للقائمة المنسدلة
  fetchRealTimeCustody()
  await sacrificeTypeStore.fetchSacrificeTypes(1, '')

  // جلب آخر التوزيعات لعرضها في الجدول الجانبي
  try {
    const res = await distributionService.get(1, '')
    recentDistributions.value = res.data?.data || []
  } catch (error) {
    console.error('فشل جلب التوزيعات السابقة', error)
  }
}

onMounted(() => {
  fetchInitialData()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// --- دالة البحث الجديدة ---
const handleSearch = async (query) => {
  searchQuery.value = query
  try {
    // إرسال الكلمة المفتاحية للـ Service
    const res = await distributionService.get(1, query)
    recentDistributions.value = res.data?.data || []
  } catch (error) {
    console.error('فشل جلب نتائج البحث', error)
    toast.error('حدث خطأ أثناء فلترة السجلات')
  }
}
// --- Handlers ---
const handleBeneficiaryConfirmed = (id) => {
  beneficiaryId.value = id
}

const handleBeneficiaryReset = () => {
  beneficiaryId.value = null
}

const handleBeneficiaryHasReceipt = (query) => {
  // إظهار تنبيه قوي للمستخدم
  toast.warning('تنبيه: هذا المستفيد لديه إيصال سابق!', {
    timeout: 8000,
    position: 'top-center',
  })

  // تحديث حقل البحث في القائمة الجانبية برمجياً ليظهر الإيصال السابق
  if (recentDistributionsTableRef.value) {
    recentDistributionsTableRef.value.setSearchQuery(query)
  }
}

const handleDistributionUpdate = (details) => {
  distributionDetails.value = details
}

// Validation
const isFormValid = computed(() => {
  if (!beneficiaryId.value) return false
  if (!distributionDetails.value.sacrifice_type_id) return false
  if (
    distributionDetails.value.payment_method !== 'free' &&
    (!distributionDetails.value.actual_price || distributionDetails.value.actual_price <= 0)
  )
    return false
  if (
    distributionDetails.value.payment_method === 'installments' &&
    (!distributionDetails.value.months_count || distributionDetails.value.months_count < 1)
  )
    return false
  return true
})

// --- الإرسال (إضافة أو تعديل) ---
const submitDistribution = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  try {
    const payload = {
      beneficiary_id: beneficiaryId.value,
      ...distributionDetails.value,
    }

    let response
    let savedRecord

    if (editingDistributionId.value) {
      // وضع التعديل
      response = await distributionService.update(editingDistributionId.value, payload)
      savedRecord = response.data?.data || response.data

      // تحديث السجل في المصفوفة المحلية
      const index = recentDistributions.value.findIndex((d) => d.id === editingDistributionId.value)
      if (index !== -1) recentDistributions.value[index] = savedRecord

      toast.success(`تم تحديث الإيصال رقم #${savedRecord.receipt_number} بنجاح.`)
    } else {
      // وضع الإضافة
      response = await distributionService.create(payload)
      savedRecord = response.data?.data || response.data

      // إضافة السجل الجديد في أعلى القائمة
      recentDistributions.value.unshift(savedRecord)

      toast.success(`تم حفظ الإيصال رقم #${savedRecord.receipt_number} بنجاح!`)
    }

    await fetchRealTimeCustody()
    // تصفير مساحة العمل
    resetWorkspace()
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحفظ.')
  } finally {
    isSubmitting.value = false
  }
}

// --- إدارة وضع التعديل ---
const startEdit = (item) => {
  editingDistributionId.value = item.id
  editingReceiptNumber.value = item.receipt_number

  // حقن بيانات المستفيد في القسم الأول
  if (beneficiarySectionRef.value && item.beneficiary) {
    beneficiarySectionRef.value.loadExistingBeneficiary(item.beneficiary)
  }

  // حقن تفاصيل التوزيع في القسم الثاني
  if (distributionDetailsSectionRef.value) {
    distributionDetailsSectionRef.value.loadExistingDetails(item)
  }
}

// --- دالة حذف سجل التوزيع وعكس الحركات ---
const handleDeleteDistribution = async (item) => {
  if (
    !confirm(
      `هل أنت متأكد من حذف الإيصال رقم #${item.receipt_number}؟ سيتم إلغاء العقد وإرجاع الكمية للمخزن.`,
    )
  ) {
    return
  }

  try {
    // 1. استدعاء دالة الحذف من الـ Service المحدثة
    await distributionService.delete(item.id)

    // 2. تحديث قائمة التوزيعات الأخيرة محلياً في الواجهة
    recentDistributions.value = recentDistributions.value.filter((d) => d.id !== item.id)

    toast.success(`تم حذف الإيصال رقم #${item.receipt_number} وعكس تأثيره المخزني بنجاح.`)

    // 3. إعادة تحديث رصيد العهدة اللحظي بعد إرجاع الأضاحي للمخزن
    await fetchRealTimeCustody()

    // إذا كان السجل المحذوف مفتوحاً حالياً في وضع التعديل، قم بتصفير مساحة العمل
    if (editingDistributionId.value === item.id) {
      resetWorkspace()
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'فشل في إتمام عملية الحذف.')
  }
}

const cancelEdit = () => {
  resetWorkspace()
  toast.info('تم إلغاء التعديل.')
}

const resetWorkspace = () => {
  editingDistributionId.value = null
  editingReceiptNumber.value = ''
  beneficiaryId.value = null
  if (beneficiarySectionRef.value) beneficiarySectionRef.value.resetSection()
  if (distributionDetailsSectionRef.value) distributionDetailsSectionRef.value.resetSection()
}

// --- Printing ---
const printSingle = (id) => {
  const routeData = router.resolve({ name: 'DistributionPrint', query: { ids: id } })
  window.open(routeData.href, '_blank')
}

const printBulk = (ids) => {
  const idsString = ids.join(',')
  const routeData = router.resolve({ name: 'DistributionPrint', query: { ids: idsString } })
  window.open(routeData.href, '_blank')
}

// --- Keyboard Shortcuts ---
const handleKeydown = (e) => {
  if (e.key === 'F2') {
    e.preventDefault()
    if (isFormValid.value && !isSubmitting.value) {
      submitDistribution()
    }
  } else if (e.key === 'Escape' && editingDistributionId.value) {
    e.preventDefault()
    cancelEdit()
  }
}

const fetchRealTimeCustody = async () => {
  isLoadingStocks.value = true
  try {
    const userRes = await apiClient.get('/user')
    const userEntityId = userRes.data?.distribution_entity_id

    if (!userEntityId) {
      currentEntityName.value = 'مستخدم غير مرتبط بجهة'
      myEntityStocks.value = []
      return
    }

    const reportRes = await stockReportService.getEntitiesStock()
    const allEntities = reportRes.data?.data || []
    const matchedEntity = allEntities.find((e) => e.distribution_entity_id == userEntityId)

    if (matchedEntity) {
      currentEntityName.value = matchedEntity.distribution_entity_name
      myEntityStocks.value = matchedEntity.stocks || []
    }
  } catch (error) {
    console.error('فشل تحديث رصيد العهدة اللحظي', error)
  } finally {
    isLoadingStocks.value = false
  }
}
</script>
