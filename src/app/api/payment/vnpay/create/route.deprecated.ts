// ❌ DEPRECATED: VNPay Sandbox Payment Route
// This file has been deprecated and should no longer be used.
//
// Previous Purpose: Create VNPay sandbox payment links for testing
// Migration Path: Use PayOS payment system instead
// New Endpoint: /api/payment/payos (or direct PayOS SDK)
//
// Removed: November 11, 2025
// Last Used: November 2024
//
// The actual route file has been removed from the routing system.
// Please update your frontend payment implementation to use PayOS.

// Original file location: src/app/api/payment/vnpay/create/route.ts
// Status: DELETED - File moved to .deprecated for archival purposes only

export default function () {
  throw new Error('VNPay payment method has been deprecated. Please use PayOS instead.');
}
