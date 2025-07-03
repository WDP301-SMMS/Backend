export enum InventoryLogType {
  WITHDRAWAL_FOR_INCIDENT = 'WITHDRAWAL_FOR_INCIDENT', // Y tá lấy cho sự cố
  ADD_STOCK = 'ADD_STOCK',                             // Manager nhập kho
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',             // Manager điều chỉnh
  DISPOSE_EXPIRED = 'DISPOSE_EXPIRED',                 // Hủy hàng hết hạn
  RETURN_TO_STOCK = 'RETURN_TO_STOCK',
}

export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',             // Còn hàng (trên ngưỡng cảnh báo)
  LOW_STOCK = 'LOW_STOCK',           // Tồn kho thấp (dưới hoặc bằng ngưỡng cảnh báo)
  OUT_OF_STOCK = 'OUT_OF_STOCK',   // Hết hàng
  DISCONTINUED = 'DISCONTINUED',     // Ngừng sử dụng (không nhập thêm nữa)
}

export enum InventoryType {
  MEDICINE = 'MEDICINE',         // Thuốc
  SUPPLIES = 'MEDICAL_SUPPLIES', // Vật tư y tế
}