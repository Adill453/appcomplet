import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, ShieldCheck, User, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("admin"); // Default to admin view

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simple validation
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        // Redirect to dashboard
        navigate("/");
      } else {
        setError("Email ou mot de passe incorrect");
        setLoading(false);
      }
    } catch (err) {
      setError("Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <Card className="glass-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">EMCGI Pay</CardTitle>
            <CardDescription>
              Connectez-vous pour accéder au système de gestion des paiements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs value={userType} onValueChange={setUserType} className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Administrateur</span>
                </TabsTrigger>
                <TabsTrigger value="readonly" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Utilisateur</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-4 mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                {userType === "admin" ? (
                  <p>Accès complet avec droits de modification</p>
                ) : (
                  <p>Accès en lecture seule, sans droits de modification</p>
                )}
              </div>
            </Tabs>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={userType === "admin" ? "admin@emcgi.ma" : "user@emcgi.ma"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder={userType === "admin" ? "••••••••" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full">
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loading}
                          style={{background: userType === "admin" ? "#FF9B17" : "#3B82F6"}}
                        >
                          {loading ? "Connexion en cours..." : "Se connecter"}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{userType === "admin" ? "Identifiants admin: admin@emcgi.ma / admin123" : "Identifiants utilisateur: user@emcgi.ma / user123"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="text-center text-xs text-muted-foreground mt-4">
                  <p>Pour démonstration uniquement:</p>
                  <p className="mt-1">
                    {userType === "admin" ? "admin@emcgi.ma / admin123" : "user@emcgi.ma / user123"}
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} EMCGI Pay - Tous droits réservés
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;