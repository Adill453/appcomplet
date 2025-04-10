
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
}

const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop grande. Taille maximale: 5MB");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="flex flex-col items-center space-y-4 pt-24">
      <div 
        onClick={handleClick}
        className="relative w-40 h-40 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors "
      >
        {preview ? (
          <img 
            src={preview} 
            alt="Photo de l'étudiant" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <User className="w-12 h-12 mb-2" />
            <span className="text-xs text-center">Cliquez pour ajouter<br />une photo</span>
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
        {
          /*<Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
      >
        {preview ? "Changer la photo" : "Ajouter une photo"}
      </Button>
*/
        }    
    </div>
  );
};

export default ImageUpload;
