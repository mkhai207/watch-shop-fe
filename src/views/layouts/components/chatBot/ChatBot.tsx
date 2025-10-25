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
import Link from 'next/link'
import { useRouter } from 'next/router'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import { useSuppressHydrationWarning } from 'src/utils/suppressHydrationWarning'

interface ProductCardItem {
  id: string
  code?: string
  name: string
  description?: string
  model?: string
  caseMaterial?: string
  caseSize?: number
  strapSize?: number
  gender?: string
  waterResistance?: string
  releaseDate?: string
  sold?: number
  basePrice: number
  rating?: number | null
  status?: boolean
  thumbnail?: string
  slider?: string[]
  brandId?: string
  categoryId?: string
  movementTypeId?: string
}

interface QuickButton {
  title: string
  payload: string
  id?: string
  metadata?: {
    order_id?: string
    order_code?: string
    status_name?: string
    status_color?: string
    intent?: string
  }
}

interface OrderCardItem {
  id: string
  code: string
  customer_name: string
  total_amount: string
  status: string
  status_color: string
  created_date: string
  buttons: QuickButton[]
}

interface Message {
  sender: 'user' | 'bot'
  text: string
  timestamp?: Date
  buttons?: QuickButton[]
  custom?: {
    type?: string
    cards?: ProductCardItem[]
    orders?: OrderCardItem[]
  }
}

interface RasaResponse {
  recipient_id: string
  text?: string
  buttons?: QuickButton[]
  custom?: {
    type?: string
    cards?: ProductCardItem[]
    orders?: OrderCardItem[]
  }
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
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)

  // Tắt hydration warnings
  useSuppressHydrationWarning()

  // Chỉ load messages sau khi component đã mount trên client
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined' && localStorage) {
      try {
        const savedMessages = localStorage.getItem('rasaChatMessages')
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages))
        }
      } catch (error) {
        console.error('Lỗi khi đọc localStorage:', error)
      }
    }
  }, [])

  // Lưu messages vào localStorage khi thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage && isClient) {
      try {
        localStorage.setItem('rasaChatMessages', JSON.stringify(messages))
        console.log('Saved chat messages to localStorage:', messages.length, 'messages')
      } catch (error) {
        console.error('Lỗi khi lưu localStorage:', error)
      }
    }
  }, [messages, isClient])

  // Cuộn xuống cuối khi mở khung chat hoặc có tin nhắn mới
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages, isLoading])

  const handleSend = async (messageText?: string, displayText?: string, metadata?: any) => {
    const textToSend = messageText || input
    if (!textToSend.trim()) return

    console.log('handleSend called with:', { messageText, displayText, textToSend })

    // Always display the actual text being sent (typed text or payload)
    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    }
    console.log('Adding user message:', userMsg)
    setMessages(prev => [...prev, userMsg])

    // Clear input only if it's a typed message, not a button click
    if (!messageText) setInput('')
    setIsLoading(true)

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('accessToken')

      // Tạo request body
      const requestBody = {
        sender: sessionId,
        message: textToSend,
        ...(token ? { metadata: { token, ...metadata } } : metadata ? { metadata } : {})
      }

      console.log('Sending request to Rasa:', requestBody)

      // Gửi tin nhắn đến Rasa server
      const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody)
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
              text:
                item.text ||
                (item.custom?.type === 'cards' || item.custom?.type === 'order_cards'
                  ? ''
                  : 'Không có phản hồi từ hệ thống.'),
              buttons: item.buttons,
              custom: item.custom,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, botMsg])
          }, index * 500)
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

  const handleOrderButtonClick = (btn: QuickButton) => {
    console.log('Order button clicked:', { payload: btn.payload, title: btn.title, metadata: btn.metadata })

    // Store order detail info for dialog opening BEFORE navigation
    if (btn.metadata?.order_id) {
      // Store order info in localStorage for the order history page to use
      localStorage.setItem('selectedOrderId', btn.metadata.order_id)
      localStorage.setItem('selectedOrderCode', btn.metadata.order_code || '')
      localStorage.setItem('openOrderDetail', 'true')
      console.log('Stored order info:', { orderId: btn.metadata.order_id, orderCode: btn.metadata.order_code })
    }

    // Navigate to order history page
    router.push('/order/order-history')

    // Don't close chatbot immediately - let user see the navigation
    // setOpen(false)
  }

  const formatTime = (date: Date | string | number) => {
    const dateObj = new Date(date)
    return dateObj.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderMessageContent = (msg: Message) => {
    // User message: keep as-is
    if (msg.sender === 'user') {
      return (
        <ListItemText
          primary={msg.text}
          primaryTypographyProps={{ sx: { whiteSpace: 'pre-line' } }}
          secondary={msg.timestamp ? formatTime(msg.timestamp) : undefined}
          secondaryTypographyProps={{
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.7)'
          }}
        />
      )
    }

    // Bot message: styled variants
    const text = msg.text || ''

    // 0) Order cards payload from Rasa custom
    if (msg.custom?.type === 'order_cards' && Array.isArray(msg.custom.orders) && msg.custom.orders.length > 0) {
      const getStatusColor = (color: string) => {
        switch (color.toLowerCase()) {
          case 'green':
            return '#4caf50'
          case 'red':
            return '#f44336'
          case 'orange':
            return '#ff9800'
          case 'blue':
            return '#2196f3'
          default:
            return '#757575'
        }
      }

      return (
        <>
          {text ? (
            <Typography variant='body2' sx={{ mb: 1 }}>
              {text}
            </Typography>
          ) : null}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {msg.custom.orders.slice(0, 10).map(order => (
              <Paper
                key={order.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  width: '100%',
                  transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': { bgcolor: '#fafafa', boxShadow: 1 }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {order.code}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      {order.customer_name}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 700,
                        color: getStatusColor(order.status_color),
                        fontSize: '0.8rem'
                      }}
                    >
                      {order.status}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      {order.created_date}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Tổng tiền: {order.total_amount}
                  </Typography>
                </Box>

                {order.buttons && order.buttons.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {order.buttons.map((btn, i) => (
                      <Button
                        key={i}
                        size='small'
                        variant='outlined'
                        onClick={() => handleOrderButtonClick(btn)}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 1.5,
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white'
                          }
                        }}
                      >
                        {btn.title}
                      </Button>
                    ))}
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
          {msg.timestamp ? (
            <Typography variant='caption' sx={{ display: 'block', mt: 0.5, color: 'text.disabled' }}>
              {formatTime(msg.timestamp)}
            </Typography>
          ) : null}
        </>
      )
    }

    // 1) Product cards payload from Rasa custom
    if (msg.custom?.type === 'cards' && Array.isArray(msg.custom.cards) && msg.custom.cards.length > 0) {
      const formatCurrency = (value?: number) => {
        if (typeof value !== 'number') return ''
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
          value
        )
      }

      return (
        <>
          {text ? (
            <Typography variant='body2' sx={{ mb: 1 }}>
              {text}
            </Typography>
          ) : null}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {msg.custom.cards.slice(0, 10).map(card => (
              <Link key={card.id} href={`/product/${card.id}`} style={{ textDecoration: 'none' }}>
                <Paper
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    border: '1px solid #eee',
                    width: '100%',
                    transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': { bgcolor: '#fafafa', boxShadow: 1 }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        overflow: 'hidden',
                        borderRadius: 1,
                        bgcolor: '#f5f5f5',
                        flexShrink: 0
                      }}
                    >
                      <img
                        src={card.thumbnail || '/images/placeholder.png'}
                        alt={card.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant='body2'
                        sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {card.name}
                      </Typography>
                      <Typography variant='body2' color='primary.main' sx={{ fontWeight: 700 }}>
                        {formatCurrency(card.basePrice)}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{
                          display: 'block',
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Mã: {card.code || '-'} · Mẫu: {card.model || '-'} · Vỏ: {card.caseMaterial || '-'}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{
                          display: 'block',
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Kích thước: {card.caseSize ? `${card.caseSize}mm` : '-'} · Dây:{' '}
                        {card.strapSize ? `${card.strapSize}mm` : '-'} · Chống nước: {card.waterResistance || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Link>
            ))}
          </Box>
          {msg.timestamp ? (
            <Typography variant='caption' sx={{ display: 'block', mt: 0.5, color: 'text.disabled' }}>
              {formatTime(msg.timestamp)}
            </Typography>
          ) : null}
        </>
      )
    }

    // 1) Italic note like *Lưu ý ...*
    if (/^\*.*\*$/.test(text.trim())) {
      const plain = text.trim().replace(/^\*|\*$/g, '')
      return (
        <>
          <Typography variant='body2' sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            {plain}
          </Typography>
          {msg.timestamp ? (
            <Typography variant='caption' sx={{ display: 'block', mt: 0.25, color: 'text.disabled' }}>
              {formatTime(msg.timestamp)}
            </Typography>
          ) : null}
        </>
      )
    }

    // 2) Bullet list (supports •, -, 📍 and emoji bullets). Pattern: **Label**: value
    // Detect lines starting with common bullets (•, -, 📍, emoji)
    const bulletLike = text
      .split('\n')
      .some(l =>
        /^(•|\-|📍|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+)/g.test(l.trim())
      )
    if (bulletLike) {
      const lines = text
        .split('\n')
        .map(l => l.trim())
        .filter(l => l)

      return (
        <>
          <Box component='ul' sx={{ p: 0, m: 0, listStyle: 'none' }}>
            {lines.map((line, i) => {
              // Extract emoji/bullet and content
              const bulletMatch = line.match(
                /^(•|\-|📍|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+)\s*(.+)$/
              )
              const bullet = bulletMatch ? bulletMatch[1] : ''
              const content = bulletMatch ? bulletMatch[2] : line

              // Extract **Label** with separator ':' or '-' then value
              const match = content.match(/^\*\*(.+?)\*\*\s*[:\-]\s*(.+)$/)
              const label = match ? match[1] : content
              const value = match ? match[2] : ''
              return (
                <Box key={i} component='li' sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {bullet && <Typography sx={{ fontSize: '1rem' }}>{bullet}</Typography>}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 0.75, rowGap: 0.25 }}>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {label}:
                      </Typography>
                      <Typography variant='body2'>{value}</Typography>
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Box>
          {msg.timestamp ? (
            <Typography variant='caption' sx={{ display: 'block', mt: 0.25, color: 'text.disabled' }}>
              {formatTime(msg.timestamp)}
            </Typography>
          ) : null}
        </>
      )
    }

    // 3) Default bot text
    return (
      <>
        <Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
          {text}
        </Typography>
        {msg.timestamp ? (
          <Typography variant='caption' sx={{ display: 'block', mt: 0.25, color: 'text.disabled' }}>
            {formatTime(msg.timestamp)}
          </Typography>
        ) : null}
      </>
    )
  }

  // Chỉ render khi đã ở client-side để tránh hydration mismatch
  if (!isClient) {
    return null
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 10000 }} suppressHydrationWarning>
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
                    {msg.sender === 'user' ? (
                      <ListItemText
                        primary={msg.text}
                        secondary={msg.timestamp ? formatTime(msg.timestamp) : undefined}
                        secondaryTypographyProps={{
                          fontSize: '0.7rem',
                          color: 'rgba(255,255,255,0.7)'
                        }}
                      />
                    ) : (
                      renderMessageContent(msg)
                    )}
                  </Paper>
                  {msg.buttons && msg.buttons.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {msg.buttons.map((btn, i) => (
                        <Button
                          key={i}
                          size='small'
                          variant='outlined'
                          onClick={() => {
                            console.log('Button clicked:', { payload: btn.payload, title: btn.title, id: btn.id })
                            // Always include brand_id if button has id, otherwise send empty metadata
                            const metadata = btn.id ? { brand_id: btn.id } : {}
                            console.log('Sending metadata:', metadata)
                            handleSend(btn.payload, undefined, metadata)
                          }}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.25, px: 1 }}
                        >
                          {btn.title}
                        </Button>
                      ))}
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
              onClick={() => handleSend()}
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
