import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { HealthCheckTemplate } from '@models/healthcheck.templates.model';
import { IHealthCheckTemplate } from '@/interfaces/healthcheck.templates.interface';
import { handleSuccessResponse } from '@/utils/responseHandler';

const createHealthCheckTemplate = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const body: IHealthCheckTemplate = req.body;
  try {
    const existingTemplate = await HealthCheckTemplate.findOne({
      name: body.name,
    });
    const isMatch = existingTemplate && existingTemplate.name === body.name;
    if (isMatch) {
      res.status(400).json({
        success: false,
        message: 'Health Check Template with this name already exists',
      });
      return;
    }

    const template: IHealthCheckTemplate =
      await HealthCheckTemplate.create(body);
    if (!template) {
      res.status(400).json({
        success: false,
        message: 'Failed to create Health Check Template',
      });
      return;
    }

    handleSuccessResponse(
      res,
      200,
      'Health Check Template created successfully',
      template,
    );
    return;
  } catch (error) {
    console.error('Error in createHealthCheckTemplate:', error);
    throw new Error('Internal Server Error');
  }
};

const getAllHealthCheckTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await HealthCheckTemplate.find();
    if (!templates || templates.length === 0) {
      res.status(404).json({ success: false, message: 'No templates found' });
      return;
    }

    handleSuccessResponse(
      res,
      200,
      'Health Check Templates retrieved successfully',
      templates,
    );
  } catch (error) {
    console.error('Error in getAllHealthCheckTemplates:', error);
    throw new Error('Internal Server Error');
  }
};

const getHealthCheckTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const template = await HealthCheckTemplate.findById(id);
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    handleSuccessResponse(
      res,
      200,
      'Health Check Template retrieved successfully',
      template,
    );
  } catch (error) {
    console.error('Error in getHealthCheckTemplate:', error);
    throw new Error('Internal Server Error');
  }
};

const setDefaultForHealthCheckTemplate = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.body;
  try {
    const template = await HealthCheckTemplate.findById(id);
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }
    if (template.isDefault) {
      res.status(400).json({
        success: false,
        message: 'This template is already set as default',
      });
      return;
    }

    const getAllTemplates = await HealthCheckTemplate.find();
    if (getAllTemplates.length > 0) {
      await HealthCheckTemplate.updateMany(
        { isDefault: true },
        { isDefault: false },
      );
    }

    template.isDefault = true;
    await template.save();

    handleSuccessResponse(
      res,
      200,
      'Health Check Template set as default successfully',
      template,
    );
  } catch (error) {
    console.error('Error in setDefaultForHealthCheckTemplate:', error);
    throw new Error('Internal Server Error');
  }
};

const deleteHealthCheckTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const template = await HealthCheckTemplate.findById(id);
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }
    if (template.isDefault) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete the default Health Check Template',
      });
      return;
    }

    await HealthCheckTemplate.findByIdAndDelete(id);
    handleSuccessResponse(
      res,
      200,
      'Health Check Template deleted successfully',
    );
  } catch (error) {
    console.error('Error in deleteHealthCheckTemplate:', error);
    throw new Error('Internal Server Error');
  }
};

const updateHealthCheckTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const body: Partial<IHealthCheckTemplate> = req.body;

  try {
    const template = await HealthCheckTemplate.findById(id);
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    const updatedTemplate = await HealthCheckTemplate.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true },
    );

    handleSuccessResponse(
      res,
      200,
      'Health Check Template updated successfully',
      updatedTemplate,
    );
  } catch (error) {
    console.error('Error in updateHealthCheckTemplate:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export {
  createHealthCheckTemplate,
  getAllHealthCheckTemplates,
  getHealthCheckTemplate,
  setDefaultForHealthCheckTemplate,
  deleteHealthCheckTemplate,
  updateHealthCheckTemplate,
};
