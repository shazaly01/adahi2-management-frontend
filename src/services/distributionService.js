// src/services/distributionService.js
import apiClient from './apiClient'

const resource = '/distributions'

export default {
  get(page = 1, search = '') {
    return apiClient.get(resource, {
      params: { page, search },
    })
  },

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  create(payload) {
    // تحويل الكائن إلى FormData لدعم رفع الملفات
    const formData = new FormData()
    for (const key in payload) {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key])
      }
    }

    return apiClient.post(resource, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  update(id, payload) {
    const formData = new FormData()
    for (const key in payload) {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key])
      }
    }
    // خدعة Laravel لاستقبال الملفات في طلبات التعديل
    formData.append('_method', 'PUT')

    return apiClient.post(`${resource}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * حذف سجل التوزيع كلياً وعكس الحركات المخزنية والمالية
   * @param {string|number} id - معرف سجل التوزيع المراد حذفه
   */
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // الدالة الخاصة بجلب إيصالات الأفراد (مفردة أو جماعية)
  // تم استخدام POST لإرسال مصفوفة الـ IDs في الـ Body بأمان
  getReceipts(ids) {
    return apiClient.post(`${resource}/receipts`, { ids })
  },

  // ==========================================================
  // الدوال الجديدة الخاصة بشاشة الموزع المستقلة (Delivery Screen)
  // ==========================================================

  // البحث عن إيصالات المستفيدين للموزع (اسم، هاتف، رقم وطني)
  searchDeliveries(searchTerm) {
    return apiClient.get(`${resource}/deliveries/search`, {
      params: { search_term: searchTerm },
    })
  },

  // تغيير حالة التسليم (وضع/إزالة علامة الصح)
  toggleDeliveryStatus(id, isDelivered) {
    return apiClient.patch(`${resource}/deliveries/${id}/toggle`, {
      is_delivered: isDelivered,
    })
  },
}
