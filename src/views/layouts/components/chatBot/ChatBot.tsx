import {
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button
} from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'

interface Message {
  sender: 'user' | 'bot'
  text: string
  timestamp?: Date
}

interface RasaResponse {
  recipient_id: string
  text: string
}

// Hàm tiện ích để xóa lịch sử trò chuyện
export const clearChatHistory = () => {
  if (typeof window !== 'undefined' && localStorage) {
    try {
      localStorage.removeItem('rasaChatMessages')
    } catch (error) {
      console.error('Lỗi khi xóa localStorage:', error)
    }
  }
}

const ChatBot = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined' && localStorage) {
      try {
        const savedMessages = localStorage.getItem('rasaChatMessages')
        return savedMessages ? JSON.parse(savedMessages) : []
      } catch (error) {
        console.error('Lỗi khi đọc localStorage:', error)
        return []
      }
    }
    return []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Lưu messages vào localStorage khi thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage) {
      try {
        localStorage.setItem('rasaChatMessages', JSON.stringify(messages))
      } catch (error) {
        console.error('Lỗi khi lưu localStorage:', error)
      }
    }
  }, [messages])

  // Cuộn xuống cuối khi mở khung chat hoặc có tin nhắn mới
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages, isLoading])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: Message = {
      sender: 'user',
      text: input,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Gửi tin nhắn đến Rasa server
      const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: sessionId,
          message: input
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: RasaResponse[] = await response.json()
      console.log('Dữ liệu trả về từ Rasa:', data)

      // Xử lý phản hồi từ Rasa
      if (data && data.length > 0) {
        // Rasa có thể trả về nhiều tin nhắn
        data.forEach((item, index) => {
          setTimeout(() => {
            const botMsg: Message = {
              sender: 'bot',
              text: item.text || 'Không có phản hồi từ hệ thống.',
              timestamp: new Date()
            }
            setMessages(prev => [...prev, botMsg])
          }, index * 500) // Delay giữa các tin nhắn
        })
      } else {
        const botMsg: Message = {
          sender: 'bot',
          text: 'Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về sản phẩm, giá cả, hoặc thông tin cửa hàng.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMsg])
      }
    } catch (error) {
      console.error('Lỗi khi gọi Rasa API:', error)
      const botMsg: Message = {
        sender: 'bot',
        text: 'Xin lỗi, có lỗi xảy ra khi kết nối với hệ thống. Vui lòng thử lại sau.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChatHistory = () => {
    setMessages([])
    clearChatHistory()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 10000 }}>
      {open ? (
        <Paper
          sx={{
            width: { xs: 320, sm: 400 },
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fff',
            color: '#000',
            borderRadius: '8px',
            boxShadow: 8,
            border: '1px solid #ddd',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #eee',
              bgcolor: 'primary.main',
              color: 'white'
            }}
          >
            <Box display='flex' alignItems='center'>
              <Avatar src='/images/chatbot.png' alt='Chatbot Avatar' sx={{ width: 35, height: 35, mr: 1 }} />
              <Typography fontWeight='bold'>Trợ lý ảo</Typography>
            </Box>
            <Box>
              <Button
                onClick={handleClearChatHistory}
                size='small'
                sx={{
                  mr: 1,
                  color: 'white',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                Xóa
              </Button>
              <IconButton onClick={() => setOpen(false)} size='small' sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Chat messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1, bgcolor: '#f9f9f9' }}>
            <List>
              {messages.length === 0 && (
                <ListItem sx={{ justifyContent: 'center', flexDirection: 'column', py: 4 }}>
                  <Avatar src='/images/chatbot.png' alt='Chatbot' sx={{ width: 48, height: 48, mb: 2 }} />
                  <Typography variant='body2' color='text.secondary' textAlign='center'>
                    Xin chào! Tôi là trợ lý ảo của CHRONOS.
                    <br />
                    Tôi có thể giúp bạn tìm hiểu về sản phẩm, giá cả và thông tin cửa hàng.
                  </Typography>
                </ListItem>
              )}
              {messages.map((msg, index) => (
                <ListItem
                  key={index}
                  sx={{
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    py: 0.5
                  }}
                >
                  <Paper
                    sx={{
                      px: 2,
                      py: 1,
                      maxWidth: '80%',
                      bgcolor: msg.sender === 'user' ? 'primary.main' : '#F1F0F0',
                      color: msg.sender === 'user' ? 'white' : '#000',
                      borderRadius: 2,
                      boxShadow: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemText
                      primary={msg.text}
                      secondary={msg.timestamp ? formatTime(msg.timestamp) : undefined}
                      secondaryTypographyProps={{
                        fontSize: '0.7rem',
                        color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                      }}
                    />
                  </Paper>
                </ListItem>
              ))}
              {/* Biểu tượng loading */}
              {isLoading && (
                <ListItem sx={{ justifyContent: 'flex-start' }}>
                  <Paper
                    sx={{
                      px: 2,
                      py: 1,
                      maxWidth: '70%',
                      bgcolor: '#F1F0F0',
                      color: '#000',
                      borderRadius: 2,
                      boxShadow: 1,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CircularProgress size={16} />
                    <Typography variant='body2' color='text.secondary'>
                      Đang xử lý...
                    </Typography>
                  </Paper>
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          {/* Input box */}
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#fff'
            }}
          >
            <TextField
              variant='outlined'
              fullWidth
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder='Nhập tin nhắn...'
              size='small'
              disabled={isLoading}
              multiline
              maxRows={3}
            />
            <IconButton
              onClick={handleSend}
              sx={{
                ml: 1,
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.light', color: 'white' }
              }}
              disabled={isLoading || !input.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      ) : (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: '#ffffff',
            p: 0,
            borderRadius: '50%',
            boxShadow: 4,
            width: 64,
            height: 64,
            '&:hover': { opacity: 0.9 }
          }}
        >
          <img
            src='/images/chatbot.png'
            alt='Chatbot Icon'
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        </IconButton>
      )}
    </Box>
  )
}

export default ChatBot
