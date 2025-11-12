import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Gavel, LogOut, User, Home, Package, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Gavel className="h-6 w-6" />
            SnapBid
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                
                {user?.role === 'seller' && (
                  <Link to="/seller/create">
                    <Button variant="ghost" size="sm">
                      <Package className="h-4 w-4 mr-2" />
                      Create Product
                    </Button>
                  </Link>
                )}
                
                {user?.role === 'admin' && (
                  <Link to="/admin/review">
                    <Button variant="ghost" size="sm">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Review Panel
                    </Button>
                  </Link>
                )}
                
                {user?.role === 'buyer' && (
                  <Link to="/orders">
                    <Button variant="ghost" size="sm">
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </Button>
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-4 border-l">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">({user?.role})</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/auth">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
