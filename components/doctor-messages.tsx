"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search, Phone, Video, MoreVertical, Paperclip, FileText } from "lucide-react"
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
  patientId: string
  patientName: string
  patientAge: number
  patientAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  priority: "low" | "medium" | "high"
  messages: Message[]
}

const conversations: Conversation[] = [
  {
    id: 1,
    patientId: "patient-jane",
    patientName: "Jane Doe",
    patientAge: 38,
    patientAvatar: "/placeholder.svg?height=40&width=40&text=JD",
    lastMessage: "Thank you for reviewing my blood pressure readings, Dr. Johnson.",
    lastMessageTime: "2024-01-20 15:45",
    unreadCount: 1,
    priority: "medium",
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
        content: "Continue with your current medication regimen. Let's schedule a follow-up in 3 months.",
        timestamp: "2024-01-20 14:30",
        read: true,
      },
      {
        id: 4,
        senderId: "patient-jane",
        senderName: "Jane Doe",
        senderType: "patient",
        content: "Thank you for reviewing my blood pressure readings, Dr. Johnson.",
        timestamp: "2024-01-20 15:45",
        read: false,
      },
    ],
  },
  {
    id: 2,
    patientId: "patient-john",
    patientName: "John Smith",
    patientAge: 45,
    patientAvatar: "/placeholder.svg?height=40&width=40&text=JS",
    lastMessage: "I'm experiencing some side effects from the new medication.",
    lastMessageTime: "2024-01-20 11:30",
    unreadCount: 2,
    priority: "high",
    messages: [
      {
        id: 1,
        senderId: "patient-john",
        senderName: "John Smith",
        senderType: "patient",
        content: "Hi Dr. Johnson, I started the new medication you prescribed yesterday.",
        timestamp: "2024-01-20 09:00",
        read: true,
      },
      {
        id: 2,
        senderId: "patient-john",
        senderName: "John Smith",
        senderType: "patient",
        content: "I'm experiencing some side effects from the new medication.",
        timestamp: "2024-01-20 11:30",
        read: false,
      },
    ],
  },
  {
    id: 3,
    patientId: "patient-mary",
    patientName: "Mary Johnson",
    patientAge: 62,
    patientAvatar: "/placeholder.svg?height=40&width=40&text=MJ",
    lastMessage: "Thank you for the lab results explanation.",
    lastMessageTime: "2024-01-19 16:20",
    unreadCount: 0,
    priority: "low",
    messages: [
      {
        id: 1,
        senderId: "dr-sarah-johnson",
        senderName: "Dr. Sarah Johnson",
        senderType: "doctor",
        content:
          "Hi Mary, your lab results came in. Everything looks normal. Your cholesterol levels have improved significantly.",
        timestamp: "2024-01-19 14:00",
        read: true,
      },
      {
        id: 2,
        senderId: "patient-mary",
        senderName: "Mary Johnson",
        senderType: "patient",
        content: "Thank you for the lab results explanation.",
        timestamp: "2024-01-19 16:20",
        read: true,
      },
    ],
  },
]

export function DoctorMessages() {
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
      senderId: "dr-sarah-johnson",
      senderName: "Dr. Sarah Johnson",
      senderType: "doctor",
      content: newMessage,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      read: true,
    }

    // In a real app, this would send the message to the server
    selectedConversation.messages.push(message)
    selectedConversation.lastMessage = newMessage
    selectedConversation.lastMessageTime = message.timestamp
    selectedConversation.unreadCount = 0

    setNewMessage("")
  }

  const markAsRead = (conversationId: number) => {
    const conversation = conversations.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
      conversation.messages.forEach((message) => {
        if (message.senderType === "patient") {
          message.read = true
        }
      })
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.patientName.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Patient Messages</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} Unread</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Patient Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
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
                    onClick={() => {
                      setSelectedConversation(conversation)
                      markAsRead(conversation.id)
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={conversation.patientAvatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {conversation.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{conversation.patientName}</p>
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
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">Age: {conversation.patientAge}</p>
                          <Badge variant={getPriorityColor(conversation.priority)} className="text-xs">
                            {conversation.priority}
                          </Badge>
                        </div>
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
                      <AvatarImage src={selectedConversation.patientAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedConversation.patientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.patientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Age: {selectedConversation.patientAge} • Priority: {selectedConversation.priority}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                      Records
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>View Patient Profile</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                        <DropdownMenuItem>Add to Priority</DropdownMenuItem>
                        <DropdownMenuItem>Archive Conversation</DropdownMenuItem>
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
                        className={`flex ${message.senderType === "doctor" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderType === "doctor" ? "bg-primary text-primary-foreground" : "bg-muted"
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
                <p className="text-muted-foreground">Choose a patient from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
