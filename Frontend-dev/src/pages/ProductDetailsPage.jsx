// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate, useOutletContext, Link } from "react-router-dom";
// import { Container, Row, Col, Image, Spinner, Alert, Breadcrumb, Card, Button, Badge, Modal, Form } from "react-bootstrap";
// import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaCheck } from "react-icons/fa";
// import axios from "axios";
// import CartService from "../services/cartService";
// import { getCategoryById } from "../services/categoryService";
// import { getProductsByCategory } from "../services/productService";
// import UserService from "../services/userService";
// import { addToWishlist, getWishlistByUser, removeProductFromWishlist } from "../services/wishlistService";
// import ReviewService from "../services/reviewService";

// const API_URL = import.meta.env.VITE_API_URL;

// const ProductDetails = () => {
//   const { productId } = useParams();
//   const navigate = useNavigate();
//   const { setCartCount } = useOutletContext();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [quantity, setQuantity] = useState(0);
//   const [reviews, setReviews] = useState([]);
//   const [recommendations, setRecommendations] = useState([]);
//   const [loadingRecs, setLoadingRecs] = useState(false);
//   const [loadingReviews, setLoadingReviews] = useState(false);
//   const [category, setCategory] = useState(null);
//   const [wishlistItems, setWishlistItems] = useState([]);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");
//   const [activeImage, setActiveImage] = useState(0);
//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [newReview, setNewReview] = useState({
//     rating: 0,
//     comment: "",
//     hoverRating: 0
//   });
//   const [submittingReview, setSubmittingReview] = useState(false);

//   const isLoggedIn = () => !!sessionStorage.getItem("jwtToken");

//   const showToastMessage = (message) => {
//     setToastMessage(message);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 2000);
//   };

//   const isInWishlist = () => {
//     return wishlistItems.some(item => item.productId === product?.id);
//   };

//   const fetchProduct = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await axios.get(`${API_URL}/products/${productId}`);
//       // Only proceed if product is active
//       if (response.data.status !== "Active") {
//         setError("This product is no longer available");
//         setProduct(null);
//         return;
//       }
//       setProduct(response.data);
//     } catch (err) {
//       setError("Failed to fetch product details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCartData = async () => {
//     const user = JSON.parse(sessionStorage.getItem("user"));
//     const guestSessionId = sessionStorage.getItem("guestSessionId");

//     try {
//       let cart = [];
//       if (user) {
//         cart = await CartService.getCartByUserId(user.id);
//       } else if (guestSessionId) {
//         cart = await CartService.getGuestCart(guestSessionId);
//       }
      
//       const cartItem = cart.find((item) => item.productId === productId);
//       setQuantity(cartItem ? cartItem.productQuantity : 0);

//       if (setCartCount) {
//         const totalQuantity = cart.reduce(
//           (acc, item) => acc + (item.productQuantity || 0),
//           0
//         );
//         setCartCount(totalQuantity);
//       }
//     } catch (error) {
//       console.error("Failed to fetch cart data", error);
//     }
//   };

//   const fetchWishlist = async () => {
//     if (isLoggedIn()) {
//       try {
//         const user = JSON.parse(sessionStorage.getItem("user"));
//         const wishlist = await getWishlistByUser(user.id);
//         setWishlistItems(wishlist);
//       } catch (error) {
//         console.error("Error fetching wishlist:", error);
//       }
//     }
//   };

//   const fetchReviews = async () => {
//     setLoadingReviews(true);
//     try {
//       const reviewsResponse = await ReviewService.getReviewsByProductId(productId);
//       const usersResponse = await UserService.getAllUsers();
      
//       const processedReviews = reviewsResponse.map(review => {
//         const user = usersResponse.data?.data?.find(u => u.id === review.userId);
//         return {
//           ...review,
//           reviewerName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
//           comment: review.review || 'No comment provided',
//           rating: review.star
//         };
//       });
      
//       setReviews(processedReviews);
//     } catch (err) {
//       console.error("Failed to fetch reviews", err);
//     } finally {
//       setLoadingReviews(false);
//     }
//   };

//   const fetchRecommendations = async () => {
//     setLoadingRecs(true);
//     try {
//       if (product?.categoryId) {
//         const products = await getProductsByCategory(product.categoryId);
//         // Filter out inactive products and current product
//         const filtered = products
//           .filter((p) => p.id !== productId && p.status === "Active")
//           .slice(0, 4);
//         setRecommendations(filtered);
//       }
//     } catch (err) {
//       console.error("Failed to fetch recommendations", err);
//     } finally {
//       setLoadingRecs(false);
//     }
//   };

//   const fetchCategory = async () => {
//     if (product?.category?.id) {
//       try {
//         const categoryData = await getCategoryById(product.category.id);
//         setCategory(categoryData);
//       } catch (err) {
//         console.error("Failed to fetch category", err);
//       }
//     }
//   };

//   // Handlers
//   const handleAddToCart = async () => {
//     if (!product) return;

//     if (product.quantity <= 0) {
//       showToastMessage("This product is currently out of stock");
//       return;
//     }

//     const user = JSON.parse(sessionStorage.getItem("user"));
//     const guestSessionId = sessionStorage.getItem("guestSessionId");

//     try {
//       const cartDTO = {
//         productId: product.id,
//         productQuantity: 1
//       };

//       if (user) {
//         cartDTO.userId = user.id;
//         await CartService.addToCart(cartDTO);
//       } else {
//         if (!guestSessionId) {
//           const newSessionId = await CartService.createNewSession();
//           sessionStorage.setItem("guestSessionId", newSessionId);
//         }
//         await CartService.addToCart(cartDTO, guestSessionId);
//       }

//       await fetchCartData();
//       showToastMessage("Added to cart successfully!");
//     } catch (err) {
//       console.error("Add to cart error:", err);
//       showToastMessage(err.response?.data?.message || "Failed to add to cart");
//     }
//   };

//   const handleQuantityChange = async (change) => {
//     const user = JSON.parse(sessionStorage.getItem("user"));
//     const guestSessionId = sessionStorage.getItem("guestSessionId");

//     try {
//       let cart = [];
//       if (user) {
//         cart = await CartService.getCartByUserId(user.id);
//       } else if (guestSessionId) {
//         cart = await CartService.getGuestCart(guestSessionId);
//       }
      
//       const cartItem = cart.find((item) => item.productId === productId);
//       if (!cartItem) return;

//       const newQuantity = (cartItem.productQuantity || 1) + change;

//       if (newQuantity < 1) {
//         if (user) {
//           await CartService.removeFromCart(cartItem.id);
//         } else {
//           await CartService.removeFromCart(cartItem.id, guestSessionId);
//         }
//       } else {
//         if (user) {
//           await CartService.updateCartItem(cartItem.id, newQuantity);
//         } else {
//           await CartService.updateCartItem(cartItem.id, newQuantity, guestSessionId);
//         }
//       }

//       await fetchCartData();
//     } catch (err) {
//       console.error("Update cart error:", err);
//       showToastMessage("Failed to update quantity");
//     }
//   };

//   const handleRemoveFromCart = async () => {
//     const user = JSON.parse(sessionStorage.getItem("user"));
//     const guestSessionId = sessionStorage.getItem("guestSessionId");

//     try {
//       let cart = [];
//       if (user) {
//         cart = await CartService.getCartByUserId(user.id);
//       } else {
//         cart = await CartService.getGuestCart(guestSessionId);
//       }
      
//       const cartItem = cart.find((item) => item.productId === productId);
//       if (!cartItem) return;

//       if (user) {
//         await CartService.removeFromCart(cartItem.id);
//       } else {
//         await CartService.removeFromCart(cartItem.id, guestSessionId);
//       }

//       await fetchCartData();
//       showToastMessage("Removed from cart");
//     } catch (err) {
//       console.error("Remove from cart error:", err);
//       showToastMessage("Failed to remove item");
//     }
//   };

//   const handleWishlistClick = async () => {
//     if (!isLoggedIn()) {
//       showToastMessage("Please login to manage your wishlist");
//       navigate("/signin");
//       return;
//     }

//     const user = JSON.parse(sessionStorage.getItem("user"));
//     const currentlyInWishlist = isInWishlist();

//     try {
//       if (currentlyInWishlist) {
//         await removeProductFromWishlist(user.id, product.id);
//         setWishlistItems(prev => 
//           prev.filter(item => item.productId !== product.id)
//         );
//         showToastMessage("Removed from wishlist");
//       } else {
//         const wishlistRequestDTO = {
//           userId: user.id,
//           productId: product.id
//         };
//         const addedItem = await addToWishlist(wishlistRequestDTO);
//         setWishlistItems(prev => [...prev, addedItem]);
//         showToastMessage("Added to wishlist");
//       }
//     } catch (error) {
//       console.error("Wishlist error:", error);
//       showToastMessage(error.response?.data?.message || "Wishlist update failed");
//     }
//   };

//   const renderRatingStars = (rating, interactive = false, size = 16) => {
//     const stars = [];
//     const currentRating = interactive ? newReview.hoverRating || newReview.rating : rating;
    
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <span
//           key={i}
//           style={{ cursor: interactive ? 'pointer' : 'default', fontSize: `${size}px` }}
//           onMouseEnter={() => interactive && setNewReview(prev => ({ ...prev, hoverRating: i }))}
//           onMouseLeave={() => interactive && setNewReview(prev => ({ ...prev, hoverRating: 0 }))}
//           onClick={() => interactive && setNewReview(prev => ({ ...prev, rating: i }))}
//         >
//           {i <= currentRating ? (
//             <FaStar className="text-warning" />
//           ) : (
//             <FaRegStar className="text-secondary" />
//           )}
//         </span>
//       );
//     }
    
//     return <div className="d-flex">{stars}</div>;
//   };

//   const handleReviewSubmit = async () => {
//     if (!newReview.rating) {
//       setError("Please select a rating");
//       return;
//     }

//     if (!isLoggedIn()) {
//       navigate("/signin");
//       return;
//     }

//     setSubmittingReview(true);
//     setError("");

//     try {
//       const user = JSON.parse(sessionStorage.getItem("user"));
//       const reviewDTO = {
//         productId: productId,
//         userId: user.id,
//         star: newReview.rating,
//         review: newReview.comment || null
//       };

//       await ReviewService.addReview(reviewDTO);
      
//       await fetchReviews();
      
//       setNewReview({
//         rating: 0,
//         comment: "",
//         hoverRating: 0
//       });
      
//       setShowReviewModal(false);
//       showToastMessage("Thank you for your review!");
//     } catch (err) {
//       console.error("Review submission error:", err);
//       setError(err.response?.data?.message || "Failed to submit review");
//     } finally {
//       setSubmittingReview(false);
//     }
//   };

//   // Effects
//   useEffect(() => {
//     if (!sessionStorage.getItem("jwtToken") && !sessionStorage.getItem("guestSessionId")) {
//       CartService.createNewSession().then((newSessionId) => {
//         sessionStorage.setItem("guestSessionId", newSessionId);
//       });
//     }
//   }, []);

//   useEffect(() => {
//     fetchProduct();
//     fetchCartData();
//     fetchWishlist();
//   }, [productId]);

//   useEffect(() => {
//     if (product) {
//       fetchReviews();
//       fetchRecommendations();
//       fetchCategory();
//     }
//   }, [product]);

//   if (loading) {
//     return (
//       <div className="text-center py-5">
//         <Spinner animation="border" variant="success" />
//         <p className="mt-2">Loading product details...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="py-5">
//         <Alert variant="danger" className="text-center">
//           {error}
//           <div className="mt-3">
//             <Button variant="outline-primary" onClick={() => navigate("/")}>
//               Back to Home
//             </Button>
//           </div>
//         </Alert>
//       </Container>
//     );
//   }

//   if (!product) {
//     return (
//       <Container className="py-5">
//         <Alert variant="warning" className="text-center">
//           Product not found or no longer available.
//           <div className="mt-3">
//             <Button variant="outline-primary" onClick={() => navigate("/")}>
//               Back to Home
//             </Button>
//           </div>
//         </Alert>
//       </Container>
//     );
//   }

//   const isOutOfStock = product.quantity <= 0;

//   return (
//     <Container fluid className="px-0 px-md-3 mt-2" style={{ maxWidth: '1400px' }}>
//       {/* Toast Notification */}
//       {showToast && (
//         <>
//           <div 
//             style={{
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: 'rgba(0,0,0,0.2)',
//               backdropFilter: 'blur(2px)',
//               zIndex: 9998,
//               transition: 'opacity 0.3s ease'
//             }}
//           />
//           <div 
//             style={{
//               position: 'fixed',
//               top: '20px',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               zIndex: 9999,
//               display: 'flex',
//               alignItems: 'center',
//               gap: '10px',
//               padding: '12px 20px',
//               borderRadius: '8px',
//               border: '1px solid #28a745',
//               color: '#28a745',
//               backgroundColor: 'rgba(255, 255, 255, 0.9)',
//               boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//               animation: 'fadeIn 0.3s ease'
//             }}
//           >
//             <FaCheck style={{ fontSize: '1.2rem' }} />
//             <span style={{ fontWeight: '500' }}>{toastMessage}</span>
//           </div>
//         </>
//       )}

//       {/* Breadcrumbs */}
//       <div className="px-3 px-md-0">
//         <Breadcrumb className="mb-3">
//           <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
//             Home
//           </Breadcrumb.Item>
//           {product?.category && (
//             <Breadcrumb.Item 
//               linkAs={Link} 
//               linkProps={{ to: `/category/${product.category.id}` }}
//             >
//               {category ? category.mainCategory : product.category.name}
//             </Breadcrumb.Item>
//           )}
//           <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
//         </Breadcrumb>
//       </div>

//       <Row className="gx-3 mx-0">
//         {/* Product Images */}
//         <Col xs={12} lg={6} xl={5} className="px-0 px-md-3">
//           <Card className="border-0 shadow-sm mb-3 mb-lg-0">
//             <Card.Body className="p-2 p-md-3">
//               <div 
//                 className="text-center mb-3 position-relative" 
//                 style={{ 
//                   height: '350px', 
//                   display: 'flex', 
//                   alignItems: 'center', 
//                   justifyContent: 'center',
//                   backgroundColor: '#f8f9fa',
//                   borderRadius: '8px'
//                 }}
//               >
//                 {isOutOfStock && (
//                   <div className="out-of-stock-badge">
//                     Out of Stock
//                   </div>
//                 )}
//                 <Image
//                   src={product.imageUrls?.[activeImage]}
//                   fluid
//                   style={{
//                     maxHeight: '100%',
//                     maxWidth: '100%',
//                     objectFit: 'contain',
//                     mixBlendMode: 'multiply',
//                     opacity: isOutOfStock ? 0.7 : 1
//                   }}
//                 />
//               </div>
//               <div className="d-flex flex-wrap gap-2 justify-content-center">
//                 {product.imageUrls?.map((img, i) => (
//                   <div 
//                     key={i} 
//                     className={`thumbnail-container ${i === activeImage ? 'active' : ''}`}
//                     onClick={() => setActiveImage(i)}
//                     style={{
//                       width: '70px',
//                       height: '70px',
//                       cursor: 'pointer',
//                       border: i === activeImage ? '2px solid #28a745' : '1px solid #ddd',
//                       borderRadius: '4px',
//                       padding: '2px',
//                       backgroundColor: '#f8f9fa',
//                       opacity: isOutOfStock ? 0.7 : 1
//                     }}
//                   >
//                     <Image 
//                       src={img} 
//                       fluid 
//                       style={{
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'contain',
//                         mixBlendMode: 'multiply'
//                       }}
//                     />
//                   </div>
//                 ))}
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>

//         {/* Product Details */}
//         <Col lg={6} xl={4} className="px-0 px-md-3">
//           <Card className="border-0 shadow-sm h-100">
//             <Card.Body className="p-3 p-md-4">
//               <div className="d-flex justify-content-between align-items-start mb-3">
//                 <div>
//                   <h2 className="mb-2" style={{ fontWeight: '600', fontSize: '1.75rem' }}>{product.name}</h2>
//                   <p className="mb-2" style={{ fontWeight: '200', fontSize: '1rem' }}>Quantity: {product.quantityType}</p>
//                   {product.category && (
//                     <Badge bg="light" text="dark" className="mb-2">
//                       {category ? category.mainCategory : product.category.name}
//                     </Badge>
//                   )}
//                 </div>
//                 <Button
//                   variant="link"
//                   className="p-0"
//                   onClick={handleWishlistClick}
//                   title={isInWishlist() ? "Remove from wishlist" : "Add to wishlist"}
//                   style={{ fontSize: '1.5rem' }}
//                 >
//                   {isInWishlist() ? (
//                     <FaHeart className="text-danger" />
//                   ) : (
//                     <FaRegHeart className="text-secondary" />
//                   )}
//                 </Button>
//               </div>

//               <div className="mb-4">
//                 <div className="d-flex align-items-center mb-2">
//                   <div className="me-2" style={{ fontSize: '1.2rem' }}>
//                     {renderRatingStars(product.averageRating || 0)}
//                   </div>
//                   <span className="text-muted">
//                     ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
//                   </span>
//                 </div>
                
//                 <div className="d-flex align-items-center mb-3">
//                   <h3 className="text-success mb-0 me-2" style={{ fontSize: '1.75rem' }}>${product.price.toFixed(2)}</h3>
//                   {product.originalPrice && product.originalPrice > product.price && (
//                     <small className="text-muted text-decoration-line-through">
//                       ${product.originalPrice.toFixed(2)}
//                     </small>
//                   )}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <h5 className="mb-2" style={{ fontWeight: '600' }}>Description</h5>
//                 <p className="text-muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{product.description}</p>
//               </div>

//               {/* Add to Cart Section */}
//               <div className="border-top pt-3">
//                 <div className="d-flex align-items-center justify-content-center">
//                   <div style={{ maxWidth: '180px', width: "100%" }}>
//                     {quantity > 0 ? (
//                       <div className="d-flex align-items-center justify-content-between">
//                         <Button 
//                           variant="outline-secondary" 
//                           size="sm"
//                           onClick={() => handleQuantityChange(-1)}
//                           disabled={quantity <= 1}
//                         >
//                           -
//                         </Button>
//                         <span className="mx-2">{quantity}</span>
//                         <Button 
//                           variant="outline-secondary" 
//                           size="sm"
//                           onClick={() => handleQuantityChange(1)}
//                           disabled={isOutOfStock}
//                         >
//                           +
//                         </Button>
//                         <Button 
//                           variant="link" 
//                           size="sm" 
//                           className="text-danger ms-2"
//                           onClick={handleRemoveFromCart}
//                         >
//                           Remove
//                         </Button>
//                       </div>
//                     ) : (
//                       <Button 
//                         variant="success" 
//                         className="w-100"
//                         onClick={handleAddToCart}
//                         disabled={isOutOfStock}
//                       >
//                         {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>

//         {/* Recommendations Sidebar */}
//         <Col xl={3} className="d-none d-xl-block ps-3">
//           <div className="sticky-top" style={{ top: '20px' }}>
//             <Card className="border-0 shadow-sm">
//               <Card.Body>
//                 <h5 className="mb-3">Recommended For You</h5>
//                 {loadingRecs ? (
//                   <div className="text-center py-3">
//                     <Spinner animation="border" variant="secondary" size="sm" />
//                   </div>
//                 ) : recommendations.length === 0 ? (
//                   <p className="text-muted small">No recommendations available.</p>
//                 ) : (
//                   <div className="d-flex flex-column gap-3">
//                     {recommendations.map((rec) => (
//                       <div 
//                         key={rec.id}
//                         className="d-flex align-items-center gap-2 p-2 hover-bg"
//                         style={{ cursor: 'pointer', borderRadius: '6px' }}
//                         onClick={() => navigate(`/product/${rec.id}`)}
//                       >
//                         <div style={{ 
//                           width: '70px', 
//                           height: '70px', 
//                           backgroundColor: '#f8f9fa',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           borderRadius: '4px'
//                         }}>
//                           <Image
//                             src={rec.imageUrls?.[0] || "/placeholder-product.jpg"}
//                             alt={rec.name}
//                             style={{
//                               maxHeight: '100%',
//                               maxWidth: '100%',
//                               objectFit: 'contain',
//                               mixBlendMode: 'multiply'
//                             }}
//                           />
//                         </div>
//                         <div className="flex-grow-1">
//                           <h6 
//                             className="mb-0" 
//                             style={{
//                               fontSize: '0.9rem',
//                               whiteSpace: 'nowrap',
//                               overflow: 'hidden',
//                               textOverflow: 'ellipsis'
//                             }}
//                           >
//                             {rec.name}
//                           </h6>
//                           <div className="text-success fw-bold">
//                             ${rec.price.toFixed(2)}
//                           </div>
//                           {rec.quantity <= 0 && (
//                             <small className="text-danger">Out of Stock</small>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </Card.Body>
//             </Card>
//           </div>
//         </Col>
//       </Row>

//       {/* Reviews Section */}
//       <section className="mt-4 px-0 px-md-3">
//         <Card className="border-0 shadow-sm">
//           <Card.Body className="p-3 p-md-4">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <h3 className="mb-0">Customer Reviews</h3>
//               <Button 
//                 variant="outline-primary" 
//                 size="sm"
//                 onClick={() => {
//                   if (!isLoggedIn()) {
//                     showToastMessage("Please login to write a review");
//                     navigate("/signin");
//                     return;
//                   }
//                   setShowReviewModal(true);
//                 }}
//               >
//                 Write a Review
//               </Button>
//             </div>
            
//             {loadingReviews ? (
//               <div className="text-center py-3">
//                 <Spinner animation="border" variant="secondary" />
//                 <p className="mt-2">Loading reviews...</p>
//               </div>
//             ) : reviews.length === 0 ? (
//               <div className="text-center py-4">
//                 <p className="text-muted mb-3">No reviews yet. Be the first to review this product!</p>
//                 <Button 
//                   variant="primary" 
//                   onClick={() => {
//                     if (!isLoggedIn()) {
//                       showToastMessage("Please login to write a review");
//                       navigate("/signin");
//                       return;
//                     }
//                     setShowReviewModal(true);
//                   }}
//                 >
//                   Write the First Review
//                 </Button>
//               </div>
//             ) : (
//               <div className="review-list">
//                 {reviews.map((review) => (
//                   <div key={review.id} className="mb-3 pb-3 border-bottom">
//                     <div className="d-flex justify-content-between mb-2">
//                       <h5 className="mb-0" style={{ fontSize: '1rem' }}>
//                         {review.reviewerName}
//                       </h5>
//                       {/* <small className="text-muted">
//                         {new Date(review.createdAt).toLocaleDateString()}
//                       </small> */}
//                     </div>
//                     <div className="mb-2">
//                       {renderRatingStars(review.rating)}
//                     </div>
//                     <p className="mb-0" style={{ lineHeight: '1.6' }}>
//                       {review.comment}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </Card.Body>
//         </Card>
//       </section>

//       {/* Recommendations Section - Mobile */}
//       <section className="mt-4 px-0 px-md-3 d-xl-none">
//         <h3 className="mb-3">You May Also Like</h3>
//         {loadingRecs ? (
//           <div className="text-center py-3">
//             <Spinner animation="border" variant="secondary" />
//           </div>
//         ) : recommendations.length === 0 ? (
//           <p className="text-muted">No recommendations available.</p>
//         ) : (
//           <Row xs={2} sm={3} md={4} className="g-2">
//             {recommendations.map((rec) => (
//               <Col key={rec.id}>
//                 <Card 
//                   className="h-100 border-0 shadow-sm"
//                   onClick={() => navigate(`/product/${rec.id}`)}
//                   style={{ cursor: 'pointer' }}
//                 >
//                   <div style={{ 
//                     height: '140px', 
//                     padding: '10px', 
//                     display: 'flex', 
//                     alignItems: 'center', 
//                     justifyContent: 'center',
//                     backgroundColor: '#f8f9fa'
//                   }}>
//                     <Card.Img
//                       variant="top"
//                       src={rec.imageUrls?.[0] || "/placeholder-product.jpg"}
//                       alt={rec.name}
//                       style={{ 
//                         maxHeight: '100%', 
//                         maxWidth: '100%',
//                         objectFit: 'contain',
//                         mixBlendMode: 'multiply'
//                       }}
//                     />
//                   </div>
//                   <Card.Body className="d-flex flex-column p-2">
//                     <Card.Title 
//                       className="mb-1" 
//                       style={{ 
//                         fontSize: '0.9rem',
//                         whiteSpace: 'nowrap',
//                         overflow: 'hidden',
//                         textOverflow: 'ellipsis'
//                       }}
//                     >
//                       {rec.name}
//                     </Card.Title>
//                     <div className="mt-auto">
//                       <Card.Text className="text-success fw-bold mb-1">
//                         ${rec.price.toFixed(2)}
//                       </Card.Text>
//                       {rec.quantity <= 0 && (
//                         <small className="text-danger">Out of Stock</small>
//                       )}
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             ))}
//           </Row>
//         )}
//       </section>

//       {/* Review Submission Modal */}
//       <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Write a Review</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-4">
//               <Form.Label>Your Rating</Form.Label>
//               <div className="mb-2">
//                 {renderRatingStars(0, true, 24)}
//                 <span className="ms-2 text-muted">
//                   {newReview.rating > 0 ? `${newReview.rating} star${newReview.rating > 1 ? 's' : ''}` : 'Not rated'}
//                 </span>
//               </div>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Your Review</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 value={newReview.comment}
//                 onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
//                 placeholder="Share your thoughts about this product..."
//               />
//             </Form.Group>

//             {error && <Alert variant="danger">{error}</Alert>}
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
//             Cancel
//           </Button>
//           <Button 
//             variant="primary" 
//             onClick={handleReviewSubmit}
//             disabled={submittingReview || !newReview.rating}
//           >
//             {submittingReview ? (
//               <>
//                 <Spinner as="span" animation="border" size="sm" className="me-2" />
//                 Submitting...
//               </>
//             ) : 'Submit Review'}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default ProductDetails; 

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext, Link } from "react-router-dom";
import { Container, Row, Col, Image, Spinner, Alert, Breadcrumb, Card, Button, Badge, Modal, Form } from "react-bootstrap";
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaCheck } from "react-icons/fa";
import axios from "axios";
import CartService from "../services/cartService";
import { getCategoryById } from "../services/categoryService";
import { getProductsByCategory } from "../services/productService";
import UserService from "../services/userService";
import { addToWishlist, getWishlistByUser, removeProductFromWishlist } from "../services/wishlistService";
import ReviewService from "../services/reviewService";

const API_URL = import.meta.env.VITE_API_URL;

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { setCartCount } = useOutletContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [category, setCategory] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    hoverRating: 0
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isLoggedIn = () => !!sessionStorage.getItem("jwtToken");

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const isInWishlist = () => {
    return wishlistItems.some(item => item.productId === product?.id);
  };

  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`);
      // Only proceed if product is active
      if (response.data.status !== "Active") {
        setError("This product is no longer available");
        setProduct(null);
        return;
      }
      setProduct(response.data);
    } catch (err) {
      setError("Failed to fetch product details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCartData = async () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const guestSessionId = sessionStorage.getItem("guestSessionId");

    try {
      let cart = [];
      if (user) {
        cart = await CartService.getCartByUserId(user.id);
      } else if (guestSessionId) {
        cart = await CartService.getGuestCart(guestSessionId);
      }
      
      const cartItem = cart.find((item) => item.productId === productId);
      setQuantity(cartItem ? cartItem.productQuantity : 0);

      if (setCartCount) {
        const totalQuantity = cart.reduce(
          (acc, item) => acc + (item.productQuantity || 0),
          0
        );
        setCartCount(totalQuantity);
      }
    } catch (error) {
      console.error("Failed to fetch cart data", error);
    }
  };

  const fetchWishlist = async () => {
    if (isLoggedIn()) {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const wishlist = await getWishlistByUser(user.id);
        setWishlistItems(wishlist);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const reviewsResponse = await ReviewService.getReviewsByProductId(productId);
      const usersResponse = await UserService.getAllUsers();
      
      const processedReviews = reviewsResponse.map(review => {
        const user = usersResponse.data?.data?.find(u => u.id === review.userId);
        return {
          ...review,
          reviewerName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
          comment: review.review || 'No comment provided',
          rating: review.star
        };
      });
      
      setReviews(processedReviews);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      if (product?.categoryId) {
        const products = await getProductsByCategory(product.categoryId);
        // Filter out inactive products and current product
        const filtered = products
          .filter((p) => p.id !== productId && p.status === "Active")
          .slice(0, 4);
        setRecommendations(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const fetchCategory = async () => {
    if (product?.category?.id) {
      try {
        const categoryData = await getCategoryById(product.category.id);
        setCategory(categoryData);
      } catch (err) {
        console.error("Failed to fetch category", err);
      }
    }
  };

  // Handlers
  const handleAddToCart = async () => {
    if (!product) return;

    if (product.quantity <= 0) {
      showToastMessage("This product is currently out of stock");
      return;
    }

    const user = JSON.parse(sessionStorage.getItem("user"));
    const guestSessionId = sessionStorage.getItem("guestSessionId");

    try {
      const cartDTO = {
        productId: product.id,
        productQuantity: 1
      };

      if (user) {
        cartDTO.userId = user.id;
        await CartService.addToCart(cartDTO);
      } else {
        if (!guestSessionId) {
          const newSessionId = await CartService.createNewSession();
          sessionStorage.setItem("guestSessionId", newSessionId);
        }
        await CartService.addToCart(cartDTO, guestSessionId);
      }

      await fetchCartData();
      showToastMessage("Added to cart successfully!");
    } catch (err) {
      console.error("Add to cart error:", err);
      showToastMessage(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleQuantityChange = async (change) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const guestSessionId = sessionStorage.getItem("guestSessionId");

    try {
      let cart = [];
      if (user) {
        cart = await CartService.getCartByUserId(user.id);
      } else if (guestSessionId) {
        cart = await CartService.getGuestCart(guestSessionId);
      }
      
      const cartItem = cart.find((item) => item.productId === productId);
      if (!cartItem) return;

      const newQuantity = (cartItem.productQuantity || 1) + change;

      if (newQuantity < 1) {
        if (user) {
          await CartService.removeFromCart(cartItem.id);
        } else {
          await CartService.removeFromCart(cartItem.id, guestSessionId);
        }
      } else {
        if (user) {
          await CartService.updateCartItem(cartItem.id, newQuantity);
        } else {
          await CartService.updateCartItem(cartItem.id, newQuantity, guestSessionId);
        }
      }

      await fetchCartData();
    } catch (err) {
      console.error("Update cart error:", err);
      showToastMessage("Failed to update quantity");
    }
  };

  const handleRemoveFromCart = async () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const guestSessionId = sessionStorage.getItem("guestSessionId");

    try {
      let cart = [];
      if (user) {
        cart = await CartService.getCartByUserId(user.id);
      } else {
        cart = await CartService.getGuestCart(guestSessionId);
      }
      
      const cartItem = cart.find((item) => item.productId === productId);
      if (!cartItem) return;

      if (user) {
        await CartService.removeFromCart(cartItem.id);
      } else {
        await CartService.removeFromCart(cartItem.id, guestSessionId);
      }

      await fetchCartData();
      showToastMessage("Removed from cart");
    } catch (err) {
      console.error("Remove from cart error:", err);
      showToastMessage("Failed to remove item");
    }
  };

  const handleWishlistClick = async () => {
    if (!isLoggedIn()) {
      showToastMessage("Please login to manage your wishlist");
      navigate("/signin");
      return;
    }

    const user = JSON.parse(sessionStorage.getItem("user"));
    const currentlyInWishlist = isInWishlist();

    try {
      if (currentlyInWishlist) {
        await removeProductFromWishlist(user.id, product.id);
        setWishlistItems(prev => 
          prev.filter(item => item.productId !== product.id)
        );
        showToastMessage("Removed from wishlist");
      } else {
        const wishlistRequestDTO = {
          userId: user.id,
          productId: product.id
        };
        const addedItem = await addToWishlist(wishlistRequestDTO);
        setWishlistItems(prev => [...prev, addedItem]);
        showToastMessage("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      showToastMessage(error.response?.data?.message || "Wishlist update failed");
    }
  };

  const renderRatingStars = (rating, interactive = false, size = 16) => {
    const stars = [];
    const currentRating = interactive ? newReview.hoverRating || newReview.rating : rating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{ cursor: interactive ? 'pointer' : 'default', fontSize: `${size}px` }}
          onMouseEnter={() => interactive && setNewReview(prev => ({ ...prev, hoverRating: i }))}
          onMouseLeave={() => interactive && setNewReview(prev => ({ ...prev, hoverRating: 0 }))}
          onClick={() => interactive && setNewReview(prev => ({ ...prev, rating: i }))}
        >
          {i <= currentRating ? (
            <FaStar className="text-warning" />
          ) : (
            <FaRegStar className="text-secondary" />
          )}
        </span>
      );
    }
    
    return <div className="d-flex">{stars}</div>;
  };

  const handleReviewSubmit = async () => {
    if (!newReview.rating) {
      setError("Please select a rating");
      return;
    }

    if (!isLoggedIn()) {
      navigate("/signin");
      return;
    }

    setSubmittingReview(true);
    setError("");

    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const reviewDTO = {
        productId: productId,
        userId: user.id,
        star: newReview.rating,
        review: newReview.comment || null
      };

      await ReviewService.addReview(reviewDTO);
      
      await fetchReviews();
      
      setNewReview({
        rating: 0,
        comment: "",
        hoverRating: 0
      });
      
      setShowReviewModal(false);
      showToastMessage("Thank you for your review!");
    } catch (err) {
      console.error("Review submission error:", err);
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Effects
  useEffect(() => {
    if (!sessionStorage.getItem("jwtToken") && !sessionStorage.getItem("guestSessionId")) {
      CartService.createNewSession().then((newSessionId) => {
        sessionStorage.setItem("guestSessionId", newSessionId);
      });
    }
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchCartData();
    fetchWishlist();
  }, [productId]);

  useEffect(() => {
    if (product) {
      fetchReviews();
      fetchRecommendations();
      fetchCategory();
    }
  }, [product]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          {error}
          <div className="mt-3">
            <Button variant="outline-primary" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          Product not found or no longer available.
          <div className="mt-3">
            <Button variant="outline-primary" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const isOutOfStock = product.quantity <= 0;

  return (
    <Container fluid className="px-0 px-md-3 mt-2" style={{ maxWidth: '1400px' }}>
      {/* Toast Notification */}
      {showToast && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(2px)',
              zIndex: 9998,
              transition: 'opacity 0.3s ease'
            }}
          />
          <div 
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #28a745',
              color: '#28a745',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <FaCheck style={{ fontSize: '1.2rem' }} />
            <span style={{ fontWeight: '500' }}>{toastMessage}</span>
          </div>
        </>
      )}

      {/* Breadcrumbs */}
      <div className="px-3 px-md-0">
        <Breadcrumb className="mb-3">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Home
          </Breadcrumb.Item>
          {product?.category && (
            <Breadcrumb.Item 
              linkAs={Link} 
              linkProps={{ to: `/category/${product.category.id}` }}
            >
              {category ? category.mainCategory : product.category.name}
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Row className="gx-3 mx-0">
        {/* Product Images - Updated Section */}
        <Col xs={12} lg={6} xl={5} className="px-0 px-md-3">
          <Card className="border-0 shadow-sm mb-3 mb-lg-0">
            <Card.Body className="p-2 p-md-3">
              <div 
                className="text-center mb-3 position-relative" 
                style={{ 
                  height: '400px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '10px',
                  overflow: 'hidden'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {isOutOfStock && (
                  <div className="out-of-stock-badge">
                    Out of Stock
                  </div>
                )}
                <Image
                  src={product.imageUrls?.[activeImage]}
                  fluid
                  style={{
                    height: '90%',
                    width: '90%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    mixBlendMode: 'multiply',
                    opacity: isOutOfStock ? 0.7 : 1,
                    transition: 'transform 0.3s ease',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
              </div>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {product.imageUrls?.map((img, i) => (
                  <div 
                    key={i} 
                    className={`thumbnail-container ${i === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: '80px',
                      height: '80px',
                      cursor: 'pointer',
                      border: i === activeImage ? '1px solid #28a745' : '1px solid #eee',
                      borderRadius: '4px',
                      padding: '1px',
                      backgroundColor: '#f8f9fa',
                      opacity: isOutOfStock ? 0.7 : 1
                    }}
                  >
                    <Image 
                      src={img} 
                      fluid 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        mixBlendMode: 'multiply',
                        padding: '5px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Product Details */}
        <Col lg={6} xl={4} className="px-0 px-md-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="mb-2" style={{ fontWeight: '600', fontSize: '1.75rem' }}>{product.name}</h2>
                  <p className="mb-2" style={{ fontWeight: '200', fontSize: '1rem' }}>Quantity: {product.quantityType}</p>
                  {product.category && (
                    <Badge bg="light" text="dark" className="mb-2">
                      {category ? category.mainCategory : product.category.name}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="link"
                  className="p-0"
                  onClick={handleWishlistClick}
                  title={isInWishlist() ? "Remove from wishlist" : "Add to wishlist"}
                  style={{ fontSize: '1.5rem' }}
                >
                  {isInWishlist() ? (
                    <FaHeart className="text-danger" />
                  ) : (
                    <FaRegHeart className="text-secondary" />
                  )}
                </Button>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <div className="me-2" style={{ fontSize: '1.2rem' }}>
                    {renderRatingStars(product.averageRating || 0)}
                  </div>
                  <span className="text-muted">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <h3 className="text-success mb-0 me-2" style={{ fontSize: '1.75rem' }}>${product.price.toFixed(2)}</h3>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <small className="text-muted text-decoration-line-through">
                      ${product.originalPrice.toFixed(2)}
                    </small>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h5 className="mb-2" style={{ fontWeight: '600' }}>Description</h5>
                <p className="text-muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{product.description}</p>
              </div>

              {/* Add to Cart Section */}
              <div className="border-top pt-3">
                <div className="d-flex align-items-center justify-content-center">
                  <div style={{ maxWidth: '180px', width: "100%" }}>
                    {quantity > 0 ? (
                      <div className="d-flex align-items-center justify-content-between">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="mx-2">{quantity}</span>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleQuantityChange(1)}
                          disabled={isOutOfStock}
                        >
                          +
                        </Button>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-danger ms-2"
                          onClick={handleRemoveFromCart}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="success" 
                        className="w-100"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recommendations Sidebar */}
        <Col xl={3} className="d-none d-xl-block ps-3">
          <div className="sticky-top" style={{ top: '20px' }}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Recommended For You</h5>
                {loadingRecs ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" variant="secondary" size="sm" />
                  </div>
                ) : recommendations.length === 0 ? (
                  <p className="text-muted small">No recommendations available.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {recommendations.map((rec) => (
                      <div 
                        key={rec.id}
                        className="d-flex align-items-center gap-2 p-2 hover-bg"
                        style={{ cursor: 'pointer', borderRadius: '6px' }}
                        onClick={() => navigate(`/product/${rec.id}`)}
                      >
                        <div style={{ 
                          width: '80px', 
                          height: '80px', 
                          backgroundColor: '#f8f9fa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          padding: '5px'
                        }}>
                          <Image
                            src={rec.imageUrls?.[0] || "/placeholder-product.jpg"}
                            alt={rec.name}
                            style={{
                              height: '100%',
                              width: '100%',
                              objectFit: 'contain',
                              mixBlendMode: 'multiply'
                            }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <h6 
                            className="mb-0" 
                            style={{
                              fontSize: '0.9rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {rec.name}
                          </h6>
                          <div className="text-success fw-bold">
                            ${rec.price.toFixed(2)}
                          </div>
                          {rec.quantity <= 0 && (
                            <small className="text-danger">Out of Stock</small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Reviews Section */}
      <section className="mt-4 px-0 px-md-3">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Customer Reviews</h3>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => {
                  if (!isLoggedIn()) {
                    showToastMessage("Please login to write a review");
                    navigate("/signin");
                    return;
                  }
                  setShowReviewModal(true);
                }}
              >
                Write a Review
              </Button>
            </div>
            
            {loadingReviews ? (
              <div className="text-center py-3">
                <Spinner animation="border" variant="secondary" />
                <p className="mt-2">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted mb-3">No reviews yet. Be the first to review this product!</p>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    if (!isLoggedIn()) {
                      showToastMessage("Please login to write a review");
                      navigate("/signin");
                      return;
                    }
                    setShowReviewModal(true);
                  }}
                >
                  Write the First Review
                </Button>
              </div>
            ) : (
              <div className="review-list">
                {reviews.map((review) => (
                  <div key={review.id} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between mb-2">
                      <h5 className="mb-0" style={{ fontSize: '1rem' }}>
                        {review.reviewerName}
                      </h5>
                      {/* <small className="text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </small> */}
                    </div>
                    <div className="mb-2">
                      {renderRatingStars(review.rating)}
                    </div>
                    <p className="mb-0" style={{ lineHeight: '1.6' }}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </section>

      {/* Mobile Recommendations - Updated Images */}
      <section className="mt-4 px-0 px-md-3 d-xl-none">
        <h3 className="mb-3">You May Also Like</h3>
        {loadingRecs ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-muted">No recommendations available.</p>
        ) : (
          <Row xs={2} sm={3} md={4} className="g-2">
            {recommendations.map((rec) => (
              <Col key={rec.id}>
                <Card 
                  className="h-100 border-0 shadow-sm"
                  onClick={() => navigate(`/product/${rec.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ 
                    height: '160px', // Increased height
                    padding: '15px', // Increased padding
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <Card.Img
                      variant="top"
                      src={rec.imageUrls?.[0] || "/placeholder-product.jpg"}
                      alt={rec.name}
                      style={{ 
                        height: '100%', 
                        width: '100%',
                        objectFit: 'contain',
                        mixBlendMode: 'multiply'
                      }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column p-2">
                    <Card.Title 
                      className="mb-1" 
                      style={{ 
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {rec.name}
                    </Card.Title>
                    <div className="mt-auto">
                      <Card.Text className="text-success fw-bold mb-1">
                        ${rec.price.toFixed(2)}
                      </Card.Text>
                      {rec.quantity <= 0 && (
                        <small className="text-danger">Out of Stock</small>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </section>
      
      {/* Review Submission Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label>Your Rating</Form.Label>
              <div className="mb-2">
                {renderRatingStars(0, true, 24)}
                <span className="ms-2 text-muted">
                  {newReview.rating > 0 ? `${newReview.rating} star${newReview.rating > 1 ? 's' : ''}` : 'Not rated'}
                </span>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Your Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about this product..."
              />
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleReviewSubmit}
            disabled={submittingReview || !newReview.rating}
          >
            {submittingReview ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : 'Submit Review'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductDetails;