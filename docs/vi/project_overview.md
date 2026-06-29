# Tổng Quan Dự Án Volio Review Agent

Tài liệu này dành cho người thiết kế, product owner, hoặc người vận hành muốn
nắm nhanh mục tiêu của dự án. Nguồn chuẩn cho Agent vẫn là các tài liệu tiếng
Anh trong thư mục `docs/`.

## Mục Tiêu

Volio Review Agent giúp xử lý review trên Apps Publisher Volio bằng các mẫu trả
lời đã lưu sẵn. Hệ thống không tự sinh nội dung trả lời mới, mà chỉ chọn
template phù hợp, kiểm tra an toàn, gửi qua giao diện Volio, và ghi log đầy đủ.

## Nguyên Tắc Sản Phẩm

- Chỉ dùng template có sẵn.
- Không bấm `Rewrite with AI`.
- Không sửa nội dung reply bằng tay.
- Review mơ hồ thì bỏ qua và ghi lý do, không chọn bừa.
- Trước khi gửi phải validate sạch lỗi và warning.
- Sau khi gửi phải đối chiếu lại UI để đảm bảo không bỏ sót review có thể trả lời.

## Các Thành Phần Chính

- Python controller: điều phối scrape, validate, reply, và export log.
- Browser agent: chạy trong tab Volio để đọc card review và chọn template.
- `review_rules.json`: rule chọn intent, template, folder, alias.
- Log theo từng app: nằm trong `apps/<app>/logs`.
- Kimi WebBridge: cầu nối giữa Agent và Chrome.

## Kết Quả Mong Muốn

Mỗi batch phải cho biết rõ:

- Đã gửi bao nhiêu reply.
- Đã skip bao nhiêu review và vì sao.
- Có bao nhiêu lỗi cần xử lý.
- Còn review nào trên UI chưa được xử lý không.
- Nếu còn, lý do là gì và có retry được không.

## Lưu Ý Cho Người Thiết Kế

Nếu cần thay đổi tone, nội dung, hoặc nhóm template, hãy cập nhật template/rule
trước, sau đó chạy validate lại. Không nên yêu cầu Agent tự viết câu trả lời riêng
cho từng review vì điều đó phá vỡ nguyên tắc an toàn của dự án.
