# GIẢI THÍCH CÁC FEATURES TRONG BỘ DỮ LIỆU

## Tổng Quan

Bộ dữ liệu METABRIC chứa thông tin lâm sàng của 1,906 bệnh nhân ung thư vú. Dự án sử dụng 12 features chính để dự đoán loại ung thư vú chi tiết.

---

## 1. THÔNG TIN PHẪU THUẬT & UNG THƯ

### 1.1. type_of_breast_surgery (Loại Phẫu Thuật Vú)

**Ý nghĩa**: Phương pháp phẫu thuật mà bệnh nhân đã trải qua.

**Các giá trị**:
- **BREAST CONSERVING** (Bảo tồn vú): 
  - Chỉ cắt bỏ khối u và một phần mô xung quanh
  - Giữ lại hầu hết mô vú
  - Thường áp dụng khi khối u nhỏ, chưa lan rộng
  
- **MASTECTOMY** (Cắt bỏ vú):
  - Loại bỏ toàn bộ hoặc hầu hết mô vú
  - Áp dụng khi khối u lớn hoặc đã lan rộng

**Vai trò**: Loại phẫu thuật phản ánh mức độ nghiêm trọng và phạm vi của ung thư.

---

### 1.2. cancer_type (Loại Ung Thư)

**Ý nghĩa**: Phân loại ung thư ở mức độ tổng quát.

**Các giá trị**:
- **Breast Cancer** (Ung thư vú): Loại ung thư phổ biến nhất
- **Breast Sarcoma** (U xơ vú): Loại ung thư hiếm gặp, khởi phát từ mô liên kết

**Vai trò**: Phân biệt hai loại ung thư có nguồn gốc tế bào khác nhau.

---

### 1.3. cellularity (Mật Độ Tế Bào)

**Ý nghĩa**: Mức độ tập trung của tế bào ung thư trong khối u.

**Các giá trị**:
- **High** (Cao): Khối u có nhiều tế bào ung thư, mật độ cao
- **Moderate** (Trung bình): Mật độ tế bào vừa phải
- **Low** (Thấp): Ít tế bào ung thư, mật độ thấp

**Vai trò**: Mật độ cao thường cho thấy khối u phát triển nhanh và có tính xâm lấn cao hơn.

**Ví dụ dễ hiểu**: Giống như so sánh mật độ dân số - thành phố đông đúc vs vùng nông thôn.

---

### 1.4. neoplasm_histologic_grade (Độ Mô Học)

**Ý nghĩa**: Đánh giá mức độ bất thường của tế bào ung thư so với tế bào bình thường.

**Các giá trị**:
- **Grade 1** (Độ 1): 
  - Tế bào ung thư gần giống tế bào bình thường
  - Phát triển chậm, ít xâm lấn
  - Tiên lượng tốt nhất
  
- **Grade 2** (Độ 2):
  - Tế bào có một số điểm bất thường
  - Phát triển và lan rộng ở mức trung bình
  
- **Grade 3** (Độ 3):
  - Tế bào rất bất thường, khác xa tế bào bình thường
  - Phát triển nhanh, xâm lấn mạnh
  - Tiên lượng kém nhất

**Vai trò**: Chỉ số quan trọng để đánh giá mức độ ác tính và lập kế hoạch điều trị.

**Ví dụ dễ hiểu**: Giống như đánh giá độ "hư hỏng" của tế bào - từ hơi lệch (Grade 1) đến hoàn toàn biến dạng (Grade 3).

---

## 2. PHÂN TỬ & TRẠNG THÁI THỤ THỂ

### 2.1. pam50_+_claudin-low_subtype (Phân Loại PAM50)

**Ý nghĩa**: Phân loại phân tử dựa trên mẫu biểu hiện của 50 gen (PAM50 = Prediction Analysis of Microarray 50).

**Các giá trị**:
- **Basal**: 
  - Thường âm tính với thụ thể nội tiết (ER-, PR-, HER2-)
  - Gọi là "triple-negative"
  - Tiên lượng kém, khó điều trị
  
- **Her2**: 
  - Mức HER2 cao
  - Phát triển nhanh nhưng có thể điều trị bằng thuốc nhắm trúng đích
  
- **LumA** (Luminal A):
  - Thụ thể nội tiết dương tính, HER2 âm tính
  - Phát triển chậm
  - Tiên lượng tốt nhất, đáp ứng tốt với liệu pháp nội tiết
  
- **LumB** (Luminal B):
  - Thụ thể nội tiết dương tính
  - Phát triển nhanh hơn LumA
  - Tiên lượng trung bình
  
- **Normal**:
  - Mẫu gen tương tự mô vú bình thường
  - Ít gặp
  
- **NC** (Not Classified):
  - Không thể phân loại vào các nhóm trên
  
- **claudin-low**:
  - Phân nhóm đặc biệt
  - Có đặc tính tế bào gốc, khó điều trị

**Vai trò**: Rất quan trọng để quyết định phương pháp điều trị và tiên lượng.

**Ví dụ dễ hiểu**: Giống như phân loại ô tô theo động cơ và tính năng - mỗi loại có đặc điểm và cách xử lý khác nhau.

---

### 2.2. her2_status (Trạng Thái HER2)

**Ý nghĩa**: Đánh giá mức độ protein HER2 (Human Epidermal growth factor Receptor 2).

**Các giá trị**:
- **Positive** (Dương tính):
  - Tế bào ung thư có nhiều protein HER2
  - Khối u phát triển nhanh
  - Có thể điều trị bằng thuốc nhắm trúng HER2 (như Herceptin)
  
- **Negative** (Âm tính):
  - Mức HER2 bình thường hoặc thấp
  - Không sử dụng được thuốc nhắm trúng HER2

**Vai trò**: Quyết định có thể sử dụng liệu pháp nhắm trúng đích hay không.

**Ví dụ dễ hiểu**: HER2 như một "công tắc tăng trưởng" - nếu bật (positive), tế bào phát triển nhanh.

---

### 2.3. pr_status (Trạng Thái PR)

**Ý nghĩa**: Đánh giá mức độ thụ thể Progesterone (PR - Progesterone Receptor).

**Các giá trị**:
- **Positive** (Dương tính):
  - Tế bào ung thư có thụ thể progesterone
  - Đáp ứng tốt với liệu pháp nội tiết
  - Tiên lượng tốt hơn
  
- **Negative** (Âm tính):
  - Không có thụ thể progesterone
  - Không sử dụng được liệu pháp nội tiết

**Vai trò**: Cùng với ER status, quyết định khả năng điều trị bằng hormone.

**Ví dụ dễ hiểu**: Thụ thể PR như "ổ khóa" - nếu có (positive), ta có thể dùng "chìa khóa" hormone để kiểm soát tế bào ung thư.

---

### 2.4. lymph_nodes_examined_positive (Số Hạch Bạch Huyết Dương Tính)

**Ý nghĩa**: Số lượng hạch bạch huyết có chứa tế bào ung thư khi kiểm tra.

**Giá trị**: Số nguyên từ 0 trở lên
- **0**: Không có hạch nào bị ung thư (tốt)
- **1-3**: Ít hạch bị ung thư (trung bình)
- **>3**: Nhiều hạch bị ung thư (xấu)

**Vai trò**: Chỉ số quan trọng để đánh giá mức độ lan rộng của ung thư.

**Ví dụ dễ hiểu**: Hạch bạch huyết như "trạm kiểm soát" - nếu nhiều trạm bị xâm nhập, chứng tỏ ung thư đã lan rộng.

---

## 3. ĐIỀU TRỊ & THÔNG SỐ LÂM SÀNG

### 3.1. chemotherapy (Hóa Trị)

**Ý nghĩa**: Bệnh nhân có được điều trị bằng hóa chất hay không.

**Các giá trị**:
- **1 (Yes/Có)**: Đã dùng hóa trị
- **0 (No/Không)**: Chưa dùng hóa trị

**Vai trò**: Phương pháp điều trị quan trọng, đặc biệt cho ung thư giai đoạn muộn hoặc có nguy cơ cao.

**Ví dụ dễ hiểu**: Hóa trị như "thuốc diệt côn trùng" - tiêu diệt tế bào ung thư nhưng cũng ảnh hưởng đến tế bào khỏe.

---

### 3.2. hormone_therapy (Liệu Pháp Nội Tiết)

**Ý nghĩa**: Bệnh nhân có được điều trị bằng hormone hay không.

**Các giá trị**:
- **1 (Yes/Có)**: Đã dùng liệu pháp nội tiết
- **0 (No/Không)**: Chưa dùng liệu pháp nội tiết

**Vai trò**: Hiệu quả với ung thư có thụ thể nội tiết dương tính (ER+ hoặc PR+).

**Ví dụ dễ hiểu**: Liệu pháp nội tiết như "chặn nguồn năng lượng" - ngăn hormone nuôi dưỡng tế bào ung thư.

---

### 3.3. radio_therapy (Xạ Trị)

**Ý nghĩa**: Bệnh nhân có được điều trị bằng xạ trị hay không.

**Các giá trị**:
- **1 (Yes/Có)**: Đã dùng xạ trị
- **0 (No/Không)**: Chưa dùng xạ trị

**Vai trò**: Thường dùng sau phẫu thuật để tiêu diệt tế bào ung thư còn sót lại.

**Ví dụ dễ hiểu**: Xạ trị như "tia laser" - nhắm vào vùng cụ thể để phá hủy tế bào ung thư.

---

### 3.4. nottingham_prognostic_index (Chỉ Số Tiên Lượng Nottingham)

**Ý nghĩa**: Công thức tính toán dự đoán tiên lượng dựa trên kích thước khối u, số hạch dương tính và độ mô học.

**Công thức**: NPI = 0.2 × tumor_size + lymph_node_stage + grade

**Giá trị**: Số thực (float) từ 2.0 đến 6.8+
- **< 3.4**: Tiên lượng tốt (Good)
- **3.4 - 5.4**: Tiên lượng trung bình (Moderate)
- **> 5.4**: Tiên lượng kém (Poor)

**Vai trò**: Chỉ số tổng hợp giúp bác sĩ đánh giá tổng thể và lập kế hoạch điều trị.

**Ví dụ dễ hiểu**: NPI như "điểm tổng kết" - tổng hợp nhiều yếu tố để cho ra một con số đánh giá chung.

---

## 4. TARGET (BIẾN CẦN DỰ ĐOÁN)

### cancer_type_detailed (Loại Ung Thư Chi Tiết)

**Ý nghĩa**: Phân loại cụ thể về loại ung thư vú dựa trên nguồn gốc tế bào và đặc điểm mô học.

**Các giá trị**:

**0. Breast** (Ung thư vú chung)
- Phân loại chung, không xác định rõ loại cụ thể

**1. Breast Invasive Ductal Carcinoma** (Carcinoma ống tuyến xâm lấn)
- Loại phổ biến nhất (~70-80% trường hợp)
- Bắt nguồn từ ống dẫn sữa
- Có khả năng xâm lấn vào mô xung quanh

**2. Breast Invasive Lobular Carcinoma** (Carcinoma tiểu thùy xâm lấn)
- Loại phổ biến thứ hai (~10-15% trường hợp)
- Bắt nguồn từ tiểu thùy sản xuất sữa
- Thường khó phát hiện trên X-quang hơn

**3. Breast Invasive Mixed Mucinous Carcinoma** (Carcinoma nhầy hỗn hợp xâm lấn)
- Loại hiếm (~2-3% trường hợp)
- Tế bào ung thư sản xuất chất nhầy
- Thường tiên lượng tốt hơn các loại khác

**4. Breast Mixed Ductal and Lobular Carcinoma** (Carcinoma ống và tiểu thùy hỗn hợp)
- Kết hợp đặc điểm của cả ductal và lobular
- Hiếm gặp (~5% trường hợp)
- Tính chất trung gian giữa hai loại trên

**Vai trò**: Đây là mục tiêu dự đoán chính của mô hình - xác định chính xác loại ung thư giúp điều trị đúng hướng.

---

## TÓM TẮT

### Phân Nhóm Features

1. **Thông tin phẫu thuật & ung thư** (4 features):
   - type_of_breast_surgery, cancer_type, cellularity, neoplasm_histologic_grade

2. **Phân tử & thụ thể** (4 features):
   - pam50_+_claudin-low_subtype, her2_status, pr_status, lymph_nodes_examined_positive

3. **Điều trị & lâm sàng** (4 features):
   - chemotherapy, hormone_therapy, radio_therapy, nottingham_prognostic_index

### Tầm Quan Trọng

- **Quan trọng nhất**: PAM50 subtype, HER2 status, PR status, histologic grade
- **Quan trọng**: Lymph nodes positive, NPI, cellularity
- **Bổ sung**: Các thông tin điều trị và phẫu thuật

### Mục Tiêu

Sử dụng 12 features này để dự đoán chính xác 1 trong 5 loại ung thư vú chi tiết (cancer_type_detailed).
