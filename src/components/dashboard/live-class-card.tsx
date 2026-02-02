'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { MapPin, Timer } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface LiveClassProps {
    liveClass: any;
    getIconForClass: (item: any) => { icon: React.ReactNode, color: string, bgColor: string };
    liveClassStudents: { id: string, name: string }[];
}

export function LiveClassCard({ liveClass, getIconForClass, liveClassStudents }: LiveClassProps) {
    const [elapsedTime, setElapsedTime] = useState('00:00');

    useEffect(() => {
        const [hours, minutes] = liveClass.time.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);

        const interval = setInterval(() => {
            const currentNow = new Date();
            const diff = currentNow.getTime() - startTime.getTime();
            
            if (diff < 0) {
                setElapsedTime('00:00');
                return;
            }
            
            const elapsedSecondsTotal = Math.floor(diff / 1000);
            const elapsedMinutes = Math.floor(elapsedSecondsTotal / 60);
            const elapsedSeconds = elapsedSecondsTotal % 60;

            if (elapsedMinutes >= 60) {
                setElapsedTime('60:00');
                clearInterval(interval);
                return;
            }

            setElapsedTime(
                `${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedSeconds).padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [liveClass]);

    const iconData = getIconForClass(liveClass);

    return (
        <section className="bg-card rounded-3xl p-6 shadow-soft relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border">
            <div className="absolute left-0 top-0 h-full w-2 bg-primary"></div>
            <div className="flex items-start gap-5 w-full md:w-auto z-10">
                <div className={`w-16 h-16 rounded-2xl ${iconData.bgColor} flex items-center justify-center flex-shrink-0 ${iconData.color}`}>
                    {iconData.icon}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold uppercase tracking-wide">Ao Vivo Agora</span>
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Estúdio A
                        </span>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-foreground mb-1">{liveClass.name}</h2>
                    <p className="text-muted-foreground text-sm">Instrutor: <span className="font-medium text-foreground">{liveClass.trainer}</span></p>
                </div>
            </div>
            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end bg-muted/50 p-4 rounded-2xl border">
                <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Alunos</p>
                    <div className="flex -space-x-2 justify-center mb-1">
                        {liveClassStudents.slice(0, 3).map(person => (
                            <Tooltip key={person.id}>
                                <TooltipTrigger asChild>
                                    <Image
                                        alt={person.name}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full border-2 border-card"
                                        src={`https://i.pravatar.cc/150?img=${person.id}`}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{person.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        {liveClassStudents.length > 3 && (
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                                        +{liveClassStudents.length - 3}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <ul className="text-sm list-disc pl-4">
                                        {liveClassStudents.slice(3).map(person => (
                                            <li key={person.id}>{person.name}</li>
                                        ))}
                                    </ul>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    <p className="text-xs font-bold text-foreground">{liveClass.capacity} Presentes</p>
                </div>
                <div className="h-10 w-px bg-border"></div>
                <div className="text-center min-w-[100px]">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Tempo Decorrido</p>
                    <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold text-primary">
                        <Timer className="w-5 h-5" />
                        {elapsedTime}
                    </div>
                </div>
            </div>
        </section>
    );
}
