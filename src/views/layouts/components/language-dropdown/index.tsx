// ** Mui Imports
import * as React from 'react'
import IconButton from '@mui/material/IconButton'
import IconifyIcon from 'src/components/Icon'
import { Menu, MenuItem, Typography } from '@mui/material'
import { LANGUAGE_OPTIONS } from 'src/configs/i18n'
import { useTranslation } from 'react-i18next'

type TProps = {}

const LanguageDropDown = (props: TProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)
  const { i18n } = useTranslation()

  const handleOnChangeLang = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton color='inherit' id='language-dropdown' onClick={handleClick}>
        <IconifyIcon icon='material-symbols:translate'></IconifyIcon>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0
              }
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {LANGUAGE_OPTIONS.map(lang => (
          <MenuItem
            selected={lang.value === i18n.language}
            key={lang.value}
            onClick={() => {
              handleOnChangeLang(lang.value)
            }}
          >
            <Typography sx={{ p: 2 }}>{lang.lang}</Typography>{' '}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default LanguageDropDown
