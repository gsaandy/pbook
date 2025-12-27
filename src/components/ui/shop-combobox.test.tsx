import { describe, expect, mock, test } from 'bun:test'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShopCombobox } from './shop-combobox'

// Import setup
import '~/test/setup'

// Mock shops data - adapted format (with id and code)
const mockShopsAdapted = [
  {
    id: 'shop_1',
    name: 'Cochin Bakery',
    code: '67063100001',
    zone: 'Kannur',
    currentBalance: 5000,
  },
  {
    id: 'shop_2',
    name: 'MarginFree Market',
    code: '67063100002',
    zone: 'Kannur',
    currentBalance: 10000,
  },
  {
    id: 'shop_3',
    name: 'Ashrayam Pharmacy',
    code: '67063100003',
    zone: 'Thalassery',
    currentBalance: 0,
  },
  {
    id: 'shop_4',
    name: 'Deepthi Bakery',
    code: '67063100004',
    zone: 'Mattannur',
    currentBalance: 25000,
  },
]

// Mock shops data - Convex format (with _id and retailerUniqueCode)
const mockShopsConvex = [
  {
    _id: 'shop_1',
    name: 'Cochin Bakery',
    retailerUniqueCode: '67063100001',
    zone: 'Kannur',
    currentBalance: 5000,
  },
  {
    _id: 'shop_2',
    name: 'MarginFree Market',
    retailerUniqueCode: '67063100002',
    zone: 'Kannur',
    currentBalance: 10000,
  },
  {
    _id: 'shop_3',
    name: 'Ashrayam Pharmacy',
    retailerUniqueCode: '67063100003',
    zone: 'Thalassery',
    currentBalance: 0,
  },
]

describe('ShopCombobox', () => {
  describe('rendering', () => {
    test('renders with placeholder', () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox
          shops={mockShopsAdapted}
          value=""
          onChange={onChange}
          placeholder="Select a shop..."
        />,
      )

      expect(screen.getByPlaceholderText('Select a shop...')).toBeDefined()
    })

    test('renders with custom placeholder', () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox
          shops={mockShopsAdapted}
          value=""
          onChange={onChange}
          placeholder="Choose shop"
        />,
      )

      expect(screen.getByPlaceholderText('Choose shop')).toBeDefined()
    })

    test('renders disabled state', () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox
          shops={mockShopsAdapted}
          value=""
          onChange={onChange}
          disabled={true}
        />,
      )

      const input = screen.getByRole('combobox')
      expect(input).toHaveProperty('disabled', true)
    })
  })

  describe('shop data format compatibility', () => {
    test('works with adapted Shop type (id, code)', () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox
          shops={mockShopsAdapted}
          value="shop_1"
          onChange={onChange}
        />,
      )

      // Should display selected shop with code format
      const input = screen.getByRole('combobox')
      expect(input.value).toContain('67063100001')
      expect(input.value).toContain('Cochin Bakery')
    })

    test('works with Convex format (_id, retailerUniqueCode)', () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox
          shops={mockShopsConvex}
          value="shop_1"
          onChange={onChange}
        />,
      )

      // Should display selected shop with retailerUniqueCode
      const input = screen.getByRole('combobox')
      expect(input.value).toContain('67063100001')
      expect(input.value).toContain('Cochin Bakery')
    })
  })

  describe('display value formatting', () => {
    test('shows code and name with balance when showBalance=true', () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox
          shops={mockShopsAdapted}
          value="shop_1"
          onChange={onChange}
          showBalance={true}
        />,
      )

      const input = screen.getByRole('combobox')
      // Format: "code - name (balance)"
      expect(input.value).toContain('67063100001')
      expect(input.value).toContain('Cochin Bakery')
      expect(input.value).toMatch(/₹/)
    })

    test('shows code and name without balance when showBalance=false', () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox
          shops={mockShopsAdapted}
          value="shop_1"
          onChange={onChange}
          showBalance={false}
        />,
      )

      const input = screen.getByRole('combobox')
      // Format: "code - name"
      expect(input.value).toContain('67063100001')
      expect(input.value).toContain('Cochin Bakery')
      expect(input.value).not.toMatch(/₹5,000/)
    })
  })

  describe('filtering', () => {
    test('filters shops by name', async () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox shops={mockShopsAdapted} value="" onChange={onChange} />,
      )

      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Bakery')

      // Wait for filtering
      await waitFor(() => {
        // Should show Cochin Bakery and Deepthi Bakery
        const text = document.body.textContent || ''
        expect(text).toContain('Cochin Bakery')
        expect(text).toContain('Deepthi Bakery')
      })
    })

    test('filters shops by code', async () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox shops={mockShopsAdapted} value="" onChange={onChange} />,
      )

      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, '67063100002')

      await waitFor(() => {
        const text = document.body.textContent || ''
        expect(text).toContain('MarginFree Market')
      })
    })

    test('filters shops by zone', async () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox shops={mockShopsAdapted} value="" onChange={onChange} />,
      )

      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Thalassery')

      await waitFor(() => {
        const text = document.body.textContent || ''
        expect(text).toContain('Ashrayam Pharmacy')
      })
    })

    test('shows no results message when filter has no matches', async () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox shops={mockShopsAdapted} value="" onChange={onChange} />,
      )

      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'NonexistentShop12345')

      await waitFor(() => {
        expect(screen.getByText('No shops found')).toBeDefined()
      })
    })

    test('filters with retailerUniqueCode (Convex format)', async () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox shops={mockShopsConvex} value="" onChange={onChange} />,
      )

      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, '67063100003')

      await waitFor(() => {
        const text = document.body.textContent || ''
        expect(text).toContain('Ashrayam Pharmacy')
      })
    })
  })

  describe('selection', () => {
    test('calls onChange when shop is selected', async () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox shops={mockShopsAdapted} value="" onChange={onChange} />,
      )

      const input = screen.getByRole('combobox')
      await userEvent.click(input)

      // Wait for dropdown to open and find item
      await waitFor(() => {
        expect(screen.getByText('Cochin Bakery')).toBeDefined()
      })

      // Click on an option
      const option = screen.getByText('Cochin Bakery')
      await userEvent.click(option)

      expect(onChange).toHaveBeenCalledWith('shop_1')
    })

    test('calls onChange with _id for Convex format shops', async () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox shops={mockShopsConvex} value="" onChange={onChange} />,
      )

      const input = screen.getByRole('combobox')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('MarginFree Market')).toBeDefined()
      })

      const option = screen.getByText('MarginFree Market')
      await userEvent.click(option)

      expect(onChange).toHaveBeenCalledWith('shop_2')
    })
  })

  describe('MAX_DISPLAYED_ITEMS limit', () => {
    test('limits displayed items to 50', async () => {
      // Create 60 shops
      const manyShops = Array.from({ length: 60 }, (_, i) => ({
        id: `shop_${i}`,
        name: `Shop ${i}`,
        code: `CODE${String(i).padStart(5, '0')}`,
        zone: 'Zone A',
        currentBalance: 1000,
      }))

      const onChange = mock(() => {})
      render(<ShopCombobox shops={manyShops} value="" onChange={onChange} />)

      const input = screen.getByRole('combobox')
      await userEvent.click(input)

      await waitFor(() => {
        const text = document.body.textContent || ''
        // Should show Shop 49 (50th item) but not Shop 50
        expect(text).toContain('Shop 49')
        expect(text).not.toContain('Shop 50')
      })
    })

    test('shows more results message when filtering', async () => {
      // Create 60 shops with same zone
      const manyShops = Array.from({ length: 60 }, (_, i) => ({
        id: `shop_${i}`,
        name: `Test Shop ${i}`,
        code: `CODE${String(i).padStart(5, '0')}`,
        zone: 'Zone A',
        currentBalance: 1000,
      }))

      const onChange = mock(() => {})
      render(<ShopCombobox shops={manyShops} value="" onChange={onChange} />)

      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      // Type something that matches more than 50 shops
      await userEvent.type(input, 'Test')

      await waitFor(() => {
        const text = document.body.textContent || ''
        // Should show "more results" since filter matches 60 shops
        expect(text).toContain('more results')
      })
    })
  })

  describe('allowClear functionality', () => {
    test('does not show clear button when allowClear=false', () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox
          shops={mockShopsAdapted}
          value="shop_1"
          onChange={onChange}
          allowClear={false}
        />,
      )

      // Should not have clear button visible
      const clearButtons = document.querySelectorAll(
        '[data-slot="combobox-clear"]',
      )
      expect(clearButtons.length).toBe(0)
    })

    test('shows clear button when allowClear=true and value is set', () => {
      const onChange = mock(() => {})
      render(
        <ShopCombobox
          shops={mockShopsAdapted}
          value="shop_1"
          onChange={onChange}
          allowClear={true}
        />,
      )

      // Should have clear button
      const clearButton = document.querySelector('[data-slot="combobox-clear"]')
      expect(clearButton).not.toBeNull()
    })
  })
})

describe('ShopCombobox helper functions', () => {
  test('getShopId returns id when available', () => {
    const onChange = mock(() => {})
    render(
      <ShopCombobox
        shops={[mockShopsAdapted[0]]}
        value="shop_1"
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('combobox')
    expect(input.value).toContain('Cochin Bakery')
  })

  test('getShopId returns _id when id not available', () => {
    const onChange = mock(() => {})
    render(
      <ShopCombobox
        shops={[mockShopsConvex[0]]}
        value="shop_1"
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('combobox')
    expect(input.value).toContain('Cochin Bakery')
  })

  test('getShopCode returns code when available', () => {
    const onChange = mock(() => {})
    render(
      <ShopCombobox
        shops={[mockShopsAdapted[0]]}
        value="shop_1"
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('combobox')
    expect(input.value).toContain('67063100001')
  })

  test('getShopCode returns retailerUniqueCode when code not available', () => {
    const onChange = mock(() => {})
    render(
      <ShopCombobox
        shops={[mockShopsConvex[0]]}
        value="shop_1"
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('combobox')
    expect(input.value).toContain('67063100001')
  })
})
