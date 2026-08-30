# PNG ONE FASHION

Website thương mại điện tử cho thương hiệu thời trang cao cấp **PNG ONE FASHION**. Xây dựng bằng Node.js (Express + EJS), MongoDB, hỗ trợ song ngữ Việt/Anh, tích hợp thanh toán VNPay & MoMo, có trang quản trị (admin) để quản lý sản phẩm và đơn hàng.

## Ngăn xếp công nghệ

- **Backend:** Node.js, Express, EJS (`express-ejs-layouts`)
- **Database:** MongoDB (qua Mongoose) — khuyến nghị dùng [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) gói M0 miễn phí, vì gói Hostinger Shared/Business không tự chạy được MongoDB
- **Session:** `express-session` + `connect-mongo`
- **Thanh toán:** VNPay (redirect + verify chữ ký), MoMo (captureWallet + IPN)
- **Ảnh sản phẩm:** hiện tại dùng "swatch" (thẻ màu + tên sản phẩm) làm ảnh tạm thay cho ảnh chụp thật — xem mục "Thay ảnh thật" bên dưới.

## Chạy thử ở máy local

1. Cài Node.js ≥ 18.
2. Cài dependencies:
   ```bash
   npm install
   ```
3. Tạo file `.env` từ mẫu:
   ```bash
   cp .env.example .env
   ```
4. Tạo cluster MongoDB Atlas miễn phí, lấy connection string, điền vào `MONGODB_URI` trong `.env`.
5. Điền `ADMIN_EMAIL` / `ADMIN_PASSWORD` bạn muốn dùng để đăng nhập `/admin`.
6. Seed dữ liệu mẫu (4 danh mục, 6 sản phẩm placeholder, tài khoản admin):
   ```bash
   npm run seed
   ```
7. Chạy server:
   ```bash
   npm run dev
   ```
8. Mở [http://localhost:3000](http://localhost:3000). Trang quản trị tại [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Thay ảnh sản phẩm thật

Sản phẩm hiện dùng "swatch" (khối màu + tên) làm ảnh placeholder thay vì ảnh chụp thật, vì bạn chưa có ảnh sản phẩm. Khi có ảnh thật:

1. Thêm URL ảnh vào field `images` của `Product` (model tại [models/Product.js](models/Product.js)).
2. Cập nhật các view `views/shop/*.ejs` — thay khối `<div class="swatch ...">` bằng `<img src="...">` khi `product.images.length`.

## Cấu hình thanh toán

### VNPay
Đăng ký tài khoản merchant tại [VNPay](https://vnpay.vn) (hoặc dùng [sandbox](https://sandbox.vnpayment.vn) để test), lấy `vnp_TmnCode` và `Hash Secret`, điền vào `VNPAY_TMN_CODE` / `VNPAY_HASH_SECRET` trong `.env`. Khi lên production, đổi `VNPAY_URL` sang `https://vnpayment.vn/paymentv2/vpcpay.html` và cập nhật `VNPAY_RETURN_URL` thành domain thật.

### MoMo
Đăng ký tài khoản merchant tại [MoMo Business](https://business.momo.vn) (hoặc dùng [sandbox](https://developers.momo.vn)), lấy `partnerCode`, `accessKey`, `secretKey`, điền vào `.env`. Khi lên production, đổi `MOMO_ENDPOINT` sang endpoint production và cập nhật `MOMO_RETURN_URL` / `MOMO_NOTIFY_URL` thành domain thật.

**Lưu ý:** việc đăng ký tài khoản merchant VNPay/MoMo (xác minh doanh nghiệp) bạn cần tự thực hiện — đây là bước ngoài phạm vi code.

## Đưa code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit: PNG ONE FASHION website"
git branch -M main
git remote add origin <URL_REPO_CUA_BAN>
git push -u origin main
```

`.env` đã được thêm vào `.gitignore` nên sẽ không bị đẩy lên GitHub — đừng bao giờ commit file này.

## Deploy lên Hostinger

Gói Hostinger Shared/Business hỗ trợ chạy Node.js qua tính năng **Node.js App** trong hPanel (dựa trên Passenger).

1. Đăng nhập **hPanel** → **Advanced** → **Node.js**.
2. Tạo ứng dụng Node.js mới:
   - **Application root:** thư mục chứa code (ví dụ `public_html/pngonefashion`)
   - **Application startup file:** `server.js`
   - **Node.js version:** 18 trở lên
3. Đưa code lên server bằng một trong hai cách:
   - **Git:** nếu hPanel hỗ trợ deploy từ Git, trỏ tới repo GitHub và nhánh `main`.
   - **File Manager / SSH:** upload toàn bộ thư mục (trừ `node_modules` và `.env`), sau đó SSH vào server chạy `npm install --production`.
4. Trong hPanel, mục **Environment variables** của ứng dụng Node.js, khai báo toàn bộ biến trong `.env.example` (đặc biệt `MONGODB_URI`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, và các biến VNPay/MoMo với `BASE_URL`/`*_RETURN_URL` trỏ về domain thật, ví dụ `https://pngonefashion.com`).
5. Chạy `npm run seed` một lần qua SSH để tạo dữ liệu mẫu và tài khoản admin đầu tiên.
6. Khởi động lại ứng dụng trong hPanel. Trỏ domain/subdomain của bạn tới ứng dụng Node.js này.
7. Kiểm tra SSL (Hostinger cấp miễn phí qua Let's Encrypt trong **Security** → **SSL**) và bật HTTPS.

## Cấu trúc thư mục

```
config/       Kết nối MongoDB
controllers/  Xử lý logic route
middleware/   Đa ngôn ngữ, xác thực admin
models/       Schema Mongoose (Product, Category, Order, Admin)
routes/       Định tuyến Express
services/     Tích hợp VNPay, MoMo
views/        Template EJS (shop + admin)
public/       CSS, JS tĩnh
locales/      Từ điển vi.json / en.json
seed/         Script seed dữ liệu mẫu
```
