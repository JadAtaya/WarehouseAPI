import './App.css';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import Home from './Pages/Home.jsx';
import Products from './Pages/Products.jsx';
import Category from './Pages/Category.jsx';
import Companies from './Pages/Companies.jsx';
import Users from './Pages/Users.jsx';
import MainLayout from './Pages/MainLayout.jsx';
import Forgot_password from './Pages/Forgot_password.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route path="/forgot_password" element={<Forgot_password />} />
        <Route path="/register" element={<Register />} />
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/category" element={<Category />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/users" element={<Users />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
