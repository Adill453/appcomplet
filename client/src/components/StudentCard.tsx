
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface StudentCardProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  paymentRate: number;
}

const StudentCard = ({
  id,
  firstName,
  lastName,
  email,
  phone,
  photo,
  paymentRate,
}: StudentCardProps) => {
  return (
    <Card className="glass-card hover-scale overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="relative pb-[50%] bg-primary/5">
            {photo ? (
              <img
                src={photo}
                alt={`${firstName} ${lastName}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="h-16 w-16 text-primary/30" />
              </div>
            )}
            

          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-lg mb-1">{firstName} {lastName}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{email}</p>
              <p>{phone}</p>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Taux de recouvrement</span>
                <span className="font-medium">{paymentRate}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    paymentRate >= 80 
                      ? 'bg-green-500' 
                      : paymentRate >= 50 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`} 
                  style={{ width: `${paymentRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-4">
              <Link to={`/students/${id}`}>
                <Button variant="outline" className="w-full">Voir détails</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
