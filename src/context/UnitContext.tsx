'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UnitContextType {
    currentUnitId: string | null;
    setCurrentUnitId: (id: string | null) => void;
    isLoading: boolean;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: ReactNode }) {
    const [currentUnitId, setCurrentUnitIdState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function initializeUnit() {
            try {
                // Get authenticated user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                // Get user's organization
                const { data: userData } = await supabase
                    .from('users')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!userData?.organization_id) {
                    setIsLoading(false);
                    return;
                }

                // Fetch units for this organization
                const { data: units, error } = await supabase
                    .from('units')
                    .select('*')
                    .eq('organization_id', userData.organization_id)
                    .eq('active', true);

                if (error || !units || units.length === 0) {
                    console.error('No units found:', error);
                    setIsLoading(false);
                    return;
                }

                // Check if there's already a stored unit ID
                const storedUnitId = localStorage.getItem('currentUnitId');
                const storedUnitExists = units.some(u => u.id === storedUnitId);

                if (storedUnitId && storedUnitExists) {
                    // Use stored unit if it still exists
                    setCurrentUnitIdState(storedUnitId);
                } else if (units.length === 1) {
                    // Auto-select if only one unit exists
                    const unitId = units[0].id;
                    setCurrentUnitIdState(unitId);
                    localStorage.setItem('currentUnitId', unitId);
                } else {
                    // Multiple units: select first active one
                    const activeUnit = units.find(u => u.active) || units[0];
                    setCurrentUnitIdState(activeUnit.id);
                    localStorage.setItem('currentUnitId', activeUnit.id);
                }

                // Store units data for Header display
                localStorage.setItem('units_data', JSON.stringify(units));
            } catch (err) {
                console.error('Error initializing unit:', err);
            } finally {
                setIsLoading(false);
            }
        }

        initializeUnit();
    }, []);

    const setCurrentUnitId = (id: string | null) => {
        setCurrentUnitIdState(id);
        if (id) {
            localStorage.setItem('currentUnitId', id);
        } else {
            localStorage.removeItem('currentUnitId');
        }
        // Dispatch custom event for components that aren't using context
        window.dispatchEvent(new Event('storage-update'));
    };

    return (
        <UnitContext.Provider value={{ currentUnitId, setCurrentUnitId, isLoading }}>
            {children}
        </UnitContext.Provider>
    );
}

export function useUnit() {
    const context = useContext(UnitContext);
    if (context === undefined) {
        throw new Error('useUnit must be used within a UnitProvider');
    }
    return context;
}
