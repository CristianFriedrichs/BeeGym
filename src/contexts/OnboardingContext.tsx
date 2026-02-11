'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface OnboardingData {
    // Step 1
    businessType: string

    // Step 2
    organizationName: string
    documentType: 'CPF' | 'CNPJ'
    document: string
    phone: string
    email: string
    studentRange: string
    hasPhysicalLocation: boolean
    addressZip: string
    addressLine1: string
    addressNumber: string
    addressNeighborhood: string
    addressCity: string
    addressState: string

    // Step 3
    planId: string
}

interface OnboardingContextType {
    data: OnboardingData
    updateData: (updates: Partial<OnboardingData>) => void
    resetData: () => void
}

const initialData: OnboardingData = {
    businessType: '',
    organizationName: '',
    documentType: 'CPF',
    document: '',
    phone: '',
    email: '',
    studentRange: '',
    hasPhysicalLocation: false,
    addressZip: '',
    addressLine1: '',
    addressNumber: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    planId: '',
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<OnboardingData>(initialData)

    const updateData = (updates: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...updates }))
    }

    const resetData = () => {
        setData(initialData)
    }

    return (
        <OnboardingContext.Provider value={{ data, updateData, resetData }}>
            {children}
        </OnboardingContext.Provider>
    )
}

export function useOnboarding() {
    const context = useContext(OnboardingContext)
    if (!context) {
        throw new Error('useOnboarding must be used within OnboardingProvider')
    }
    return context
}
