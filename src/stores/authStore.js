// src/stores/authStore.js
import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    returnUrl: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    permissions: (state) => {
      // استخدام التسلسل الآمن ?. لتجنب الأخطاء إذا كانت roles غير موجودة
      if (state.user?.roles) {
        const allPermissions = state.user.roles.flatMap(
          (role) => role.permissions?.map((p) => p.name) || [],
        )
        return [...new Set(allPermissions)]
      }
      return []
    },
  },

  actions: {
    async login(credentials) {
      const response = await authService.login(credentials)
      const { access_token, user } = response.data

      this.token = access_token
      this.user = user

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    async logout() {
      try {
        // محاولة استدعاء الـ API لتسجيل الخروج من السيرفر
        await authService.logout()
      } catch (error) {
        console.error('Logout API call failed, but clearing local state anyway:', error)
      } finally {
        // --- تنظيف الحالة المحلية ---
        this.user = null
        this.token = null
        this.returnUrl = null

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // --- التوجيه الإجباري لصفحة الدخول ---
        // نستخدم window.location.href لضمان تنظيف الذاكرة تماماً
        window.location.href = '/login'
      }
    },

    can(permissionName) {
      // التجاوز للسوبر أدمن باستخدام التسلسل الآمن لتجنب أخطاء undefined
      if (this.user?.roles?.some((role) => role.name === 'Super Admin')) {
        return true
      }
      return this.permissions.includes(permissionName)
    },
  },
})
