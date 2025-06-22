import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

// Import tất cả các model
import { UserModel } from '../models/user.model';
import { StudentModel } from '../models/student.model';
import { Class } from '../models/class.model';
import { MedicalIncidentModel } from '../models/medical.incident.model';
import { MedicationRequestModel } from '../models/medication.request.model';
import {
  MedicalInventoryModel,
  InventoryDetailModel,
} from '../models/medical.inventory.model';
import { HealthCheckCampaign } from '../models/healthcheck.campaign.model';
import { HealthCheckResult } from '../models/healthcheck.result.model';
import { HealthCheckConsent } from '../models/healthcheck.consents.model';
import { HealthCheckTemplate } from '../models/healthcheck.templates.model';
import { HealthProfileModel } from '../models/health.profile.model';
import { HealthDevelopmentTracker } from '../models/health.development.tracker.model';
import {
  HealthcareOrganization,
  OrganizationManager,
  OrganizationStaffs,
} from '../models/healthcare.organizations.model';
import { InventoryLogModel } from '../models/inventory.logs.model';
import { MeetingScheduleModel } from '../models/meeting.schedule.model';
import { RequestItemModel } from '../models/medication.request.model';
import { MedicationScheduleModel } from '../models/medication.schedule.model';
import { VaccinationRecordModel } from '../models/vacination.record.model';
import { VaccinationConsentModel } from '../models/vaccination.consent.model';
import { VaccinationCampaignModel } from '../models/vaccination.campaign.model';
import { BlogPostModel } from '../models/blog.post.model';

// Import enums
import { RoleEnum } from '../enums/RoleEnum';
import { ConsentStatus } from '../enums/ConsentsEnum';
import { CampaignStatus, ExecutionType } from '../enums/CampaignEnum';

// Hàm helper để lấy một phần tử ngẫu nhiên từ mảng
const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Database connected!');

    // Xóa dữ liệu cũ
    console.log('Cleaning old data...');
    await Promise.all([
      UserModel.deleteMany({}),
      StudentModel.deleteMany({}),
      Class.deleteMany({}),
      MedicalIncidentModel.deleteMany({}),
      MedicationRequestModel.deleteMany({}),
      MedicalInventoryModel.deleteMany({}),
      InventoryDetailModel.deleteMany({}),
      HealthCheckCampaign.deleteMany({}),
      HealthCheckResult.deleteMany({}),
      HealthCheckConsent.deleteMany({}),
      HealthCheckTemplate.deleteMany({}),
      HealthProfileModel.deleteMany({}),
      HealthDevelopmentTracker.deleteMany({}),
      HealthcareOrganization.deleteMany({}),
      OrganizationStaffs.deleteMany({}),
      OrganizationManager.deleteMany({}),
      InventoryLogModel.deleteMany({}),
      MeetingScheduleModel.deleteMany({}),
      RequestItemModel.deleteMany({}),
      MedicationScheduleModel.deleteMany({}),
      VaccinationRecordModel.deleteMany({}),
      VaccinationConsentModel.deleteMany({}),
      VaccinationCampaignModel.deleteMany({}),
      BlogPostModel.deleteMany({}),
    ]);
    console.log('Old data cleaned!');

    // Tạo dữ liệu User
    console.log('Seeding User data...');
    const users = [
      {
        username: 'parent1',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'parent1@example.com',
        role: RoleEnum.Parent,
        dob: new Date('1980-01-01T00:00:00Z'),
        phone: '0123456789',
        isActive: true,
        authProvider: 'local',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        username: 'parent2',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'parent2@example.com',
        role: RoleEnum.Parent,
        dob: new Date('1982-02-02T00:00:00Z'),
        phone: '0987654321',
        isActive: true,
        authProvider: 'local',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        username: 'nurse1',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'nurse1@example.com',
        role: RoleEnum.Nurse,
        dob: new Date('1975-03-03T00:00:00Z'),
        phone: '0123987654',
        isActive: true,
        authProvider: 'local',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        username: 'admin1',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'admin1@example.com',
        role: RoleEnum.Admin,
        dob: new Date('1970-04-04T00:00:00Z'),
        phone: '0111222333',
        isActive: true,
        authProvider: 'local',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        username: 'manager1',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'manager1@example.com',
        role: RoleEnum.Manager,
        dob: new Date('1978-05-05T00:00:00Z'),
        phone: '0999888777',
        isActive: true,
        authProvider: 'local',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];
    const createdUsers = await UserModel.insertMany(users);
    const parents = createdUsers.filter((u) => u.role === RoleEnum.Parent);
    const nurses = createdUsers.filter((u) => u.role === RoleEnum.Nurse);

    // Tạo dữ liệu Class
    console.log('Seeding Class data...');
    const classInfos = [
      { className: 'Class 1A', gradeLevel: 6 },
      { className: 'Class 2B', gradeLevel: 7 },
      { className: 'Class 3C', gradeLevel: 8 },
      { className: 'Class 4A', gradeLevel: 9 },
      { className: 'Class 5B', gradeLevel: 6 },
    ];

    const classes = classInfos.map((c) => ({
      ...c,
      schoolYear: '2024-2025',
      students: [],
      totalStudents: 0,
      createdAt: new Date('2024-08-01T00:00:00Z'),
      updatedAt: new Date('2024-08-01T00:00:00Z'),
    }));
    const createdClasses = await Class.insertMany(classes);

    // Tạo dữ liệu Student
    console.log('Seeding Student data...');
    const studentsData = [
      {
        fullName: 'Nguyen Van A',
        dob: '2015-05-10',
        username: 'parent1',
        className: 'Class 1A',
      },
      {
        fullName: 'Tran Thi B',
        dob: '2015-06-15',
        username: 'parent2',
        className: 'Class 1A',
      },
      {
        fullName: 'Le Van C',
        dob: '2015-07-20',
        username: 'nurse1',
        className: 'Class 1A',
      },
      {
        fullName: 'Pham Thi D',
        dob: '2014-08-25',
        username: 'parent1',
        className: 'Class 2B',
      },
      {
        fullName: 'Hoang Van E',
        dob: '2014-09-30',
        username: 'parent2',
        className: 'Class 2B',
      },
      {
        fullName: 'Nguyen Thi F',
        dob: '2013-10-05',
        username: 'nurse1',
        className: 'Class 3C',
      },
      {
        fullName: 'Tran Van G',
        dob: '2013-11-10',
        username: 'parent1',
        className: 'Class 3C',
      },
      {
        fullName: 'Le Thi H',
        dob: '2012-12-15',
        username: 'parent2',
        className: 'Class 4A',
      },
      {
        fullName: 'Pham Van I',
        dob: '2015-01-20',
        username: 'nurse1',
        className: 'Class 5B',
      },
    ];

    const studentsToInsert = studentsData.map((s) => ({
      parentId: createdUsers.find((u) => u.username === s.username)!._id,
      classId: createdClasses.find((c) => c.className === s.className)!._id,
      fullName: s.fullName,
      dateOfBirth: new Date(`${s.dob}T00:00:00Z`),
    }));
    const createdStudents = await StudentModel.insertMany(studentsToInsert);

    // 3. Cập nhật lại Class với danh sách student tương ứng
    const classStudentMap = new Map<string, mongoose.Types.ObjectId[]>();

    for (const student of createdStudents) {
      const key = student.classId.toString();
      if (!classStudentMap.has(key)) {
        classStudentMap.set(key, []);
      }
      classStudentMap.get(key)!.push(student._id);
    }

    for (const [classId, studentIds] of classStudentMap) {
      await Class.findByIdAndUpdate(classId, {
        students: studentIds,
        totalStudents: studentIds.length,
      });
    }

    const dummyOrgId1 = new mongoose.Types.ObjectId();
    const dummyOrgId2 = new mongoose.Types.ObjectId();
    // Tạo dữ liệu OrganizationManager
    console.log('Seeding OrganizationManager data...');
    const organizationManagers = [
      {
        fullName: 'Dr. John Doe',
        email: 'john.doe@cityhealth.com',
        phone: '0123456789',
        organizationId: dummyOrgId1,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        fullName: 'Dr. Jane Smith',
        email: 'jane.smith@schoolhealth.com',
        phone: '0987654321',
        organizationId: dummyOrgId2,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];
    const createdOrganizationManagers =
      await OrganizationManager.insertMany(organizationManagers);

    // Tạo dữ liệu OrganizationStaff
    console.log('Seeding OrganizationStaff data...');
    const organizationStaff = [
      {
        fullName: 'Nurse Alice Brown',
        position: 'Nurse',
        isActive: true,
        organizationId: dummyOrgId2,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        fullName: 'Technician Bob White',
        position: 'Technician',
        isActive: true,
        organizationId: dummyOrgId2,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        fullName: 'Nurse Carol Green',
        position: 'Nurse',
        isActive: true,
        organizationId: dummyOrgId1,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];
    const createdOrganizationStaff =
      await OrganizationStaffs.insertMany(organizationStaff);

    // Tạo dữ liệu HealthcareOrganization
    console.log('Seeding HealthcareOrganization data...');
    const healthcareOrganizations = [
      {
        _id: dummyOrgId1, // gán lại đúng dummy ID
        name: 'City Health Clinic',
        address: '123 Health St, City',
        phone: '0123456789',
        email: 'contact@cityhealth.com',
        type: 'CLINIC',
        isActive: true,
        managerInfo: createdOrganizationManagers.find(
          (m) => m.email === 'john.doe@cityhealth.com',
        )!._id,
        staffMembers: [
          createdOrganizationStaff.find(
            (s) => s.fullName === 'Nurse Carol Green',
          )!._id,
        ],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        _id: dummyOrgId2,
        name: 'School Health Center',
        address: '456 School Rd, City',
        phone: '0987654321',
        email: 'info@schoolhealth.com',
        type: 'HEALTH_CENTER',
        isActive: true,
        managerInfo: createdOrganizationManagers.find(
          (m) => m.email === 'jane.smith@schoolhealth.com',
        )!._id,
        staffMembers: [
          createdOrganizationStaff.find(
            (s) => s.fullName === 'Nurse Alice Brown',
          )!._id,
          createdOrganizationStaff.find(
            (s) => s.fullName === 'Technician Bob White',
          )!._id,
        ],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];
    const createdHealthcareOrganizations =
      await HealthcareOrganization.insertMany(healthcareOrganizations);

    // Tạo dữ liệu HealthCheckTemplate
    console.log('Seeding HealthCheckTemplate data...');
    const healthCheckTemplates = [
      {
        name: 'General Health Check',
        description: 'Standard health check for students',
        type: 'GENERAL',
        checkupItems: [
          {
            itemName: 'Height',
            unit: 'cm',
            dataType: 'NUMBER',
            guideline: 'Measure standing height',
          },
          {
            itemName: 'Vision',
            dataType: 'TEXT',
            guideline: 'Use Snellen chart',
          },
        ],
        isDefault: true,
      },
      {
        name: 'Vision Screening',
        description: 'Vision check for students',
        type: 'VISION',
        checkupItems: [
          {
            itemName: 'Vision',
            dataType: 'TEXT',
            guideline: 'Use Snellen chart',
          },
        ],
        isDefault: false,
      },
    ];
    const createdHealthCheckTemplates =
      await HealthCheckTemplate.insertMany(healthCheckTemplates);

    // Tạo dữ liệu HealthCheckCampaign
    console.log('Seeding HealthCheckCampaign data...');
    const healthCheckCampaigns = [
      {
        name: 'Annual Health Check 2024',
        schoolYear: '2024-2025',
        startDate: new Date('2024-10-01T00:00:00Z'),
        endDate: new Date('2024-10-15T00:00:00Z'),
        templateId: createdHealthCheckTemplates.find(
          (t) => t.name === 'General Health Check',
        )!._id,
        targetGradeLevels: [6, 7],
        nurseId: createdUsers.find((u) => u.username === 'nurse1')!._id,
        status: CampaignStatus.DRAFT,
        createdBy: createdUsers.find((u) => u.username === 'parent1')!._id,
      },
      {
        name: 'Vision Screening 2025',
        schoolYear: '2024-2025',
        startDate: new Date('2025-02-01T00:00:00Z'),
        endDate: new Date('2025-02-10T00:00:00Z'),
        templateId: createdHealthCheckTemplates.find(
          (t) => t.name === 'Vision Screening',
        )!._id,
        targetGradeLevels: [8, 9],
        nurseId: createdUsers.find((u) => u.username === 'parent2')!._id,
        status: CampaignStatus.COMPLETED,
        createdBy: createdUsers.find((u) => u.username === 'parent1')!._id,
      },
    ];
    const createdHealthCheckCampaigns =
      await HealthCheckCampaign.insertMany(healthCheckCampaigns);

    // Tạo dữ liệu HealthCheckConsent
    console.log('Seeding HealthCheckConsent data...');
    const healthCheckConsents = [
      {
        campaignId: createdHealthCheckCampaigns.find(
          (c) => c.name === 'Annual Health Check 2024',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Van A')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'parent1')!._id,
        status: ConsentStatus.APPROVED,
        confirmedAt: new Date('2024-09-20T00:00:00Z'),
      },
      {
        campaignId: createdHealthCheckCampaigns.find(
          (c) => c.name === 'Annual Health Check 2024',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Tran Thi B')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'parent2')!._id,
        status: ConsentStatus.DECLINED,
        reasonForDeclining: 'Medical exemption',
        confirmedAt: new Date('2024-09-21T00:00:00Z'),
      },
      {
        campaignId: createdHealthCheckCampaigns.find(
          (c) => c.name === 'Vision Screening 2025',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Thi F')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'nurse1')!._id,
        status: ConsentStatus.PENDING,
      },
    ];
    await HealthCheckConsent.insertMany(healthCheckConsents);

    // Tạo dữ liệu HealthCheckResult
    console.log('Seeding HealthCheckResult data...');
    const healthCheckResults = [
      {
        campaignId: createdHealthCheckCampaigns.find(
          (c) => c.name === 'Annual Health Check 2024',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Van A')!
          ._id,
        checkupDate: new Date('2024-10-05T00:00:00Z'),
        resultsData: [
          {
            itemId: new mongoose.Types.ObjectId(),
            itemName: 'Height',
            value: 145,
            unit: 'cm',
            isAbnormal: false,
            notes: 'Normal growth',
          },
          {
            itemId: new mongoose.Types.ObjectId(),
            itemName: 'Vision',
            value: '20/20',
            isAbnormal: false,
            notes: 'Normal',
          },
        ],
        overallConclusion: 'Healthy',
        recommendation: 'Continue regular checkups',
        checkedBy: createdUsers.find((u) => u.username === 'nurse1')!._id,
        dataSource: 'DIRECT_INPUT',
        status: 'PENDING_REVIEW',
      },
      {
        campaignId: createdHealthCheckCampaigns.find(
          (c) => c.name === 'Vision Screening 2025',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Thi F')!
          ._id,
        checkupDate: new Date('2025-02-05T00:00:00Z'),
        resultsData: [
          {
            itemId: new mongoose.Types.ObjectId(),
            itemName: 'Vision',
            value: '20/25',
            isAbnormal: true,
            notes: 'Needs glasses',
          },
        ],
        overallConclusion: 'Vision issue detected',
        recommendation: 'Consult optometrist',
        checkedBy: createdUsers.find((u) => u.username === 'parent2')!._id,
        dataSource: 'DIRECT_INPUT',
        status: 'CONFIRMED',
      },
    ];
    await HealthCheckResult.insertMany(healthCheckResults);

    // Tạo dữ liệu HealthProfile
    console.log('Seeding HealthProfile data...');
    const healthProfiles = [
      {
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Van A')!
          ._id,
        allergies: 'Peanuts',
        chronicConditions: 'None',
        visionStatus: 'Normal',
        hearingStatus: 'Normal',
        vaccines: [
          { vaccineName: 'MMR', doseNumber: 1 },
          { vaccineName: 'Hepatitis B', doseNumber: 2 },
        ],
      },
      {
        studentId: createdStudents.find((s) => s.fullName === 'Tran Thi B')!
          ._id,
        allergies: 'None',
        chronicConditions: 'Asthma',
        visionStatus: 'Needs glasses',
        hearingStatus: 'Normal',
        vaccines: [{ vaccineName: 'MMR', doseNumber: 1 }],
      },
      {
        studentId: createdStudents.find((s) => s.fullName === 'Le Van C')!._id,
        allergies: 'Dust',
        chronicConditions: 'None',
        visionStatus: 'Normal',
        hearingStatus: 'Mild hearing loss',
        vaccines: [{ vaccineName: 'Hepatitis B', doseNumber: 1 }],
      },
    ];
    await HealthProfileModel.insertMany(healthProfiles);

    // Tạo dữ liệu HealthDevelopmentTracker
    console.log('Seeding HealthDevelopmentTracker data...');
    const healthDevelopmentTrackers = [
      {
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Van A')!
          ._id,
        heightHistory: [
          { date: new Date('2024-09-01T00:00:00Z'), value: 145 },
          { date: new Date('2025-03-01T00:00:00Z'), value: 147 },
        ],
        weightHistory: [
          { date: new Date('2024-09-01T00:00:00Z'), value: 40 },
          { date: new Date('2025-03-01T00:00:00Z'), value: 42 },
        ],
        bmiHistory: [
          { date: new Date('2024-09-01T00:00:00Z'), value: 19 },
          { date: new Date('2025-03-01T00:00:00Z'), value: 19.4 },
        ],
        visionHistory: [
          {
            date: new Date('2024-09-01T00:00:00Z'),
            leftEye: '20/20',
            rightEye: '20/20',
          },
        ],
        lastUpdatedAt: new Date('2025-03-01T00:00:00Z'),
      },
      {
        studentId: createdStudents.find((s) => s.fullName === 'Tran Thi B')!
          ._id,
        heightHistory: [
          { date: new Date('2024-09-01T00:00:00Z'), value: 150 },
          { date: new Date('2025-03-01T00:00:00Z'), value: 152 },
        ],
        weightHistory: [
          { date: new Date('2024-09-01T00:00:00Z'), value: 45 },
          { date: new Date('2025-03-01T00:00:00Z'), value: 46 },
        ],
        bmiHistory: [
          { date: new Date('2024-09-01T00:00:00Z'), value: 20 },
          { date: new Date('2025-03-01T00:00:00Z'), value: 20.2 },
        ],
        visionHistory: [
          {
            date: new Date('2024-09-01T00:00:00Z'),
            leftEye: '20/25',
            rightEye: '20/20',
          },
        ],
        lastUpdatedAt: new Date('2025-03-01T00:00:00Z'),
      },
      {
        studentId: createdStudents.find((s) => s.fullName === 'Le Van C')!._id,
        heightHistory: [{ date: new Date('2024-09-01T00:00:00Z'), value: 148 }],
        weightHistory: [{ date: new Date('2024-09-01T00:00:00Z'), value: 43 }],
        bmiHistory: [{ date: new Date('2024-09-01T00:00:00Z'), value: 19.6 }],
        visionHistory: [
          {
            date: new Date('2024-09-01T00:00:00Z'),
            leftEye: '20/20',
            rightEye: '20/25',
          },
        ],
        lastUpdatedAt: new Date('2024-09-01T00:00:00Z'),
      },
    ];
    await HealthDevelopmentTracker.insertMany(healthDevelopmentTrackers);

    // Tạo dữ liệu InventoryDetail
    console.log('Seeding InventoryDetail data...');
    const inventoryDetails = [
      {
        quantity: 50,
        expirationDate: new Date('2026-12-31T00:00:00Z'),
      },
      {
        quantity: 20,
        expirationDate: new Date('2025-06-30T00:00:00Z'),
      },
    ];
    const createdInventoryDetails =
      await InventoryDetailModel.insertMany(inventoryDetails);

    // Tạo dữ liệu MedicalInventory
    console.log('Seeding MedicalInventory data...');
    const medicalInventories = [
      {
        detailId: createdInventoryDetails[0]._id,
        itemName: 'Bandages',
        unit: 'Box',
        quantityTotal: 50,
        lowStockThreshold: 10,
        status: 'In Stock',
      },
      {
        detailId: createdInventoryDetails[1]._id,
        itemName: 'Antihistamine',
        unit: 'Pack',
        quantityTotal: 20,
        lowStockThreshold: 5,
        status: 'In Stock',
      },
    ];
    const createdMedicalInventories =
      await MedicalInventoryModel.insertMany(medicalInventories);

    // Tạo dữ liệu InventoryLog
    console.log('Seeding InventoryLog data...');
    const inventoryLogs = [
      {
        inventoryId: createdMedicalInventories.find(
          (i) => i.itemName === 'Bandages',
        )!._id,
        nurseId: createdUsers.find((u) => u.username === 'nurse1')!._id,
        incidentId: null, // Sẽ cập nhật sau khi tạo MedicalIncident
        typeLog: 'USAGE',
        quantityChanged: -2,
        reason: 'Used for student treatment',
      },
      {
        inventoryId: createdMedicalInventories.find(
          (i) => i.itemName === 'Bandages',
        )!._id,
        nurseId: createdUsers.find((u) => u.username === 'parent2')!._id,
        incidentId: null,
        typeLog: 'RESTOCK',
        quantityChanged: 10,
        reason: 'Restocked supplies',
      },
    ];
    const createdInventoryLogs =
      await InventoryLogModel.insertMany(inventoryLogs);

    // Tạo dữ liệu MedicalIncident
    console.log('Seeding MedicalIncident data...');
    const medicalIncidents = [
      {
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Van A')!
          ._id,
        nurseId: createdUsers.find((u) => u.username === 'nurse1')!._id,
        incidentType: 'Injury',
        description: 'Minor cut on hand',
        severity: 'Low',
        status: 'Resolved',
        actionsTaken: 'Cleaned and bandaged',
        incidentTime: new Date('2024-10-10T10:00:00Z'),
      },
      {
        studentId: createdStudents.find((s) => s.fullName === 'Tran Thi B')!
          ._id,
        nurseId: createdUsers.find((u) => u.username === 'parent2')!._id,
        incidentType: 'Allergic Reaction',
        description: 'Mild allergic reaction to food',
        severity: 'Moderate',
        status: 'Under Observation',
        actionsTaken: 'Administered antihistamine',
        incidentTime: new Date('2024-11-01T12:00:00Z'),
      },
    ];
    const createdMedicalIncidents =
      await MedicalIncidentModel.insertMany(medicalIncidents);

    // Cập nhật incidentId trong InventoryLog
    (createdInventoryLogs[0] as any).incidentId = createdMedicalIncidents.find(
      (i) => i.description === 'Minor cut on hand',
    )!._id;
    await createdInventoryLogs[0].save();

    // Tạo dữ liệu MedicationRequest
    console.log('Seeding MedicationRequest data...');
    const medicationRequests = [
      {
        parentId: createdUsers.find((u) => u.username === 'parent1')!._id,
        startDate: new Date('2024-10-01T00:00:00Z'),
        endDate: new Date('2024-12-31T00:00:00Z'),
        prescriptionFile: 'prescription_001.pdf',
        status: 'APPROVED',
      },
      {
        parentId: createdUsers.find((u) => u.username === 'parent2')!._id,
        startDate: new Date('2024-11-01T00:00:00Z'),
        endDate: new Date('2025-01-31T00:00:00Z'),
        prescriptionFile: 'prescription_002.pdf',
        status: 'PENDING',
      },
    ];
    const createdMedicationRequests =
      await MedicationRequestModel.insertMany(medicationRequests);

    // Tạo dữ liệu RequestItem
    console.log('Seeding RequestItem data...');
    const requestItems = [
      {
        medicationRequestId: createdMedicationRequests.find(
          (r) => r.prescriptionFile === 'prescription_001.pdf',
        )!._id,
        medicationName: 'Inhaler',
        dosage: '1 puff daily',
        instruction: 'Use as needed for asthma',
      },
      {
        medicationRequestId: createdMedicationRequests.find(
          (r) => r.prescriptionFile === 'prescription_002.pdf',
        )!._id,
        medicationName: 'Antihistamine',
        dosage: '10mg daily',
        instruction: 'Take with water',
      },
    ];
    await RequestItemModel.insertMany(requestItems);

    // Tạo dữ liệu MedicationSchedule
    console.log('Seeding MedicationSchedule data...');
    const medicationSchedules = [
      {
        medicationRequestId: createdMedicationRequests.find(
          (r) => r.prescriptionFile === 'prescription_001.pdf',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Van A')!
          ._id,
        nurseId: createdUsers.find((u) => u.username === 'nurse1')!._id,
        sessionSlots: 'Morning',
        status: 'ACTIVE',
      },
      {
        medicationRequestId: createdMedicationRequests.find(
          (r) => r.prescriptionFile === 'prescription_002.pdf',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Tran Thi B')!
          ._id,
        nurseId: createdUsers.find((u) => u.username === 'parent2')!._id,
        sessionSlots: 'Evening',
        status: 'PENDING',
      },
    ];
    await MedicationScheduleModel.insertMany(medicationSchedules);

    // Tạo dữ liệu VaccinationCampaign
    console.log('Seeding VaccinationCampaign data...');
    const vaccinationCampaigns = [
      {
        name: 'MMR Campaign 2024',
        vaccineName: 'MMR',
        doseNumber: 1,
        description: 'MMR vaccination for students',
        schoolYear: '2024-2025',
        partnerId: createdHealthcareOrganizations.find(
          (n) => n.name === 'City Health Clinic',
        )!._id,
        targetGradeLevels: [1, 2, 3],
        status: CampaignStatus.DRAFT,
        startDate: new Date('2024-11-01T00:00:00Z'),
        endDate: new Date('2024-11-15T00:00:00Z'),
        createdBy: createdUsers.find((u) => u.username === 'manager1')!._id,
      },
      {
        name: 'Hepatitis B Booster 2025',
        vaccineName: 'Hepatitis B',
        doseNumber: 2,
        description: 'Hepatitis B booster dose',
        schoolYear: '2024-2025',
        partnerId: createdHealthcareOrganizations.find(
          (n) => n.name === 'School Health Center',
        )!._id,
        targetGradeLevels: [1, 2, 3, 4, 5],
        status: CampaignStatus.DRAFT,
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: new Date('2025-01-15T00:00:00Z'),
        createdBy: createdUsers.find((u) => u.username === 'manager1')!._id,
      },
    ];

    const createdVaccinationCampaigns =
      await VaccinationCampaignModel.insertMany(vaccinationCampaigns);

    // Tạo dữ liệu VaccinationConsent
    console.log('Seeding VaccinationConsent data...');
    const vaccinationConsents = [
      {
        campaignId: createdVaccinationCampaigns.find(
          (c) => c.vaccineName === 'MMR',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Van A')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'parent1')!._id,
        status: ConsentStatus.APPROVED,
        confirmedAt: new Date('2024-10-22T00:00:00Z'),
        createdAt: new Date('2024-10-20T00:00:00Z'),
      },
      {
        campaignId: createdVaccinationCampaigns.find(
          (c) => c.vaccineName === 'MMR',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Tran Thi B')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'parent2')!._id,
        status: ConsentStatus.PENDING,
        createdAt: new Date('2024-10-21T00:00:00Z'),
      },
    ];
    const createdVaccinationConsents =
      await VaccinationConsentModel.insertMany(vaccinationConsents);

    // Tạo dữ liệu VaccinationRecord
    console.log('Seeding VaccinationRecord data...');
    const vaccinationRecords = [
      {
        consentId: createdVaccinationConsents.find(
          (c) => c.status === ConsentStatus.APPROVED,
        )!._id,
        partnerId: createdHealthcareOrganizations.find(
          (o) => o.name === 'City Health Clinic',
        )!._id,
        administeredByStaffId: createdOrganizationStaff.find(
          (s) => s.fullName === 'Nurse Alice Brown',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Van A')!
          ._id,
        postVaccinationChecks: [
          {
            observedAt: new Date('2024-11-01T10:00:00Z'),
            temperatureLevel: 36.5,
            notes: 'No adverse reactions',
          },
        ],
        administeredAt: new Date('2024-11-01T09:00:00Z'),
        vaccineName: 'MMR',
        doseNumber: 1,
        createdAt: new Date('2024-11-01T00:00:00Z'),
        updatedAt: new Date('2024-11-01T00:00:00Z'),
      },
      {
        consentId: createdVaccinationConsents.find(
          (c) => c.status === ConsentStatus.PENDING,
        )!._id,
        partnerId: createdHealthcareOrganizations.find(
          (o) => o.name === 'School Health Center',
        )!._id,
        administeredByStaffId: createdOrganizationStaff.find(
          (s) => s.fullName === 'Nurse Carol Green',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Tran Thi B')!
          ._id,
        postVaccinationChecks: [],
        administeredAt: new Date('2025-01-05T09:00:00Z'),
        vaccineName: 'Hepatitis B',
        doseNumber: 2,
        createdAt: new Date('2025-01-05T00:00:00Z'),
        updatedAt: new Date('2025-01-05T00:00:00Z'),
      },
    ];
    await VaccinationRecordModel.insertMany(vaccinationRecords);

    // Tạo dữ liệu MeetingSchedule
    console.log('Seeding MeetingSchedule data...');
    const meetingSchedules = [
      {
        studentId: createdStudents.find((s) => s.fullName === 'Nguyen Van A')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'parent1')!._id,
        meetingTime: new Date('2024-10-20T10:00:00Z'),
        location: 'School Office',
        status: 'SCHEDULED',
        reasons: 'Discuss health check results',
        notes: 'Bring medical records',
        afterMeetingNotes: 'Agreed on follow-up',
      },
      {
        studentId: createdStudents.find((s) => s.fullName === 'Tran Thi B')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'parent2')!._id,
        meetingTime: new Date('2024-11-15T14:00:00Z'),
        location: 'Online',
        status: 'PENDING',
        reasons: 'Discuss medication plan',
        notes: 'Zoom link to be provided',
        afterMeetingNotes: '',
      },
    ];
    await MeetingScheduleModel.insertMany(meetingSchedules);

    // Tạo dữ liệu BlogPost
    console.log('Seeding BlogPost data...');
    const blogPosts = [
      {
        authorId: createdUsers.find((u) => u.username === 'parent1')!._id,
        title: 'Tips for Student Health',
        content:
          'Maintaining student health involves proper nutrition, exercise, and regular checkups...',
        publishedAt: new Date('2025-01-15T10:00:00Z'),
      },
      {
        authorId: createdUsers.find((u) => u.username === 'parent2')!._id,
        title: 'Importance of Vaccinations',
        content:
          'Vaccinations are critical for preventing diseases in school environments...',
        publishedAt: new Date('2025-02-20T12:00:00Z'),
      },
      {
        authorId: createdUsers.find((u) => u.username === 'parent1')!._id,
        title: 'Mental Health Awareness',
        content:
          'Supporting student mental health is essential for academic success...',
        publishedAt: new Date('2025-03-10T09:00:00Z'),
      },
      {
        authorId: createdUsers.find((u) => u.username === 'nurse1')!._id,
        title: 'Exercise for Kids',
        content:
          'Encouraging physical activity helps improve focus and health...',
        publishedAt: new Date('2025-04-05T14:00:00Z'),
      },
      {
        authorId: createdUsers.find((u) => u.username === 'parent2')!._id,
        title: 'Healthy Eating Habits',
        content: 'A balanced diet is key to student growth and development...',
        publishedAt: new Date('2025-05-12T11:00:00Z'),
      },
    ];
    await BlogPostModel.insertMany(blogPosts);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    console.log('Closing database connection.');
    await mongoose.connection.close();
  }
};

// Chạy script
seedDatabase();
