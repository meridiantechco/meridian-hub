import { Sun, Moon, Laptop, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "button" | "dropdown";
}

export function ThemeToggle({ className, variant = "dropdown" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === "icon") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "size-8.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-all cursor-pointer",
              className
            )}
            aria-label="Alternar tema claro/escuro"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="size-4 text-primary transition-transform duration-200 hover:-rotate-12" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            Alternar para tema {resolvedTheme === "dark" ? "claro" : "escuro"}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-8.5 rounded-lg border border-border/80 bg-surface/50 text-muted-foreground hover:text-foreground hover:bg-surface hover:border-primary/40 transition-all cursor-pointer shadow-xs",
                className
              )}
              aria-label="Selecionar tema da interface"
            >
              {resolvedTheme === "dark" ? (
                <Moon className="size-4 text-primary" />
              ) : (
                <Sun className="size-4 text-amber-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Aparência do sistema ({theme === "system" ? "Automático" : theme === "dark" ? "Escuro" : "Claro"})</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-36 bg-card border-border shadow-elev">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "text-xs flex items-center justify-between cursor-pointer py-1.5",
            theme === "light" ? "text-primary font-semibold bg-primary/10" : "text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Sun className="size-3.5 text-amber-500" />
            <span>Claro</span>
          </div>
          {theme === "light" && <Check className="size-3 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "text-xs flex items-center justify-between cursor-pointer py-1.5",
            theme === "dark" ? "text-primary font-semibold bg-primary/10" : "text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Moon className="size-3.5 text-primary" />
            <span>Escuro</span>
          </div>
          {theme === "dark" && <Check className="size-3 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "text-xs flex items-center justify-between cursor-pointer py-1.5",
            theme === "system" ? "text-primary font-semibold bg-primary/10" : "text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Laptop className="size-3.5 text-muted-foreground" />
            <span>Sistema</span>
          </div>
          {theme === "system" && <Check className="size-3 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
