import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createOrder,
  createOrderWithSavedAddress,
} from "../services/orderService";
import { getPaymentDetails, verifyPayment } from "../services/paymentService";
import { addAddress, getUserAddresses } from "../services/addressService";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Alert,
  Card,
  ListGroup,
  Modal,
} from "react-bootstrap";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [form, setForm] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);

  const user = JSON.parse(sessionStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchSavedAddresses();
    } else {
      console.warn("No user ID found in session");
    }
  }, [userId]);

  useEffect(() => {
    if (!showAddressModal) {
      fetchSavedAddresses();
    }
  }, [showAddressModal]);

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await getUserAddresses(userId);
      const addresses = response.data || response;

      if (Array.isArray(addresses)) {
        setSavedAddresses(addresses);

        const defaultAddress = addresses.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      } else {
        console.warn("Unexpected addresses format:", addresses);
        setSavedAddresses([]);
      }
    } catch (err) {
      setError("Failed to load saved addresses. Please try again.");
      setSavedAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const detectLocation = async () => {
    setLoadingLocation(true);
    setError(null);

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      // Get current position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      setLocationPermission("granted");

      // Reverse geocode to get address details
      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location details");
      }

      const data = await response.json();

      const address = data.address;

      if (!address) {
        throw new Error("Could not determine address from location");
      }

      // Extract address components based on the actual response structure
      const city =
        address.suburb || address.neighbourhood || address.county || "";
      const state = address.state || "";
      const postalCode = address.postcode || "";
      const country = address.country || "";

      // Construct street address from available components
      // const streetParts = [
      //   address.neighbourhood,
      //   address.suburb,
      //   address.county
      // ].filter(Boolean);

      // const street = streetParts.join(", ") || "Detected location";

      // Update form with detected location
      setForm({
        street: "",
        city: city,
        state: state,
        postalCode: postalCode,
        country: country,
        isDefault: false,
      });

      setShowAddressForm(true);
    } catch (err) {
      setError(
        err.message ||
          "Failed to detect your location. Please enter your address manually."
      );
      setShowAddressForm(true);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSaveNewAddress = async () => {
    try {
      if (!userId) {
        setError("User not found. Please sign in again.");
        navigate("/signin");
        return;
      }

      if (!form.street) {
        setError("Please enter your street address");
        return;
      }

      const addressData = {
        street: form.street,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        isDefault: form.isDefault,
      };

      await addAddress(userId, addressData, "", form.isDefault);

      // Reset form
      setForm({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        isDefault: false,
      });

      setShowAddressForm(false);
      setShowAddressModal(false);

      // Refresh addresses
      await fetchSavedAddresses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address.");
      console.error("Error saving address:", err);
    }
  };

  const handleCheckoutWithSelectedAddress = async (addressIdParam) => {
    const addressId = addressIdParam || selectedAddressId;
    if (!addressId) {
      setError("Please select an address or add a new one");
      return;
    }

    setLoading(true);
    try {
      const res = await createOrderWithSavedAddress(userId, addressId);
      const order = res.data;
      const orderId = order.id;
      const amount = order.totalAmount;

      if (!orderId) throw new Error("Order ID is missing");

      sessionStorage.setItem("orderId", orderId);
      const { data: payDetails } = await getPaymentDetails(orderId);
      const razorpayOrderId = payDetails.order_id;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load Razorpay SDK");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "Groceryol App",
        description: `Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const verificationResponse = await verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            console.log("Verification response:", verificationResponse.data);

            if (verificationResponse.data.status === "success") {
              try {
                // Determine user type
                const isLoggedIn = !!sessionStorage.getItem("jwtToken");
                const sessionId = sessionStorage.getItem("guestSessionId");

                if (isLoggedIn) {
                  const user = JSON.parse(sessionStorage.getItem("user"));
                  await CartService.clearUserCart(user.id);
                } else if (sessionId) {
                  await CartService.clearGuestCart(sessionId);
                }

                // Update UI and storage
                if (setCartCount) setCartCount(0);
                localStorage.removeItem("cartItems");
                sessionStorage.removeItem("cartItems");

                navigate(`/order-confirmation/${orderId}`);
              } catch (cartError) {
                navigate(`/order-confirmation/${orderId}`);
              }
            } else {
              setError(
                verificationResponse.data.message ||
                  "Payment verification failed"
              );
            }
          } catch (verErr) {
            setError(
              verErr.response?.data?.message || "Payment verification failed"
            );
          }
        },
        method: {
          netbanking: true,
          upi: true,
          wallet: true,
          card: true,
        },
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email || "",
          contact: user?.mobileNumber || "",
        },
        theme: { color: "#22c55e" },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to initiate payment.");
      setLoading(false);
    }
  };

  return (
    <Container className="mt-2 pt-2 mb-4">
      <h2 className="mb-4">Checkout</h2>
      {!userId && (
        <Alert variant="warning">
          Please sign in to view your saved addresses
        </Alert>
      )}

      <Card className="p-4">
        {loadingAddresses ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p>Loading your saved addresses...</p>
          </div>
        ) : savedAddresses.length > 0 ? (
          <>
            <h5 className="mb-3">Select Delivery Address</h5>
            <ListGroup className="mb-4">
              {savedAddresses.map((address) => (
                <ListGroup.Item key={address.id} className="position-relative">
                  <Form.Check
                    type="radio"
                    id={`address-${address.id}`}
                    name="addressSelection"
                    label={
                      <div className="address-display">
                        <div className="fw-bold">
                          {address.address?.street || "No street"}
                        </div>
                        <div>
                          {address.address?.city || "No city"},
                          {address.address?.state || "No state"} -
                          {address.address?.postalCode || "No postal code"}
                        </div>
                        <div>{address.address?.country || "No country"}</div>
                        {address.isDefault && (
                          <span className="badge bg-primary mt-1">Default</span>
                        )}
                      </div>
                    }
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="mb-2"
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="d-flex justify-content-between mb-4">
              <Button
                variant="outline-primary"
                onClick={() => setShowAddressModal(true)}
              >
                Add New Address
              </Button>
              <Button
                variant="success"
                onClick={() => handleCheckoutWithSelectedAddress()}
                disabled={loading || !selectedAddressId}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <p>No saved addresses found.</p>
              <Button
                variant="primary"
                onClick={() => setShowAddressModal(true)}
                className="mb-4"
              >
                Add Your First Address
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Add New Address Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!showAddressForm && (
            <div className="text-center py-4">
              <Button
                variant="primary"
                onClick={detectLocation}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Detecting your location...
                  </>
                ) : (
                  "Auto-Detect My Location"
                )}
              </Button>
              <p className="mt-3">OR</p>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setShowAddressForm(true);
                  setForm({
                    street: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    country: "",
                    isDefault: false,
                  });
                }}
              >
                Enter Address Manually
              </Button>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {showAddressForm && (
            <Form>
              <Form.Group controlId="modalStreet" className="mb-3">
                <Form.Label>Street Address</Form.Label>
                <Form.Control
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleInputChange}
                  placeholder="Enter your street address (house number, building, street)"
                  disabled={loading}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="modalCity">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                      disabled={loading}
                      placeholder="City"
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group controlId="modalState">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleInputChange}
                      disabled={loading}
                      placeholder="State"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="modalPostalCode">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleInputChange}
                      disabled={loading}
                      placeholder="Postal code"
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group controlId="modalCountry">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleInputChange}
                      disabled={loading}
                      placeholder="Country"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="modalIsDefault" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Set as default address"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                  disabled={loading}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddressModal(false)}
          >
            Cancel
          </Button>
          {showAddressForm && (
            <Button
              variant="primary"
              onClick={handleSaveNewAddress}
              disabled={loading || !form.street}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CheckoutPage;
