import { useMemo, useState, useTransition } from 'react'
import { formatCurrency } from '~/lib/constants'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '~/components/ui/combobox'

const MAX_DISPLAYED_ITEMS = 50

// Flexible shop type that works with both adapted Shop type and Convex data
interface ShopItem {
  id?: string
  _id?: string
  name: string
  code?: string
  retailerUniqueCode?: string
  zone: string
  currentBalance: number
}

// Helper to get normalized values from shop
const getShopId = (shop: ShopItem) => shop.id ?? shop._id ?? ''
const getShopCode = (shop: ShopItem) => shop.code ?? shop.retailerUniqueCode ?? ''

export interface ShopComboboxProps {
  shops: Array<ShopItem>
  value: string
  onChange: (shopId: string) => void
  disabled?: boolean
  placeholder?: string
  showBalance?: boolean
  allowClear?: boolean
}

export function ShopCombobox({
  shops,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a shop...',
  showBalance = true,
  allowClear = false,
}: ShopComboboxProps) {
  const [inputValue, setInputValue] = useState('')
  const [filterQuery, setFilterQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const selectedShop = useMemo(
    () => shops.find((s) => getShopId(s) === value),
    [shops, value],
  )

  const filteredShops = useMemo(() => {
    if (!filterQuery) return shops.slice(0, MAX_DISPLAYED_ITEMS)
    const query = filterQuery.toLowerCase()
    return shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(query) ||
        getShopCode(shop).toLowerCase().includes(query) ||
        shop.zone.toLowerCase().includes(query),
    )
  }, [shops, filterQuery])

  const displayedShops = filteredShops.slice(0, MAX_DISPLAYED_ITEMS)
  const hasMoreResults = filteredShops.length > MAX_DISPLAYED_ITEMS

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    // Use transition to keep input responsive while filtering
    startTransition(() => {
      setFilterQuery(newValue)
    })
  }

  const getDisplayValue = (shop: ShopItem | undefined) => {
    if (!shop) return ''
    const code = getShopCode(shop)
    if (showBalance) {
      return `${code} - ${shop.name} (${formatCurrency(shop.currentBalance)})`
    }
    return `${code} - ${shop.name}`
  }

  return (
    <Combobox
      value={value}
      onValueChange={(newValue) => {
        onChange(newValue as string)
        setInputValue('')
      }}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        value={inputValue || getDisplayValue(selectedShop)}
        onChange={handleInputChange}
        onFocus={() => {
          if (selectedShop) {
            setInputValue('')
          }
        }}
        onBlur={() => {
          if (!inputValue) {
            setInputValue('')
          }
        }}
        disabled={disabled}
        showClear={allowClear && !!value}
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxList>
          {displayedShops.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {isPending ? 'Searching...' : 'No shops found'}
            </div>
          ) : (
            <>
              {displayedShops.map((shop) => {
                const shopId = getShopId(shop)
                const shopCode = getShopCode(shop)
                return (
                  <ComboboxItem key={shopId} value={shopId}>
                    <div className="flex flex-col w-full py-0.5">
                      <span className="font-medium text-slate-900 dark:text-white truncate">
                        {shop.name}
                      </span>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {shop.zone}
                          {showBalance && (
                            <span className="ml-1.5 text-slate-600 dark:text-slate-300 font-medium">
                              {formatCurrency(shop.currentBalance)}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                          {shopCode}
                        </span>
                      </div>
                    </div>
                  </ComboboxItem>
                )
              })}
              {hasMoreResults && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground text-center border-t">
                  Type to search {filteredShops.length - MAX_DISPLAYED_ITEMS}{' '}
                  more results...
                </div>
              )}
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
