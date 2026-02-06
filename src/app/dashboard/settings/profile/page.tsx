'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save, Upload } from 'lucide-react';

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPublicProfile, setShowPublicProfile] = useState(true);
    const [fullName, setFullName] = useState('');
    const [professionalTitle, setProfessionalTitle] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [whatsappNotifications, setWhatsappNotifications] = useState(false);
    const { toast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        async function fetchProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                setUserId(user.id);

                // Get user profile data from public.users table
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user data:', error);
                    // Fallback to auth metadata if table query fails
                    setFullName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
                    return;
                }

                if (userData) {
                    setFullName(userData.name || '');
                    setProfessionalTitle(userData.professional_title || '');
                    setBio(userData.bio || '');
                    setAvatarUrl(userData.avatar_url || '');
                    setShowPublicProfile(userData.show_public_profile ?? true);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!userId) return;
        setIsSaving(true);

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: fullName,
                    professional_title: professionalTitle,
                    bio: bio,
                    show_public_profile: showPublicProfile,
                })
                .eq('id', userId);

            if (error) throw error;

            toast({
                title: 'Perfil Atualizado!',
                description: 'Suas informações foram salvas com sucesso.',
                className: 'bg-[#ff8c00] text-white border-none',
            });

            // Force header to refresh by dispatching custom event
            window.dispatchEvent(new CustomEvent('userProfileUpdated'));

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro ao salvar',
                description: error.message || 'Tente novamente mais tarde.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex justify-center">
                <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                        <AvatarImage src={avatarUrl} alt={fullName} />
                        <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                            {getInitials(fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        size="icon"
                        variant="outline"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background"
                    >
                        <Upload className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Profile Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Perfil Público</CardTitle>
                    <CardDescription>Esta informação será exibida para seus alunos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Public Profile Toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                            <Label htmlFor="show-profile" className="font-medium">Mostrar perfil público?</Label>
                            <p className="text-sm text-muted-foreground">
                                Se desativado, seu perfil não aparecerá para os alunos.
                            </p>
                        </div>
                        <Switch
                            id="show-profile"
                            checked={showPublicProfile}
                            onCheckedChange={setShowPublicProfile}
                        />
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo *</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Seu nome completo"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="professionalTitle">Cargo / Título Profissional</Label>
                            <Input
                                id="professionalTitle"
                                value={professionalTitle}
                                onChange={(e) => setProfessionalTitle(e.target.value)}
                                placeholder="Ex: Personal Trainer, Nutricionista"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio / Descrição</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Conte um pouco sobre você e sua experiência profissional..."
                            className="min-h-[120px] resize-none"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#ff8c00] hover:bg-[#e67e00] text-white"
                        >
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Salvar Alterações
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Preferences Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Preferências de Notificação</CardTitle>
                    <CardDescription>Escolha como você deseja receber alertas importantes do sistema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                            <Label htmlFor="email-notifications" className="font-medium">Notificações por E-mail</Label>
                            <p className="text-sm text-muted-foreground">
                                Receber resumos e alertas via e-mail
                            </p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                        />
                    </div>

                    {/* WhatsApp Notifications */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                            <Label htmlFor="whatsapp-notifications" className="font-medium">Notificações por WhatsApp</Label>
                            <p className="text-sm text-muted-foreground">
                                Receber avisos urgentes via WhatsApp
                            </p>
                        </div>
                        <Switch
                            id="whatsapp-notifications"
                            checked={whatsappNotifications}
                            onCheckedChange={setWhatsappNotifications}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
