// ** Mui Imports
import * as React from 'react'
import IconButton from '@mui/material/IconButton'
import { useSettings } from 'src/hooks/useSettings'
import { Mode } from 'src/types/layouts'
import IconifyIcon from 'src/components/Icon'

type TProps = {}

const ModeToggle = (props: TProps) => {
  const { settings, saveSettings } = useSettings()

  const handleModeChange = (mode: Mode) => {
    saveSettings({ ...settings, mode })
  }

  const handleToggleMode = () => {
    if (settings.mode === 'light') {
      handleModeChange('dark')
    } else {
      handleModeChange('light')
    }
  }

  return (
    <IconButton color='inherit' onClick={handleToggleMode}>
      <IconifyIcon icon={settings.mode === 'light' ? 'lets-icons:sun-light' : 'circum:dark'} />
    </IconButton>
  )
}

export default ModeToggle
