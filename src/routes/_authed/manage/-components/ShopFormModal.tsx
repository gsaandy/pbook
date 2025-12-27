import { useState } from 'react'
import type { Shop } from '~/lib/types'
import { Modal } from '~/components/modals/Modal'

interface ShopFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (shop: Omit<Shop, 'id'> | Shop) => void
  shop?: Shop | null
}

// Validation helpers
const validatePhone = (phone: string): boolean => {
  if (!phone) return true // Optional field
  // Indian phone: 10 digits, optionally starting with +91
  const cleaned = phone.replace(/[\s-]/g, '')
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned)
}

const validatePinCode = (pinCode: string): boolean => {
  if (!pinCode) return true // Optional field
  return /^\d{6}$/.test(pinCode)
}

interface FormErrors {
  name?: string
  code?: string
  zone?: string
  phone?: string
  whatsapp?: string
  pinCode?: string
}

export function ShopFormModal({
  isOpen,
  onClose,
  onSave,
  shop,
}: ShopFormModalProps) {
  // Lazy initialization - parent uses key prop to reset when shop changes
  const [formData, setFormData] = useState(() => ({
    name: shop?.name ?? '',
    code: shop?.code ?? '', // retailerUniqueCode
    // Address fields
    addressLine1: shop?.addressLine1 ?? '',
    addressLine2: shop?.addressLine2 ?? '',
    addressLine3: shop?.addressLine3 ?? '',
    city: shop?.city ?? '',
    district: shop?.district ?? '',
    state: shop?.state ?? 'Kerala',
    pinCode: shop?.pinCode ?? '',
    // Contact fields
    phone: shop?.phone ?? '',
    whatsapp: shop?.whatsapp ?? '',
    // Business
    zone: shop?.zone ?? '',
    currentBalance: shop?.currentBalance ?? 0,
  }))

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Shop name is required'
    }

    // Code is required only for new shops (not when editing)
    if (!shop && !formData.code.trim()) {
      newErrors.code = 'Retailer code is required'
    }

    if (!formData.zone.trim()) {
      newErrors.zone = 'Zone is required'
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Enter valid 10-digit phone number'
    }

    if (formData.whatsapp && !validatePhone(formData.whatsapp)) {
      newErrors.whatsapp = 'Enter valid 10-digit WhatsApp number'
    }

    if (formData.pinCode && !validatePinCode(formData.pinCode)) {
      newErrors.pinCode = 'Enter valid 6-digit PIN code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Clean up empty strings to undefined for optional fields
    const cleanedData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      addressLine1: formData.addressLine1.trim() || undefined,
      addressLine2: formData.addressLine2.trim() || undefined,
      addressLine3: formData.addressLine3.trim() || undefined,
      city: formData.city.trim() || undefined,
      district: formData.district.trim() || undefined,
      state: formData.state.trim() || undefined,
      pinCode: formData.pinCode.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      whatsapp: formData.whatsapp.trim() || undefined,
      zone: formData.zone.trim(),
      currentBalance: formData.currentBalance,
    }

    if (shop) {
      onSave({ ...cleanedData, id: shop.id })
    } else {
      onSave(cleanedData)
    }
    onClose()
  }

  const inputClassName =
    'w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const errorInputClassName =
    'w-full px-4 py-2 bg-white dark:bg-slate-900 border border-red-500 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500'
  const labelClassName =
    'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'
  const errorTextClassName = 'text-xs text-red-500 mt-1'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={shop ? 'Edit Shop' : 'Add Shop'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Shop Name & Code */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName}>
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? errorInputClassName : inputClassName}
              placeholder="Enter shop name"
            />
            {errors.name && <p className={errorTextClassName}>{errors.name}</p>}
          </div>

          <div>
            <label className={labelClassName}>
              Retailer Code {!shop && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className={errors.code ? errorInputClassName : inputClassName}
              placeholder="e.g., 67063100001"
              disabled={!!shop} // Cannot change code once created
            />
            {errors.code && <p className={errorTextClassName}>{errors.code}</p>}
            {shop && (
              <p className="text-xs text-slate-500 mt-1">
                Code cannot be changed after creation
              </p>
            )}
          </div>
        </div>

        {/* Address Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Address Details
          </h3>

          <div className="space-y-3">
            <div>
              <label className={labelClassName}>Address Line 1</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine1: e.target.value })
                }
                className={inputClassName}
                placeholder="Building/Shop number, Street"
              />
            </div>

            <div>
              <label className={labelClassName}>Address Line 2</label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine2: e.target.value })
                }
                className={inputClassName}
                placeholder="Area, Landmark"
              />
            </div>

            <div>
              <label className={labelClassName}>Address Line 3</label>
              <input
                type="text"
                value={formData.addressLine3}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine3: e.target.value })
                }
                className={inputClassName}
                placeholder="Additional details"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className={inputClassName}
                  placeholder="City"
                />
              </div>

              <div>
                <label className={labelClassName}>District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  className={inputClassName}
                  placeholder="District"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className={inputClassName}
                  placeholder="State"
                />
              </div>

              <div>
                <label className={labelClassName}>PIN Code</label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => {
                    // Only allow digits, max 6
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setFormData({ ...formData, pinCode: value })
                  }}
                  className={errors.pinCode ? errorInputClassName : inputClassName}
                  placeholder="6-digit PIN"
                  maxLength={6}
                />
                {errors.pinCode && (
                  <p className={errorTextClassName}>{errors.pinCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Contact Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClassName}>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={errors.phone ? errorInputClassName : inputClassName}
                placeholder="+91 98765 43210"
              />
              {errors.phone && (
                <p className={errorTextClassName}>{errors.phone}</p>
              )}
            </div>

            <div>
              <label className={labelClassName}>WhatsApp</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                className={errors.whatsapp ? errorInputClassName : inputClassName}
                placeholder="+91 98765 43210"
              />
              {errors.whatsapp && (
                <p className={errorTextClassName}>{errors.whatsapp}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Business Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClassName}>
                Zone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) =>
                  setFormData({ ...formData, zone: e.target.value })
                }
                className={errors.zone ? errorInputClassName : inputClassName}
                placeholder="e.g., Kannur, Thalassery"
              />
              {errors.zone && <p className={errorTextClassName}>{errors.zone}</p>}
            </div>

            <div>
              <label className={labelClassName}>Current Balance (INR)</label>
              <input
                type="number"
                value={formData.currentBalance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentBalance: Number(e.target.value),
                  })
                }
                className={inputClassName}
                min="0"
                disabled={!!shop} // Balance should be managed through transactions, not direct edit
              />
              {shop && (
                <p className="text-xs text-slate-500 mt-1">
                  Balance is managed through invoices and collections
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {shop ? 'Save Changes' : 'Add Shop'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
