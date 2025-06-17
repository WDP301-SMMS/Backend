import { IHealthCheckTemplate } from '@/interfaces/healthcheck.templates.interface';
import AdminHealthTemplateService from '@/services/admin.health.template.service';
import { NextFunction, Request, Response } from 'express';


const adminHealthTemplateService = new AdminHealthTemplateService();

const createHealthCheckTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const templateData: IHealthCheckTemplate = req.body;

    // Validation cơ bản
    if (!templateData.name || !templateData.description || !templateData.type || !Array.isArray(templateData.checkupItems)) {
      res.status(400).json({ message: 'Missing required fields: name, description, type, checkupItems' });
      return;
    }

    const newTemplate = await adminHealthTemplateService.createHealthCheckTemplate(templateData);
    res.status(201).json({ data: newTemplate, message: 'Health check template created successfully' });
  } catch (error) {
    next(error);
  }
};

const getHealthCheckTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      type?: string;
    };
    const result = await adminHealthTemplateService.getHealthCheckTemplates(query);
    res.status(200).json({ data: result, message: 'Health check templates retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

const getHealthCheckTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { templateId } = req.params;
    const template = await adminHealthTemplateService.getHealthCheckTemplateById(templateId);
    res.status(200).json({ data: template, message: 'Health check template retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

const updateHealthCheckTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { templateId } = req.params;
    const updateData: Partial<IHealthCheckTemplate> = req.body;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'Request body cannot be empty' });
      return;
    }

    const updatedTemplate = await adminHealthTemplateService.updateHealthCheckTemplate(templateId, updateData);
    res.status(200).json({ data: updatedTemplate, message: 'Health check template updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteHealthCheckTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { templateId } = req.params;
    await adminHealthTemplateService.deleteHealthCheckTemplate(templateId);
    res.status(200).json({ message: 'Health check template deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const AdminHealthTemplateController = {
  createHealthCheckTemplate,
  getHealthCheckTemplates,
  getHealthCheckTemplateById,
  updateHealthCheckTemplate,
  deleteHealthCheckTemplate,
};