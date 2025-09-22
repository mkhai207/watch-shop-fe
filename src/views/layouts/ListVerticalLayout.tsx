import React, { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { Box, Collapse, List, ListItemButton, ListItemIcon, Typography } from '@mui/material'
import { MenuItem, VerticalItems } from 'src/configs/layout'
import IconifyIcon from 'src/components/Icon'
import { useRouter } from 'next/router'

type TProps = {
  open: boolean
}

const RecursiveListItems = ({
  disabled,
  items,
  level,
  openItem,
  setOpenItem
}: {
  disabled: boolean
  items: any
  level: number
  openItem: { [key: string]: boolean }
  setOpenItem: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
}) => {
  const router = useRouter()

  const isActive = (item: MenuItem) => {
    if (item.path) {
      return router.pathname === item.path
    }

    return false
  }

  const handleClick = (item: MenuItem) => {
    if (!disabled) {
      // setOpenItem(prev => ({
      //   ...prev,
      //   [title]: !prev[title]
      // }))
      if (item.path && !item.children) {
        router.push(item.path)
      } else if (item.children && item.children.length > 0) {
        setOpenItem(prev => ({
          ...prev,
          [item.title]: !prev[item.title]
        }))
      }
    }
  }

  return (
    <>
      {items?.map((item: any) => {
        return (
          <React.Fragment key={item.title}>
            <ListItemButton
              sx={{
                padding: `8px 10px 8px ${level * 20}px`,
                backgroundColor: isActive(item) ? 'primary.main' : 'transparent',
                color: isActive(item) ? 'white' : 'text.primary',
                fontWeight: isActive(item) ? 'bold' : 'normal',
                '&:hover': {
                  backgroundColor: isActive(item) ? 'primary.dark' : 'action.hover'
                },
                '&.Mui-selected': {
                  backgroundColor: isActive(item) ? 'primary.main' : 'transparent',
                  color: isActive(item) ? 'white' : 'text.primary',
                  fontWeight: isActive(item) ? 'bold' : 'normal',
                  '&:hover': {
                    backgroundColor: isActive(item) ? 'primary.dark' : 'action.hover'
                  }
                }
              }}
              selected={isActive(item)}
              onClick={() => {
                handleClick(item)
              }}
            >
              <ListItemIcon>
                <Box
                  sx={{
                    color: isActive(item) ? 'white' : 'inherit'
                  }}
                >
                  <IconifyIcon icon={item.icon} />
                </Box>
              </ListItemIcon>

              {!disabled && (
                <Typography
                  variant='body1'
                  sx={{
                    color: isActive(item) ? 'white' : 'text.primary',
                    fontWeight: isActive(item) ? 'bold' : 'normal',
                    flex: 1
                  }}
                >
                  {item?.title}
                </Typography>
              )}
              {item.children && item.children.length > 0 && (
                <>
                  {openItem[item.title] ? (
                    <IconifyIcon icon='ic:sharp-expand-more' />
                  ) : (
                    <IconifyIcon icon='ic:sharp-expand-less' />
                  )}
                </>
              )}
            </ListItemButton>
            {item.children && item.children.length > 0 && (
              <>
                <Collapse in={openItem[item.title]} timeout='auto' unmountOnExit>
                  <RecursiveListItems
                    disabled={disabled}
                    items={item.children}
                    level={level + 1}
                    openItem={openItem}
                    setOpenItem={setOpenItem}
                  />
                </Collapse>
              </>
            )}
          </React.Fragment>
        )
      })}
    </>
  )
}

const ListVerticalLayout: NextPage<TProps> = ({ open }) => {
  const [openItem, setOpenItem] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (!open) {
      handleToggleAll()
    }
  }, [open])

  const handleToggleAll = () => {
    setOpenItem({})
  }

  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component='nav'
      aria-labelledby='nested-list-subheader'
    >
      <RecursiveListItems
        disabled={!open}
        items={VerticalItems}
        level={1}
        openItem={openItem}
        setOpenItem={setOpenItem}
      />
    </List>
  )
}

export default ListVerticalLayout
