
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User, Plus, Filter, Phone, Mail, CreditCard, Loader2, Pencil, Trash2, Lock, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import StudentService for MongoDB connection
import StudentService, { StudentType } from "@/services/studentService";

const StudentsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [students, setStudents] = useState<StudentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  // Available education levels
  const educationLevels = ["1ère Année", "2ème Année", "3ème Année", "Master 1", "Master 2"];
  
  // Fetch students from MongoDB when component mounts
  useEffect(() => {
    setIsLoading(true);
    StudentService.getAllStudents()
      .then(data => {
        setStudents(data);
      })
      .catch(error => {
        console.error("Error fetching students:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  
  // Map the raw student data to the display format needed
const studentsForDisplay = (students || []).map(student => ({
  id: student._id || '',
  photo: student.photo || "default.jpg",
  firstName: student.firstName || "Inconnu",
  lastName: student.lastName || "Inconnu",
  email: student.email || "Non fourni",
  phone: student.phone || "Non disponible",
  parentPhone: student.parentPhone || "Non disponible",
  cne: student.cne || "Non renseigné",
  cin: student.cin || "Non renseigné",
  level: student.level || "Non spécifié",
  paymentRate: student.recoveryRate ?? 0,
  totalAmount: `${student.totalAmount ?? 0} DH`,
}));

  
  // Filter students based on search term and selected level
  const filteredStudents = studentsForDisplay.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cne.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cin.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if student matches the selected level filter
    const matchesLevel = !selectedLevel || selectedLevel === "all" || student.level === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });
  
  const handleViewDetails = (id: string) => {
    navigate(`/students/${id}`);
  };
  
  const handleEdit = (id: string) => {
    navigate(`/students/edit/${id}`);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
      try {
        await StudentService.deleteStudent(id);
        toast.success("Étudiant supprimé avec succès");
        // Refresh the student list
        setStudents(students.filter(student => student._id !== id));
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error("Erreur lors de la suppression de l'étudiant");
      }
    }
  };
  
  // Rendu adapté pour mobile
  const renderMobileStudentCard = (student: any) => (
    <Card key={student.id} className="p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {student.photo ? (
            <img 
              src={student.photo} 
              alt={`${student.firstName} ${student.lastName}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{student.firstName} {student.lastName}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Mail className="w-3 h-3" />
            <span className="truncate">{student.email}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-xs">
          <div className="flex items-center gap-1 mb-1">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Tél:</span>
          </div>
          <span>{student.phone}</span>
        </div>
        <div className="text-xs">
          <div className="flex items-center gap-1 mb-1">
            <CreditCard className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">CNE/CIN:</span>
          </div>
          <span>{student.cne}/{student.cin}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-16 bg-secondary rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  student.paymentRate >= 80 
                    ? 'bg-green-500' 
                    : student.paymentRate >= 50 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`} 
                style={{ width: `${student.paymentRate}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium">{student.paymentRate}%</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleViewDetails(student.id)}
          >
            Détails
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEdit(student.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDelete(student.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
  
  return (
    <div className="page-container animate-on-mount">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-semibold text-2xl md:text-3xl">Liste des Étudiants</h1>
            <p className="text-muted-foreground">
              Gérer et visualiser les informations de tous les étudiants
            </p>
          </div>
          
          <Link to="/students/new">
            <Button className="button-transition gap-2 w-full md:w-auto" style={{background:"#FF9B17"}}>
              <Plus className="h-4 w-4" /> Nouvel Étudiant
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="Rechercher par nom, email, téléphone, CIN ou CNE..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64">
            <Select
              value={selectedLevel}
              onValueChange={setSelectedLevel}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filtrer par niveau" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  {educationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {selectedLevel && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSelectedLevel("")}
              title="Réinitialiser le filtre"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement des étudiants...</span>
          </div>
        )}
        
        {/* Affichage mobile */}
        <div className="md:hidden">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => renderMobileStudentCard(student))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Aucun étudiant ne correspond aux critères de recherche
            </Card>
          )}
        </div>
        
        {/* Affichage desktop */}
        <div className="hidden md:block">
          <Card className="glass-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom & Prénom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>CNE/CIN</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Taux</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow 
                        key={student.id} 
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {student.photo ? (
                                <img 
                                  src={student.photo} 
                                  alt={`${student.firstName} ${student.lastName}`}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{student.firstName} {student.lastName}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{student.email}</TableCell>
                        <TableCell className="text-muted-foreground">{student.phone}</TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div><span className="text-muted-foreground">CNE:</span> {student.cne}</div>
                            <div><span className="text-muted-foreground">CIN:</span> {student.cin}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{student.level}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-secondary rounded-full h-2 max-w-[100px]">
                              <div 
                                className={`h-2 rounded-full ${
                                  student.paymentRate >= 80 
                                    ? 'bg-green-500' 
                                    : student.paymentRate >= 50 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                                }`} 
                                style={{ width: `${student.paymentRate}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">{student.paymentRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(student.id)}
                            >
                              Détails
                            </Button>
                            {isAdmin() ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEdit(student.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDelete(student.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled
                                className="cursor-not-allowed"
                              >
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center p-8 text-muted-foreground">
                        Aucun étudiant ne correspond aux critères de recherche
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentsList;
