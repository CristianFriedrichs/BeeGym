import {
  Bike,
  Dumbbell,
  Flame,
  Flower2,
  Waves,
  HeartPulse,
  Award,
  Swords,
  Shield,
  Target,
  Trophy,
  Activity,
  Zap,
  Leaf,
  PersonStanding,
  Sparkles,
  Heart,
  Brain,
  Wind,
} from 'lucide-react';
import React from 'react';

export type RecurringClass = {
  id: number;
  name: string;
  instructor: string;
  location: string;
  icon: string;
  color: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  daysOfWeek: string[]; // 0 for Sunday, 1 for Monday, etc.
  time: string; // HH:mm
  duration: number; // in minutes
  capacity?: number;
  status: 'active' | 'inactive';
  unitId: string;
}

export const iconCategories = {
  'Atividades Físicas': [
    { value: 'weights', label: 'Musculação', icon: Dumbbell },
    { value: 'spinning', label: 'Spinning', icon: Bike },
    { value: 'wod', label: 'Crossfit/WOD', icon: Flame },
    { value: 'cardio', label: 'Cardio', icon: HeartPulse },
    { value: 'swimming', label: 'Natação/Hidro', icon: Waves },
    { value: 'functional', label: 'Funcional', icon: Activity },
    { value: 'hiit', label: 'HIIT', icon: Zap },
    { value: 'martial-arts', label: 'Lutas', icon: Swords },
  ],
  'Mente & Corpo': [
    { value: 'yoga', label: 'Yoga', icon: Flower2 },
    { value: 'pilates', label: 'Pilates', icon: PersonStanding },
    { value: 'meditation', label: 'Meditação', icon: Brain },
    { value: 'stretching', label: 'Alongamento', icon: Wind },
    { value: 'wellness', label: 'Bem-estar', icon: Leaf },
  ],
  'Metas & Conquistas': [
    { value: 'award', label: 'Prêmio', icon: Award },
    { value: 'shield', label: 'Defesa', icon: Shield },
    { value: 'target', label: 'Foco/Meta', icon: Target },
    { value: 'trophy', label: 'Troféu', icon: Trophy },
    { value: 'sparkles', label: 'Destaque', icon: Sparkles },
    { value: 'health', label: 'Saúde', icon: Heart },
  ],
};


export const classIcons = Object.values(iconCategories).flat();

export function getIcon(iconName: string) {
    return classIcons.find(i => i.value === iconName)?.icon || Dumbbell;
}

export const classColors = [
    { value: 'blue', label: 'Azul', background: 'bg-blue-500', text: 'text-white' },
    { value: 'green', label: 'Verde', background: 'bg-green-500', text: 'text-white' },
    { value: 'red', label: 'Vermelho', background: 'bg-red-500', text: 'text-white' },
    { value: 'purple', label: 'Roxo', background: 'bg-purple-500', text: 'text-white' },
    { value: 'teal', label: 'Verde-azulado', background: 'bg-teal-500', text: 'text-white' },
    { value: 'orange', label: 'Laranja', background: 'bg-orange-500', text: 'text-white' },
    { value: 'primary', label: 'Primária (Tema)', background: 'bg-primary', text: 'text-primary-foreground' },
];

export const classColorStyles: { [key: string]: { background: string, text: string, border: string } } = {
    blue: { background: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500' },
    green: { background: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-500' },
    red: { background: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-500' },
    purple: { background: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500' },
    teal: { background: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500' },
    orange: { background: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500' },
    primary: { background: 'bg-primary/10', text: 'text-primary', border: 'border-primary' },
};
