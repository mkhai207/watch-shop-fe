# VN Public APIs Integration

## Tổng quan

Dự án đã được tích hợp với [VN Public APIs](https://vn-public-apis.fpo.vn/) - một bộ API miễn phí và ổn định để lấy danh sách tỉnh, huyện, xã của Việt Nam. API này được phát triển bởi FPO và cung cấp dữ liệu chính xác, cập nhật.

## API Endpoints

### 1. Lấy danh sách tỉnh/thành phố
- **Endpoint:** `GET https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1`
- **Tham số:**
  - `limit=-1`: Lấy toàn bộ danh sách
  - `q`: Từ khóa tìm kiếm (tùy chọn)
  - `cols`: Các cột muốn lấy (tùy chọn)

### 2. Lấy danh sách quận/huyện theo tỉnh
- **Endpoint:** `GET https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode={code}&limit=-1`
- **Tham số:**
  - `provinceCode`: Mã tỉnh/thành phố (bắt buộc)
  - `limit=-1`: Lấy toàn bộ danh sách
  - `q`: Từ khóa tìm kiếm (tùy chọn)

### 3. Lấy danh sách xã/phường theo quận/huyện
- **Endpoint:** `GET https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode={code}&limit=-1`
- **Tham số:**
  - `districtCode`: Mã quận/huyện (bắt buộc)
  - `limit=-1`: Lấy toàn bộ danh sách
  - `q`: Từ khóa tìm kiếm (tùy chọn)

## Cách sử dụng

### 1. Import service
```typescript
import {
  getProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
  searchProvinces,
  searchDistricts,
  searchWards,
  Province,
  District,
  Ward
} from 'src/services/addressApi'
```

### 2. Sử dụng trong component
```typescript
// Lấy danh sách tỉnh
const provinces = await getProvinces()

// Lấy danh sách quận/huyện theo mã tỉnh
const districts = await getDistrictsByProvince('72') // Mã TP.HCM

// Lấy danh sách xã/phường theo mã quận/huyện
const wards = await getWardsByDistrict('712') // Mã Quận 1

// Tìm kiếm tỉnh
const searchResults = await searchProvinces('hồ chí minh')
```

### 3. Sử dụng component AddressForm
```typescript
import AddressForm from 'src/components/AddressForm'

<AddressForm
  defaultValues={addressData}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  submitButtonText="Lưu"
  showDefaultCheckbox={true}
  loading={false}
/>
```

## Cấu trúc dữ liệu

### Province
```typescript
interface Province {
  code: string        // Mã tỉnh (VD: "72")
  name: string        // Tên tỉnh (VD: "Thành phố Hồ Chí Minh")
  name_with_type: string // Tên đầy đủ (VD: "Thành phố Hồ Chí Minh")
  slug: string        // Slug URL
  type: string        // Loại (VD: "thanh-pho")
}
```

### District
```typescript
interface District {
  code: string        // Mã quận/huyện (VD: "712")
  name: string        // Tên quận/huyện (VD: "Quận 1")
  name_with_type: string // Tên đầy đủ (VD: "Quận 1")
  slug: string        // Slug URL
  type: string        // Loại (VD: "quan")
  province_code: string // Mã tỉnh cha
}
```

### Ward
```typescript
interface Ward {
  code: string        // Mã xã/phường (VD: "25666")
  name: string        // Tên xã/phường (VD: "Phường Bến Nghé")
  name_with_type: string // Tên đầy đủ (VD: "Phường Bến Nghé")
  slug: string        // Slug URL
  type: string        // Loại (VD: "phuong")
  district_code: string // Mã quận/huyện cha
}
```

## Tính năng

1. **Cascading Selects**: Khi chọn tỉnh, danh sách quận/huyện sẽ được load tự động. Tương tự với quận/huyện và xã/phường.

2. **Validation**: Form có validation đầy đủ cho tất cả các trường bắt buộc.

3. **Loading States**: Hiển thị trạng thái loading khi đang tải dữ liệu.

4. **Error Handling**: Xử lý lỗi và hiển thị thông báo phù hợp.

5. **Search Functions**: Hỗ trợ tìm kiếm tỉnh, huyện, xã.

6. **Reusable Component**: Component AddressForm có thể tái sử dụng ở nhiều nơi khác nhau.

7. **Name with Type**: Hiển thị tên đầy đủ với loại đơn vị hành chính.

## Ưu điểm của VN Public APIs

- **Ổn định**: API được phát triển bởi FPO, một công ty uy tín
- **Miễn phí**: Không yêu cầu API key
- **Cập nhật**: Dữ liệu được cập nhật thường xuyên
- **Đầy đủ**: Cung cấp đầy đủ thông tin về đơn vị hành chính
- **Tìm kiếm**: Hỗ trợ tìm kiếm linh hoạt
- **Phân trang**: Hỗ trợ phân trang cho dữ liệu lớn

## Lưu ý

- API sử dụng mã (code) thay vì ID để liên kết giữa các cấp
- Tên hiển thị sử dụng `name_with_type` để có thông tin đầy đủ
- API hỗ trợ tìm kiếm với tham số `q`
- Có thể giới hạn số lượng kết quả với tham số `limit`

## Demo API

Bạn có thể test API trực tiếp bằng HTTPie:

```bash
# Lấy tất cả tỉnh
http -v https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1

# Lấy quận/huyện của TP.HCM
http -v https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=72&limit=-1

# Lấy xã/phường của Quận 1
http -v https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=712&limit=-1
```