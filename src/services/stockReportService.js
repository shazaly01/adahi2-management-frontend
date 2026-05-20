import apiClient from './apiClient'

const resource = '/reports'

export default {
  /**
   * جلب الأرصدة اللحظية للمخازن الرئيسية
   */
  getWarehousesStock() {
    return apiClient.get(`${resource}/warehouses`)
  },

  /**
   * جلب الأرصدة اللحظية (العهد والمنصرف) لجهات التوزيع
   */
  getEntitiesStock() {
    return apiClient.get(`${resource}/entities`)
  },
}
