import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaWheelchair, FaChevronLeft, FaShoppingCart, FaClipboardCheck } from "react-icons/fa";

const CATEGORY_OPTIONS = [
  "All",
  "Mobility",
  "Orthotics",
  "Prosthetics",
  "Daily Living Aids",
];

const DEVICE_ITEMS = [
  {
    id: "walker-basic",
    name: "Foldable Walker",
    category: "Mobility",
    price: "$65",
    image: "/img/foldable_wallker.png",
    description:
      "Lightweight foldable walker with height adjustment for stable daily movement.",
    indications:
      "Suitable for users with balance limitations and post-surgery gait support needs.",
    assessmentRequired: false,
  },
  {
    id: "knee-brace-pro",
    name: "Knee Support Brace",
    category: "Orthotics",
    price: "$42",
    image: "/img/knee_support_brace.png",
    description:
      "Adjustable knee brace that improves alignment and reduces pain during walking.",
    indications:
      "Recommended for mild-to-moderate knee instability after clinical review.",
    assessmentRequired: true,
  },
  {
    id: "prosthetic-leg-bk",
    name: "Below-Knee Prosthesis",
    category: "Prosthetics",
    price: "$480",
    image: "/img/below_knee.png",
    description:
      "Functional lower-limb prosthetic setup focused on comfort and daily mobility.",
    indications:
      "For transtibial amputees, requires fitting assessment and follow-up sessions.",
    assessmentRequired: true,
  },
  {
    id: "bath-chair-safe",
    name: "Bath Safety Chair",
    category: "Daily Living Aids",
    price: "$35",
    image: "/img/bath_safety_chair.png",
    description:
      "Anti-slip bath chair with back support for safer bathroom use and transfers.",
    indications:
      "Useful for elderly patients and anyone with reduced lower-limb strength.",
    assessmentRequired: false,
  },
];

const AssistiveDevice = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [assessmentRequests, setAssessmentRequests] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [scheduleInfo, setScheduleInfo] = useState({
    date: "",
    window: "Morning",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const amount = Number(item.price.replace("$", "")) || 0;
      return sum + amount * item.quantity;
    }, 0);
  }, [cartItems]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const filteredDevices = useMemo(() => {
    if (selectedCategory === "All") return DEVICE_ITEMS;
    return DEVICE_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const selectedDevice = DEVICE_ITEMS.find((item) => item.id === selectedDeviceId);

  const onUploadPrescription = (event, deviceId) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setPrescriptions((prev) => ({ ...prev, [deviceId]: file.name }));
    setMessage(`Prescription uploaded for ${DEVICE_ITEMS.find((d) => d.id === deviceId)?.name}.`);
  };

  const handleAddToCart = (device) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === device.id);
      if (existing) {
        return prev.map((item) =>
          item.id === device.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...device, quantity: 1 }];
    });
    setMessage(`${device.name} added to cart.`);
  };

  const handleRequestAssessment = (device) => {
    if (assessmentRequests.some((item) => item.id === device.id)) {
      setMessage(`Assessment already requested for ${device.name}.`);
      return;
    }
    setAssessmentRequests((prev) => [...prev, device]);
    setMessage(`Assessment requested for ${device.name}.`);
  };

  const submitSchedule = (event) => {
    event.preventDefault();
    if (!scheduleInfo.date) {
      setMessage("Please choose a delivery/fitting date.");
      return;
    }
    setMessage(
      `Delivery/fitting preference saved (${scheduleInfo.date}, ${scheduleInfo.window}).`
    );
  };

  const backToList = () => {
    setSelectedDeviceId(null);
    setMessage("");
  };

  const updateCartQuantity = (deviceId, nextQuantity) => {
    if (nextQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== deviceId));
      setMessage("Item removed from cart.");
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => (item.id === deviceId ? { ...item, quantity: nextQuantity } : item))
    );
  };

  const removeFromCart = (deviceId) => {
    const target = cartItems.find((item) => item.id === deviceId);
    setCartItems((prev) => prev.filter((item) => item.id !== deviceId));
    if (target) setMessage(`${target.name} removed from cart.`);
  };

  const handleSimulatedPayment = async () => {
    if (cartItems.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }
    setProcessingPayment(true);
    setMessage("");

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const mockOrderId = `MOCK-${Date.now()}`;
    setPaymentResult({
      orderId: mockOrderId,
      total: cartTotal.toFixed(2),
      itemsCount: cartItemCount,
      status: "paid_mock",
    });
    setCartItems([]);
    setProcessingPayment(false);
    setShowPaymentConfirm(false);
    setMessage("Payment Successful (Simulation). No real transaction was processed.");
  };

  if (selectedDevice) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto py-8 px-4"
      >
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <button
            type="button"
            onClick={backToList}
            className="inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 mb-4"
          >
            <FaChevronLeft />
            Back to Devices
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src={selectedDevice.image}
              alt={selectedDevice.name}
              className="w-full h-64 object-cover rounded-lg border border-gray-200"
            />

            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedDevice.name}</h1>
              <div className="flex items-center gap-3 text-sm mb-4">
                <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                  {selectedDevice.category}
                </span>
                <span className="font-semibold text-amber-700">{selectedDevice.price}</span>
              </div>

              <h3 className="font-semibold text-gray-800 mb-1">Description</h3>
              <p className="text-sm text-gray-700 mb-3">{selectedDevice.description}</p>

              <h3 className="font-semibold text-gray-800 mb-1">Indications</h3>
              <p className="text-sm text-gray-700 mb-3">{selectedDevice.indications}</p>

              <h3 className="font-semibold text-gray-800 mb-1">Assessment Required</h3>
              <p className="text-sm text-gray-700 mb-4">
                {selectedDevice.assessmentRequired ? "Yes" : "No"}
              </p>

              <div className="mb-4">
                <label
                  htmlFor={`prescription-${selectedDevice.id}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Upload Prescription (if required)
                </label>
                <input
                  id={`prescription-${selectedDevice.id}`}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => onUploadPrescription(event, selectedDevice.id)}
                  className="block w-full text-sm text-gray-700"
                />
                {prescriptions[selectedDevice.id] && (
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded: {prescriptions[selectedDevice.id]}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(selectedDevice)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                >
                  <FaShoppingCart />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestAssessment(selectedDevice)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900"
                >
                  <FaClipboardCheck />
                  Request Assessment
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Delivery / Fitting Scheduling
            </h2>
            <form onSubmit={submitSchedule} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="date"
                value={scheduleInfo.date}
                onChange={(event) =>
                  setScheduleInfo((prev) => ({ ...prev, date: event.target.value }))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={scheduleInfo.window}
                onChange={(event) =>
                  setScheduleInfo((prev) => ({ ...prev, window: event.target.value }))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
              >
                Save Schedule
              </button>
              <textarea
                value={scheduleInfo.notes}
                onChange={(event) =>
                  setScheduleInfo((prev) => ({ ...prev, notes: event.target.value }))
                }
                className="md:col-span-3 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows="3"
                placeholder="Notes for delivery/fitting team..."
              />
            </form>
          </div>

          {message && <p className="text-sm font-medium text-amber-700 mt-4">{message}</p>}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-8 px-4"
    >
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
          <FaWheelchair className="text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Assistive Devices</h1>
        <p className="text-gray-600 mb-5">
          Browse categories, view device details, add to cart or request assessment.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORY_OPTIONS.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategory === category
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => (
            <button
              key={device.id}
              type="button"
              onClick={() => setSelectedDeviceId(device.id)}
              className="text-left rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
            >
              <img
                src={device.image}
                alt={device.name}
                className="w-full h-36 object-cover rounded-md mb-3"
              />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {device.category}
                </span>
                <span className="text-sm font-semibold text-amber-700">{device.price}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{device.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{device.description}</p>
            </button>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <p className="text-sm text-gray-600">No devices found for this category.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Cart ({cartItemCount})</h3>
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-600">No items in cart yet.</p>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-md p-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDeviceId(item.id)}
                      className="text-sm font-medium text-amber-700 hover:text-amber-800"
                    >
                      {item.name}
                    </button>
                    <p className="text-xs text-gray-500">{item.price} each</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-md border border-gray-300">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-sm font-semibold text-gray-800 mt-2">
                  Total: ${cartTotal.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPaymentConfirm(true)}
                  className="mt-3 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                >
                  Proceed to Payment (Simulated)
                </button>
              </>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              Assessment Requests ({assessmentRequests.length})
            </h3>
            {assessmentRequests.length === 0 ? (
              <p className="text-sm text-gray-600">No requests yet.</p>
            ) : (
              assessmentRequests.map((item) => (
                <p key={item.id} className="text-sm text-gray-700">
                  {item.name}
                </p>
              ))
            )}
          </div>
        </div>

        {message && <p className="text-sm font-medium text-amber-700 mt-4">{message}</p>}

        {paymentResult && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="font-semibold text-emerald-800 mb-1">Simulated Payment Receipt</h3>
            <p className="text-sm text-emerald-900">Order ID: {paymentResult.orderId}</p>
            <p className="text-sm text-emerald-900">Items: {paymentResult.itemsCount}</p>
            <p className="text-sm text-emerald-900">Amount: ${paymentResult.total}</p>
            <p className="text-sm text-emerald-900">Status: {paymentResult.status}</p>
          </div>
        )}

        {showPaymentConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Confirm Payment</h3>
              <p className="text-sm text-gray-700 mb-2">Items: {cartItemCount}</p>
              <p className="text-sm text-gray-700 mb-4">Total: ${cartTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mb-4">
                This is a simulation only. No real payment API is called.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentConfirm(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  disabled={processingPayment}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSimulatedPayment}
                  className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                  disabled={processingPayment}
                >
                  {processingPayment ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            to="/patient/"
            className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default AssistiveDevice;
