// src/lib/trends.ts
// Trend data calculation utilities

import type { 
  TrendData, 
  DailyCollection, 
  EmployeePerformance, 
  PaymentModeDistribution, 
  TopShop 
} from '../../product-plan/sections/reports-and-history/types';

export interface Transaction {
  id: string;
  timestamp: string;
  employeeName: string;
  shopName: string;
  amount: number;
  paymentMode: 'cash' | 'upi' | 'cheque';
  reference?: string | null;
  status: 'completed' | 'adjusted' | 'reversed';
}

/**
 * Calculate trend data from transactions
 */
export function calculateTrendData(
  transactions: Transaction[],
  dateRange: { start: string; end: string }
): TrendData {
  // Filter only completed transactions
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  
  // Daily Collections
  const dailyCollections: DailyCollection[] = calculateDailyCollections(
    completedTransactions,
    dateRange
  );
  
  // Employee Performance
  const employeePerformance: EmployeePerformance[] = calculateEmployeePerformance(
    completedTransactions
  );
  
  // Payment Mode Distribution
  const paymentModeDistribution: PaymentModeDistribution[] = calculatePaymentModeDistribution(
    completedTransactions
  );
  
  // Top Shops
  const topShops: TopShop[] = calculateTopShops(completedTransactions);
  
  return {
    dailyCollections,
    employeePerformance,
    paymentModeDistribution,
    topShops,
  };
}

/**
 * Calculate daily collection totals
 */
function calculateDailyCollections(
  transactions: Transaction[],
  dateRange: { start: string; end: string }
): DailyCollection[] {
  const dailyMap = new Map<string, number>();
  
  // Initialize all dates in range with 0
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const current = new Date(start);
  
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    dailyMap.set(dateStr, 0);
    current.setDate(current.getDate() + 1);
  }
  
  // Sum transactions by date
  transactions.forEach(txn => {
    const dateStr = new Date(txn.timestamp).toISOString().split('T')[0];
    const current = dailyMap.get(dateStr) || 0;
    dailyMap.set(dateStr, current + txn.amount);
  });
  
  // Convert to array and sort by date
  return Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate employee performance metrics
 */
function calculateEmployeePerformance(
  transactions: Transaction[]
): EmployeePerformance[] {
  const employeeMap = new Map<string, number>();
  
  transactions.forEach(txn => {
    const current = employeeMap.get(txn.employeeName) || 0;
    employeeMap.set(txn.employeeName, current + txn.amount);
  });
  
  return Array.from(employeeMap.entries())
    .map(([employeeName, totalCollected]) => ({ employeeName, totalCollected }))
    .sort((a, b) => b.totalCollected - a.totalCollected)
    .slice(0, 10); // Top 10 employees
}

/**
 * Calculate payment mode distribution
 */
function calculatePaymentModeDistribution(
  transactions: Transaction[]
): PaymentModeDistribution[] {
  const modeMap = new Map<string, number>();
  let total = 0;
  
  transactions.forEach(txn => {
    const current = modeMap.get(txn.paymentMode) || 0;
    modeMap.set(txn.paymentMode, current + txn.amount);
    total += txn.amount;
  });
  
  return Array.from(modeMap.entries())
    .map(([mode, amount]) => ({
      mode,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate top shops by collection amount
 */
function calculateTopShops(transactions: Transaction[]): TopShop[] {
  const shopMap = new Map<string, number>();
  
  transactions.forEach(txn => {
    const current = shopMap.get(txn.shopName) || 0;
    shopMap.set(txn.shopName, current + txn.amount);
  });
  
  return Array.from(shopMap.entries())
    .map(([shopName, totalCollected]) => ({ shopName, totalCollected }))
    .sort((a, b) => b.totalCollected - a.totalCollected)
    .slice(0, 10); // Top 10 shops
}

