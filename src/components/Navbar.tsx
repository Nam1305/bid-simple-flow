import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from '@/components/ui/select';
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
} from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Gavel, LogOut, Home, Package, ShieldCheck, User, Search, Bell, Wallet
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // local state cho search/sort (đặt ở Navbar như yêu cầu)
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<'ending' | 'price'>('ending');

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const initial = (user?.name?.[0] ?? 'U').toUpperCase();

  // demo handler (có thể đổi sang navigate(`/?q=${...}&sort=${...}`))
  const onSearch = (q: string) => {
    console.log('search:', q, 'sort:', sortKey);
  };
  const onSort = (v: 'ending' | 'price') => setSortKey(v);
  const onOpenNotifications = () => console.log('open notifications');

  return (
    <TooltipProvider>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/40">
  <div className="container mx-auto px-4">
    {/* Header bar: 3 cột cân đối */}
    <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 gap-4">
      
      {/* 1) Brand */}
      <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
        <Gavel className="h-6 w-6" />
        SnapBid
      </Link>

      {/* 2) Nav + Form: 2 cột đều, form chiếm phần còn lại */}
      <div className="hidden md:grid grid-cols-[auto_1fr] items-center gap-4">
        {/* Nav links */}
        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <a className="hover:text-slate-900" href="#featured">Featured</a>
          <a className="hover:text-slate-900" href="#trending">Trending</a>
          <a className="hover:text-slate-900" href="#how">How it works</a>
        </nav>

        {/* Form search + sort (chiếm 1fr) */}
        <form
          className="flex items-center gap-2 w-full"
          onSubmit={(e)=>{e.preventDefault(); onSearch(query);}}
        >
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search items, creators, collections…"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Select value={sortKey} onValueChange={onSort}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ending">Ending soon</SelectItem>
              <SelectItem value="price">Highest price</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="h-9">Search</Button>
        </form>
      </div>

      {/* 3) Actions: Notifications | Wallet | Avatar dropdown */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Bell className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Wallet className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Wallet</TooltipContent>
        </Tooltip>

        {/* Avatar dropdown (giữ ảnh cố định) */}
        {/* Avatar dropdown: giữ nguyên ảnh avatar, route theo role */}
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-9 w-9 hidden md:inline-flex cursor-pointer">
                        <AvatarImage src="https://i.pravatar.cc/100?img=12" alt="user" />
                        <AvatarFallback>{initial}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">{user?.name ?? 'User'}</span>
                          <span className="text-xs text-muted-foreground">
                            Role: {user?.role ?? 'guest'}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Common */}
                      <DropdownMenuItem asChild>
                        <Link to="/">
                          <Home className="h-4 w-4 mr-2" />
                          Home
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>

                      {/* Role-based */}
                      {user?.role === 'buyer' && (
                        <DropdownMenuItem asChild>
                          <Link to="/orders">
                            <Package className="h-4 w-4 mr-2" />
                            My Orders
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {user?.role === 'seller' && (
                        <DropdownMenuItem asChild>
                          <Link to="/seller/create">
                            <Package className="h-4 w-4 mr-2" />
                            Create Product
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {user?.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin/review">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Review Panel
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/auth">
                    <Button>Login</Button>
                  </Link>
                )}
      </div>
    </div>
  </div>
</nav>

    </TooltipProvider>
  );
};
