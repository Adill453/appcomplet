
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, ArrowLeft, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import PaymentTable from "@/components/PaymentTable";
import StudentService, { StudentType } from "@/services/studentService";

// Interface pour Payment
interface Payment {
  month: string;
  amount: string;
  date: Date | undefined;
  method: string;
  receiptNumber: string;
}

// Interface pour Student
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  parentPhone: string;
  birthDate: Date;
  birthPlace: string;
  cin: string;
  cne: string;
  photo: string;
  academicYear: string;
  level: string;
  totalAmount: string;
  payments: Payment[];
  recoveryRate: number;
}



const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const { isAdmin } = useAuth();
  
  // Redirect to students list if user is not admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/students');
      toast.error("Vous n'avez pas les droits pour modifier les étudiants");
    }
  }, [isAdmin, navigate]);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    parentPhone: "",
    birthDate: undefined as Date | undefined,
    birthPlace: "",
    cin: "",
    cne: "",
    photo: "",
    academicYear: "",
    level: "",
    totalAmount: "15000",
    payments: [] as Payment[],
    recoveryRate: 0
  });
  
  useEffect(() => {
    // Load student data if in edit mode
    if (isEditMode && id) {
      setIsFetching(true);
      // Fetch student from MongoDB
      StudentService.getStudentById(id)
        .then(student => {
          if (student) {
            // Convert student data to match formData structure
            setFormData({
              firstName: student.firstName || "",
              lastName: student.lastName || "",
              email: student.email || "",
              phone: student.phone || "",
              parentPhone: student.parentPhone || "",
              birthDate: student.birthDate ? new Date(student.birthDate) : undefined,
              birthPlace: student.birthPlace || "",
              cin: student.cin || "",
              cne: student.cne || "",
              photo: student.photo || "",
              academicYear: student.academicYear || "2023-2024",
              level: student.level || "",
              totalAmount: student.totalAmount?.toString() || "15000",
              payments: student.payments?.map(p => ({
                month: p.month,
                amount: p.amount.toString(),
                date: p.date ? new Date(p.date) : undefined,
                method: p.method,
                receiptNumber: p.receiptNumber || ""
              })) || [],
              recoveryRate: student.recoveryRate || 0
            });
          } else {
            // Student not found
            toast.error("Étudiant non trouvé");
            navigate("/students");
          }
        })
        .catch(error => {
          console.error("Error fetching student:", error);
          toast.error("Erreur lors de la récupération des données de l'étudiant");
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [isEditMode, id, navigate]);
  
  // Update handleChange function
  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | string, name?: string) => {
    if (typeof e === 'string' && name) {
      // Handle Select component change
      setFormData(prev => ({ ...prev, [name]: e }));
    } else if (typeof e === 'object' && e !== null && 'target' in e) {
      // Ici, TypeScript comprend que e est un ChangeEvent
      const target = e.target as HTMLInputElement;
      // Handle Input component change
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setFormData(prev => ({ ...prev, totalAmount: value }));
  };
  
  const handlePhotoChange = (photoData: string) => {
    setFormData(prev => ({ ...prev, photo: photoData }));
  };
  
  const handlePaymentsChange = (payments: Payment[], recoveryRate: number) => {
    setFormData(prev => ({ ...prev, payments, recoveryRate }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a copy of the form data
      const dataToSubmit = { ...formData };
      
      // Filter out payments with empty amount to avoid validation errors
      // Only include payments that have an amount value
      dataToSubmit.payments = formData.payments.filter(payment => 
        payment.amount && parseFloat(payment.amount) > 0
      );
      
      if (isEditMode && id) {
        // Update existing student in MongoDB
        const updatedStudent = await StudentService.updateStudent(id, dataToSubmit as unknown as StudentType);
        toast.success("Les informations ont été mises à jour avec succès");
        
        // Rester sur la page actuelle après l'enregistrement en mode édition
        setActiveTab("payment");
      } else {
        // Create new student in MongoDB
        const newStudent = await StudentService.createStudent(dataToSubmit as unknown as Omit<StudentType, 'id'>);
        toast.success("Nouvel étudiant ajouté avec succès");
        
        // Rediriger vers les détails du nouvel étudiant
        if (newStudent && newStudent._id) {
          navigate(`/students/${newStudent._id}`);
        } else {
          navigate('/students');
        }
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (<>
    <div className="page-container animate-on-mount">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <h1 className="font-semibold text-xl md:text-2xl">
              {isEditMode ? 
                `${formData.firstName} ${formData.lastName}` : 
                "Ajouter un étudiant"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode 
                ? "Modifier les informations et les paiements de l'étudiant" 
                : "Créer une nouvelle fiche individuelle de paiement"}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="info">Informations Personnelles</TabsTrigger>
              <TabsTrigger value="payment">Informations Financières</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="animate-fade-in">
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="col-span-1 flex flex-col items-center">
                      <ImageUpload 
                        value={formData.photo} 
                        onChange={handlePhotoChange}
                      />
                    </div>
                    
                    <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom <span className="text-red-500">*</span></Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom <span className="text-red-500">*</span></Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Date de naissance</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.birthDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.birthDate ? (
                                format(formData.birthDate, "dd MMMM yyyy", { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.birthDate}
                              onSelect={(date) => setFormData(prev => ({ ...prev, birthDate: date }))}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="birthPlace">Lieu de naissance</Label>
                        <Input
                          id="birthPlace"
                          name="birthPlace"
                          value={formData.birthPlace}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Numéro de téléphone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="parentPhone">Numéro du parent</Label>
                        <Input
                          id="parentPhone"
                          name="parentPhone"
                          value={formData.parentPhone}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cin">CIN</Label>
                        <Input
                          id="cin"
                          name="cin"
                          value={formData.cin}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cne">CNE</Label>
                        <Input
                          id="cne"
                          name="cne"
                          value={formData.cne}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment" className="animate-fade-in">
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Année Universitaire</Label>
                      <Select
                        value={formData.academicYear || ""}
                        onValueChange={(value) => handleChange(value, 'academicYear')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'année universitaire" />
                        </SelectTrigger>
                        <SelectContent>
                          
                          {Array.from({ length: 9 }, (_, i) => {
                            const startYear = 2024 + i;
                            const endYear = startYear + 1;
                            const academicYear = `${startYear}-${endYear}`;
                            return (
                              <SelectItem key={academicYear} value={academicYear}>
                                {academicYear}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Niveau</Label>
                      <Select
                        value={formData.level || ""}
                        onValueChange={(value) => handleChange(value, 'level')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1ère Année">1ère Année</SelectItem>
                          <SelectItem value="2ème Année">2ème Année</SelectItem>
                          <SelectItem value="3ème Année">3ème Année</SelectItem>
                          <SelectItem value="Master 1">Master 1</SelectItem>
                          <SelectItem value="Master 2">Master 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Tableau des Paiements Mensuels</h3>
                    <PaymentTable 
                      totalAmount={parseFloat(formData.totalAmount) || 0}
                      initialPayments={formData.payments}
                      onChange={handlePaymentsChange}
                    />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="totalAmount">Montant Annuel à Payer (DH)</Label>
                      <Input
                        id="totalAmount"
                        name="totalAmount"
                        value={formData.totalAmount}
                        onChange={handleTotalAmountChange}
                      />
                    </div> 
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/students")}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" className="gap-2" disabled={isLoading || isFetching} style={{background:"#FF9B17"}}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default StudentForm;
