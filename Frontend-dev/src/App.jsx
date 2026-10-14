import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./pages/Layout";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import AdminDashboard from "./pages/AdminDashboard";
import CategoriesList from "./components/AdminFolder/CategoriesList";
import ProductListPage from "./components/AdminFolder/ProductListPage";
import Orders from "./components/AdminFolder/Orders";
import UserListPage from "./components/AdminFolder/UserListPage";
import DeliveryPersonList from "./components/AdminFolder/DeliveryPersonList";
import CustomerDashboard from "./pages/CustomerDashboard";
import ViewAllPage from "./pages/ViewAllPage";
import ProductDetails from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmationPage";
import MyOrders from "./components/CustomerFolder/MyOrders";
import 'bootstrap/dist/css/bootstrap.min.css';
import SearchResultsPage from "./pages/SearchResultsPage";
import DeliveryPersonDashboard from "./pages/DeliveryPersonDashboard";
import DeliveryMainPage from "./components/DeliveryMainPage";
import AvailableOrdersPage from "./components/AvailableOrdersPage";
import Wishlist from "./components/CustomerFolder/Wishlist";
import MyAddresses from "./components/CustomerFolder/MyAddresses";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminMainPage from "./components/AdminFolder/AdminMainPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/view-all" element={<ViewAllPage />} />
          <Route path="/category/:categoryId" element={<ViewAllPage />}/>
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/search" element={<SearchResultsPage />} />
        </Route>
          <Route path="/admin/dashboard" element={<AdminDashboard />}>
          <Route index element={<AdminMainPage />} />
          <Route path="categories" element={<CategoriesList />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<UserListPage />} />
          <Route path="deliveryPersons" element={<DeliveryPersonList />} />
        </Route>

        <Route path="/customer/dashboard" element={<CustomerDashboard />}>
          <Route index element={<div className="text-center py-5"><h4>Select an option from the dashboard</h4></div>} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="addresses" element={<MyAddresses />} />
          {/* <Route path="settings" element={<CustomerSettings />} />
          <Route path="help" element={<HelpCenter />} /> */}
        </Route>


        <Route path="/delivery/dashboard" element={<DeliveryPersonDashboard />}>
          <Route index element={<DeliveryMainPage />} />  
          <Route path="orders-available" element={<AvailableOrdersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
