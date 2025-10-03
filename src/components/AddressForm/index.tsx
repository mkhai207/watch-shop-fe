import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  getProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
  Province,
  District,
  Ward
} from 'src/services/addressApi'
import * as yup from 'yup'

interface AddressFormData {
  recipient_name: string
  phone_number: string
  street: string
  ward: string
  wardCode?: string
  district: string
  districtCode?: string
  city: string
  provinceCode?: string
  is_default: boolean
}

interface AddressFormProps {
  defaultValues?: Partial<AddressFormData>
  onSubmit: (data: AddressFormData) => void
  onCancel?: () => void
  submitButtonText?: string
  showDefaultCheckbox?: boolean
  loading?: boolean
}

const AddressForm: React.FC<AddressFormProps> = ({
  defaultValues = {},
  onSubmit,
  onCancel,
  submitButtonText = 'Lưu',
  showDefaultCheckbox = true,
  loading = false
}) => {
  // Address API states
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  // Form validation schema
  const schema = yup.object({
    recipient_name: yup.string().required('Tên người nhận là bắt buộc'),
    phone_number: yup
      .string()
      .required('Số điện thoại là bắt buộc')
      .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
    street: yup.string().required('Địa chỉ đường/số nhà là bắt buộc'),
    ward: yup.string().required('Phường/xã là bắt buộc'),
    district: yup.string().required('Quận/huyện là bắt buộc'),
    city: yup.string().required('Tỉnh/thành phố là bắt buộc'),
    is_default: yup.boolean().default(false)
  })

  const { handleSubmit, control, reset, setValue, watch } = useForm<AddressFormData>({
    defaultValues: {
      recipient_name: '',
      phone_number: '',
      street: '',
      ward: '',
      wardCode: undefined,
      district: '',
      districtCode: undefined,
      city: '',
      provinceCode: undefined,
      is_default: false,
      ...defaultValues
    },
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  // Watch form values for cascading
  const watchedCity = watch('city')
  const watchedDistrict = watch('district')

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load provinces
  const loadProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const provincesData = await getProvinces()
      setProvinces(provincesData)
    } catch (error) {
      console.error('Error loading provinces:', error)
    } finally {
      setLoadingProvinces(false)
    }
  }

  // Load districts by province code
  const loadDistricts = async (provinceCode: string) => {
    setLoadingDistricts(true)
    setDistricts([])
    setWards([])
    try {
      const districtsData = await getDistrictsByProvince(provinceCode)
      setDistricts(districtsData)
    } catch (error) {
      console.error('Error loading districts:', error)
    } finally {
      setLoadingDistricts(false)
    }
  }

  // Load wards by district code
  const loadWards = async (districtCode: string) => {
    setLoadingWards(true)
    setWards([])
    try {
      const wardsData = await getWardsByDistrict(districtCode)
      setWards(wardsData)
    } catch (error) {
      console.error('Error loading wards:', error)
    } finally {
      setLoadingWards(false)
    }
  }

  // Handle province change
  const handleProvinceChange = (provinceName: string) => {
    const selectedProvince = provinces.find(p => p.name === provinceName)
    if (selectedProvince) {
      setValue('provinceCode', selectedProvince.code)
      setValue('city', provinceName) // Ensure city field is set
      loadDistricts(selectedProvince.code)
      // Reset district and ward when province changes
      setValue('district', '')
      setValue('districtCode', '')
      setValue('ward', '')
      setValue('wardCode', '')
    }
  }

  // Handle district change
  const handleDistrictChange = (districtName: string) => {
    const selectedDistrict = districts.find(d => d.name === districtName)
    if (selectedDistrict) {
      setValue('districtCode', selectedDistrict.code)
      setValue('district', districtName) // Ensure district field is set
      loadWards(selectedDistrict.code)
      // Reset ward when district changes
      setValue('ward', '')
      setValue('wardCode', '')
    }
  }

  // Handle ward change
  const handleWardChange = (wardName: string) => {
    const selectedWard = wards.find(w => w.name === wardName)
    if (selectedWard) {
      setValue('wardCode', selectedWard.code)
      setValue('ward', wardName) // Ensure ward field is set
    }
  }

  // Reset form when defaultValues change (only when editing)
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset({
        recipient_name: defaultValues.recipient_name || '',
        phone_number: defaultValues.phone_number || '',
        street: defaultValues.street || '',
        ward: defaultValues.ward || '',
        wardCode: defaultValues.wardCode || undefined,
        district: defaultValues.district || '',
        districtCode: defaultValues.districtCode || undefined,
        city: defaultValues.city || '',
        provinceCode: defaultValues.provinceCode || undefined,
        is_default: defaultValues.is_default || false
      })
    }
  }, [defaultValues, reset])

  // Load cascading data when editing
  useEffect(() => {
    if (defaultValues && defaultValues.city && provinces.length > 0) {
      const province = provinces.find(p => p.name === defaultValues.city)
      if (province) {
        setValue('provinceCode', province.code)
        loadDistricts(province.code)
      }
    }
  }, [defaultValues, provinces, setValue])

  // Load wards when districts are loaded and district is provided
  useEffect(() => {
    if (defaultValues && defaultValues.district && districts.length > 0) {
      const district = districts.find(d => d.name === defaultValues.district)
      if (district) {
        setValue('districtCode', district.code)
        loadWards(district.code)
      }
    }
  }, [defaultValues, districts, setValue])

  // Load wards when wards are loaded and ward is provided
  useEffect(() => {
    if (defaultValues && defaultValues.ward && wards.length > 0) {
      const ward = wards.find(w => w.name === defaultValues.ward)
      if (ward) {
        setValue('wardCode', ward.code)
      }
    }
  }, [defaultValues, wards, setValue])

  return (
    <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Controller
        name='recipient_name'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} label='Tên người nhận' fullWidth error={!!error} helperText={error?.message} />
        )}
      />

      <Controller
        name='phone_number'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} label='Số điện thoại' fullWidth error={!!error} helperText={error?.message} />
        )}
      />

      <Controller
        name='street'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label='Địa chỉ (số nhà, tên đường)'
            fullWidth
            error={!!error}
            helperText={error?.message}
          />
        )}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!control._formState.errors.city}>
            <InputLabel>Tỉnh/Thành phố</InputLabel>
            <Controller
              name='city'
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label='Tỉnh/Thành phố'
                  disabled={loadingProvinces}
                  value={field.value || ''}
                  onChange={e => {
                    field.onChange(e.target.value)
                    handleProvinceChange(e.target.value)
                  }}
                >
                  {provinces.length > 0 ? (
                    provinces.map(province => (
                      <MenuItem key={province.code} value={province.name}>
                        {province.name_with_type}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Đang tải...</MenuItem>
                  )}
                </Select>
              )}
            />
            {control._formState.errors.city && (
              <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                {control._formState.errors.city.message}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!control._formState.errors.district}>
            <InputLabel>Quận/Huyện</InputLabel>
            <Controller
              name='district'
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label='Quận/Huyện'
                  disabled={loadingDistricts || districts.length === 0}
                  value={field.value || ''}
                  onChange={e => {
                    field.onChange(e.target.value)
                    handleDistrictChange(e.target.value)
                  }}
                >
                  {districts.map(district => (
                    <MenuItem key={district.code} value={district.name}>
                      {district.name_with_type}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {control._formState.errors.district && (
              <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                {control._formState.errors.district.message}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!control._formState.errors.ward}>
            <InputLabel>Phường/Xã</InputLabel>
            <Controller
              name='ward'
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label='Phường/Xã'
                  disabled={loadingWards || wards.length === 0}
                  value={field.value || ''}
                  onChange={e => {
                    field.onChange(e.target.value)
                    handleWardChange(e.target.value)
                  }}
                >
                  {wards.map(ward => (
                    <MenuItem key={ward.code} value={ward.name}>
                      {ward.name_with_type}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {control._formState.errors.ward && (
              <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                {control._formState.errors.ward.message}
              </Typography>
            )}
          </FormControl>
        </Grid>
      </Grid>

      {showDefaultCheckbox && (
        <Controller
          name='is_default'
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox checked={field.value} onChange={field.onChange} />}
              label='Đặt làm địa chỉ mặc định'
            />
          )}
        />
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        {onCancel && (
          <Button onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
        )}
        <Button type='submit' variant='contained' disabled={loading}>
          {loading ? <CircularProgress size={20} /> : submitButtonText}
        </Button>
      </Box>
    </Box>
  )
}

export default AddressForm
