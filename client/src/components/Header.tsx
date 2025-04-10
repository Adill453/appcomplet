
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  User, 
  Home, 
  Menu, 
  X, 
  ArrowRight, 
  Sparkles,
  LogOut 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import logo from "./logo/Logo-Emcgi.png";
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-md" 
          : "bg-white/80 backdrop-blur-sm border-b border-border"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 relative group">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/20 transition-all duration-300">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h1 className="text-xl font-semibold tracking-tight relative">
              <span style={{color:"#FF9B17"}}>EMCGI</span>Pay
            </h1>
          </Link>
         
          {/* Desktop Navigation */}
          <div className="hidden ml-10 md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                        "data-[active]:bg-accent/50 data-[active]:text-accent-foreground",
                        location.pathname === "/" ? "bg-accent/50 text-accent-foreground" : "text-muted-foreground"
                      )}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      location.pathname.includes("/students") ? "bg-accent/50 text-accent-foreground" : "text-muted-foreground"
                    )}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Étudiants
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[220px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/students"
                            className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <div className="text-sm font-medium">Liste des Étudiants</div>
                            </div>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              Voir tous les étudiants enregistrés
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/students/new"
                            className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <ArrowRight className="h-4 w-4" />
                              <div className="text-sm font-medium">Nouvel Étudiant</div>
                            </div>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              Ajouter un nouvel étudiant au système
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Logout Button - Desktop */}
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={logout}
            className="hidden md:flex"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Déconnexion
          </Button>
          
          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border",
          mobileMenuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col px-4 pb-4 pt-2 space-y-2 bg-white/90 backdrop-blur-sm">
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
              location.pathname === "/" 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/students" 
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
              location.pathname === "/students" 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            <User className="h-4 w-4" />
            <span>Liste des Étudiants</span>
          </Link>
          
          <Link 
            to="/students/new" 
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
              location.pathname === "/students/new" 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            <ArrowRight className="h-4 w-4" />
            <span style={{background:"#FF9B17"}} >Nouvel Étudiant</span>
          </Link>
          
          <div className="pt-2 mt-2 border-t border-border">
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
