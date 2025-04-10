import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, User, CreditCard, Calendar, ArrowRight, Filter } from "lucide-react";
import { getDashboardStats } from "@/services/dashboardService";
import { Student } from "@/services/mongoDBService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState([
    {
      title: "Étudiants Inscrits",
      value: "0",
      change: "Chargement...",
      icon: User,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "Paiements Reçus",
      value: "0 DH",
      change: "Chargement...",
      icon: CreditCard,
      color: "bg-green-500/10 text-green-500"
    },
    {
      title: "Taux de Recouvrement",
      value: "0%",
      change: "Chargement...",
      icon: Calendar,
      color: "bg-purple-500/10 text-purple-500"
    },
  ]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);

  const levels = [
    { value: "1ère Année", label: "1ère Année" },
    { value: "2ème Année", label: "2ème Année" },
    { value: "3ème Année", label: "3ème Année" },
    { value: "Master 1", label: "Master 1" },
    { value: "Master 2", label: "Master 2" },
  ];

  useEffect(() => {
    fetchDashboardData(selectedLevel);
  }, [selectedLevel]);

  const fetchDashboardData = async (level?: string) => {
    try {
      setLoading(true);
      const dashboardData = await getDashboardStats(level);

      setStats([
        {
          title: level ? `Étudiants en ${level}` : "Étudiants Inscrits",
          value: dashboardData.totalStudents.toString(),
          change: "",
          icon: User,
          color: "bg-blue-500/10 text-blue-500"
        },
        {
          title: level ? `Paiements ${level}` : "Paiements Reçus",
          value: `${dashboardData.totalPayments.toLocaleString('fr-MA')} DH`,
          change: "",
          icon: CreditCard,
          color: "bg-green-500/10 text-green-500"
        },
        {
          title: level ? `Recouvrement ${level}` : "Taux de Recouvrement",
          value: `${dashboardData.recoveryRate}%`,
          change: "",
          icon: Calendar,
          color: "bg-purple-500/10 text-purple-500"
        },
      ]);

      setRecentStudents(dashboardData.recentStudents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value === "all" ? undefined : value);
  };

  const getTotalPaid = (student: Student) => {
    if (!student.payments) return 0;
    return student.payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  return (
    <>
      <div className="page-container animate-on-mount">
        <div className="flex flex-col gap-8">
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="font-semibold">Tableau de Bord</h1>
                <p className="text-muted-foreground">
                  Bienvenue sur votre système de gestion des paiements étudiants.
                </p>
              </div>

              <div className="w-full md:w-64">
                <Select onValueChange={handleLevelChange} defaultValue="all">
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrer par niveau" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((stat, i) => (
                <Card key={i} className="glass-card hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.color} p-2 rounded-full`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">
                {selectedLevel ? `Étudiants Récents (${selectedLevel})` : "Étudiants Récents"}
              </h2>
              <Link to="/students">
                <Button variant="ghost" className="text-primary gap-1">
                  Voir tous <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <Card className="glass-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 font-medium">Nom</th>
                      <th className="text-left px-6 py-3 font-medium">Email</th>
                      <th className="text-left px-6 py-3 font-medium">Montant</th>
                      <th className="text-right px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">Chargement des données...</td>
                      </tr>
                    ) : recentStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">Aucun étudiant trouvé</td>
                      </tr>
                    ) : (
                      recentStudents.map((student) => {
                        const totalPaid = getTotalPaid(student);
                        return (
                          <tr
                            key={student._id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-6 py-4">{`${student.firstName} ${student.lastName}`}</td>
                            <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                            <td className="px-6 py-4">{`${totalPaid.toLocaleString('fr-MA')} DH`}</td>
                            <td className="px-6 py-4 text-right">
                              <Link to={`/students/${student._id}`}>
                                <Button size="sm" variant="outline">Détails</Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default Index;
