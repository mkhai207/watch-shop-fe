// // ** React
// import React, { useEffect, useState, forwardRef, useRef } from 'react'

// // ** Mui
// import { InputBase, styled, IconButton, ClickAwayListener } from '@mui/material'
// import Icon from 'src/components/Icon'

// interface TInputSearch {
//   value: string
//   onChange: (value: string) => void
//   placeholder?: string
//   onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
//   onFocus?: () => void
//   onBlur?: () => void
//   showClearButton?: boolean
//   disabled?: boolean
//   autoFocus?: boolean
//   size?: 'small' | 'medium' | 'large'
//   expandable?: boolean
//   onExpand?: (expanded: boolean) => void
//   onSearch?: (value: string) => void
// }

// const Search = styled('div')<{
//   size?: 'small' | 'medium' | 'large'
//   expanded?: boolean
//   expandable?: boolean
// }>(({ theme, size = 'medium', expanded = true, expandable = false }) => {
//   const heights = {
//     small: '32px',
//     medium: '38px',
//     large: '44px'
//   }

//   return {
//     position: 'relative',
//     borderRadius: theme.shape.borderRadius,
//     backgroundColor: theme.palette.common.white,
//     marginLeft: '0 !important',
//     height: heights[size],
//     width: expandable ? (expanded ? '300px' : heights[size]) : '100%',
//     minWidth: expandable ? heights[size] : 'auto',
//     border: `1px solid ${theme.palette.customColors.borderColor}`,
//     transition: 'all 0.3s ease',
//     cursor: expandable && !expanded ? 'pointer' : 'default',
//     overflow: 'hidden',
//     '&:focus-within': expanded
//       ? {
//           borderColor: theme.palette.primary.main,
//           boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`
//         }
//       : {},
//     '&:hover':
//       expandable && !expanded
//         ? {
//             backgroundColor: theme.palette.action.hover,
//             borderColor: theme.palette.primary.main
//           }
//         : {},
//     [theme.breakpoints.up('sm')]: {
//       marginLeft: theme.spacing(1),
//       width: expandable ? (expanded ? '300px' : heights[size]) : 'auto'
//     },
//     [theme.breakpoints.down('sm')]: {
//       width: expandable ? (expanded ? '250px' : heights[size]) : '100%'
//     }
//   }
// })

// const SearchIconWrapper = styled('div')<{
//   clickable?: boolean
//   expanded?: boolean
// }>(({ theme, clickable = false, expanded = true }) => ({
//   padding: theme.spacing(0, 2),
//   height: '100%',
//   position: 'absolute',
//   left: 0,
//   top: 0,
//   pointerEvents: clickable && !expanded ? 'auto' : 'none',
//   alignItems: 'center',
//   justifyContent: 'center',
//   display: 'flex',
//   color: theme.palette.text.secondary,
//   cursor: clickable && !expanded ? 'pointer' : 'default',
//   zIndex: 1,
//   '&:hover':
//     clickable && !expanded
//       ? {
//           color: theme.palette.primary.main
//         }
//       : {}
// }))

// const ClearButton = styled(IconButton)(({ theme }) => ({
//   position: 'absolute',
//   right: theme.spacing(0.5),
//   top: '50%',
//   transform: 'translateY(-50%)',
//   padding: theme.spacing(0.5),
//   color: theme.palette.text.secondary,
//   zIndex: 2,
//   '&:hover': {
//     backgroundColor: theme.palette.action.hover
//   }
// }))

// const StyledInputBase = styled(InputBase)<{
//   hasClearButton?: boolean
//   expanded?: boolean
//   expandable?: boolean
// }>(({ theme, hasClearButton, expanded = true, expandable = false }) => ({
//   color: 'inherit',
//   width: '100%',
//   height: '100%',
//   opacity: expandable ? (expanded ? 1 : 0) : 1,
//   transition: 'opacity 0.3s ease',
//   '& .MuiInputBase-input': {
//     width: '100%',
//     padding: theme.spacing(1, hasClearButton ? 5 : 1, 1, 0),
//     paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//     '&::placeholder': {
//       color: theme.palette.text.secondary,
//       opacity: 0.7
//     }
//   }
// }))

// const InputSearch = forwardRef<HTMLInputElement, TInputSearch>((props, ref) => {
//   const {
//     value,
//     onChange,
//     placeholder = 'Search...',
//     onKeyDown,
//     onFocus,
//     onBlur,
//     showClearButton = true,
//     disabled = false,
//     autoFocus = false,
//     size = 'medium',
//     expandable = false,
//     onExpand,
//     onSearch
//   } = props

//   const [localSearch, setLocalSearch] = useState(value)
//   const [expanded, setExpanded] = useState(!expandable)
//   const inputRef = useRef<HTMLInputElement>(null)

//   useEffect(() => {
//     setLocalSearch(value)
//   }, [value])

//   const handleSearch = (searchValue: string) => {
//     const trimmedValue = searchValue.trim()
//     onChange(trimmedValue)
//     onSearch?.(trimmedValue)
//   }

//   const handleExpand = () => {
//     if (!expandable || disabled) return

//     const newExpanded = !expanded
//     setExpanded(newExpanded)
//     onExpand?.(newExpanded)

//     if (newExpanded) {
//       setTimeout(() => {
//         inputRef.current?.focus()
//       }, 100)
//     }
//   }

//   const handleClickAway = () => {
//     if (expandable && expanded && !localSearch.trim()) {
//       setExpanded(false)
//       onExpand?.(false)
//     }
//   }

//   const handleClear = () => {
//     setLocalSearch('')
//     handleSearch('')
//     if (expandable) {
//       inputRef.current?.focus()
//     }
//   }

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       // Chỉ search khi nhấn Enter
//       handleSearch(localSearch)

//       if (expandable && localSearch.trim()) {
//       }
//     } else if (e.key === 'Escape') {
//       if (expandable) {
//         if (localSearch.trim()) {
//           handleClear()
//         } else {
//           setExpanded(false)
//           onExpand?.(false)
//         }
//       } else {
//         handleClear()
//       }
//     }

//     onKeyDown?.(e)
//   }

//   const handleInputFocus = () => {
//     onFocus?.()
//   }

//   const handleInputBlur = () => {
//     onBlur?.()
//   }

//   const searchComponent = (
//     <Search size={size} expanded={expanded} expandable={expandable} onClick={!expanded ? handleExpand : undefined}>
//       <SearchIconWrapper
//         clickable={expandable && !expanded}
//         expanded={expanded}
//         onClick={!expanded ? handleExpand : undefined}
//       >
//         <Icon icon='material-symbols-light:search' />
//       </SearchIconWrapper>

//       <StyledInputBase
//         ref={ref || inputRef}
//         value={localSearch}
//         placeholder={placeholder}
//         inputProps={{ 'aria-label': 'search' }}
//         disabled={disabled}
//         autoFocus={autoFocus && expanded}
//         expanded={expanded}
//         expandable={expandable}
//         hasClearButton={showClearButton && localSearch.length > 0 && expanded}
//         onChange={e => setLocalSearch(e.target.value)}
//         onKeyDown={handleKeyDown}
//         onFocus={handleInputFocus}
//         onBlur={handleInputBlur}
//         style={{
//           pointerEvents: expandable && !expanded ? 'none' : 'auto'
//         }}
//       />

//       {showClearButton && localSearch.length > 0 && !disabled && expanded && (
//         <ClearButton size='small' onClick={handleClear} tabIndex={-1}>
//           <Icon icon='material-symbols:close' fontSize='small' />
//         </ClearButton>
//       )}
//     </Search>
//   )

//   if (expandable) {
//     return (
//       <ClickAwayListener onClickAway={handleClickAway}>
//         <div style={{ display: 'inline-block' }}>{searchComponent}</div>
//       </ClickAwayListener>
//     )
//   }

//   return searchComponent
// })

// InputSearch.displayName = 'InputSearch'

// export default InputSearch

// ** React
import React, { useEffect, useState, forwardRef, useRef } from 'react'

// ** Mui
import { InputBase, styled, IconButton, ClickAwayListener } from '@mui/material'
import Icon from 'src/components/Icon'

interface TInputSearch {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onFocus?: () => void
  onBlur?: () => void
  showClearButton?: boolean
  disabled?: boolean
  autoFocus?: boolean
  size?: 'small' | 'medium' | 'large'
  expandable?: boolean
  onExpand?: (expanded: boolean) => void
  onSearch?: (value: string) => void
}

// Interface for styled component props
interface SearchStyledProps {
  size?: 'small' | 'medium' | 'large'
  expanded?: boolean
  expandable?: boolean
}

interface SearchIconWrapperProps {
  clickable?: boolean
  expanded?: boolean
}

interface StyledInputBaseProps {
  hasClearButton?: boolean
  expanded?: boolean
  expandable?: boolean
}

const Search = styled('div', {
  shouldForwardProp: prop => !['expanded', 'expandable'].includes(prop as string)
})<SearchStyledProps>(({ theme, size = 'medium', expanded = true, expandable = false }) => {
  const heights = {
    small: '32px',
    medium: '38px',
    large: '44px'
  }

  return {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.common.white,
    marginLeft: '0 !important',
    height: heights[size],
    width: expandable ? (expanded ? '300px' : heights[size]) : '100%',
    minWidth: expandable ? heights[size] : 'auto',
    border: `1px solid ${theme.palette.customColors.borderColor}`,
    transition: 'all 0.3s ease',
    cursor: expandable && !expanded ? 'pointer' : 'default',
    overflow: 'hidden',
    '&:focus-within': expanded
      ? {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`
        }
      : {},
    '&:hover':
      expandable && !expanded
        ? {
            backgroundColor: theme.palette.action.hover,
            borderColor: theme.palette.primary.main
          }
        : {},
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: expandable ? (expanded ? '300px' : heights[size]) : 'auto'
    },
    [theme.breakpoints.down('sm')]: {
      width: expandable ? (expanded ? '250px' : heights[size]) : '100%'
    }
  }
})

const SearchIconWrapper = styled('div', {
  shouldForwardProp: prop => !['clickable', 'expanded'].includes(prop as string)
})<SearchIconWrapperProps>(({ theme, clickable = false, expanded = true }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  left: 0,
  top: 0,
  pointerEvents: clickable && !expanded ? 'auto' : 'none',
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  color: theme.palette.text.secondary,
  cursor: clickable && !expanded ? 'pointer' : 'default',
  zIndex: 1,
  '&:hover':
    clickable && !expanded
      ? {
          color: theme.palette.primary.main
        }
      : {}
}))

const ClearButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(0.5),
  top: '50%',
  transform: 'translateY(-50%)',
  padding: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  zIndex: 2,
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}))

const StyledInputBase = styled(InputBase, {
  shouldForwardProp: prop => !['hasClearButton', 'expanded', 'expandable'].includes(prop as string)
})<StyledInputBaseProps>(({ theme, hasClearButton, expanded = true, expandable = false }) => ({
  color: 'inherit',
  width: '100%',
  height: '100%',
  opacity: expandable ? (expanded ? 1 : 0) : 1,
  transition: 'opacity 0.3s ease',
  '& .MuiInputBase-input': {
    width: '100%',
    padding: theme.spacing(1, hasClearButton ? 5 : 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7
    }
  }
}))

const InputSearch = forwardRef<HTMLInputElement, TInputSearch>((props, ref) => {
  const {
    value,
    onChange,
    placeholder = 'Search...',
    onKeyDown,
    onFocus,
    onBlur,
    showClearButton = true,
    disabled = false,
    autoFocus = false,
    size = 'medium',
    expandable = false,
    onExpand,
    onSearch
  } = props

  const [localSearch, setLocalSearch] = useState(value)
  const [expanded, setExpanded] = useState(!expandable)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalSearch(value)
  }, [value])

  const handleSearch = (searchValue: string) => {
    const trimmedValue = searchValue.trim()
    onChange(trimmedValue)
    onSearch?.(trimmedValue)
  }

  const handleExpand = () => {
    if (!expandable || disabled) return

    const newExpanded = !expanded
    setExpanded(newExpanded)
    onExpand?.(newExpanded)

    if (newExpanded) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleClickAway = () => {
    if (expandable && expanded && !localSearch.trim()) {
      setExpanded(false)
      onExpand?.(false)
    }
  }

  const handleClear = () => {
    setLocalSearch('')
    handleSearch('')
    if (expandable) {
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Chỉ search khi nhấn Enter
      handleSearch(localSearch)

      if (expandable && localSearch.trim()) {
      }
    } else if (e.key === 'Escape') {
      if (expandable) {
        if (localSearch.trim()) {
          handleClear()
        } else {
          setExpanded(false)
          onExpand?.(false)
        }
      } else {
        handleClear()
      }
    }

    onKeyDown?.(e)
  }

  const handleInputFocus = () => {
    onFocus?.()
  }

  const handleInputBlur = () => {
    onBlur?.()
  }

  const searchComponent = (
    <Search size={size} expanded={expanded} expandable={expandable} onClick={!expanded ? handleExpand : undefined}>
      <SearchIconWrapper
        clickable={expandable && !expanded}
        expanded={expanded}
        onClick={!expanded ? handleExpand : undefined}
      >
        <Icon icon='material-symbols-light:search' />
      </SearchIconWrapper>

      <StyledInputBase
        ref={ref || inputRef}
        value={localSearch}
        placeholder={placeholder}
        inputProps={{ 'aria-label': 'search' }}
        disabled={disabled}
        autoFocus={autoFocus && expanded}
        expanded={expanded}
        expandable={expandable}
        hasClearButton={showClearButton && localSearch.length > 0 && expanded}
        onChange={e => setLocalSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        style={{
          pointerEvents: expandable && !expanded ? 'none' : 'auto'
        }}
      />

      {showClearButton && localSearch.length > 0 && !disabled && expanded && (
        <ClearButton size='small' onClick={handleClear} tabIndex={-1}>
          <Icon icon='material-symbols:close' fontSize='small' />
        </ClearButton>
      )}
    </Search>
  )

  if (expandable) {
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <div style={{ display: 'inline-block' }}>{searchComponent}</div>
      </ClickAwayListener>
    )
  }

  return searchComponent
})

InputSearch.displayName = 'InputSearch'

export default InputSearch
