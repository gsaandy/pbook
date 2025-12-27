import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

// Custom render function with providers if needed
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export function createMockShop(overrides: Partial<MockShop> = {}): MockShop {
  return {
    id: `shop_${Math.random().toString(36).slice(2)}`,
    _id: undefined,
    name: 'Test Shop',
    code: 'TEST001',
    retailerUniqueCode: undefined,
    zone: 'Test Zone',
    currentBalance: 1000,
    ...overrides,
  }
}

export function createMockShopConvex(
  overrides: Partial<MockShopConvex> = {},
): MockShopConvex {
  return {
    _id: `shop_${Math.random().toString(36).slice(2)}`,
    id: undefined,
    name: 'Test Shop',
    retailerUniqueCode: 'TEST001',
    code: undefined,
    zone: 'Test Zone',
    currentBalance: 1000,
    ...overrides,
  }
}

export interface MockShop {
  id?: string
  _id?: string
  name: string
  code?: string
  retailerUniqueCode?: string
  zone: string
  currentBalance: number
}

export interface MockShopConvex {
  _id?: string
  id?: string
  name: string
  retailerUniqueCode?: string
  code?: string
  zone: string
  currentBalance: number
}
