<template>
  <div
    class="min-h-screen bg-[#0b1120] text-slate-200 font-sans flex flex-col items-center py-6 px-4 sm:px-6 overflow-x-hidden"
  >
    <div class="w-full max-w-lg flex justify-between items-center mb-8 animate-fade-in">
      <div>
        <h1
          class="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
        >
          تسليم الأضاحي
        </h1>
        <p class="text-xs text-slate-400 mt-1">بوابة الموزع الميداني</p>
      </div>
      <AppButton
        @click="goHome"
        variant="outline"
        class="border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors duration-300"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          ></path>
        </svg>
      </AppButton>
    </div>

    <AppCard
      class="w-full max-w-lg mb-8 shadow-[0_0_25px_rgba(6,182,212,0.12)] border-cyan-900/40 bg-slate-900/80 backdrop-blur-xl transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.25)]"
    >
      <div class="flex flex-col gap-4">
        <AppInput
          v-model="searchTerm"
          label="البحث عن مستفيد"
          placeholder="أدخل الاسم، الهاتف، أو الرقم الوطني..."
          @keyup.enter="handleSearch"
          @focusin="$event.target.select()"
          class="transition-all duration-300"
        />
        <AppButton
          @click="handleSearch"
          :loading="isSearching"
          class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold border-0 shadow-lg shadow-cyan-900/40 transition-all duration-300 transform active:scale-[0.98]"
        >
          بحث عن الإيصالات
        </AppButton>
      </div>
    </AppCard>

    <div class="w-full max-w-lg pb-10">
      <Transition mode="out-in" name="fade-slide">
        <div
          v-if="!hasSearched && !isSearching"
          class="flex flex-col items-center justify-center py-12 text-center bg-slate-900/30 rounded-2xl border border-slate-800/60 p-6"
        >
          <div
            class="p-4 bg-cyan-950/40 rounded-full text-cyan-400 mb-4 shadow-inner animate-pulse"
          >
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <h3 class="text-slate-300 font-bold text-base mb-1">جاهز للبحث ميدانياً</h3>
          <p class="text-xs text-slate-500 max-w-xs leading-relaxed">
            يرجى إدخال بيانات المستفيد أعلاه للتحقق من حصته وتأكيد عملية التسليم فوراً.
          </p>
        </div>

        <div v-else-if="isSearching" id="loading-state" class="space-y-5">
          <SkeletonCard v-for="n in 2" :key="n" class="bg-slate-900/40 border border-slate-800" />
        </div>

        <div
          v-else-if="distributions.length === 0 && hasSearched"
          class="flex flex-col items-center justify-center py-12 bg-slate-900/50 rounded-2xl border border-red-900/30 border-dashed p-6 text-center"
        >
          <div class="p-4 bg-red-950/30 rounded-full text-red-400 mb-4">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 class="text-slate-300 font-bold text-base mb-1">عذراً، لم نجد أي سجلات</h3>
          <p class="text-xs text-slate-500 max-w-xs leading-relaxed">
            تأكد من كتابة الاسم بشكل صحيح أو جرب البحث برقم الهاتف الخلوي.
          </p>
        </div>

        <div v-else class="space-y-5">
          <TransitionGroup name="list-complete" tag="div" class="space-y-5">
            <AppCard
              v-for="dist in distributions"
              :key="dist.id"
              class="relative overflow-hidden border transition-all duration-500 ease-out card-glow"
              :class="
                dist.is_delivered
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-800/70 border-slate-700/80 shadow-md'
              "
            >
              <div
                class="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
                :class="
                  dist.is_delivered
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-slate-600'
                "
              ></div>

              <div class="p-2">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      class="font-bold text-xl text-white mb-2 tracking-wide transition-colors duration-300"
                      :class="dist.is_delivered ? 'text-emerald-300' : 'text-white'"
                    >
                      {{ dist.beneficiary.name }}
                    </h3>

                    <div class="flex flex-wrap items-center gap-2 text-slate-400">
                      <span
                        class="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-md text-xs border border-slate-800"
                      >
                        <svg
                          class="w-3.5 h-3.5 text-cyan-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          ></path>
                        </svg>
                        {{ dist.beneficiary.phone }}
                      </span>

                      <span
                        class="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-md text-xs border border-slate-800"
                      >
                        <svg
                          class="w-3.5 h-3.5 text-amber-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0m-3 7h2m-3 3h4"
                          ></path>
                        </svg>
                        <span class="text-slate-500 font-medium">الوطني:</span>
                        <span class="font-mono">{{ dist.beneficiary.national_id }}</span>
                      </span>
                    </div>
                  </div>

                  <div
                    class="px-3 py-1.5 rounded-lg text-xs font-black border transition-all duration-500 transform uppercase tracking-wider"
                    :class="
                      dist.is_delivered
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 scale-105 shadow-sm'
                        : 'bg-slate-700/60 text-slate-400 border-slate-600'
                    "
                  >
                    {{ dist.is_delivered ? 'مُسلمة' : 'قيد الانتظار' }}
                  </div>
                </div>

                <div
                  class="bg-slate-900/80 rounded-xl p-3.5 mb-5 border border-slate-700/40 flex justify-between items-center transition-all duration-300"
                >
                  <div class="flex flex-col">
                    <span class="text-xs text-slate-500 mb-1">نوع الأضحية مقرر صرفها</span>
                    <span class="font-extrabold text-cyan-400 text-base">{{
                      dist.sacrifice_type.name
                    }}</span>
                  </div>
                  <div class="w-px h-8 bg-slate-800"></div>
                  <div class="flex flex-col items-end">
                    <span class="text-xs text-slate-500 mb-1">العدد الإجمالي</span>
                    <span
                      class="font-black text-white text-xl bg-slate-800 px-3.5 py-0.5 rounded-lg border border-slate-700 shadow-inner"
                      >{{ dist.quantity }}</span
                    >
                  </div>
                </div>

                <button
                  @click="toggleStatus(dist)"
                  :disabled="isToggling === dist.id"
                  class="w-full relative flex items-center justify-center p-4 overflow-hidden text-base font-black rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-md transform active:scale-[0.99]"
                  :class="[
                    dist.is_delivered
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white focus:ring-emerald-500 shadow-emerald-950/40'
                      : 'bg-gradient-to-r from-slate-700 via-slate-700 to-slate-600 text-slate-200 hover:from-slate-600 hover:to-slate-500 focus:ring-slate-500 border border-slate-500/20 shadow-black/20',
                  ]"
                >
                  <svg
                    v-if="isToggling === dist.id"
                    class="animate-spin h-6 w-6 text-white"
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

                  <div v-else class="flex items-center gap-2">
                    <svg
                      v-if="dist.is_delivered"
                      class="w-6 h-6 animate-scale-bounce"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="3"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <svg
                      v-else
                      class="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>{{
                      dist.is_delivered ? 'تم إتمام وتوثيق التسليم' : 'تأكيد تسليم الأضحية للمستفيد'
                    }}</span>
                  </div>
                </button>

                <Transition name="fade-slide-up">
                  <div
                    v-if="dist.is_delivered && dist.delivery_date"
                    class="text-center mt-3.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 py-2 rounded-lg border border-emerald-900/40 shadow-inner"
                  >
                    تاريخ ووقت الصرف:
                    <span dir="ltr" class="font-mono">{{ dist.delivery_date }}</span>
                  </div>
                </Transition>
              </div>
            </AppCard>
          </TransitionGroup>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import distributionService from '@/services/distributionService'

import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'

const router = useRouter()
const searchTerm = ref('')
const distributions = ref([])
const isSearching = ref(false)
const hasSearched = ref(false)
const isToggling = ref(null)

const handleSearch = async () => {
  if (!searchTerm.value || searchTerm.value.length < 3) {
    alert('يرجى إدخال 3 أحرف أو أرقام على الأقل لبدء البحث الميداني.')
    return
  }

  isSearching.value = true
  distributions.value = []

  try {
    const response = await distributionService.searchDeliveries(searchTerm.value)
    distributions.value = response.data.data
    hasSearched.value = true
  } catch (error) {
    console.error('Search error:', error)
    alert(error.response?.data?.message || 'فشل الاتصال بالخادم، يرجى التحقق من الشبكة.')
  } finally {
    isSearching.value = false
  }
}

const toggleStatus = async (dist) => {
  isToggling.value = dist.id
  try {
    const newStatus = !dist.is_delivered
    const response = await distributionService.toggleDeliveryStatus(dist.id, newStatus)

    dist.is_delivered = response.data.data.is_delivered
    dist.delivery_date = response.data.data.delivery_date
  } catch (error) {
    console.error('Toggle error:', error)
    alert(error.response?.data?.message || 'غير مصرح لك بإجراء هذه العملية كمسؤول ميداني.')
  } finally {
    isToggling.value = null
  }
}

const goHome = () => {
  router.push('/app/dashboard')
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.list-complete-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(20px);
}
.list-complete-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
}
.list-complete-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}
.list-complete-leave-active {
  position: absolute;
  width: 100%;
}

@keyframes scaleBounce {
  0% {
    transform: scale(0.6);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
.animate-scale-bounce {
  animation: scaleBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

.fade-slide-up-enter-active {
  transition: all 0.3s ease-out;
}
.fade-slide-up-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.card-glow {
  transition:
    box-shadow 0.4s ease,
    border-color 0.4s ease,
    background-color 0.4s ease;
}
</style>
