import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUserAsync } from "./store/slices/authSlice";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Settings from "./pages/Settings";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserAsync());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="settings" element={<Settings />} />
          {/* Future routes will be added here */}
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
