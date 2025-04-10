import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, User, Calendar, Phone, Mail, CreditCard } from "lucide-react";
import { toast } from "sonner";
import PaymentTable from "@/components/PaymentTable";
import StudentService, { StudentType } from "@/services/studentService";

interface Payment {
  month: string;
  amount: string;
  date: Date | undefined;
  method: string;
  receiptNumber: string;
}

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
  totalAmount: string;
  payments: Payment[];
  recoveryRate: number;
}

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [isFetching, setIsFetching] = useState(true);
  
  const [studentData, setStudentData] = useState<Student>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    parentPhone: "",
    birthDate: new Date(),
    birthPlace: "",
    cin: "",
    cne: "",
    photo: "",
    academicYear: "",
    totalAmount: "",
    payments: [],
    recoveryRate: 0
  });
  
  useEffect(() => {
    // Load student data
    if (id) {
      setIsFetching(true);
      // Fetch student from MongoDB
      StudentService.getStudentById(id)
        .then(student => {
          if (student) {
            // Convert student data to match our structure
            setStudentData({
              id: student._id || "",
              firstName: student.firstName || "",
              lastName: student.lastName || "",
              email: student.email || "",
              phone: student.phone || "",
              parentPhone: student.parentPhone || "",
              birthDate: student.birthDate ? new Date(student.birthDate) : new Date(),
              birthPlace: student.birthPlace || "",
              cin: student.cin || "",
              cne: student.cne || "",
              photo: student.photo || "",
              academicYear: student.academicYear || "",
              totalAmount: student.totalAmount?.toString() || "",
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
  }, [id, navigate]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleEditClick = () => {
    navigate(`/students/edit/${id}`);
  };
  
  return (
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
              {studentData.firstName} {studentData.lastName}
            </h1>
            <p className="text-muted-foreground">
              Détails et informations de paiement de l'étudiant
            </p>
          </div>
          
          <Button onClick={handleEditClick}>
            Modifier
          </Button>
        </div>
        
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
                    {studentData.photo ? (
                      <img 
                        src={studentData.photo} 
                        alt={`${studentData.firstName} ${studentData.lastName}`}
                        className="w-48 h-48 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                        <User className="h-24 w-24 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Prénom</p>
                        <p className="font-medium">{studentData.firstName || "Non renseigné"}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Nom</p>
                        <p className="font-medium">{studentData.lastName || "Non renseigné"}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Date de naissance</p>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {studentData.birthDate ? (
                            format(studentData.birthDate, "dd MMMM yyyy", { locale: fr })
                          ) : (
                            "Non renseigné"
                          )}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Lieu de naissance</p>
                        <p className="font-medium">{studentData.birthPlace || "Non renseigné"}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {studentData.email || "Non renseigné"}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {studentData.phone || "Non renseigné"}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Téléphone des parents</p>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {studentData.parentPhone || "Non renseigné"}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Année académique</p>
                        <p className="font-medium">{studentData.academicYear || "Non renseigné"}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">CIN</p>
                        <p className="font-medium flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {studentData.cin || "Non renseigné"}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">CNE</p>
                        <p className="font-medium">{studentData.cne || "Non renseigné"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment" className="animate-fade-in">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Montant Total</h3>
                    <p className="text-2xl font-bold">{studentData.totalAmount ? `${parseInt(studentData.totalAmount).toLocaleString('fr-MA')} DH` : "0 DH"}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900">
                    <h3 className="font-medium text-green-800 dark:text-green-300 mb-1">Montant Payé</h3>
                    <p className="text-2xl font-bold">
                      {studentData.payments && studentData.payments.length > 0 
                        ? `${studentData.payments.reduce((sum, payment) => sum + (parseInt(payment.amount) || 0), 0).toLocaleString('fr-MA')} DH` 
                        : "0 DH"}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900">
                    <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Taux de Recouvrement</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{studentData.recoveryRate}%</p>
                      <div className="flex-1 h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 dark:bg-purple-400 rounded-full" 
                          style={{ width: `${studentData.recoveryRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Historique des Paiements</h3>
                  <PaymentTable 
                    initialPayments={studentData.payments || []} 
                    totalAmount={parseInt(studentData.totalAmount) || 0}
                    readOnly={true}
                    onChange={() => {}} // No-op function since this is read-only
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDetails;