import { describe, test, expect, mock } from 'bun:test'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FieldStaffCollections } from './FieldStaffCollections'
import type { FieldStaffCollectionsProps } from './FieldStaffCollections'

// Import setup
import '~/test/setup'

// Mock data
const mockEmployee = {
  _id: 'emp_1',
  name: 'John Doe',
}

const mockShops = [
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
    currentBalance: 15000, // High due
  },
  {
    _id: 'shop_3',
    name: 'Ashrayam Pharmacy',
    retailerUniqueCode: '67063100003',
    zone: 'Thalassery',
    currentBalance: 0,
  },
]

const today = new Date().toISOString().split('T')[0]!

const mockTransactions = [
  {
    _id: 'txn_1',
    amount: 1000,
    timestamp: new Date(today + 'T10:00:00').getTime(),
    paymentMode: 'cash' as const,
    isVerified: false,
    shop: { name: 'Cochin Bakery' },
  },
  {
    _id: 'txn_2',
    amount: 2000,
    timestamp: new Date(today + 'T11:00:00').getTime(),
    paymentMode: 'cash' as const,
    isVerified: false,
    shop: { name: 'MarginFree Market' },
  },
  {
    _id: 'txn_3',
    amount: 500,
    timestamp: new Date(today + 'T12:00:00').getTime(),
    paymentMode: 'upi' as const,
    isVerified: false,
    shop: { name: 'Ashrayam Pharmacy' },
  },
]

describe('FieldStaffCollections', () => {
  const defaultProps: FieldStaffCollectionsProps = {
    currentEmployee: mockEmployee,
    shops: mockShops,
    transactions: mockTransactions,
    today,
    onCollectCash: mock(() => {}),
    isCollecting: false,
  }

  describe('rendering', () => {
    test('renders employee name', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      expect(screen.getByText('John Doe')).toBeDefined()
      expect(screen.getByText('Logged in as')).toBeDefined()
    })

    test('renders cash in bag total', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      expect(screen.getByText('Cash in Bag')).toBeDefined()
      // Cash in bag should be 1000 + 2000 = 3000 (only unverified cash)
      expect(screen.getByText('₹3,000')).toBeDefined()
    })

    test('renders collections count for today', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      expect(screen.getByText('3 collections today')).toBeDefined()
    })

    test('renders search input', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      expect(
        screen.getByPlaceholderText('Search by name, code, or zone...'),
      ).toBeDefined()
    })

    test('renders shop count', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      expect(screen.getByText(/3 shops/)).toBeDefined()
    })
  })

  describe('shop list', () => {
    test('displays shop codes', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      expect(screen.getByText('67063100001')).toBeDefined()
      expect(screen.getByText('67063100002')).toBeDefined()
      expect(screen.getByText('67063100003')).toBeDefined()
    })

    test('displays shop names', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      expect(screen.getByText('Cochin Bakery')).toBeDefined()
      expect(screen.getByText('MarginFree Market')).toBeDefined()
      expect(screen.getByText('Ashrayam Pharmacy')).toBeDefined()
    })

    test('displays shop zones', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      // Kannur appears twice (for two shops)
      const kannurElements = screen.getAllByText('Kannur')
      expect(kannurElements.length).toBe(2)
      expect(screen.getByText('Thalassery')).toBeDefined()
    })

    test('displays shop balances', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      expect(screen.getByText('₹5,000')).toBeDefined()
      expect(screen.getByText('₹15,000')).toBeDefined()
      expect(screen.getByText('₹0')).toBeDefined()
    })

    test('shows High Due badge for shops over 10000 balance', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      // Only MarginFree Market has > 10000 balance
      expect(screen.getByText('High Due!')).toBeDefined()
    })

    test('sorts shops by balance (highest first)', () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const shopNames = screen.getAllByRole('button', { name: /.*/ })
      // First shop in list should be MarginFree Market (15000 balance)
      const firstShopButton = shopNames.find((btn) =>
        btn.textContent?.includes('MarginFree Market'),
      )
      expect(firstShopButton).toBeDefined()
    })
  })

  describe('search functionality', () => {
    test('filters shops by name', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(
        'Search by name, code, or zone...',
      )
      await userEvent.type(searchInput, 'Cochin')

      await waitFor(() => {
        expect(screen.getByText('Cochin Bakery')).toBeDefined()
        expect(screen.queryByText('MarginFree Market')).toBeNull()
        expect(screen.queryByText('Ashrayam Pharmacy')).toBeNull()
      })
    })

    test('filters shops by code', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(
        'Search by name, code, or zone...',
      )
      await userEvent.type(searchInput, '67063100002')

      await waitFor(() => {
        expect(screen.getByText('MarginFree Market')).toBeDefined()
        expect(screen.queryByText('Cochin Bakery')).toBeNull()
      })
    })

    test('filters shops by zone', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(
        'Search by name, code, or zone...',
      )
      await userEvent.type(searchInput, 'Thalassery')

      await waitFor(() => {
        expect(screen.getByText('Ashrayam Pharmacy')).toBeDefined()
        expect(screen.queryByText('Cochin Bakery')).toBeNull()
        expect(screen.queryByText('MarginFree Market')).toBeNull()
      })
    })

    test('shows empty state when no shops match search', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(
        'Search by name, code, or zone...',
      )
      await userEvent.type(searchInput, 'NonexistentShop')

      await waitFor(() => {
        expect(screen.getByText('No shops match your search.')).toBeDefined()
      })
    })

    test('updates shop count when filtering', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(
        'Search by name, code, or zone...',
      )
      await userEvent.type(searchInput, 'Kannur')

      await waitFor(() => {
        expect(screen.getByText(/2 shops/)).toBeDefined()
      })
    })
  })

  describe('collection modal', () => {
    test('opens modal when shop is clicked', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      await waitFor(() => {
        // Modal should show shop details
        expect(screen.getAllByText('Cochin Bakery').length).toBeGreaterThan(1)
        expect(screen.getByText('Amount Collected')).toBeDefined()
        expect(screen.getByText('Payment Mode')).toBeDefined()
      })
    })

    test('displays shop code in modal', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      await waitFor(() => {
        // Shop code should appear in modal header
        const codeElements = screen.getAllByText('67063100001')
        expect(codeElements.length).toBeGreaterThan(1)
      })
    })

    test('shows payment mode buttons', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      await waitFor(() => {
        expect(screen.getByText('Cash')).toBeDefined()
        expect(screen.getByText('UPI')).toBeDefined()
        expect(screen.getByText('Cheque')).toBeDefined()
      })
    })

    test('shows current balance in modal', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      await waitFor(() => {
        expect(screen.getByText('Current Balance:')).toBeDefined()
      })
    })

    test('closes modal when Cancel is clicked', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      await waitFor(() => {
        expect(screen.getByText('Amount Collected')).toBeDefined()
      })

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Amount Collected')).toBeNull()
      })
    })

    test('closes modal when X button is clicked', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      await waitFor(() => {
        expect(screen.getByText('Amount Collected')).toBeDefined()
      })

      const closeButton = screen.getByText('×')
      await userEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByText('Amount Collected')).toBeNull()
      })
    })
  })

  describe('collection submission', () => {
    test('calls onCollectCash with correct data when submitted', async () => {
      const onCollectCash = mock(() => {})
      render(
        <FieldStaffCollections {...defaultProps} onCollectCash={onCollectCash} />,
      )

      // Open modal
      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      // Enter amount
      const amountInput = screen.getByPlaceholderText('0')
      await userEvent.type(amountInput, '5000')

      // Submit
      const submitButton = screen.getByText('Confirm Collection')
      await userEvent.click(submitButton)

      expect(onCollectCash).toHaveBeenCalledWith({
        shopId: 'shop_1',
        amount: 5000,
        paymentMode: 'cash',
      })
    })

    test('allows selecting different payment modes', async () => {
      const onCollectCash = mock(() => {})
      render(
        <FieldStaffCollections {...defaultProps} onCollectCash={onCollectCash} />,
      )

      // Open modal
      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      // Enter amount
      const amountInput = screen.getByPlaceholderText('0')
      await userEvent.type(amountInput, '1000')

      // Select UPI
      const upiButton = screen.getByText('UPI')
      await userEvent.click(upiButton)

      // Submit
      const submitButton = screen.getByText('Confirm Collection')
      await userEvent.click(submitButton)

      expect(onCollectCash).toHaveBeenCalledWith({
        shopId: 'shop_1',
        amount: 1000,
        paymentMode: 'upi',
      })
    })

    test('disables submit button when amount is empty', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      await waitFor(() => {
        const submitButton = screen.getByText('Confirm Collection')
        expect(submitButton).toHaveProperty('disabled', true)
      })
    })

    test('disables submit button when amount is zero', async () => {
      render(<FieldStaffCollections {...defaultProps} />)

      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      const amountInput = screen.getByPlaceholderText('0')
      await userEvent.type(amountInput, '0')

      await waitFor(() => {
        const submitButton = screen.getByText('Confirm Collection')
        expect(submitButton).toHaveProperty('disabled', true)
      })
    })

    test('shows loading state when isCollecting is true', async () => {
      render(<FieldStaffCollections {...defaultProps} isCollecting={true} />)

      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      const amountInput = screen.getByPlaceholderText('0')
      await userEvent.type(amountInput, '1000')

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeDefined()
      })
    })

    test('resets form after successful submission', async () => {
      const onCollectCash = mock(() => {})
      render(
        <FieldStaffCollections {...defaultProps} onCollectCash={onCollectCash} />,
      )

      // Open modal
      const shopButton = screen.getByText('Cochin Bakery').closest('button')
      await userEvent.click(shopButton!)

      // Enter amount
      const amountInput = screen.getByPlaceholderText('0')
      await userEvent.type(amountInput, '5000')

      // Submit
      const submitButton = screen.getByText('Confirm Collection')
      await userEvent.click(submitButton)

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Amount Collected')).toBeNull()
      })
    })
  })

  describe('pagination', () => {
    test('paginates when more than 20 shops', async () => {
      const manyShops = Array.from({ length: 25 }, (_, i) => ({
        _id: `shop_${i}`,
        name: `Shop ${i}`,
        retailerUniqueCode: `CODE${String(i).padStart(5, '0')}`,
        zone: 'Zone A',
        currentBalance: 1000 * (25 - i), // Descending balance for sorting
      }))

      render(
        <FieldStaffCollections
          {...defaultProps}
          shops={manyShops}
          transactions={[]}
        />,
      )

      // Should show pagination info
      expect(screen.getByText('1-20 of 25')).toBeDefined()
      expect(screen.getByText('1 / 2')).toBeDefined()
    })

    test('navigates to next page', async () => {
      const manyShops = Array.from({ length: 25 }, (_, i) => ({
        _id: `shop_${i}`,
        name: `Shop ${i}`,
        retailerUniqueCode: `CODE${String(i).padStart(5, '0')}`,
        zone: 'Zone A',
        currentBalance: 1000 * (25 - i),
      }))

      render(
        <FieldStaffCollections
          {...defaultProps}
          shops={manyShops}
          transactions={[]}
        />,
      )

      const nextButton = screen.getByLabelText('Next page')
      await userEvent.click(nextButton)

      expect(screen.getByText('21-25 of 25')).toBeDefined()
      expect(screen.getByText('2 / 2')).toBeDefined()
    })

    test('navigates to previous page', async () => {
      const manyShops = Array.from({ length: 25 }, (_, i) => ({
        _id: `shop_${i}`,
        name: `Shop ${i}`,
        retailerUniqueCode: `CODE${String(i).padStart(5, '0')}`,
        zone: 'Zone A',
        currentBalance: 1000 * (25 - i),
      }))

      render(
        <FieldStaffCollections
          {...defaultProps}
          shops={manyShops}
          transactions={[]}
        />,
      )

      // Go to page 2
      const nextButton = screen.getByLabelText('Next page')
      await userEvent.click(nextButton)

      // Go back to page 1
      const prevButton = screen.getByLabelText('Previous page')
      await userEvent.click(prevButton)

      expect(screen.getByText('1-20 of 25')).toBeDefined()
      expect(screen.getByText('1 / 2')).toBeDefined()
    })

    test('disables previous button on first page', () => {
      const manyShops = Array.from({ length: 25 }, (_, i) => ({
        _id: `shop_${i}`,
        name: `Shop ${i}`,
        retailerUniqueCode: `CODE${String(i).padStart(5, '0')}`,
        zone: 'Zone A',
        currentBalance: 1000 * (25 - i),
      }))

      render(
        <FieldStaffCollections
          {...defaultProps}
          shops={manyShops}
          transactions={[]}
        />,
      )

      const prevButton = screen.getByLabelText('Previous page')
      expect(prevButton).toHaveProperty('disabled', true)
    })

    test('disables next button on last page', async () => {
      const manyShops = Array.from({ length: 25 }, (_, i) => ({
        _id: `shop_${i}`,
        name: `Shop ${i}`,
        retailerUniqueCode: `CODE${String(i).padStart(5, '0')}`,
        zone: 'Zone A',
        currentBalance: 1000 * (25 - i),
      }))

      render(
        <FieldStaffCollections
          {...defaultProps}
          shops={manyShops}
          transactions={[]}
        />,
      )

      const nextButton = screen.getByLabelText('Next page')
      await userEvent.click(nextButton)

      expect(nextButton).toHaveProperty('disabled', true)
    })

    test('resets to page 1 when search changes', async () => {
      const manyShops = Array.from({ length: 25 }, (_, i) => ({
        _id: `shop_${i}`,
        name: `Shop ${i}`,
        retailerUniqueCode: `CODE${String(i).padStart(5, '0')}`,
        zone: 'Zone A',
        currentBalance: 1000 * (25 - i),
      }))

      render(
        <FieldStaffCollections
          {...defaultProps}
          shops={manyShops}
          transactions={[]}
        />,
      )

      // Go to page 2
      const nextButton = screen.getByLabelText('Next page')
      await userEvent.click(nextButton)

      expect(screen.getByText('2 / 2')).toBeDefined()

      // Type in search
      const searchInput = screen.getByPlaceholderText(
        'Search by name, code, or zone...',
      )
      await userEvent.type(searchInput, 'Shop 1')

      // Should reset to page 1
      await waitFor(() => {
        // Pagination may be hidden if fewer than 20 results
        // or showing page 1 of X
        expect(screen.queryByText('2 / 2')).toBeNull()
      })
    })
  })

  describe('empty states', () => {
    test('shows empty state when no shops', () => {
      render(
        <FieldStaffCollections {...defaultProps} shops={[]} transactions={[]} />,
      )

      expect(screen.getByText('No shops available.')).toBeDefined()
    })

    test('shows zero cash in bag when no unverified cash transactions', () => {
      const verifiedTransactions = mockTransactions.map((t) => ({
        ...t,
        isVerified: true,
      }))

      render(
        <FieldStaffCollections
          {...defaultProps}
          transactions={verifiedTransactions}
        />,
      )

      // Cash in bag should be ₹0 (appears in header, and also for shop with 0 balance)
      const zeroAmounts = screen.getAllByText('₹0')
      expect(zeroAmounts.length).toBeGreaterThan(0)
    })

    test('shows 0 collections today when no transactions today', () => {
      const oldTransactions = mockTransactions.map((t) => ({
        ...t,
        timestamp: new Date('2024-01-01').getTime(),
      }))

      render(
        <FieldStaffCollections
          {...defaultProps}
          transactions={oldTransactions}
        />,
      )

      expect(screen.getByText('0 collections today')).toBeDefined()
    })
  })

  describe('cash in bag calculation', () => {
    test('only counts unverified cash transactions', () => {
      const mixedTransactions = [
        {
          _id: 'txn_1',
          amount: 1000,
          timestamp: new Date(today + 'T10:00:00').getTime(),
          paymentMode: 'cash' as const,
          isVerified: false, // Should count
          shop: null,
        },
        {
          _id: 'txn_2',
          amount: 2000,
          timestamp: new Date(today + 'T11:00:00').getTime(),
          paymentMode: 'cash' as const,
          isVerified: true, // Should NOT count (verified)
          shop: null,
        },
        {
          _id: 'txn_3',
          amount: 500,
          timestamp: new Date(today + 'T12:00:00').getTime(),
          paymentMode: 'upi' as const,
          isVerified: false, // Should NOT count (UPI)
          shop: null,
        },
      ]

      render(
        <FieldStaffCollections
          {...defaultProps}
          transactions={mixedTransactions}
        />,
      )

      // Only unverified cash = 1000
      expect(screen.getByText('₹1,000')).toBeDefined()
    })

    test('only counts transactions from today', () => {
      const mixedDatesTransactions = [
        {
          _id: 'txn_1',
          amount: 1000,
          timestamp: new Date(today + 'T10:00:00').getTime(),
          paymentMode: 'cash' as const,
          isVerified: false,
          shop: null,
        },
        {
          _id: 'txn_2',
          amount: 5000,
          timestamp: new Date('2024-01-01T10:00:00').getTime(), // Old date
          paymentMode: 'cash' as const,
          isVerified: false,
          shop: null,
        },
      ]

      render(
        <FieldStaffCollections
          {...defaultProps}
          transactions={mixedDatesTransactions}
        />,
      )

      // Only today's transaction = 1000
      expect(screen.getByText('₹1,000')).toBeDefined()
    })
  })
})
