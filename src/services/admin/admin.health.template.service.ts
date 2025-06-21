import { IHealthCheckTemplate } from '@/interfaces/healthcheck.templates.interface';
import { AppError } from '@/utils/globalErrorHandler';

import { HealthCheckCampaign } from '@/models/healthcheck.campaign.model';
import { HealthCheckTemplate } from '@/models/healthcheck.templates.model';
import { FilterQuery } from 'mongoose';


const createAppError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

class AdminHealthTemplateService {
  private templates = HealthCheckTemplate;
  private campaigns = HealthCheckCampaign;

  public async createHealthCheckTemplate(templateData: Omit<IHealthCheckTemplate, '_id'>): Promise<IHealthCheckTemplate> {
    const existingTemplate = await this.templates.findOne({ name: templateData.name });
    if (existingTemplate) {
      throw createAppError(409, `A health check template with the name "${templateData.name}" already exists.`);
    }

    const newTemplate = await this.templates.create(templateData);
    return newTemplate;
  }

  public async getHealthCheckTemplates(query: {
    page?: string;
    limit?: string;
    search?: string; 
    type?: string;   
  }): Promise<{ templates: IHealthCheckTemplate[]; total: number; pages: number; currentPage: number }> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const findQuery: FilterQuery<IHealthCheckTemplate> = {};

    if (query.search) {
      findQuery.name = { $regex: query.search, $options: 'i' };
    }
    if (query.type) {
      findQuery.type = query.type;
    }

    const [templates, total] = await Promise.all([
      this.templates.find(findQuery).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      this.templates.countDocuments(findQuery),
    ]);

    return {
      templates,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }


  public async getHealthCheckTemplateById(templateId: string): Promise<IHealthCheckTemplate> {
    const template = await this.templates.findById(templateId);
    if (!template) {
      throw createAppError(404, 'Health check template not found.');
    }
    return template;
  }


  public async updateHealthCheckTemplate(templateId: string, updateData: Partial<IHealthCheckTemplate>): Promise<IHealthCheckTemplate> {
    const template = await this.templates.findById(templateId);
    if (!template) {
      throw createAppError(404, 'Health check template not found to update.');
    }

    // Kiểm tra xem tên mới có bị trùng không
    if (updateData.name && updateData.name !== template.name) {
      const existingTemplate = await this.templates.findOne({ name: updateData.name });
      if (existingTemplate) {
        throw createAppError(409, `A health check template with the name "${updateData.name}" already exists.`);
      }
    }

    Object.assign(template, updateData);
    await template.save();
    return template;
  }


  public async deleteHealthCheckTemplate(templateId: string): Promise<void> {
    // Kiểm tra xem mẫu này có đang được sử dụng bởi bất kỳ chiến dịch nào không
    const campaignUsingTemplate = await this.campaigns.findOne({ templateId: templateId });
    if (campaignUsingTemplate) {
      throw createAppError(
        409, // 409 Conflict
        `Cannot delete this template because it is being used by the campaign: "${campaignUsingTemplate.name}".`,
      );
    }

    const deletedTemplate = await this.templates.findByIdAndDelete(templateId);
    if (!deletedTemplate) {
      throw createAppError(404, 'Health check template not found to delete.');
    }
  }
}

export default AdminHealthTemplateService;