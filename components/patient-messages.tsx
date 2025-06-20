"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search, Phone, Video, MoreVertical, Paperclip } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  id: number
  senderId: string
  senderName: string
  senderType: "patient" | "doctor"
  content: string
  timestamp: string
  read: boolean
  attachments?: string[]
}

interface Conversation {
  id: number
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  doctorAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
}

const conversations: Conversation[] = [
  {
    id: 1,
    doctorId: "dr-sarah-johnson",
    doctorName: "Dr. Sarah Johnson",
    doctorSpecialty: "Cardiologist",
    doctorAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
    lastMessage: "Your blood pressure readings look good. Continue with current medication.",
    lastMessageTime: "2024-01-20 14:30",
    unreadCount: 0,
    messages: [
      {
        id: 1,
        senderId: "patient-jane",
        senderName: "Jane Doe",
        senderType: "patient",
        content:
          "Hi Dr. Johnson, I've been taking my blood pressure medication as prescribed. Here are my recent readings.",
        timestamp: "2024-01-20 10:00",
        read: true,
        attachments: ["blood_pressure_log.pdf"],
      },
      {
        id: 2,
        senderId: "dr-sarah-johnson",
        senderName: "Dr. Sarah Johnson",
        senderType: "doctor",
        content:
          "Thank you for sharing your readings, Jane. I've reviewed them and they look very good. Your blood pressure is well controlled.",
        timestamp: "2024-01-20 14:15",
        read: true,
      },
      {
        id: 3,
        senderId: "dr-sarah-johnson",
        senderName: "Dr. Sarah Johnson",
        senderType: "doctor",
        content: "Your blood pressure readings look good. Continue with current medication.",
        timestamp: "2024-01-20 14:30",
        read: true,
      },
    ],
  },
  {
    id: 2,
    doctorId: "dr-michael-brown",
    doctorName: "Dr. Michael Brown",
    doctorSpecialty: "General Practitioner",
    doctorAvatar: "/placeholder.svg?height=40&width=40&text=MB",
    lastMessage: "Don't forget about your annual physical next week.",
    lastMessageTime: "2024-01-19 16:45",
    unreadCount: 1,
    messages: [
      {
        id: 1,
        senderId: "dr-michael-brown",
        senderName: "Dr. Michael Brown",
        senderType: "doctor",
        content:
          "Hi Jane, this is a reminder about your annual physical examination scheduled for next week on January 25th at 2:30 PM.",
        timestamp: "2024-01-19 16:40",
        read: true,
      },
      {
        id: 2,
        senderId: "dr-michael-brown",
        senderName: "Dr. Michael Brown",
        senderType: "doctor",
        content: "Don't forget about your annual physical next week.",
        timestamp: "2024-01-19 16:45",
        read: false,
      },
    ],
  },
  {
    id: 3,
    doctorId: "dr-emily-davis",
    doctorName: "Dr. Emily Davis",
    doctorSpecialty: "Endocrinologist",
    doctorAvatar: "/placeholder.svg?height=40&width=40&text=ED",
    lastMessage: "Your HbA1c results are excellent! Keep up the good work.",
    lastMessageTime: "2024-01-18 11:20",
    unreadCount: 0,
    messages: [
      {
        id: 1,
        senderId: "patient-jane",
        senderName: "Jane Doe",
        senderType: "patient",
        content: "Hi Dr. Davis, I received my lab results. Could you please review them?",
        timestamp: "2024-01-18 09:00",
        read: true,
      },
      {
        id: 2,
        senderId: "dr-emily-davis",
        senderName: "Dr. Emily Davis",
        senderType: "doctor",
        content:
          "I've reviewed your HbA1c results and they're excellent at 6.8%! This shows your diabetes is very well controlled.",
        timestamp: "2024-01-18 11:15",
        read: true,
      },
      {
        id: 3,
        senderId: "dr-emily-davis",
        senderName: "Dr. Emily Davis",
        senderType: "doctor",
        content: "Your HbA1c results are excellent! Keep up the good work.",
        timestamp: "2024-01-18 11:20",
        read: true,
      },
    ],
  },
]

export function PatientMessages() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: selectedConversation.messages.length + 1,
      senderId: "patient-jane",
      senderName: "Jane Doe",
      senderType: "patient",
      content: newMessage,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      read: true,
    }

    // In a real app, this would send the message to the server
    selectedConversation.messages.push(message)
    selectedConversation.lastMessage = newMessage
    selectedConversation.lastMessageTime = message.timestamp

    setNewMessage("")
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.doctorSpecialty.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 p-4">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={conversation.doctorAvatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {conversation.doctorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{conversation.doctorName}</p>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{conversation.doctorSpecialty}</p>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedConversation.doctorAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedConversation.doctorName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.doctorName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedConversation.doctorSpecialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                        <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === "patient" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderType === "patient" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center space-x-2 text-xs opacity-80">
                                  <Paperclip className="h-3 w-3" />
                                  <span>{attachment}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a doctor from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
