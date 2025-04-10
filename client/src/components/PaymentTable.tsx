
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Months of the year in French
const months = [
  "Septembre", "Octobre", "Novembre", "Décembre",
  "Janvier", "Février", "Mars", "Avril",
  "Mai", "Juin", "Juillet", "Août"
];

// Payment methods
const paymentMethods = [
  { value: "cash", label: "Espèces" },
  { value: "transfer", label: "Virement" },
  { value: "card", label: "Carte" },
];

interface Payment {
  month: string;
  amount: string;
  date: Date | undefined;
  method: string;
  receiptNumber: string;
}

interface PaymentTableProps {
  totalAmount: number;
  initialPayments?: Payment[];
  onChange: (payments: Payment[], recoveryRate: number) => void;
  readOnly?: boolean;
}

const PaymentTable = ({ totalAmount, initialPayments, onChange, readOnly = false }: PaymentTableProps) => {
  const [payments, setPayments] = useState<Payment[]>(() => {
    // Créer la structure par défaut avec tous les mois
    const defaultPayments = months.map(month => ({
      month,
      amount: "",
      date: undefined,
      method: "",
      receiptNumber: "",
    }));
    
    // Si des paiements initiaux existent, les fusionner avec la structure par défaut
    if (initialPayments && initialPayments.length > 0) {
      // Pour chaque paiement initial, mettre à jour le mois correspondant dans la structure par défaut
      initialPayments.forEach(payment => {
        const index = months.findIndex(month => month === payment.month);
        if (index !== -1) {
          defaultPayments[index] = payment;
        }
      });
    }
    
    return defaultPayments;
  });
  
  useEffect(() => {
    // Mettre à jour le taux de recouvrement et notifier le parent des changements
    onChange(payments, calculateRecoveryRate());
  }, [payments]);
  
  const calculateTotalPaid = () => {
    return payments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      return sum + amount;
    }, 0);
  };
  
  const calculateRecoveryRate = () => {
    if (totalAmount === 0) return 0;
    const totalPaid = calculateTotalPaid();
    return Math.round((totalPaid / totalAmount) * 100);
  };
  
  const handlePaymentChange = (index: number, field: keyof Payment, value: any) => {
    const updatedPayments = [...payments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    
    // If amount is updated, format it properly
    if (field === 'amount' && typeof value === 'string') {
      // Remove non-numeric characters except decimal point
      let cleanValue = value.replace(/[^\d.]/g, '');
      
      // Ensure only one decimal point
      const parts = cleanValue.split('.');
      if (parts.length > 2) {
        cleanValue = `${parts[0]}.${parts.slice(1).join('')}`;
      }
      
      updatedPayments[index].amount = cleanValue;
    }
    
    setPayments(updatedPayments);
  };
  
  const clearPayment = (index: number) => {
    const updatedPayments = [...payments];
    updatedPayments[index] = {
      ...updatedPayments[index],
      amount: "",
      date: undefined,
      method: "",
      receiptNumber: "",
    };
    setPayments(updatedPayments);
  };
  
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto pb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Mois</th>
              <th className="border px-4 py-2 text-left">Montant Payé (DH)</th>
              <th className="border px-4 py-2 text-left">Date de Paiement</th>
              <th className="border px-4 py-2 text-left">Mode de Paiement</th>
              <th className="border px-4 py-2 text-left">Numéro du Reçu</th>
              <th className="border px-4 py-2 text-center w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => {
              // Vérifier si le mois est payé (a un montant)
              const isPaid = !!payment.amount && parseFloat(payment.amount) > 0;
              
              // En mode lecture seule, n'afficher que les mois payés
              if (readOnly && !isPaid) return null;
              
              return (
                <tr 
                  key={payment.month} 
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    isPaid && readOnly && "bg-green-50"
                  )}
                >
                  <td className="border px-4 py-2">
                    <div className="font-medium">{payment.month}</div>
                  </td>
                  <td className="border px-4 py-2">
                    {readOnly ? (
                      <div className="py-1.5 px-2 font-medium">
                        {payment.amount ? `${parseFloat(payment.amount).toLocaleString()} DH` : "-"}
                      </div>
                    ) : (
                      <Input
                        type="text"
                        value={payment.amount}
                        onChange={(e) => handlePaymentChange(index, "amount", e.target.value)}
                        placeholder="0.00"
                        className="h-9"
                      />
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {readOnly ? (
                      <div className="py-1.5 px-2">
                        {payment.date ? format(payment.date, "dd MMMM yyyy", { locale: fr }) : "-"}
                      </div>
                    ) : (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-9",
                              !payment.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {payment.date ? (
                              format(payment.date, "dd MMMM yyyy", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={payment.date}
                            onSelect={(date) => handlePaymentChange(index, "date", date)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {readOnly ? (
                      <div className="py-1.5 px-2">
                        {payment.method ? 
                          paymentMethods.find(m => m.value === payment.method)?.label || payment.method : 
                          "-"}
                      </div>
                    ) : (
                      <Select
                        value={payment.method}
                        onValueChange={(value) => handlePaymentChange(index, "method", value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {readOnly ? (
                      <div className="py-1.5 px-2">
                        {payment.receiptNumber || "-"}
                      </div>
                    ) : (
                      <Input
                        type="text"
                        value={payment.receiptNumber}
                        onChange={(e) => handlePaymentChange(index, "receiptNumber", e.target.value)}
                        placeholder="Numéro du reçu"
                        className="h-9"
                      />
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => clearPayment(index)}
                        disabled={!payment.amount && !payment.date && !payment.method && !payment.receiptNumber}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {readOnly && isPaid && (
                      <div className="flex justify-center">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="bg-muted/20 p-4 rounded-md border">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-medium">Résumé des Paiements</h3>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="block">Montant total à payer: <span className="font-medium">{totalAmount.toLocaleString()} DH</span></span>
              <span className="block">Montant total payé: <span className="font-medium">{calculateTotalPaid().toLocaleString()} DH</span></span>
              <span className="block">
  Montant restant : 
  <span className="font-medium">
    {(totalAmount - calculateTotalPaid()).toLocaleString()} DH
  </span>
</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium mb-1">Taux de Recouvrement</div>
            <div className="inline-flex items-center justify-center p-1">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E4E4E7"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeDasharray={`${calculateRecoveryRate()}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-semibold">
                  {calculateRecoveryRate()}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTable;
