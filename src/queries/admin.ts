import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '~/convex/_generated/api'

/**
 * Admin query options for use with React Query.
 */
export const adminQueries = {
  /** Get employees with pending (unverified) cash to hand over */
  pendingHandovers: () => convexQuery(api.admin.getPendingHandovers, {}),
}

/**
 * Verify handover - marks all unverified cash transactions for an employee as verified.
 */
export function useVerifyHandoverMutation() {
  const mutationFn = useConvexMutation(api.admin.verifyHandover)
  return useMutation({ mutationFn })
}

/**
 * Add a balance correction for a shop.
 */
export function useAddCorrectionMutation() {
  const mutationFn = useConvexMutation(api.admin.addCorrection)
  return useMutation({ mutationFn })
}
