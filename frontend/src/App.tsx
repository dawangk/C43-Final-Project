import './App.css'
import { Toaster } from "./components/ui/toaster";
import { Route } from 'react-router-dom';
import { Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Login } from './pages/Login/Login';
import LoginRoute from './components/login-route';
import AuthRoute from './components/auth-route';
import { Signup } from './pages/Signup/Signup';

function App() {
  return (
    <div className="w-full">
      <Routes>
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginRoute component={Login} />} />
        <Route path="/signup" element={<Signup/>} />
        <Route
          path="/dashboard/*"
          element={<AuthRoute component={Dashboard} />}
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
