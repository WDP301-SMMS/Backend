import { IHealthcareOrganization } from '@/interfaces/healthcare.organizations.interface';
import { HealthCheckCampaign } from '@/models/healthcheck.campaign.model';
import { HealthcareOrganization } from '@/models/healthcare.organizations.model';
import { FilterQuery } from 'mongoose';
import { AppError } from '@/middlewares/globalErrorHandler';

const createAppError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

class AdminPartnerService {
  private partners = HealthcareOrganization;
  private campaigns = HealthCheckCampaign;

  /**
   * @description Tạo một đối tác y tế mới.
   * @route POST /api/admin/partners
   */
  public async createPartner(partnerData: Omit<IHealthcareOrganization, '_id'>): Promise<IHealthcareOrganization> {
    const existingPartner = await this.partners.findOne({
      $or: [{ name: partnerData.name }, { email: partnerData.email }],
    });
    if (existingPartner) {
      throw createAppError(409, `A partner with this name or email already exists.`);
    }

    const newPartner = await this.partners.create(partnerData);
    return newPartner;
  }

  /**
   * @description Lấy danh sách các đối tác y tế, hỗ trợ phân trang và tìm kiếm.
   * @route GET /api/admin/partners
   */
  public async getPartners(query: {
    page?: string;
    limit?: string;
    search?: string; // Tìm theo tên hoặc email
    status?: 'active' | 'inactive' | 'all'; // Lọc theo trạng thái
  }): Promise<{ partners: IHealthcareOrganization[]; total: number; pages: number; currentPage: number }> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const findQuery: FilterQuery<IHealthcareOrganization> = {};

    if (query.search) {
      findQuery.$or = [{ name: { $regex: query.search, $options: 'i' } }, { email: { $regex: query.search, $options: 'i' } }];
    }

    if (query.status && query.status !== 'all') {
      findQuery.isActive = query.status === 'active';
    }

    const [partners, total] = await Promise.all([
      this.partners.find(findQuery).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      this.partners.countDocuments(findQuery),
    ]);

    return {
      partners,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  /**
   * @description Lấy thông tin chi tiết của một đối tác bằng ID.
   * @route GET /api/admin/partners/:partnerId
   */
  public async getPartnerById(partnerId: string): Promise<IHealthcareOrganization> {
    const partner = await this.partners.findById(partnerId);
    if (!partner) {
      throw createAppError(404, 'Partner not found.');
    }
    return partner;
  }

  /**
   * @description Cập nhật thông tin của một đối tác.
   * @route PUT /api/admin/partners/:partnerId
   */
  public async updatePartner(partnerId: string, updateData: Partial<IHealthcareOrganization>): Promise<IHealthcareOrganization> {
    const partner = await this.partners.findById(partnerId);
    if (!partner) {
      throw createAppError(404, 'Partner not found to update.');
    }

    // Kiểm tra trùng lặp nếu tên hoặc email được thay đổi
    if (updateData.name && updateData.name !== partner.name) {
      const existing = await this.partners.findOne({ name: updateData.name });
      if (existing) throw createAppError(409, `A partner with the name "${updateData.name}" already exists.`);
    }
    if (updateData.email && updateData.email !== partner.email) {
      const existing = await this.partners.findOne({ email: updateData.email });
      if (existing) throw createAppError(409, `A partner with the email "${updateData.email}" already exists.`);
    }

    Object.assign(partner, updateData);
    await partner.save();
    return partner;
  }

  /**
   * @description Xóa một đối tác y tế.
   *              Thực tế, chúng ta nên vô hiệu hóa thay vì xóa cứng để bảo toàn lịch sử.
   *              Tuy nhiên, nếu yêu cầu là xóa, cần kiểm tra ràng buộc.
   * @route DELETE /api/admin/partners/:partnerId
   */
  public async deletePartner(partnerId: string): Promise<void> {
    const campaignWithPartner = await this.campaigns.findOne({ partnerId: partnerId });
    if (campaignWithPartner) {
      throw createAppError(
        409,
        `Cannot delete this partner as it is associated with the campaign: "${campaignWithPartner.name}". Please consider deactivating the partner instead.`,
      );
    }

    const deletedPartner = await this.partners.findByIdAndDelete(partnerId);
    if (!deletedPartner) {
      throw createAppError(404, 'Partner not found to delete.');
    }
  }
}

export default AdminPartnerService;