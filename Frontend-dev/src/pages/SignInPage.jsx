import React, { useState, useEffect } from "react";
import LoginPageLogo from "../assets/LoginPageLogo.png";
import { useLocation, useNavigate } from "react-router-dom";
import userService from "../services/userService";
import HomePage from "./HomePage";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Image,
  CloseButton,
  InputGroup,
  FormCheck,
} from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem("rememberedCredentials");
    if (savedCredentials) {
      const { email, password } = JSON.parse(savedCredentials);
      setEmail(email);
      setPassword(password);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Save credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem(
        "rememberedCredentials",
        JSON.stringify({ email, password })
      );
    } else {
      localStorage.removeItem("rememberedCredentials");
    }

    try {
      const credentials = { emailId: email, password };
      const response = await userService.login(credentials);
      const { status, message, jwtToken, user, deliveryPerson } = response.data;

      if (status && jwtToken && (user || deliveryPerson)) {
        sessionStorage.setItem("jwtToken", jwtToken);

        if (user) {
          const role = user.role?.toLowerCase();
          sessionStorage.setItem("userRole", role);
          sessionStorage.setItem("user", JSON.stringify(user));

          if (role === "admin") {
            navigate("/admin/dashboard");
          } else if (location.state?.from === "/cart") {
            navigate("/cart", { replace: true });
          } else if (role === "buyer") {
            navigate("/");
          } else {
            setError("Unknown user role. Cannot proceed.");
          }
        } else if (deliveryPerson) {
          sessionStorage.setItem("userRole", "delivery_person");
          sessionStorage.setItem("user", JSON.stringify(deliveryPerson));
          navigate("/delivery/dashboard");
        }
      } else {
        setError(message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error(
        "Login request error:",
        error.response?.data || error.message
      );
      setError("Invalid login credentials.");
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <HomePage />
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
        style={{ zIndex: 1050 }}
      >
        <Container
          fluid
          className="bg-white rounded-5 shadow-lg overflow-hidden"
          style={{ width: "100%", maxWidth: "1000px", padding: "0" }}
        >
          <Row className="g-0 flex-column flex-md-row">
            <Col
              md={6}
              className="d-none d-md-flex"
              style={{
                backgroundColor: "#FFBA12",
                minHeight: "500px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={LoginPageLogo}
                alt="Login Visual"
                className="img-fluid"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Col>

            <Col
              xs={12}
              md={6}
              className="d-flex flex-column justify-content-center px-4 py-4 position-relative"
              style={{ minHeight: "500px" }}
            >
              <div
                className="position-absolute top-0 end-0 p-3"
                style={{ zIndex: 1 }}
              >
                <CloseButton
                  className="m-2"
                  onClick={() => navigate("/")}
                  aria-label="Close"
                />
              </div>

              <div className="d-md-none d-flex justify-content-center mb-3">
                <Image
                  src={LoginPageLogo}
                  alt="Login Visual"
                  className="img-fluid"
                  style={{ maxWidth: "150px" }}
                />
              </div>

              <h2 className="text-center fw-bold text-dark mb-1 fs-4">
                Welcome back
              </h2>
              <p className="text-center text-secondary mb-3 fs-6">
                We're so excited to see you again!
              </p>

              {successMessage && (
                <Alert variant="success" className="text-center py-2 mb-3">
                  {successMessage}
                </Alert>
              )}
              {error && (
                <Alert variant="danger" className="text-center py-2 mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleLogin}>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label className="fw-medium mb-1 fs-6">
                    Email or Phone number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email or phone"
                    required
                    className="py-2 px-3"
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-3">
                  <Form.Label className="fw-medium mb-1 fs-6">
                    Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="py-2 px-3"
                    />
                    <InputGroup.Text
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <FormCheck
                    type="checkbox"
                    id="rememberMe"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="fs-6"
                  />
                  <div
                    className="text-primary fs-6"
                    role="button"
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot your password?
                  </div>
                </div>

                <Button
                  variant="success"
                  type="submit"
                  className="w-100 py-2 fw-medium mb-2"
                  style={{ fontSize: "1rem" }}
                >
                  Log in
                </Button>
              </Form>

              <p className="text-center mt-3 text-secondary fs-6">
                Don't have an account?{" "}
                <span
                  role="button"
                  className="text-primary fw-medium"
                  onClick={() => navigate("/signup")}
                >
                  Sign up
                </span>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default SignInPage;
