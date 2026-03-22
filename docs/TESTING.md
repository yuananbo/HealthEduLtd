# Unit tests

## Commands (repository root)

| Command | Description |
|--------|-------------|
| `npm test` | Run all tests once (Vitest) |
| `npm run test:watch` | Watch mode while developing |
| `npm run test:coverage` | Run tests + V8 coverage report (`coverage/` HTML + terminal) |

## Stack

- **Vitest** — ESM-friendly; backend tests use **node**, frontend tests use **jsdom**.
- **@testing-library/react** — user interactions on `PayForAppointment`.
- **Controller tests** — `vi.mock` for Mongoose models and `processPayment`.

## Covered areas (payment-related)

| Source | Test file | What is verified |
|--------|-----------|------------------|
| `backend/utils/paymentEnv.js` | `paymentEnv.test.js` | Frontend base URL, success URL, public API base URL (env + request fallback) |
| `backend/utils/payment.js` (`isMockPayment`) | `payment.isMock.test.js` | Mock vs real gateway based on `NODE_ENV` and `USE_REAL_PAYMENT` |
| `initiateAppointmentPayment` in `appointment.controller.js` | `appointment.payment.test.js` | 404, 403, invalid status, already paid, successful checkout (mocked gateway) |
| `frontend/src/utils/paymentFlow.js` | `paymentFlow.test.js` | Flutterwave redirect URL shapes; `followPaymentResponse` |
| `PayForAppointment.jsx` | `PayForAppointment.test.jsx` | Loading, errors, non-pending status, pay success navigation, API error toast |

Coverage targets **critical paths** for the payment/booking feature, not necessarily every line of large controllers.
