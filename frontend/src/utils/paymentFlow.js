/**
 * Flutterwave may return redirect URL at meta.authorization.redirect
 * or nested under data (provider response shape).
 */
export function getPaymentRedirectUrl(paymentResponse) {
  if (!paymentResponse) return null;
  return (
    paymentResponse.meta?.authorization?.redirect ||
    paymentResponse.data?.meta?.authorization?.redirect ||
    null
  );
}

export function followPaymentResponse(
  paymentResponse,
  navigate,
  successPath = "/patient/payment-success-page"
) {
  const url = getPaymentRedirectUrl(paymentResponse);
  if (url) {
    window.location.href = url;
    return true;
  }
  if (navigate) {
    navigate(successPath);
  }
  return false;
}
