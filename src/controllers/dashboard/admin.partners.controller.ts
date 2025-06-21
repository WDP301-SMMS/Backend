import { NextFunction, Request, Response } from 'express';
import AdminPartnerService from '@/services/admin/admin.partners.service';
import { IHealthcareOrganization, IManagerInfo } from '@/interfaces/healthcare.organizations.interface';

const adminPartnerService = new AdminPartnerService();


const createPartner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { organization, managerInfo } = req.body;

    if (!organization || !managerInfo) {
      res.status(400).json({ message: 'Request body must include "organization" and "managerInfo" objects.' });
      return;
    }

    const newPartner = await adminPartnerService.createPartner({ organization, managerInfo });
    res.status(201).json({ data: newPartner, message: 'Partner and manager created successfully.' });
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
    res.status(200).json({ data: result, message: 'Partners retrieved successfully.' });
  } catch (error) {
    next(error);
  }
};


const getPartnerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const partner = await adminPartnerService.getPartnerById(partnerId);
    res.status(200).json({ data: partner, message: 'Partner retrieved successfully.' });
  } catch (error) {
    next(error);
  }
};


const updatePartner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const updateData: Partial<IHealthcareOrganization> = req.body;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'Request body cannot be empty.' });
      return;
    }

    const updatedPartner = await adminPartnerService.updatePartner(partnerId, updateData);
    res.status(200).json({ data: updatedPartner, message: 'Partner updated successfully.' });
  } catch (error) {
    next(error);
  }
};


const updatePartnerStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ message: 'Request body must include an "isActive" boolean field.' });
      return;
    }

    const updatedPartner = await adminPartnerService.updatePartnerStatus(partnerId, isActive);
    res.status(200).json({ data: updatedPartner, message: `Partner status updated to ${isActive ? 'active' : 'inactive'}.` });
  } catch (error) {
    next(error);
  }
};


const addStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const staffData = req.body;
    const newStaff = await adminPartnerService.addStaffToPartner(partnerId, staffData);
    res.status(201).json({ data: newStaff, message: 'Staff member added successfully.' });
  } catch (error) {
    next(error);
  }
};


const removeStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { partnerId, staffId } = req.params;
    await adminPartnerService.removeStaffFromPartner(partnerId, staffId);
    res.status(200).json({ message: 'Staff member removed successfully.' });
  } catch (error) {
    next(error);
  }
};


const replaceManager = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const newManagerData: Omit<IManagerInfo, '_id' | 'organizationId'> = req.body;

    const newManager = await adminPartnerService.replaceManager(partnerId, newManagerData);
    res.status(200).json({ data: newManager, message: 'Manager replaced successfully.' });
  } catch (error) {
    next(error);
  }
};

export const AdminPartnerController = {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartner,
  updatePartnerStatus,
  addStaff,
  removeStaff,
  replaceManager,
};