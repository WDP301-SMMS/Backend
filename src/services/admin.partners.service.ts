import { IHealthcareOrganization, IManagerInfo, IPartnerStaff } from '@/interfaces/healthcare.organizations.interface';
import { HealthcareOrganization, OrganizationManager, OrganizationStaffs } from '@/models/healthcare.organizations.model';

import mongoose, { FilterQuery } from 'mongoose';
import { AppError } from '@/utils/globalErrorHandler';
import { VaccinationRecordModel } from '@/models/vacination.record.model';


const createAppError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

interface ICreatePartnerAndManagerDTO {
  organization: Omit<IHealthcareOrganization, '_id' | 'managerInfo' | 'staffMembers'>;
  managerInfo: Omit<IManagerInfo, '_id' | 'organizationId'>;
}

type IAddStaffDTO = Omit<IPartnerStaff, '_id' | 'organizationId' | 'isActive'>;




class AdminPartnerService {
  private partners = HealthcareOrganization;
  private managers = OrganizationManager;
  private staffs = OrganizationStaffs;
  private vaccinationRecords = VaccinationRecordModel;


  public async createPartner(partnerData: ICreatePartnerAndManagerDTO): Promise<IHealthcareOrganization> {
    const existingPartner = await this.partners.findOne({
      $or: [{ name: partnerData.organization.name }, { email: partnerData.organization.email }],
    });
    if (existingPartner) {
      throw createAppError(409, `A partner with this name or email already exists.`);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const newOrg = new this.partners(partnerData.organization);

      const newManagerData = { ...partnerData.managerInfo, organizationId: newOrg._id };
      const [newManager] = await this.managers.create([newManagerData], { session });

      newOrg.managerInfo = newManager._id;
      await newOrg.save({ session });

      await session.commitTransaction();

      return await this.getPartnerById(newOrg._id.toString());

    } catch (error) {
      await session.abortTransaction();
      
      if (error instanceof Error) {
        throw createAppError(500, `Failed to create partner: ${error.message}`);
      } else {
        throw createAppError(500, `Failed to create partner due to an unknown error.`);
      }

    } finally {
      session.endSession();
    }
  }


  public async addStaffToPartner(partnerId: string, staffData: IAddStaffDTO): Promise<IPartnerStaff> {
    const partner = await this.partners.findById(partnerId);
    if (!partner) {
      throw createAppError(404, 'Partner not found to add staff to.');
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const newStaffData = { ...staffData, organizationId: partnerId };
      const [newStaff] = await this.staffs.create([newStaffData], { session });

      await this.partners.findByIdAndUpdate(
        partnerId,
        { $push: { staffMembers: newStaff._id } },
        { session }
      );

      await session.commitTransaction();
      return newStaff;
    } catch (error) {
      await session.abortTransaction();
      throw createAppError(500, `Failed to add staff member: ${(error as Error).message}`);
    } finally {
      session.endSession();
    }
  }


  public async updateStaffMember(staffId: string, updateData: Partial<IAddStaffDTO>): Promise<IPartnerStaff> {
    const updatedStaff = await this.staffs.findByIdAndUpdate(staffId, updateData, { new: true });
    if (!updatedStaff) {
      throw createAppError(404, 'Staff member not found to update.');
    }
    return updatedStaff;
  }


  public async removeStaffFromPartner(partnerId: string, staffId: string): Promise<void> {
    const existingRecord = await this.vaccinationRecords.findOne({ administeredByStaffId: staffId });
    if (existingRecord) {
      throw createAppError(
        409, // Conflict
        `Cannot remove this staff member as they are associated with existing vaccination records. Please consider deactivating them instead.`
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const staffToRemove = await this.staffs.findById(staffId);
      if (!staffToRemove || staffToRemove.organizationId.toString() !== partnerId) {
        throw createAppError(404, 'Staff member not found in this organization.');
      }

      await this.partners.findByIdAndUpdate(
        partnerId,
        { $pull: { staffMembers: staffId } },
        { session }
      );

      await this.staffs.findByIdAndDelete(staffId, { session });

      await session.commitTransaction();
    } catch (error) {
      if (!(error instanceof Error && 'status' in error)) {
        throw createAppError(500, `Failed to remove staff member: ${(error as Error).message}`);
      }
      throw error;
    } finally {
      session.endSession();
    }
  }


  public async updateManager(managerId: string, updateData: Partial<Omit<IManagerInfo, '_id' | 'organizationId'>>): Promise<IManagerInfo> {
    const updatedManager = await this.managers.findByIdAndUpdate(managerId, updateData, { new: true });
    if (!updatedManager) {
      throw createAppError(404, 'Manager not found to update.');
    }
    return updatedManager;
  }


  public async replaceManager(partnerId: string, newManagerData: Omit<IManagerInfo, '_id' | 'organizationId'>): Promise<IManagerInfo> {
    const partner = await this.partners.findById(partnerId);
    if (!partner) {
      throw createAppError(404, 'Partner not found to replace manager for.');
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const createdManagerData = { ...newManagerData, organizationId: partnerId };
      const [newManager] = await this.managers.create([createdManagerData], { session });

      const oldManagerId = partner.managerInfo;
      partner.managerInfo = newManager._id;
      await partner.save({ session });

      await this.managers.findByIdAndDelete(oldManagerId, { session });

      await session.commitTransaction();
      return newManager;
    } catch (error) {
      await session.abortTransaction();
      throw createAppError(500, `Failed to replace manager: ${(error as Error).message}`);
    } finally {
      session.endSession();
    }
  }

  public async getPartners(query: {
    page?: string;
    limit?: string;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
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
      this.partners.find(findQuery)
        .populate('managerInfo')
        .populate('staffMembers')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.partners.countDocuments(findQuery),
    ]);

    return {
      partners: partners as IHealthcareOrganization[],
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  public async getPartnerById(partnerId: string): Promise<IHealthcareOrganization> {
    const partner = await this.partners
      .findById(partnerId)
      .populate('managerInfo')
      .populate('staffMembers')
      .lean();

    if (!partner) {
      throw createAppError(404, 'Partner not found.');
    }
    return partner as IHealthcareOrganization;
  }

  public async updatePartner(partnerId: string, updateData: Partial<IHealthcareOrganization>): Promise<IHealthcareOrganization> {
    const updatedPartner = await this.partners.findByIdAndUpdate(partnerId, { $set: updateData }, { new: true });

    if (!updatedPartner) {
      throw createAppError(404, 'Partner not found to update.');
    }

    return await this.getPartnerById(updatedPartner._id.toString());
  }

  public async updatePartnerStatus(partnerId: string, isActive: boolean): Promise<IHealthcareOrganization> {
    const partner = await this.partners.findById(partnerId);
    if (!partner) {
      throw createAppError(404, 'Partner not found.');
    }

    if (partner.isActive === isActive) {
      throw createAppError(409, `Partner is already ${isActive ? 'active' : 'inactive'}.`);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      partner.isActive = isActive;
      await partner.save({ session });

      await this.staffs.updateMany(
        { organizationId: partnerId },
        { $set: { isActive: isActive } },
        { session }
      );

      await session.commitTransaction();

      return await this.getPartnerById(partnerId);

    } catch (error) {
      await session.abortTransaction();
      throw createAppError(500, `Failed to update partner status: ${(error as Error).message}`);
    } finally {
      session.endSession();
    }
  }
}

export default AdminPartnerService;
