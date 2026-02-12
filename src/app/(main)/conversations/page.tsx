'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send, Check, CheckCheck, Archive, Trash2, MoreVertical, MoreHorizontal, Paperclip, Mic, Smile, Copy, ArrowRight as ForwardIcon, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const users: { [key: string]: { id: string|number; name: string; role: string; avatar: string; } } = {
  "user_professional": { id: "user_professional", name: "Kristin Watson", role: "Personal", avatar: "https://i.pravatar.cc/150?img=32" },
  "4": { id: 4, name: "Ana Clara", role: "Aluno", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop" },
  "2": { id: 2, name: "Carlos Andrade", role: "Aluno", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop" },
  "3": { id: 3, name: "Mariana Costa", role: "Aluno", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&h=256&fit=crop" }
};

const initialConversationsData = [
  {
    id: 'convo_4',
    participantIds: ['user_professional', '4'],
    lastMessage: "Ok, muito obrigada! Até amanhã.",
    lastMessageTimestamp: "2024-07-30T10:42:00.000Z",
    unread: 0,
    status: "read",
    archived: false,
  },
  {
    id: 'convo_2',
    participantIds: ['user_professional', '2'],
    lastMessage: "Perfeito! Treino novo na sexta então.",
    lastMessageTimestamp: "2024-07-29T15:30:00.000Z",
    unread: 2,
    status: "sent",
    archived: false,
  },
  {
    id: 'convo_3',
    participantIds: ['user_professional', '3'],
    lastMessage: "Qual o foco do treino de hoje?",
    lastMessageTimestamp: "2024-07-28T11:00:00.000Z",
    unread: 0,
    status: "delivered",
    archived: true,
  },
];

type Conversation = typeof initialConversationsData[0];

type Message = {
    id: number;
    content: string;
    senderId: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
    isDeleted?: boolean;
}

const initialMessagesData: { [key: string]: Message[] } = {
    'convo_4': [
        { id: 1, content: "Olá! Seu novo plano de treinos para esta semana já está disponível no app. Qualquer dúvida é só chamar!", senderId: 'user_professional', timestamp: "2024-07-30T10:40:00.000Z", status: "read"},
        { id: 2, content: "Ok, muito obrigada! Até amanhã.", senderId: '4', timestamp: "2024-07-30T10:42:00.000Z", status: "read" },
    ],
    'convo_2': [
         { id: 3, content: "Carlos, tudo bem? Ajustei seu treino para focar mais em cardio, como pediu.", senderId: 'user_professional', timestamp: "2024-07-29T15:28:00.000Z", status: "sent"},
         { id: 4, content: "Perfeito! Treino novo na sexta então.", senderId: '2', timestamp: "2024-07-29T15:30:00.000Z", status: "sent" },
    ],
    'convo_3': [
        { id: 5, content: "Qual o foco do treino de hoje?", senderId: '3', timestamp: "2024-07-28T11:00:00.000Z", status: "delivered" }
    ]
};

const MessageStatus = ({ status }: { status: string }) => {
    if (status === 'read') return <CheckCheck className="h-4 w-4 text-blue-500" />;
    if (status === 'delivered') return <CheckCheck className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
}

const formatTimestamp = (isoString: string) => {
    const date = parseISO(isoString);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Ontem';
    return format(date, 'dd/MM/yy');
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState(initialConversationsData);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, archived
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (!selectedConversation) return;
    try {
        const storedMessages = localStorage.getItem(`chat_messages_${selectedConversation.id}`);
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        } else {
            const initial = initialMessagesData[selectedConversation.id as keyof typeof initialMessagesData] || [];
            setMessages(initial);
            if(initial.length > 0) localStorage.setItem(`chat_messages_${selectedConversation.id}`, JSON.stringify(initial));
        }
    } catch (error) {
        console.error("Could not access localStorage", error);
        setMessages(initialMessagesData[selectedConversation.id as keyof typeof initialMessagesData] || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      const lastMsg = messages[messages.length - 1];
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
        ? { ...c, lastMessage: lastMsg.isDeleted ? 'Mensagem removida' : lastMsg.content, lastMessageTimestamp: lastMsg.timestamp }
        : c
      ));
    }
  }, [messages, selectedConversation]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageToSend: Message = {
        id: Date.now(),
        content: newMessage,
        senderId: 'user_professional',
        timestamp: new Date().toISOString(),
        status: 'sent'
    };

    const updatedMessages = [...messages, messageToSend];
    setMessages(updatedMessages);
    try {
        localStorage.setItem(`chat_messages_${selectedConversation.id}`, JSON.stringify(updatedMessages));
    } catch(error) {
        console.error("Could not write to localStorage", error);
    }
    setNewMessage('');
  };

  const handleDeleteMessage = (messageId: number) => {
    if (!selectedConversation) return;

    const updatedMessages = messages.map(msg =>
      msg.id === messageId
        ? { ...msg, content: 'Mensagem removida', isDeleted: true }
        : msg
    );
    setMessages(updatedMessages);
    try {
      localStorage.setItem(`chat_messages_${selectedConversation.id}`, JSON.stringify(updatedMessages));
      toast({ title: 'Mensagem excluída.' });
    } catch (error) {
      console.error('Could not write to localStorage', error);
      toast({ title: 'Erro ao excluir mensagem.', variant: 'destructive' });
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Mensagem copiada!' });
  };
  
  const handleForwardMessage = () => {
      toast({ title: 'Encaminhar (em desenvolvimento)' });
  };
  
  const handleAction = (action: 'archive' | 'delete') => {
    if(!selectedConversation) return;

    if (action === 'delete') {
      // Soft delete
      setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
      toast({ title: `Conversa excluída.`});
    } else {
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id ? { ...c, archived: !c.archived } : c
      ));
      toast({ title: `Conversa ${selectedConversation.archived ? 'desarquivada' : 'arquivada'}.`});
    }
    setSelectedConversation(undefined);
  }

  const filteredConversations = conversations
    .filter(c => {
        const otherParticipantId = c.participantIds.find(pId => pId !== 'user_professional') as keyof typeof users;
        const otherParticipant = users[otherParticipantId];
        if (!otherParticipant) return false;
        
        const matchesSearch = otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()) || otherParticipant.role.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        if(filter === 'unread') return c.unread > 0 && !c.archived;
        if(filter === 'archived') return c.archived;
        if(filter === 'all') return !c.archived;
        return true;
    })
    .sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    
  const otherParticipant = selectedConversation ? users[selectedConversation.participantIds.find(pId => pId !== 'user_professional') as keyof typeof users] : null;

  return (
    <div className="h-full flex bg-card border md:rounded-2xl overflow-hidden">
      <div className={cn(
        "w-full md:w-1/3 lg:w-1/4 border-r flex flex-col",
        selectedConversation ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">Conversas</h2>
            <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquisar por nome ou papel..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-1 mt-2">
                <Button size="sm" variant={filter === 'all' ? 'secondary' : 'ghost'} onClick={() => setFilter('all')}>Todas</Button>
                <Button size="sm" variant={filter === 'unread' ? 'secondary' : 'ghost'} onClick={() => setFilter('unread')}>Não lidas</Button>
                <Button size="sm" variant={filter === 'archived' ? 'secondary' : 'ghost'} onClick={() => setFilter('archived')}>Arquivadas</Button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(convo => {
                const participantId = convo.participantIds.find(pId => pId !== 'user_professional') as keyof typeof users;
                const participant = users[participantId];
                if (!participant) return null;
                return (
                <div 
                    key={convo.id} 
                    className={cn(
                      "p-4 flex items-start gap-4 cursor-pointer hover:bg-muted/50",
                      selectedConversation?.id === convo.id && 'bg-muted'
                    )}
                    onClick={() => setSelectedConversation(convo)}
                    >
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold truncate">{participant.name}</p>
                            {isClient && <p className="text-xs text-muted-foreground">{formatTimestamp(convo.lastMessageTimestamp)}</p>}
                        </div>
                         <div className="flex justify-between items-start mt-1">
                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                            {convo.unread > 0 && <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center">{convo.unread}</Badge>}
                        </div>
                    </div>
                </div>
            )})}
             {filteredConversations.length === 0 && (
                <div className="text-center p-8 text-sm text-muted-foreground">
                    Nenhuma conversa encontrada.
                </div>
            )}
        </div>
      </div>

      {!selectedConversation && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-background">
          <div className="text-center">
            <h3 className="text-xl font-semibold">Selecione uma conversa</h3>
            <p className="text-muted-foreground">Comece a se comunicar com seus alunos e equipe.</p>
          </div>
        </div>
      )}

      {selectedConversation && otherParticipant && (
        <div className="flex-1 flex flex-col bg-background">
          <div className="p-4 border-b bg-card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(undefined)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
                      <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                      <p className="font-semibold">{otherParticipant.name}</p>
                      <p className="text-xs text-muted-foreground">{otherParticipant.role}</p>
                  </div>
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleAction('archive')}><Archive className="mr-2 h-4 w-4" /> {selectedConversation.archived ? 'Desarquivar' : 'Arquivar'} Conversa</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => handleAction('delete')}><Trash2 className="mr-2 h-4 w-4" /> Excluir Conversa</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                  {messages.map(msg => {
                      const sender = msg.senderId === 'user_professional' ? users['user_professional'] : users[msg.senderId];
                      const isMyMessage = msg.senderId === 'user_professional';
                      return (
                      <div key={msg.id} className={cn("flex items-end gap-2 group relative", isMyMessage ? 'justify-end' : 'justify-start')}>
                          {!isMyMessage && (
                              <Avatar className="h-8 w-8">
                                  <AvatarImage src={sender?.avatar} />
                                  <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                          )}
                          <div className={cn("max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl relative", isMyMessage ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none border')}>
                            <div className={cn("absolute top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity", isMyMessage ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1")}>
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast({title: 'Reações (em breve)'})}>
                                    <Smile className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={isMyMessage ? "start" : "end"}>
                                        <DropdownMenuItem onSelect={() => handleCopyMessage(msg.content)}>
                                            <Copy className="mr-2 h-4 w-4" /> Copiar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={handleForwardMessage}>
                                            <ForwardIcon className="mr-2 h-4 w-4" /> Encaminhar
                                        </DropdownMenuItem>
                                        {isMyMessage && !msg.isDeleted && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => handleDeleteMessage(msg.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <p className={cn("text-sm", msg.isDeleted && "italic text-muted-foreground/80")}>{msg.content}</p>
                            <div className="flex items-center justify-end gap-1.5 mt-1.5">
                                {isClient && <p className={cn("text-xs opacity-70", isMyMessage ? "text-primary-foreground/70" : "text-muted-foreground")}>{format(new Date(msg.timestamp), "HH:mm")}</p>}
                                {isMyMessage && <MessageStatus status={msg.status} />}
                            </div>
                          </div>
                          {isMyMessage && (
                              <Avatar className="h-8 w-8">
                                  <AvatarImage src={sender?.avatar} />
                                  <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                          )}
                      </div>
                  )})}
                   <div ref={messagesEndRef} />
              </div>
          </div>

          <div className="p-4 bg-card border-t">
              <form className="relative" onSubmit={(e) => {e.preventDefault(); handleSendMessage();}}>
                  <div className="relative rounded-lg border bg-muted/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
                      <Textarea
                          placeholder="Digite uma mensagem..."
                          className="bg-transparent border-0 pr-32 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[48px]"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                              }
                          }}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" type="button" onClick={() => toast({title: 'Anexar (em breve)'})}>
                                <Paperclip className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" type="button" onClick={() => toast({title: 'Gravar áudio (em breve)'})}>
                                <Mic className="h-4 w-4" />
                            </Button>
                          <Button size="icon" type="submit" className="h-8 w-8">
                              <Send className="h-4 w-4" />
                          </Button>
                      </div>
                  </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
}
