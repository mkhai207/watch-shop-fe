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
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress
} from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'

interface Message {
  sender: 'user' | 'bot'
  text: string
  sources?: Array<{
    id: string
    name: string
    price: number
    thumbnail: string
    description: string
    gender: string
    category: string
  }>
}

// Hàm tiện ích để xóa lịch sử trò chuyện
export const clearChatHistory = () => {
  if (typeof window !== 'undefined' && localStorage) {
    try {
      localStorage.removeItem('chatMessages')
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
        const savedMessages = localStorage.getItem('chatMessages')

        return savedMessages ? JSON.parse(savedMessages) : []
      } catch (error) {
        console.error('Lỗi khi đọc localStorage:', error)

        return []
      }
    }

    return []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false) // Trạng thái loading
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Lưu messages vào localStorage khi thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage) {
      try {
        localStorage.setItem('chatMessages', JSON.stringify(messages))
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

    const userMsg: Message = { sender: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true) // Bắt đầu loading

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      })

      const data = await response.json()
      console.log('Dữ liệu trả về từ backend:', data)
      if (data.sources) {
        console.log('Sources:', data.sources)
      }

      const botMsg: Message = {
        sender: 'bot',
        text: data.answer || 'Không có phản hồi từ hệ thống.',
        sources: data.sources || []
      }

      setMessages(prev => [...prev, botMsg])
    } catch (error) {
      console.error('Lỗi khi gọi API:', error)
      setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' }])
    } finally {
      setIsLoading(false) // Kết thúc loading
    }
  }

  const handleClearChatHistory = () => {
    setMessages([])
    clearChatHistory()
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 10000 }}>
      {open ? (
        <Paper
          sx={{
            width: { xs: 320, sm: 360 },
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fff',
            color: '#000',
            borderRadius: 2,
            boxShadow: 8,
            border: '1px solid #ddd'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #eee'
            }}
          >
            <Box display='flex' alignItems='center'>
              <Avatar src='/images/chatbot.png' alt='Chatbot Avatar' sx={{ width: 35, height: 35 }} />
              <Typography fontWeight='bold'>Trợ lý ảo</Typography>
            </Box>
            <Box>
              <IconButton onClick={handleClearChatHistory} size='small' sx={{ mr: 1 }}>
                <Typography variant='caption'>Xóa lịch sử</Typography>
              </IconButton>
              <IconButton onClick={() => setOpen(false)} size='small'>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Chat messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1, bgcolor: '#f9f9f9' }}>
            <List>
              {messages.map((msg, index) => (
                <ListItem
                  key={index}
                  sx={{ flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <Paper
                    sx={{
                      px: 2,
                      py: 1,
                      maxWidth: '70%',
                      bgcolor: msg.sender === 'user' ? '#DCF8C6' : '#F1F0F0',
                      color: '#000',
                      borderRadius: 2,
                      boxShadow: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText primary={msg.text} />
                  </Paper>
                  {msg.sender === 'bot' && msg.sources && msg.sources.length > 0 && (
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 'bold' }}>
                        Sản phẩm gợi ý ({msg.sources.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {msg.sources.map(source => (
                          <Grid item xs={6} key={source.id}>
                            <a href={`/product/${source.id}`} style={{ textDecoration: 'none' }}>
                              <Card sx={{ '&:hover': { opacity: 0.9 }, transition: 'opacity 0.2s' }}>
                                <CardMedia
                                  component='img'
                                  height='120'
                                  image={source.thumbnail || '/default-image.jpg'}
                                  alt={source.name || 'Sản phẩm không tên'}
                                  sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ p: 1, textAlign: 'center' }}>
                                  <Typography variant='body2' fontWeight='medium'>
                                    {source.name || 'Không có tên'}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {source.price ? `${source.price.toLocaleString('vi-VN')} VNĐ` : 'Không có giá'}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </a>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
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
                    <CircularProgress size={20} />
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
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder='Nhập tin nhắn...'
              size='small'
              disabled={isLoading}
            />
            <IconButton onClick={handleSend} sx={{ ml: 1, color: '#1976d2' }} disabled={isLoading}>
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
