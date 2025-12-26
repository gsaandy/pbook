import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type {CashTransactionsByEmployee, EODSummary, EmployeeSettlement, VerificationFormData} from '@/components/sections/EndOfDayReconciliation';
import { useDataStore } from '@/lib/data-store'
import {



  EndOfDayReconciliation

} from '@/components/sections/EndOfDayReconciliation'

export const Route = createFileRoute('/_authed/reconciliation')({
  component: ReconciliationPage,
})

function ReconciliationPage() {
  const {
    employees,
    getTodayTransactions,
    getTodayAssignments,
    getTodayReconciliation,
    getTodayReconciliations,
    getEmployeeCashInHand,
    getRoute,
    getShop,
    verifyReconciliation,
  } = useDataStore()

  const today = new Date().toISOString().split('T')[0]
  const todayTransactions = getTodayTransactions()
  const todayAssignments = getTodayAssignments()
  const todayReconciliations = getTodayReconciliations()

  // Build EOD summary
  const eodSummary: EODSummary = useMemo(() => {
    const totalCollected = todayTransactions.reduce((sum, t) => sum + t.amount, 0)
    const cashExpected = todayTransactions
      .filter((t) => t.paymentMode === 'cash')
      .reduce((sum, t) => sum + t.amount, 0)
    const digitalPayments = todayTransactions
      .filter((t) => t.paymentMode !== 'cash')
      .reduce((sum, t) => sum + t.amount, 0)

    // Count employees who need verification (those with active assignments today)
    const employeesWithAssignments = new Set(
      todayAssignments.filter((a) => a.status === 'active').map((a) => a.employeeId)
    )
    const employeesTotal = employeesWithAssignments.size
    const employeesVerified = todayReconciliations.filter(
      (r) => r.status === 'verified' || r.status === 'mismatch'
    ).length

    return {
      date: today,
      totalCollected,
      cashExpected,
      digitalPayments,
      employeesVerified,
      employeesTotal,
    }
  }, [todayTransactions, todayAssignments, todayReconciliations, today])

  // Build employee settlements list
  const employeeSettlements: Array<EmployeeSettlement> = useMemo(() => {
    // Get all field staff with active assignments today
    const activeAssignments = todayAssignments.filter((a) => a.status === 'active')

    return activeAssignments.map((assignment) => {
      const employee = employees.find((e) => e.id === assignment.employeeId)
      const route = getRoute(assignment.routeId)
      const reconciliation = getTodayReconciliation(assignment.employeeId)
      const expectedCash = getEmployeeCashInHand(assignment.employeeId)

      let status: 'pending' | 'verified' | 'mismatch' | 'closed' = 'pending'
      if (reconciliation) {
        status = reconciliation.status === 'verified' ? 'verified' : 'mismatch'
      }

      return {
        id: assignment.id,
        employeeId: assignment.employeeId,
        employeeName: employee?.name || 'Unknown',
        route: route?.name || 'Unknown Route',
        expectedCash,
        actualCash: reconciliation?.actualCash ?? null,
        variance: reconciliation?.variance ?? null,
        status,
        verifiedAt: reconciliation?.verifiedAt ?? null,
        note: reconciliation?.note ?? null,
      }
    })
  }, [todayAssignments, employees, getRoute, getTodayReconciliation, getEmployeeCashInHand])

  // Build cash transactions by employee
  const cashTransactionsByEmployee: CashTransactionsByEmployee = useMemo(() => {
    const result: CashTransactionsByEmployee = {}

    const cashTransactions = todayTransactions.filter((t) => t.paymentMode === 'cash')

    cashTransactions.forEach((txn) => {
      if (!(txn.employeeId in result)) {
        result[txn.employeeId] = []
      }

      const shop = getShop(txn.shopId)

      result[txn.employeeId].push({
        id: txn.id,
        timestamp: txn.timestamp,
        shopName: shop?.name ?? 'Unknown Shop',
        amount: txn.amount,
      })
    })

    // Sort each employee's transactions by timestamp
    Object.keys(result).forEach((empId) => {
      result[empId].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    })

    return result
  }, [todayTransactions, getShop])

  // Handle match verification
  const handleVerifyMatch = (settlementId: string) => {
    const settlement = employeeSettlements.find((s) => s.id === settlementId)
    if (settlement) {
      verifyReconciliation(settlement.employeeId, settlement.expectedCash)
    }
  }

  // Handle mismatch verification
  const handleVerifyMismatch = (settlementId: string, data: VerificationFormData) => {
    const settlement = employeeSettlements.find((s) => s.id === settlementId)
    if (settlement) {
      verifyReconciliation(settlement.employeeId, data.actualCash, data.note)
    }
  }

  return (
    <EndOfDayReconciliation
      eodSummary={eodSummary}
      employeeSettlements={employeeSettlements}
      cashTransactionsByEmployee={cashTransactionsByEmployee}
      currentDate={today}
      onVerifyMatch={handleVerifyMatch}
      onVerifyMismatch={handleVerifyMismatch}
    />
  )
}
