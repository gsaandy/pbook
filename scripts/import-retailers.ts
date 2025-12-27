#!/usr/bin/env bun

/**
 * Import retailers from CSV to Convex database
 *
 * Usage:
 *   bun run scripts/import-retailers.ts
 *
 * Environment variables:
 *   CONVEX_URL - Your Convex deployment URL (required)
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ConvexHttpClient } from 'convex/browser'
/* eslint-disable-next-line */
import { api } from '../convex/_generated/api'
/* eslint-disable-next-line */
import { Id } from '../convex/_generated/dataModel'

// CSV column indices (0-based)
const CSV_COLUMNS = {
  DISTR_CODE: 0,
  DISTRIBUTOR_NAME: 1,
  SALESMAN_CODE: 2,
  SALESMAN_NAME: 3,
  ROUTE_CODE: 4,
  ROUTE_NAME: 5,
  RETAILER_CODE: 6,
  RETAILER_UNIQUE_CODE: 7,
  RETAILER_NAME: 8,
  RETAILER_STATUS: 9,
  CHANNEL_GROUP: 10,
  CHANNEL: 11,
  CHANNEL_SUB_TYPE: 12,
  LATITUDE: 13,
  LONGITUDE: 14,
  RETAILER_ADDRESS_1: 15,
  RETAILER_ADDRESS_2: 16,
  RETAILER_ADDRESS_3: 17,
  PIN_CODE: 18,
  DISTRICT: 19,
  TOWN: 20,
  TOWN_TYPE: 21,
  TOWN_CLASS: 22,
  UA: 23,
  UA_TOWN: 24,
  UA_TOWN_CLASS: 25,
  TERRAIN: 26,
  RETAILER_STATE_CODE: 27,
  RETAILER_STATE_NAME: 28,
  CONTACT_PERSON_NAME: 29,
  CONTACT_PERSON_NUMBER: 30,
  GSTIN: 31,
  PAN_NO: 32,
  GST_TYPE: 33,
  COMPOSITE: 34,
  GST_STATE_CODE: 35,
  GST_STATE_NAME: 36,
  FSSAI_LICENSE_NO: 37,
  FSSAI_LIC_EXPIRY_DATE: 38,
  DRUG_LIC_NUMBER: 39,
  DRUG_LIC_EXPIRY_DATE: 40,
  DISCOUNT_FOR_REMOTE_LOCATION: 41,
  KEY_ACCOUNT_NAME: 42,
  CREATION_DATE: 43,
  LAST_MODIFIED_DATE: 44,
  AADHAR_NO: 45,
  IS_TCS_APPLICABLE: 46,
  CREDIT_BILLS: 47,
  CREDIT_LIMIT: 48,
  CREDIT_DAYS: 49,
  CASH_DISCOUNT: 50,
  CREATED_BY: 51,
  COVERAGE_TYPE: 52,
  WHATSAPP: 53,
  FORT_NIGHTLY: 54,
} as const

interface CSVRow {
  routeCode: string
  routeName: string
  retailerUniqueCode: string
  retailerName: string
  latitude?: number
  longitude?: number
  addressLine1?: string
  addressLine2?: string
  addressLine3?: string
  pinCode?: string
  district?: string
  city?: string
  state?: string
  phone?: string
  whatsapp?: string
  zone: string // Using district as zone for now
}

function parseCSVLine(line: string): Array<string> {
  const result: Array<string> = []
  let current = ''
  let inQuotes = false

  // eslint-disable-next-line
  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())

  return result
}

function cleanValue(value: string): string | undefined {
  const cleaned = value.trim()
  if (!cleaned || cleaned === 'NA' || cleaned === '') {
    return undefined
  }
  return cleaned
}

function parseFloatSafe(value: string | undefined): number | undefined {
  if (!value) return undefined
  const cleaned = cleanValue(value)
  if (!cleaned) return undefined
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? undefined : parsed
}

function parseCSVRow(row: Array<string>): CSVRow | null {
  try {
    const routeCode = cleanValue(row[CSV_COLUMNS.ROUTE_CODE]) || ''
    const routeName = cleanValue(row[CSV_COLUMNS.ROUTE_NAME]) || ''
    const retailerUniqueCode =
      cleanValue(row[CSV_COLUMNS.RETAILER_UNIQUE_CODE]) || ''
    const retailerName = cleanValue(row[CSV_COLUMNS.RETAILER_NAME]) || ''

    // Skip rows with missing essential data
    if (!routeCode || !routeName || !retailerUniqueCode || !retailerName) {
      return null
    }

    return {
      routeCode,
      routeName,
      retailerUniqueCode,
      retailerName,
      latitude: parseFloatSafe(row[CSV_COLUMNS.LATITUDE]),
      longitude: parseFloatSafe(row[CSV_COLUMNS.LONGITUDE]),
      addressLine1: cleanValue(row[CSV_COLUMNS.RETAILER_ADDRESS_1]),
      addressLine2: cleanValue(row[CSV_COLUMNS.RETAILER_ADDRESS_2]),
      addressLine3: cleanValue(row[CSV_COLUMNS.RETAILER_ADDRESS_3]),
      pinCode: cleanValue(row[CSV_COLUMNS.PIN_CODE]),
      district: cleanValue(row[CSV_COLUMNS.DISTRICT]),
      city: cleanValue(row[CSV_COLUMNS.TOWN]),
      state: cleanValue(row[CSV_COLUMNS.RETAILER_STATE_NAME]),
      phone: cleanValue(row[CSV_COLUMNS.CONTACT_PERSON_NUMBER]),
      whatsapp: cleanValue(row[CSV_COLUMNS.WHATSAPP]),
      zone: cleanValue(row[CSV_COLUMNS.DISTRICT]) || 'Unknown',
    }
  } catch (error) {
    console.error('Error parsing row:', error)
    return null
  }
}

async function main() {
  const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL
  if (!convexUrl) {
    console.error(
      'Error: CONVEX_URL or VITE_CONVEX_URL environment variable is required',
    )
    console.error(
      'Set it with: export CONVEX_URL="https://your-deployment.convex.cloud"',
    )
    console.error(
      'Or: export VITE_CONVEX_URL="https://your-deployment.convex.cloud"',
    )
    process.exit(1)
  }

  const csvPath = join(
    import.meta.dirname,
    '..',
    'product-plan',
    'Retailer Master Report.xlsx - Sheet1.csv',
  )

  console.log('Reading CSV file...')
  const csvContent = readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter((line) => line.trim())

  if (lines.length < 2) {
    console.error('Error: CSV file appears to be empty or invalid')
    process.exit(1)
  }

  // Skip header row
  const dataRows = lines.slice(1)

  console.log(`Found ${dataRows.length} data rows`)

  // Parse CSV rows
  const parsedRows: Array<CSVRow> = []
  for (let i = 0; i < dataRows.length; i++) {
    const row = parseCSVLine(dataRows[i])
    const parsed = parseCSVRow(row)
    if (parsed) {
      parsedRows.push(parsed)
    }
    if ((i + 1) % 100 === 0) {
      console.log(`  Parsed ${i + 1}/${dataRows.length} rows...`)
    }
  }

  console.log(`Successfully parsed ${parsedRows.length} rows`)

  // Initialize Convex client
  const client = new ConvexHttpClient(convexUrl)

  // Extract unique routes
  const uniqueRoutes = new Map<string, { code: string; name: string }>()
  for (const row of parsedRows) {
    const key = `${row.routeCode}|${row.routeName}`
    if (!uniqueRoutes.has(key)) {
      uniqueRoutes.set(key, {
        code: row.routeCode,
        name: row.routeName,
      })
    }
  }

  console.log(`\nFound ${uniqueRoutes.size} unique routes`)

  // Import routes
  console.log('\nImporting routes...')
  const routeCodeToId = new Map<string, string>()
  let routesCreated = 0
  let routesSkipped = 0

  for (const [, route] of uniqueRoutes) {
    try {
      // Check if route already exists
      const existing = await client.query(api.routes.getByCode, {
        code: route.code,
      })

      if (existing) {
        routeCodeToId.set(route.code, existing._id)
        routesSkipped++
        if (routesSkipped % 10 === 0) {
          console.log(`  Skipped ${routesSkipped} existing routes...`)
        }
        continue
      }

      // Create new route
      const routeId = await client.mutation(api.routes.create, {
        name: route.name,
        code: route.code,
      })

      routeCodeToId.set(route.code, routeId)
      routesCreated++

      if (routesCreated % 10 === 0) {
        console.log(`  Created ${routesCreated} routes...`)
      }
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        // Route might have been created by another process, try to fetch it
        const existing = await client.query(api.routes.getByCode, {
          code: route.code,
        })
        if (existing) {
          routeCodeToId.set(route.code, existing._id)
          routesSkipped++
          continue
        }
      }
      console.error(`Error creating route ${route.code}:`, error.message)
    }
  }

  console.log(
    `Routes: ${routesCreated} created, ${routesSkipped} skipped (already exist)`,
  )

  // Import shops
  console.log('\nImporting shops...')
  let shopsCreated = 0
  let shopsSkipped = 0
  let shopsErrors = 0

  // eslint-disable-next-line
  for (let i = 0; i < parsedRows.length; i++) {
    const row = parsedRows[i]
    const routeId = routeCodeToId.get(row.routeCode)

    try {
      // Check if shop already exists
      const existing = await client.query(api.shops.getByRetailerUniqueCode, {
        retailerUniqueCode: row.retailerUniqueCode,
      })

      if (existing) {
        shopsSkipped++
        if (shopsSkipped % 50 === 0) {
          console.log(`  Skipped ${shopsSkipped} existing shops...`)
        }
        continue
      }

      // Create new shop
      await client.mutation(api.shops.create, {
        name: row.retailerName,
        retailerUniqueCode: row.retailerUniqueCode,
        zone: row.zone,
        routeId: routeId as Id<'routes'>,
        addressLine1: row.addressLine1,
        addressLine2: row.addressLine2,
        addressLine3: row.addressLine3,
        city: row.city,
        district: row.district,
        state: row.state,
        pinCode: row.pinCode,
        phone: row.phone,
        whatsapp: row.whatsapp,
        latitude: row.latitude,
        longitude: row.longitude,
        currentBalance: 0,
      })

      shopsCreated++

      if (shopsCreated % 50 === 0) {
        console.log(
          `  Created ${shopsCreated}/${parsedRows.length} shops... (${shopsSkipped} skipped, ${shopsErrors} errors)`,
        )
      }
    } catch (error: any) {
      shopsErrors++
      if (error.message?.includes('already exists')) {
        shopsSkipped++
        shopsErrors--
        continue
      }
      console.error(
        `Error creating shop ${row.retailerName} (${row.retailerUniqueCode}):`,
        error.message,
      )
    }
  }

  console.log('\n=== Import Summary ===')
  console.log(`Routes: ${routesCreated} created, ${routesSkipped} skipped`)
  console.log(
    `Shops: ${shopsCreated} created, ${shopsSkipped} skipped, ${shopsErrors} errors`,
  )
  console.log('\nImport complete!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
