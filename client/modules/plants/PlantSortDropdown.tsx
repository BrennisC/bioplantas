import { ArrowUpDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type SortOption = 
  | "name-asc" 
  | "name-desc" 
  | "date-desc" 
  | "date-asc"
  | "favorites-desc";

interface PlantSortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Nombre (A-Z)" },
  { value: "name-desc", label: "Nombre (Z-A)" },
  { value: "date-desc", label: "Más recientes" },
  { value: "date-asc", label: "Más antiguas" },
  { value: "favorites-desc", label: "Más populares" },
];

export default function PlantSortDropdown({ value, onChange }: PlantSortDropdownProps) {
  const currentOption = sortOptions.find(opt => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <ArrowUpDown className="w-4 h-4" />
          <span className="hidden sm:inline">Ordenar:</span>
          <span className="font-medium">{currentOption?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="cursor-pointer"
          >
            <Check
              className={`w-4 h-4 mr-2 ${
                value === option.value ? "opacity-100" : "opacity-0"
              }`}
            />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
