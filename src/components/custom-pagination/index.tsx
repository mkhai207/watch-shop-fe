import { Box, MenuItem, Pagination, PaginationProps, Select, styled } from '@mui/material'
import React, { Ref } from 'react'
import { useTranslation } from 'react-i18next'

const StylePagination = styled(Pagination)<PaginationProps>(({ theme }) => ({
  '& .MuiDataGrid-footerContainer': {
    '.MuiBox-root': {
      flex: 1,
      width: '100% !important'
    }
  }
}))

type TProps = {
  page: number // ** current page
  pageSize: number // ** current size row
  rowLength: number
  totalPages: number
  pageSizeOptions: number[]
  onChangePagination: (page: number, pageSize: number) => void
  isHideShowed?: boolean
}

const CustomPagination = React.forwardRef((props: TProps, ref: Ref<any>) => {
  const { pageSize, page, rowLength, totalPages, pageSizeOptions, onChangePagination, isHideShowed, ...rests } = props

  const { t } = useTranslation()

  const startRow = rowLength > 0 ? (page - 1) * pageSize + 1 : 0
  const endRow = rowLength > 0 ? Math.min(page * pageSize, rowLength) : 0

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingLeft: '8px'
      }}
    >
      {!isHideShowed && (
        <>
          {(rowLength || 0) > 0 ? (
            <Box>
              <span>{t('Đang hiển thị ')}</span>
              <span style={{ fontWeight: 'bold' }}>{startRow}</span>
              <span>{' - '}</span>
              <span style={{ fontWeight: 'bold' }}>{endRow}</span>
              <span>{t(' trên ')}</span>
              <span style={{ fontWeight: 'bold' }}>{rowLength || 0}</span>
            </Box>
          ) : (
            <Box></Box>
          )}
        </>
      )}
      <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center', flexGrow: 1, justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span>{t('Số dòng hiển thị')}</span>
          <Select
            size='small'
            sx={{
              width: '80px',
              padding: 0,
              '& .MuiSelect-select.MuiSelect-select-MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall':
                { minWidth: 'unset !important', padding: '8.5px 12px 8.5px 24px !important' }
            }}
            value={pageSize || 12}
            onChange={e => onChangePagination(1, +e.target.value)}
          >
            {(pageSizeOptions || []).map(opt => {
              return (
                <MenuItem value={opt} key={opt}>
                  {opt}
                </MenuItem>
              )
            })}
          </Select>
        </Box>
        {/* <StylePagination color='primary' {...rests} /> */}
        <StylePagination
          color='primary'
          count={totalPages || 1}
          page={page || 1}
          onChange={(event, newPage) => onChangePagination(newPage, pageSize)}
          siblingCount={2}
          boundaryCount={1}
          {...rests}
        />
      </Box>
    </Box>
  )
})
export default CustomPagination
