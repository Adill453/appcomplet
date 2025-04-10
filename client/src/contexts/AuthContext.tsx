import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'admin' | 'readonly' | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'readonly' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = () => {
      const auth = sessionStorage.getItem('isAuthenticated');
      const role = sessionStorage.getItem('userRole') as 'admin' | 'readonly' | null;
      
      setIsAuthenticated(auth === 'true');
      setUserRole(role);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // For demonstration purposes - in a real app, this would be an API call
    const adminEmail = "admin@emcgi.ma";
    const adminPassword = "admin123";
    const readonlyEmail = "user@emcgi.ma";
    const readonlyPassword = "user123";
    
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === adminEmail && password === adminPassword) {
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('userRole', 'admin');
          setIsAuthenticated(true);
          setUserRole('admin');
          setLoading(false);
          resolve(true);
        } else if (email === readonlyEmail && password === readonlyPassword) {
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('userRole', 'readonly');
          setIsAuthenticated(true);
          setUserRole('readonly');
          setLoading(false);
          resolve(true);
        } else {
          setLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  // Logout function
  const logout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };
  
  // Helper function to check if user is admin
  const isAdmin = () => {
    return userRole === 'admin';
  };

  const value = {
    isAuthenticated,
    userRole,
    login,
    logout,
    loading,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};