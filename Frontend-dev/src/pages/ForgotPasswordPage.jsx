import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";
import LoginPageLogo from "../assets/LoginPageLogo.png";
import HomePage from "./HomePage";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Image,
  InputGroup,
} from "react-bootstrap";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      const response = await userService.requestPasswordChange(email);
      if (response.data && (response.data.status || response.data.success)) {
        setSuccessMessage("OTP sent to your email!");
        setOtpSent(true);
      } else {
        setError(response.data?.message || "Failed to send OTP");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await userService.changePasswordWithOtp({
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      
      if (response.data && response.data.success) {
        setSuccessMessage("Password changed successfully! Redirecting to login...");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        setError(response.data?.message || "Password change failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred during password change");
      console.error("Password change error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* HomePage as background */}
      <HomePage />
      {/* Overlay for blur/dim effect */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
        style={{ zIndex: 1050 }}
      >
        <Container
          fluid
          className="bg-white rounded-5 shadow-lg overflow-hidden"
          style={{ width: "100%", maxWidth: "500px", padding: "0" }}
        >
          <Row className="g-0">
            <Col
              xs={12}
              className="d-flex flex-column justify-content-center px-4 py-4 position-relative"
              style={{ minHeight: "500px" }}
            >
              {/* Cross icon at top right */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 2,
                  cursor: "pointer",
                  color: "#888",
                  fontSize: "1.5rem",
                }}
                onClick={() => navigate("/")}
                aria-label="Close"
              >
                <FaTimes />
              </div>

              <div className="d-flex justify-content-center mb-3">
                <Image
                  src={LoginPageLogo}
                  alt="Logo"
                  className="img-fluid"
                  style={{ maxWidth: "100px" }}
                />
              </div>

              <h2 className="fw-bold text-dark mb-3 fs-4 text-center">
                Reset Password
              </h2>

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

              <Form onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
                <Row className="mb-3">
                  <Col xs={12} sm={otpSent ? 6 : 12} className="mb-2 mb-sm-0">
                    <Form.Group controlId="email">
                      <Form.Label className="fw-medium mb-1 fs-6">
                        Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={otpSent}
                      />
                    </Form.Group>
                  </Col>
                  {otpSent && (
                    <Col xs={12} sm={6}>
                      <Form.Group controlId="otp">
                        <Form.Label className="fw-medium mb-1 fs-6">
                          OTP
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter OTP"
                          required
                          maxLength={6}
                        />
                      </Form.Group>
                    </Col>
                  )}
                </Row>

                {otpSent && (
                  <Row className="mb-3">
                    <Col xs={12} sm={6} className="mb-2 mb-sm-0">
                      <Form.Group controlId="newPassword">
                        <Form.Label className="fw-medium mb-1 fs-6">
                          New Password
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            required
                          />
                          <InputGroup.Text
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group controlId="confirmPassword">
                        <Form.Label className="fw-medium mb-1 fs-6">
                          Confirm Password
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                          />
                          <InputGroup.Text
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="w-100 py-2 fw-medium mb-2"
                  style={{ fontSize: "1rem" }}
                >
                  {isLoading
                    ? otpSent
                      ? "Updating..."
                      : "Sending..."
                    : otpSent
                    ? "Update Password"
                    : "Send Verification Code"}
                </Button>

                {otpSent && (
                  <p className="text-center text-secondary mt-2 fs-6">
                    Didn't receive a code?{" "}
                    <span
                      role="button"
                      className="text-primary fw-medium"
                      onClick={() => {
                        clearMessages();
                        setOtp("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setOtpSent(false);
                      }}
                    >
                      Resend Code
                    </span>
                  </p>
                )}
              </Form>

              <p className="text-center mt-3 text-secondary fs-6">
                Remember your password?{" "}
                <span
                  role="button"
                  className="text-primary fw-medium"
                  onClick={() => navigate("/signin")}
                >
                  Sign in
                </span>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;