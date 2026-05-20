import apiClient from './apiClient'

const resource = '/reports'

export default {
  /**
   * تقرير المخزون (الدفتر العام)
   * @param {Object} params - الفلاتر (start_date, end_date, warehouse_id, distribution_entity_id, sacrifice_type_id, movement_type)
   */
  getInventoryReport(params = {}) {
    return apiClient.get(`${resource}/inventory`, { params })
  },

  /**
   * تقرير التوزيع والمستفيدين (الذكي)
   * @param {Object} params - الفلاتر (group_by, distribution_entity_id, group, delivery_location, start_date, end_date)
   */
  getDistributionsReport(params = {}) {
    return apiClient.get(`${resource}/distributions`, { params })
  },

  /**
   * بيانات لوحة القيادة المركزية (Dashboard)
   */
  getDashboardData() {
    // لاحظ أننا نستخدم '/dashboard' مباشرة لأن المسار في api.php ليس داخل مجموعة reports
    return apiClient.get('/dashboard')
  },
}
