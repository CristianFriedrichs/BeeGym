'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'

export default function OnboardingStep2() {
    const router = useRouter()
    const { toast } = useToast()
    const { data, updateData } = useOnboarding()

    const [isCepLoading, setIsCepLoading] = useState(false)
    const [formData, setFormData] = useState({
        organizationName: data.organizationName,
        documentType: data.documentType,
        document: data.document,
        phone: data.phone,
        email: data.email,
        studentRange: data.studentRange,
        hasPhysicalLocation: data.businessType === 'Personal' ? false : data.hasPhysicalLocation,
        addressZip: data.addressZip,
        addressLine1: data.addressLine1,
        addressNumber: data.addressNumber,
        addressNeighborhood: data.addressNeighborhood,
        addressCity: data.addressCity,
        addressState: data.addressState,
    })

    // Redirect if no business type selected
    useEffect(() => {
        if (!data.businessType) {
            router.push('/onboarding')
        }
    }, [data.businessType, router])

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    }

    const formatCNPJ = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    }

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1')
    }

    const formatCep = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1')
    }

    const handleCepBlur = async () => {
        const cep = formData.addressZip.replace(/\D/g, '')
        if (cep.length !== 8) return

        setIsCepLoading(true)
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
            const data = await response.json()

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    addressLine1: data.logradouro,
                    addressNeighborhood: data.bairro,
                    addressCity: data.localidade,
                    addressState: data.uf
                }))
                document.getElementById('addressNumber')?.focus()
            }
        } catch (error) {
            console.error('Erro ao buscar CEP', error)
        } finally {
            setIsCepLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        let formattedValue = value

        if (name === 'document') {
            formattedValue = formData.documentType === 'CPF' ? formatCPF(value) : formatCNPJ(value)
        } else if (name === 'phone') {
            formattedValue = formatPhone(value)
        } else if (name === 'addressZip') {
            formattedValue = formatCep(value)
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))

        // Reset document when type changes
        if (name === 'documentType') {
            setFormData(prev => ({ ...prev, document: '' }))
        }
    }

    const validateForm = () => {
        if (!formData.organizationName || !formData.document || !formData.phone || !formData.email || !formData.studentRange) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha todos os campos obrigatórios.' })
            return false
        }

        if (!formData.hasPhysicalLocation && !formData.addressZip) {
            toast({ variant: 'destructive', title: 'Endereço obrigatório', description: 'Informe o CEP do estabelecimento.' })
            return false
        }

        return true
    }

    const handleNext = () => {
        if (!validateForm()) return

        updateData(formData)
        router.push('/onboarding/step-3')
    }

    return (
        <div className="flex min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto w-full my-auto space-y-8">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Passo 2 de 4</span>
                        <span className="text-sm font-medium text-primary">66%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '66%' }} />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Dados do seu Espaço</CardTitle>
                        <CardDescription>Informe os dados principais do seu estabelecimento para continuarmos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Organization Name */}
                        <div className="space-y-2">
                            <Label>Nome do Estabelecimento *</Label>
                            <Input
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                placeholder="Ex: Studio Fitness"
                            />
                        </div>

                        {/* CPF/CNPJ */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Documento *</Label>
                                <Select value={formData.documentType} onValueChange={(v) => handleSelectChange('documentType', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CPF">CPF</SelectItem>
                                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>{formData.documentType} *</Label>
                                <Input
                                    name="document"
                                    value={formData.document}
                                    onChange={handleChange}
                                    placeholder={formData.documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0001-00'}
                                    maxLength={formData.documentType === 'CPF' ? 14 : 18}
                                />
                            </div>
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Telefone de Contato *</Label>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>E-mail Comercial *</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="contato@exemplo.com"
                                />
                            </div>
                        </div>

                        {/* Student Range */}
                        <div className="space-y-2">
                            <Label>Número de Alunos *</Label>
                            <Select value={formData.studentRange} onValueChange={(v) => handleSelectChange('studentRange', v)}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0-20">0 - 20</SelectItem>
                                    <SelectItem value="21-40">21 - 40</SelectItem>
                                    <SelectItem value="41-60">41 - 60</SelectItem>
                                    <SelectItem value="61-300">61 - 300</SelectItem>
                                    <SelectItem value="301-500">301 - 500</SelectItem>
                                    <SelectItem value="500+">Acima de 500</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Address Toggle */}
                        <div className="pt-4 border-t">
                            <div className="flex items-center space-x-2 mb-4">
                                <Switch
                                    checked={!formData.hasPhysicalLocation}
                                    onCheckedChange={(checked) => setFormData(prev => ({
                                        ...prev,
                                        hasPhysicalLocation: !checked,
                                        addressZip: checked ? '' : prev.addressZip,
                                        addressLine1: checked ? '' : prev.addressLine1,
                                        addressNumber: checked ? '' : prev.addressNumber,
                                        addressNeighborhood: checked ? '' : prev.addressNeighborhood,
                                        addressCity: checked ? '' : prev.addressCity,
                                        addressState: checked ? '' : prev.addressState,
                                    }))}
                                />
                                <Label>Não possuo local fixo (Atendimento Online/Domiciliar)</Label>
                            </div>

                            {formData.hasPhysicalLocation && (
                                <div className="grid gap-4">
                                    {/* CEP */}
                                    <div className="w-full md:w-1/3 space-y-2">
                                        <Label>CEP *</Label>
                                        <div className="relative">
                                            <Input
                                                name="addressZip"
                                                value={formData.addressZip}
                                                onChange={handleChange}
                                                onBlur={handleCepBlur}
                                                placeholder="00000-000"
                                                maxLength={9}
                                            />
                                            {isCepLoading && (
                                                <div className="absolute right-2 top-2.5">
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address + Number */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-3 space-y-2">
                                            <Label>Endereço</Label>
                                            <Input name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="Rua, Avenida..." readOnly={isCepLoading} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Número</Label>
                                            <Input id="addressNumber" name="addressNumber" value={formData.addressNumber} onChange={handleChange} placeholder="123" />
                                        </div>
                                    </div>

                                    {/* Neighborhood + City + State */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Bairro</Label>
                                            <Input name="addressNeighborhood" value={formData.addressNeighborhood} onChange={handleChange} placeholder="Bairro" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Cidade</Label>
                                            <Input name="addressCity" value={formData.addressCity} onChange={handleChange} placeholder="Cidade" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>UF</Label>
                                            <Input name="addressState" value={formData.addressState} onChange={handleChange} placeholder="UF" maxLength={2} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => router.push('/onboarding')}>Voltar</Button>
                        <Button onClick={handleNext}>Próximo</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
