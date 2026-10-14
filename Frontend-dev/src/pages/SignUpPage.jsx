import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaInfoCircle, FaCheck, FaTimes } from "react-icons/fa";
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Modal, 
  Card, 
  Image, 
  Alert,
  ListGroup,
  CloseButton
} from "react-bootstrap";
import userService from "../services/userService"; 
import LoginPageLogo from "../assets/LoginPageLogo.png";
import HomePage from "./HomePage";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email entry, 2: OTP verification, 3: Account creation
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Password requirements
  const passwordRequirements = [
    { id: 1, text: "At least 8 characters", validator: (pwd) => pwd.length >= 8 },
    { id: 2, text: "At least one uppercase letter", validator: (pwd) => /[A-Z]/.test(pwd) },
    { id: 3, text: "At least one lowercase letter", validator: (pwd) => /[a-z]/.test(pwd) },
    { id: 4, text: "At least one number", validator: (pwd) => /[0-9]/.test(pwd) },
    { id: 5, text: "At least one special character", validator: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendOtp = async () => {
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setEmailError("");
    setLoading(true);
    setApiError("");
    
    try {
      // Check if email already exists
      // const emailCheck = await userService.getUserByEmail(email);
      // if (emailCheck.data) {
      //   setEmailError("Email already registered. Please sign in instead.");
      //   return;
      // }

      // Call backend API to send OTP
      const response = await userService.sendOtp(email);
      
      if (response.data) {
        setOtpSent(true);
        setCountdown(60); 
        setStep(2); 
      } else {
        setApiError("Failed to send OTP");
      }
    } catch (error) {
      setApiError(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setApiError("");
    
    try {
      const response = await userService.sendOtp(email);
      
      if (response.data) {
        setCountdown(60); 
      } else {
        setApiError("Failed to resend OTP");
      }
    } catch (error) {
      setApiError(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError("OTP is required");
      return;
    }
    
    setLoading(true);
    setOtpError("");
    setApiError("");
    
    try {
      const response = await userService.validateOtp({ email, otp });
      
      if (response.data) {
        setStep(3); 
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountCreation = async (e) => {
    e.preventDefault();
    
    
    if (userData.password !== userData.confirmPassword) {
      setApiError("Passwords don't match");
      return;
    }
    
    // Validate password requirements
    const passwordValid = passwordRequirements.every(req => req.validator(userData.password));
    if (!passwordValid) {
      setApiError("Password doesn't meet requirements");
      return;
    }
    
    setLoading(true);
    setApiError("");
    
    try {
      const registrationData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email,
        mobileNumber: userData.mobileNumber,
        password: userData.password,
        role: "USER"
      };

      const response = await userService.registerUser(registrationData);
      
      if (response.data) {
        navigate("/signin"); 
      } else {
        setApiError("Registration failed");
      }
    } catch (error) {
      setApiError(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <>
      <HomePage />
      
      <Modal show={true} centered backdrop="static" size="lg" className="signup-modal">
        <Modal.Body className="p-0">
          <Card className="border-0">
            <Row className="g-0">
              
              {step !== 3 && (
                <Col md={6} className="d-none d-md-flex bg-warning align-items-center justify-content-center p-4">
                  <Image 
                    src={LoginPageLogo} 
                    alt="Signup visual" 
                    fluid 
                    className="img-fluid"
                    style={{ maxHeight: "300px" }}
                  />
                </Col>
              )}
              
              
              <Col md={step === 3 ? 12 : 6} className="p-3 p-sm-4 p-lg-5">
                <CloseButton 
                  onClick={() => navigate("/")} 
                  className="position-absolute end-0 top-0 m-3"
                />
                
                {step === 3 && (
                  <div className="text-center mb-4">
                    <Image 
                      src={LoginPageLogo} 
                      alt="Logo" 
                      style={{ height: "80px" }} 
                      className="mb-3"
                    />
                  </div>
                )}
                
                <Card.Title as="h2" className="text-center mb-3 fs-3 fs-md-4">
                  {step === 1 ? "Create your account" : 
                   step === 2 ? "Verify your email" : 
                   "Complete your profile"}
                </Card.Title>
                
                {apiError && (
                  <Alert variant="danger" className="text-center py-2">
                    {apiError}
                  </Alert>
                )}
                
                {step === 1 && (
                  <>
                    <p className="text-muted text-center mb-4">
                      We'll send you a verification code
                    </p>
                    
                    <Form.Group controlId="email" className="mb-3">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        isInvalid={!!emailError}
                        className="py-2"
                      />
                      <Form.Control.Feedback type="invalid">
                        {emailError}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Button
                      variant="success"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-100 py-2 fw-medium"
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : null}
                      Send Verification Code
                    </Button>
                    
                    <p className="text-center text-muted mt-3 small">
                      Already have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0 align-baseline text-decoration-none" 
                        onClick={() => navigate("/signin")}
                      >
                        Sign in
                      </Button>
                    </p>
                  </>
                )}
                
                {step === 2 && (
                  <>
                    <p className="text-muted text-center mb-4">
                      We've sent a 6-digit code to {email}
                    </p>
                    
                    <Form.Group controlId="otp" className="mb-3">
                      <Form.Label>Verification code</Form.Label>
                      <Form.Control
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        isInvalid={!!otpError}
                        className="py-2"
                      />
                      <Form.Control.Feedback type="invalid">
                        {otpError}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Button
                      variant="success"
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="w-100 py-2 fw-medium mb-3"
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : null}
                      Verify Code
                    </Button>
                    
                    <div className="text-center text-muted small">
                      {countdown > 0 ? (
                        <span>Resend code in {countdown} seconds</span>
                      ) : (
                        <Button
                          variant="link"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="p-0 text-decoration-none"
                        >
                          Resend code
                        </Button>
                      )}
                    </div>
                  </>
                )}
                
                {step === 3 && (
                  <Form onSubmit={handleAccountCreation}>
                    <Row className="mb-3">
                      <Col xs={12} sm={6} className="mb-3 mb-sm-0">
                        <Form.Group controlId="firstName">
                          <Form.Label>First name</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={userData.firstName}
                            onChange={handleInputChange}
                            required
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Form.Group controlId="lastName">
                          <Form.Label>Last name</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleInputChange}
                            required
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group controlId="mobileNumber" className="mb-3">
                      <Form.Label>Mobile number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="mobileNumber"
                        value={userData.mobileNumber}
                        onChange={handleInputChange}
                        required
                        className="py-2"
                      />
                    </Form.Group>
                    
                    <Form.Group controlId="emailDisplay" className="mb-3">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        readOnly
                        className="py-2 bg-light"
                      />
                    </Form.Group>
                    
                    <Form.Group controlId="password" className="mb-3">
                      <Form.Label>
                        Password
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 ms-2 align-top"
                          onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                        >
                          <FaInfoCircle />
                        </Button>
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={userData.password}
                          onChange={handleInputChange}
                          required
                          className="py-2 pe-5"
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y p-1 me-2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                      
                      {showPasswordRequirements && (
                        <Card className="mt-2">
                          <Card.Body className="p-2 small">
                            <Card.Text className="fw-medium mb-1">Password must contain:</Card.Text>
                            <ListGroup variant="flush">
                              {passwordRequirements.map(req => (
                                <ListGroup.Item key={req.id} className="px-0 py-1 border-0">
                                  <span className="d-flex align-items-center">
                                    {req.validator(userData.password) ? (
                                      <FaCheck className="text-success me-2" />
                                    ) : (
                                      <FaTimes className="text-danger me-2" />
                                    )}
                                    {req.text}
                                  </span>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      )}
                    </Form.Group>
                    
                    <Form.Group controlId="confirmPassword" className="mb-4">
                      <Form.Label>Confirm password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={userData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="py-2 pe-5"
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y p-1 me-2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                    </Form.Group>
                    
                    <Button
                      type="submit"
                      variant="success"
                      disabled={loading}
                      className="w-100 py-2 fw-medium"
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : null}
                      Create Account
                    </Button>
                  </Form>
                )}
              </Col>
            </Row>
          </Card>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SignUpPage;