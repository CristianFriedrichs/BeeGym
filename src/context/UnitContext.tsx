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

                // Fetch units for this organization (NO FILTER ON ACTIVE)
                const { data: units, error } = await supabase
                    .from('units')
                    .select('*')
                    .eq('organization_id', userData.organization_id);

                // Even if there's an error, try to proceed if we have units
                if (error) {
                    console.warn('Error fetching units (proceeding anyway):', error);
                }

                // If no units exist, we can't proceed
                if (!units || units.length === 0) {
                    console.error('No units found for organization:', userData.organization_id);
                    setIsLoading(false);
                    return;
                }

                // Check if there's already a stored unit ID
                const storedUnitId = localStorage.getItem('currentUnitId');
                const storedUnitExists = units.some(u => u.id === storedUnitId);

                if (storedUnitId && storedUnitExists) {
                    // Use stored unit if it still exists
                    setCurrentUnitIdState(storedUnitId);
                } else {
                    // Auto-select the first unit (or first active one if available)
                    const activeUnit = units.find(u => u.active === true) || units[0];
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
