import { NextFunction, Request, Response } from 'express';
import { IHealthcareOrganization } from '@/interfaces/healthcare.organizations.interface';
import AdminPartnerService from '@/services/admin.partners.service';

const adminPartnerService = new AdminPartnerService();

const createPartner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const partnerData: IHealthcareOrganization = req.body;


    if (!partnerData.name || !partnerData.email || !partnerData.phone || !partnerData.type) {
      res.status(400).json({ message: 'Missing required fields: name, email, phone, type' });
      return;
    }

    const newPartner = await adminPartnerService.createPartner(partnerData);
    res.status(201).json({ data: newPartner, message: 'Partner created successfully' });
  } catch (error) {
    next(error);
  }
};


const getPartners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      status?: 'active' | 'inactive' | 'all';
    };
    const result = await adminPartnerService.getPartners(query);
    res.status(200).json({ data: result, message: 'Partners retrieved successfully' });
  } catch (error) {
    next(error);
  }
};


const getPartnerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const partner = await adminPartnerService.getPartnerById(partnerId);
    res.status(200).json({ data: partner, message: 'Partner retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

const updatePartner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const updateData: Partial<IHealthcareOrganization> = req.body;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'Request body cannot be empty' });
      return;
    }

    const updatedPartner = await adminPartnerService.updatePartner(partnerId, updateData);
    res.status(200).json({ data: updatedPartner, message: 'Partner updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deletePartner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { partnerId } = req.params;
    await adminPartnerService.deletePartner(partnerId);
    res.status(200).json({ message: 'Partner deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const AdminPartnerController = {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartner,
  deletePartner,
};