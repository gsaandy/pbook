import { useMemo, useState, useTransition } from 'react'
import type { Shop } from '~/lib/types'
import { formatCurrency } from '~/lib/constants'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '~/components/ui/combobox'

const MAX_DISPLAYED_ITEMS = 50

export interface ShopComboboxProps {
  shops: Array<Shop>
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
    () => shops.find((s) => s.id === value),
    [shops, value],
  )

  const filteredShops = useMemo(() => {
    if (!filterQuery) return shops.slice(0, MAX_DISPLAYED_ITEMS)
    const query = filterQuery.toLowerCase()
    return shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(query) ||
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

  const getDisplayValue = (shop: Shop | undefined) => {
    if (!shop) return ''
    if (showBalance) {
      return `${shop.name} - ${shop.zone} (${formatCurrency(shop.currentBalance)})`
    }
    return `${shop.name} - ${shop.zone}`
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
              {displayedShops.map((shop) => (
                <ComboboxItem key={shop.id} value={shop.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{shop.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {shop.zone}
                      {showBalance && ` - ${formatCurrency(shop.currentBalance)}`}
                    </span>
                  </div>
                </ComboboxItem>
              ))}
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
