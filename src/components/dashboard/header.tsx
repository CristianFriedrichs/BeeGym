'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { 
    Search, 
    MessageCircle, 
    Bell, 
    ChevronDown, 
    Sun,
    Moon,
    Globe,
    Building,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { logAction } from "@/lib/logger"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"

const translations = {
  'pt-BR': {
    theme: 'Tema',
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema',
    language: 'Idioma',
    portuguese: 'Português',
    english: 'English (US)',
    spanish: 'Español',
    settings: 'Configurações',
    support: 'Suporte',
    searchPlaceholder: 'Buscar alunos, aulas ou treinos...',
    themeChangedToast: (theme: string) => `Tema alterado para ${theme}`,
    langChangedToast: (lang: string) => `Idioma alterado para ${lang}`,
  },
  'en-US': {
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    portuguese: 'Português',
    english: 'English (US)',
    spanish: 'Español',
    settings: 'Settings',
    support: 'Support',
    searchPlaceholder: 'Search students, classes, or workouts...',
    themeChangedToast: (theme: string) => `Theme changed to ${theme}`,
    langChangedToast: (lang: string) => `Language changed to ${lang}`,
  },
  'es-ES': {
    theme: 'Tema',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    language: 'Idioma',
    portuguese: 'Português',
    english: 'English (US)',
    spanish: 'Español',
    settings: 'Configuración',
    support: 'Soporte',
    searchPlaceholder: 'Buscar alumnos, clases o entrenamientos...',
    themeChangedToast: (theme: string) => `Tema cambiado a ${theme}`,
    langChangedToast: (lang: string) => `Idioma cambiado a ${lang}`,
  }
};

type Locale = keyof typeof translations;

const useTranslation = (lang: string) => {
    const localeMap: {[key: string]: Locale} = {
        'PT': 'pt-BR',
        'US': 'en-US',
        'ES': 'es-ES'
    }
    const locale = localeMap[lang] || 'pt-BR';
    return translations[locale];
}

export function Header() {
  const [theme, setThemeState] = useState('system');
  const [effectiveTheme, setEffectiveTheme] = useState('light');
  const [language, setLanguage] = useState('PT');
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const [units, setUnits] = useState<any[]>([]);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

  const t = useTranslation(language);

  const syncStateFromStorage = () => {
    const storedUnits = JSON.parse(localStorage.getItem('units_data') || '[]');
    setUnits(storedUnits);

    const storedUnitId = localStorage.getItem('currentUnitId');
    const availableUnitIds = storedUnits.map((u: any) => u.id);

    if (storedUnitId && availableUnitIds.includes(storedUnitId)) {
      setCurrentUnitId(storedUnitId);
    } else if (storedUnits.length > 0) {
      const defaultUnit = storedUnits.find((u:any) => u.status === 'Ativo')?.id || storedUnits[0].id;
      setCurrentUnitId(defaultUnit);
      localStorage.setItem('currentUnitId', defaultUnit);
    } else {
      setCurrentUnitId(null);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const storedTheme = localStorage.getItem('theme') || 'system';
    setThemeState(storedTheme);

    const storedLang = localStorage.getItem('lang') || 'PT';
    setLanguage(storedLang);

    const applyTheme = (t: string) => {
        let isDark;
        if (t === 'system') {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            isDark = t === 'dark';
        }
        
        if (isDark) {
            document.documentElement.classList.add('dark');
            setEffectiveTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            setEffectiveTheme('light');
        }
    };

    applyTheme(storedTheme);
    syncStateFromStorage();

    window.addEventListener('storage-update', syncStateFromStorage);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const stored = localStorage.getItem('theme') || 'system';
      if (stored === 'system') {
          applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
        mediaQuery.removeEventListener('change', handleChange);
        window.removeEventListener('storage-update', syncStateFromStorage);
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);

    let isDark;
    if (newTheme === 'system') {
        localStorage.removeItem('theme');
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        localStorage.setItem('theme', newTheme);
        isDark = newTheme === 'dark';
    }

    if (isDark) {
        document.documentElement.classList.add('dark');
        setEffectiveTheme('dark');
    } else {
        document.documentElement.classList.remove('dark');
        setEffectiveTheme('light');
    }
    
    const themeLabels = { light: t.light, dark: t.dark, system: t.system };
    toast({ title: t.themeChangedToast(themeLabels[newTheme]) });
  };
  
  const handleLanguageChange = (lang: 'PT' | 'US' | 'ES') => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
    const langLabels = { PT: "Português", US: "English (US)", ES: "Español" };
    toast({ title: translations[lang === 'PT' ? 'pt-BR' : lang === 'US' ? 'en-US' : 'es-ES'].langChangedToast(langLabels[lang]) });
  };

  const handleUnitChange = (unitId: string) => {
    setCurrentUnitId(unitId);
    localStorage.setItem('currentUnitId', unitId);
    window.location.reload();
  };

  const ThemeIcon = effectiveTheme === 'dark' ? Moon : Sun;
  const selectedUnit = units.find(u => u.id === currentUnitId);

  return (
    <header className="h-20 bg-card border-b flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10">
      <div className="flex-1 md:flex-none">
        <div className="hidden md:flex items-center bg-muted rounded-full px-4 py-2.5 w-96 border border-transparent focus-within:border-primary transition-colors">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-foreground placeholder-muted-foreground" placeholder={t.searchPlaceholder} type="text"/>
        </div>
      </div>
      
      <div className="flex items-center gap-1 md:gap-2">
        {isClient && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                  <ThemeIcon className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t.theme}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as any)}>
                    <DropdownMenuRadioItem value="light">{t.light}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">{t.dark}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">{t.system}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Globe className="h-5 w-5" />
                  <span className="text-xs font-bold">{language}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t.language}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={language} onValueChange={(v) => handleLanguageChange(v as any)}>
                  <DropdownMenuRadioItem value="PT">Português</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="US">English (US)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ES">Español</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={units.length <= 1}>
                 <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  <Building className="h-5 w-5" />
                  <span className="text-xs font-bold max-w-[100px] truncate">{selectedUnit?.name || 'Unidade'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Unidade Ativa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={currentUnitId || ''} onValueChange={handleUnitChange}>
                  {units.map(unit => <DropdownMenuRadioItem key={unit.id} value={unit.id}>{unit.name}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="h-5 w-5" />
        </button>
        <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-card"></span>
        </button>
        <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/150?img=32"/>
                <AvatarFallback>KW</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-foreground leading-tight">Kristin Watson</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link href="/dashboard/settings">{t.settings}</Link></DropdownMenuItem>
            <DropdownMenuItem>{t.support}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
