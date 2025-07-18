import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

import { UserModel } from '../models/user.model';
import { StudentModel } from '../models/student.model';
import { Class } from '../models/class.model';
import { MedicalIncidentModel } from '../models/medical.incident.model';
import {
  MedicationRequestModel,
  RequestItemModel,
} from '../models/medication.request.model';
import { MedicalInventoryModel } from '../models/medical.inventory.model';
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
import { MedicationScheduleModel } from '../models/medication.schedule.model';

import { VaccinationConsentModel } from '../models/vaccination.consent.model';
import { VaccinationCampaignModel } from '../models/vaccination.campaign.model';
import { BlogPostModel } from '../models/blog.post.model';

import { IncidentSeverity } from '@/enums/IncidentEnum';
import { RoleEnum } from '../enums/RoleEnum';
import { ConsentStatus } from '../enums/ConsentsEnum';
import { CampaignStatus } from '../enums/CampaignEnum';
import { StudentGender, StudentStatus } from '../enums/StudentEnum';
import { CheckupItemDataType, CheckupItemUnit } from '../enums/TemplateEnum';
import {
  MedicationRequestEnum,
  MedicationScheduleEnum,
} from '../enums/MedicationEnum';
import { SlotEnum } from '../enums/SlotEnum';
import { EAllergySeverity } from '../enums/AllergyEnums';
import {
  InventoryLogType,
  InventoryStatus,
  InventoryType,
} from '../enums/InventoryEnums';
import { OrganizationEnum } from '../enums/OrganizationEnum';
import { VaccinationRecordModel } from '@/models/vacination.record.model';

const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Database connected!');

    console.log('Cleaning old data...');
    await Promise.all([
      UserModel.deleteMany({}),
      StudentModel.deleteMany({}),
      Class.deleteMany({}),
      MedicalIncidentModel.deleteMany({}),
      MedicationRequestModel.deleteMany({}),
      RequestItemModel.deleteMany({}),
      MedicalInventoryModel.deleteMany({}),
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
      MedicationScheduleModel.deleteMany({}),
      VaccinationRecordModel.deleteMany({}),
      VaccinationConsentModel.deleteMany({}),
      VaccinationCampaignModel.deleteMany({}),
      BlogPostModel.deleteMany({}),
    ]);
    console.log('Old data cleaned!');

    console.log('Seeding User data...');
    const users = [
      {
        username: 'Trần Đoàn A',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'parent1@example.com',
        role: RoleEnum.Parent,
        dob: new Date('1980-01-01T00:00:00Z'),
        phone: '0123456789',
        isActive: true,
        authProvider: 'local',
      },
      {
        username: 'Nguyễn Thị B',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'parent2@example.com',
        role: RoleEnum.Parent,
        dob: new Date('1982-02-02T00:00:00Z'),
        phone: '0987654321',
        isActive: true,
        authProvider: 'local',
      },
      {
        username: 'Nguyễn Ngọc C',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'nurse1@example.com',
        role: RoleEnum.Nurse,
        dob: new Date('1975-03-03T00:00:00Z'),
        phone: '0123987654',
        isActive: true,
        authProvider: 'local',
      },
      {
        username: 'Nguyễn Ngọc CAB',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'nurse2@example.com',
        role: RoleEnum.Nurse,
        dob: new Date('1975-01-03T00:00:00Z'),
        phone: '0123987000',
        isActive: true,
        authProvider: 'local',
      },
      {
        username: 'Trần Văn D',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'admin1@example.com',
        role: RoleEnum.Admin,
        dob: new Date('1970-04-04T00:00:00Z'),
        phone: '0111222333',
        isActive: true,
        authProvider: 'local',
      },
      {
        username: 'Nguyễn Thị E',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'manager1@example.com',
        role: RoleEnum.Manager,
        dob: new Date('1978-05-05T00:00:00Z'),
        phone: '0999888777',
        isActive: true,
        authProvider: 'local',
      },
    ];
    const createdUsers = await UserModel.insertMany(users);
    const parents = createdUsers.filter((u) => u.role === RoleEnum.Parent);
    const nurses = createdUsers.filter((u) => u.role === RoleEnum.Nurse);
    const manager = createdUsers.find((u) => u.role === RoleEnum.Manager)!;
    const admin = createdUsers.find((u) => u.role === RoleEnum.Admin)!;

    console.log('Seeding Class data...');
    const classInfos = [
      { className: 'Lớp 1A', gradeLevel: 1 },
      { className: 'Lớp 2B', gradeLevel: 2 },
      { className: 'Lớp 3C', gradeLevel: 3 },
      { className: 'Lớp 4A', gradeLevel: 4 },
      { className: 'Lớp 5B', gradeLevel: 5 },
    ];

    const classes = classInfos.map((c) => ({
      ...c,
      schoolYear: '2024-2025',
      students: [],
      totalStudents: 0,
    }));
    const createdClasses = await Class.insertMany(classes);

    function generateInviteCode(length = 6) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    console.log('Seeding Student data...');
    const studentsData = [
      {
        fullName: 'Nguyễn Văn A',
        dob: '2018-05-10',
        parentEmail: 'parent1@example.com',
        className: 'Lớp 1A',
        gender: StudentGender.MALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Trần Thị B',
        dob: '2018-06-15',
        parentEmail: 'parent2@example.com',
        className: 'Lớp 1A',
        gender: StudentGender.FEMALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Lê Văn C',
        dob: '2017-07-20',
        parentEmail: 'parent1@example.com',
        className: 'Lớp 2B',
        gender: StudentGender.MALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Phạm Thị D',
        dob: '2017-08-25',
        parentEmail: 'parent1@example.com',
        className: 'Lớp 2B',
        gender: StudentGender.FEMALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Hoàng Văn E',
        dob: '2016-09-30',
        parentEmail: 'parent2@example.com',
        className: 'Lớp 3C',
        gender: StudentGender.MALE,
        status: StudentStatus.ACTIVE,
      },
    ];

    const studentsToInsert = studentsData.map((s) => ({
      parentId: createdUsers.find((u) => u.email === s.parentEmail)!._id,
      classId: createdClasses.find((c) => c.className === s.className)!._id,
      fullName: s.fullName,
      dateOfBirth: new Date(`${s.dob}T00:00:00Z`),
      gender: s.gender,
      status: s.status,
      invitedCode: {
        code: generateInviteCode(),
        isActive: true,
        createdAt: new Date(),
      },
    }));
    const createdStudents = await StudentModel.insertMany(studentsToInsert);

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
    console.log('Seeding OrganizationManager data...');
    const organizationManagers = [
      {
        fullName: 'Dr. John Doe',
        email: 'john.doe@cityhealth.com',
        phone: '0123456789',
        organizationId: dummyOrgId1,
      },
      {
        fullName: 'Dr. Jane Smith',
        email: 'jane.smith@schoolhealth.com',
        phone: '0987654321',
        organizationId: dummyOrgId2,
      },
    ];
    const createdOrganizationManagers =
      await OrganizationManager.insertMany(organizationManagers);

    console.log('Seeding OrganizationStaff data...');
    const organizationStaff = [
      {
        fullName: 'Nurse Alice Brown',
        position: 'Nurse',
        isActive: true,
        organizationId: dummyOrgId2,
      },
      {
        fullName: 'Technician Bob White',
        position: 'Technician',
        isActive: true,
        organizationId: dummyOrgId2,
      },
      {
        fullName: 'Nurse Carol Green',
        position: 'Nurse',
        isActive: true,
        organizationId: dummyOrgId1,
      },
    ];
    const createdOrganizationStaff =
      await OrganizationStaffs.insertMany(organizationStaff);

    console.log('Seeding HealthcareOrganization data...');
    const healthcareOrganizations = [
      {
        _id: dummyOrgId1,
        name: 'City Health Clinic',
        address: '123 Health St, City',
        phone: '0123456789',
        email: 'contact@cityhealth.com',
        type: OrganizationEnum.CLINIC,
        isActive: true,
        managerInfo: createdOrganizationManagers[0]._id,
        staffMembers: [createdOrganizationStaff[2]._id],
      },
      {
        _id: dummyOrgId2,
        name: 'School Health Center',
        address: '456 School Rd, City',
        phone: '0987654321',
        email: 'info@schoolhealth.com',
        type: OrganizationEnum.HEALTH_CENTER,
        isActive: true,
        managerInfo: createdOrganizationManagers[1]._id,
        staffMembers: [
          createdOrganizationStaff[0]._id,
          createdOrganizationStaff[1]._id,
        ],
      },
    ];
    const createdHealthcareOrganizations =
      await HealthcareOrganization.insertMany(healthcareOrganizations);

    console.log('Seeding HealthCheckTemplate data...');
    const healthCheckTemplates = [
      {
        name: 'Khám sức khỏe tổng quát định kỳ',
        description: 'Bao gồm các chỉ số cơ bản về thể chất học sinh.',
        checkupItems: [
          {
            itemId: 1,
            itemName: 'Chiều cao',
            unit: CheckupItemUnit.CM,
            dataType: CheckupItemDataType.NUMBER,
          },
          {
            itemId: 2,
            itemName: 'Cân nặng',
            unit: CheckupItemUnit.KG,
            dataType: CheckupItemDataType.NUMBER,
          },
          {
            itemId: 3,
            itemName: 'Chỉ số BMI',
            dataType: CheckupItemDataType.NUMBER,
          },
          {
            itemId: 4,
            itemName: 'Huyết áp',
            unit: CheckupItemUnit.MM_HG,
            dataType: CheckupItemDataType.TEXT,
          },
        ],
        isDefault: true,
      },
    ];
    const createdHealthCheckTemplates =
      await HealthCheckTemplate.insertMany(healthCheckTemplates);

    console.log('Seeding HealthCheckCampaign data...');
    const healthCheckCampaigns = [
      {
        name: 'Chiến dịch khám sức khỏe HK1 2024-2025',
        schoolYear: '2024-2025',
        startDate: new Date('2024-10-01T00:00:00Z'),
        endDate: new Date('2024-10-15T00:00:00Z'),
        templateId: createdHealthCheckTemplates[0]._id,
        participatingStaffs: [nurses[0]._id, nurses[1]._id],
        assignments: [
          {
            classId: createdClasses[0]._id,
            nurseId: nurses[0]._id,
          },
          {
            classId: createdClasses[1]._id,
            nurseId: nurses[1]._id,
          },
        ],
        status: CampaignStatus.IN_PROGRESS,
        createdBy: manager._id,
      },
    ];
    const createdHealthCheckCampaigns =
      await HealthCheckCampaign.insertMany(healthCheckCampaigns);

    console.log('Seeding HealthCheckConsent data...');
    const healthCheckConsents = [
      {
        campaignId: createdHealthCheckCampaigns[0]._id,
        studentId: createdStudents[0]._id,
        classId: createdStudents[0].classId,
        nurseId: nurses[0]._id,
        parentId: createdStudents[0].parentId!,
        status: ConsentStatus.APPROVED,
        confirmedAt: new Date('2024-09-20T00:00:00Z'),
      },
      {
        campaignId: createdHealthCheckCampaigns[0]._id,
        studentId: createdStudents[1]._id,
        classId: createdStudents[1].classId,
        nurseId: nurses[0]._id,
        parentId: createdStudents[1].parentId!,
        status: ConsentStatus.DECLINED,
        reasonForDeclining: 'Bận việc gia đình.',
        confirmedAt: new Date('2024-09-21T00:00:00Z'),
      },
      {
        campaignId: createdHealthCheckCampaigns[0]._id,
        studentId: createdStudents[2]._id,
        classId: createdStudents[2].classId,
        nurseId: nurses[1]._id,
        parentId: createdStudents[2].parentId!,
        status: ConsentStatus.PENDING,
      },
    ];
    await HealthCheckConsent.insertMany(healthCheckConsents);

    console.log('Seeding HealthCheckResult data...');
    const healthCheckResults = [
      {
        campaignId: createdHealthCheckCampaigns[0]._id,
        studentId: createdStudents[0]._id,
        nurseId: nurses[0]._id,
        checkupDate: new Date('2024-10-05T00:00:00Z'),
        resultsData: [
          {
            itemName: 'Chiều cao',
            value: 125,
            unit: 'CM',
            isAbnormal: false,
            guideline: 'Trong ngưỡng an toàn.',
            notes: 'Phát triển bình thường.',
          },
          {
            itemName: 'Cân nặng',
            value: 25,
            unit: 'KG',
            isAbnormal: false,
            guideline: 'Trong ngưỡng an toàn.',
            notes: 'Phát triển bình thường.',
          },
        ],
        isAbnormal: false,
        overallConclusion: 'Phát triển bình thường, trong ngưỡng an toàn.',
        recommendations: 'Tiếp tục theo dõi chế độ dinh dưỡng và vận động.',
      },
    ];
    const createdHealthCheckResults =
      await HealthCheckResult.insertMany(healthCheckResults);

    console.log('Seeding HealthProfile data...');
    const healthProfiles = [
      {
        studentId: createdStudents[0]._id,
        allergies: [
          {
            type: 'Thực phẩm',
            reaction: 'Phát ban, ngứa',
            severity: EAllergySeverity.Mild,
            notes: 'Dị ứng nhẹ với đậu phộng.',
          },
        ],
        chronicConditions: [],
        medicalHistory: [
          {
            condition: 'Gãy tay',
            facility: 'Bệnh viện Nhi đồng',
            treatmentDate: new Date('2023-04-10T00:00:00Z'),
            method: 'Bó bột',
            notes: 'Tay trái, đã hồi phục hoàn toàn.',
          },
        ],
        visionHistory: [
          {
            checkupDate: new Date('2024-01-15T00:00:00Z'),
            rightEyeVision: '20/20',
            leftEyeVision: '20/20',
            wearsGlasses: false,
            isColorblind: false,
          },
        ],
        hearingHistory: [],
        vaccines: [
          {
            vaccineName: 'Sởi - Quai bị - Rubella (MMR)',
            doseNumber: 1,
            note: 'Tiêm theo lịch quốc gia',
            dateInjected: new Date('2019-05-10T00:00:00Z'),
            locationInjected: 'Trạm Y tế Phường',
          },
        ],
      },
      {
        studentId: createdStudents[1]._id,
        allergies: [],
        chronicConditions: [
          {
            conditionName: 'Hen suyễn',
            diagnosedDate: new Date('2022-09-01T00:00:00Z'),
            medication: 'Thuốc xịt Ventolin khi cần',
            notes: 'Cần mang theo thuốc xịt khi vận động mạnh.',
          },
        ],
        medicalHistory: [],
        visionHistory: [],
        hearingHistory: [],
        vaccines: [],
      },
    ];
    await HealthProfileModel.insertMany(healthProfiles);

    console.log('Seeding HealthDevelopmentTracker data...');
    const healthDevelopmentTrackers = [
      {
        studentId: createdStudents[0]._id,
        heightHistory: [
          { date: new Date('2023-09-01T00:00:00Z'), value: 120 },
          { date: new Date('2024-03-01T00:00:00Z'), value: 125 },
        ],
        weightHistory: [
          { date: new Date('2023-09-01T00:00:00Z'), value: 22 },
          { date: new Date('2024-03-01T00:00:00Z'), value: 25 },
        ],
        bmiHistory: [
          { date: new Date('2023-09-01T00:00:00Z'), value: 15.3 },
          { date: new Date('2024-03-01T00:00:00Z'), value: 16.0 },
        ],
        visionHistory: [
          {
            date: new Date('2024-01-15T00:00:00Z'),
            leftEye: '20/20',
            rightEye: '20/20',
          },
        ],
        lastUpdatedAt: new Date(),
      },
    ];
    await HealthDevelopmentTracker.insertMany(healthDevelopmentTrackers);

    console.log('Seeding MedicalInventory data...');
    const medicalInventories = [
      {
        itemName: 'Băng gạc cá nhân (hộp 100 cái)',
        description: 'Băng gạc vô trùng dùng cho vết thương nhỏ.',
        type: InventoryType.SUPPLIES,
        unit: 'Hộp',
        lowStockThreshold: 10,
        status: InventoryStatus.IN_STOCK,
        batches: [
          {
            quantity: 50,
            expirationDate: new Date('2026-12-31T00:00:00Z'),
            addedAt: new Date(),
          },
        ],
      },
      {
        itemName: 'Paracetamol 500mg',
        description: 'Thuốc hạ sốt, giảm đau.',
        type: InventoryType.MEDICINE,
        unit: 'Vỉ',
        lowStockThreshold: 20,
        status: InventoryStatus.LOW_STOCK,
        batches: [
          {
            quantity: 15,
            expirationDate: new Date('2025-06-30T00:00:00Z'),
            addedAt: new Date(),
          },
        ],
      },
    ];
    const createdMedicalInventories =
      await MedicalInventoryModel.insertMany(medicalInventories);

    console.log('Seeding MedicalIncident data...');
    const medicalIncidents = [
      {
        studentId: createdStudents[0]._id,
        nurseId: nurses[0]._id,
        incidentType: 'Chấn thương nhẹ',
        description: 'Trầy xước đầu gối do ngã ở sân chơi.',
        severity: IncidentSeverity.Mild,
        actionsTaken: 'Rửa sạch vết thương, dán băng gạc cá nhân.',
        incidentTime: new Date('2024-09-15T10:00:00Z'),
      },
    ];
    const createdMedicalIncidents =
      await MedicalIncidentModel.insertMany(medicalIncidents);

    console.log('Seeding InventoryLog data...');
    const inventoryLogs = [
      {
        inventoryId: createdMedicalInventories[0]._id,
        nurseId: nurses[0]._id,
        incidentId: createdMedicalIncidents[0]._id,
        typeLog: InventoryLogType.WITHDRAWAL_FOR_INCIDENT,
        quantityChanged: -1,
        reason: 'Sử dụng cho sự cố của học sinh Nguyễn Văn A',
      },
      {
        inventoryId: createdMedicalInventories[1]._id,
        nurseId: manager._id,
        typeLog: InventoryLogType.ADD_STOCK,
        quantityChanged: 50,
        reason: 'Nhập kho định kỳ',
      },
    ];
    await InventoryLogModel.insertMany(inventoryLogs);

    console.log('Seeding MedicationRequest data...');
    const medicationRequests = [
      {
        parentId: createdStudents[1].parentId!,
        studentId: createdStudents[1]._id,
        startDate: new Date('2024-10-01T00:00:00Z'),
        endDate: new Date('2024-12-31T00:00:00Z'),
        prescriptionFile: 'prescription_001.pdf',
        status: MedicationRequestEnum.Scheduled,
      },
    ];
    const createdMedicationRequests =
      await MedicationRequestModel.insertMany(medicationRequests);

    console.log('Seeding RequestItem data...');
    const requestItems = [
      {
        medicationRequestId: createdMedicationRequests[0]._id,
        medicationName: 'Thuốc ho Prospan',
        dosage: '5ml/lần',
        instruction: 'Uống 2 lần/ngày sau ăn',
      },
    ];
    await RequestItemModel.insertMany(requestItems);

    console.log('Seeding MedicationSchedule data...');
    const medicationSchedules = [
      {
        medicationRequestId: createdMedicationRequests[0]._id,
        studentId: createdStudents[1]._id,
        nurseId: nurses[0]._id,
        sessionSlots: SlotEnum.Morning,
        status: MedicationScheduleEnum.Done,
        date: new Date('2024-10-02T08:00:00Z'),
      },
      {
        medicationRequestId: createdMedicationRequests[0]._id,
        studentId: createdStudents[1]._id,
        nurseId: nurses[0]._id,
        sessionSlots: SlotEnum.Afternoon,
        status: MedicationScheduleEnum.Not_taken,
        date: new Date('2024-10-02T14:00:00Z'),
        reason: 'Học sinh quên uống thuốc',
      },
    ];
    await MedicationScheduleModel.insertMany(medicationSchedules);

    console.log('Seeding VaccinationCampaign data...');
    const vaccinationCampaigns = [
      {
        name: 'Chiến dịch tiêm MMR năm 2024',
        vaccineName: 'MMR',
        doseNumber: 1,
        description: 'Tiêm chủng MMR cho học sinh các khối đầu cấp',
        destination: 'Trường học',
        schoolYear: '2024-2025',
        partnerId: createdHealthcareOrganizations[0]._id,
        targetGradeLevels: [1, 2, 3],
        status: CampaignStatus.COMPLETED,
        startDate: new Date('2024-11-01T00:00:00Z'),
        endDate: new Date('2024-11-15T00:00:00Z'),
        createdBy: manager._id,
        summary: {
          totalStudents: 5,
          totalConsents: 3,
          approved: 1,
          declined: 1,
          administered: 1,
          absent: 0,
        },
      },
    ];
    const createdVaccinationCampaigns =
      await VaccinationCampaignModel.insertMany(vaccinationCampaigns);

    console.log('Seeding VaccinationConsent data...');
    const vaccinationConsents = [
      {
        campaignId: createdVaccinationCampaigns[0]._id,
        studentId: createdStudents[0]._id,
        parentId: createdStudents[0].parentId!,
        status: ConsentStatus.APPROVED,
        confirmedAt: new Date('2024-10-22T00:00:00Z'),
      },
      {
        campaignId: createdVaccinationCampaigns[0]._id,
        studentId: createdStudents[1]._id,
        parentId: createdStudents[1].parentId!,
        status: ConsentStatus.DECLINED,
        reasonForDeclining: 'Gia đình không đồng ý.',
        confirmedAt: new Date('2024-10-23T00:00:00Z'),
      },
      {
        campaignId: createdVaccinationCampaigns[0]._id,
        studentId: createdStudents[2]._id,
        parentId: createdStudents[2].parentId!,
        status: ConsentStatus.PENDING,
      },
    ];
    const createdVaccinationConsents =
      await VaccinationConsentModel.insertMany(vaccinationConsents);

    console.log('Seeding VaccinationRecord data...');
    const vaccinationRecords = [
      {
        consentId: createdVaccinationConsents[0]._id,
        partnerId: createdVaccinationCampaigns[0].partnerId,
        administeredByStaffId: createdOrganizationStaff[2]._id, // Nurse Carol Green from City Health Clinic
        studentId: createdStudents[0]._id,
        postVaccinationChecks: [
          {
            observedAt: new Date('2024-11-01T10:30:00Z'),
            temperatureLevel: 37.0,
            notes: 'Bình thường, không có phản ứng phụ.',
            isAbnormal: false,
          },
        ],
        administeredAt: new Date('2024-11-01T10:00:00Z'),
        vaccineName: 'MMR',
        doseNumber: 1,
      },
    ];
    await VaccinationRecordModel.insertMany(vaccinationRecords);

    console.log('Seeding MeetingSchedule data...');
    const meetingSchedules = [
      {
        studentId: createdStudents[0]._id,
        parentId: createdStudents[0].parentId!,
        resultId: createdHealthCheckResults[0]._id,
        meetingTime: new Date('2024-10-20T10:00:00Z'),
        location: 'Phòng Y tế trường học',
        status: 'Đã hoàn thành',
        reasons: 'Trao đổi về kết quả khám sức khỏe của học sinh.',
        notes: 'Phụ huynh vui lòng mang theo sổ sức khỏe của con.',
        afterMeetingNotes:
          'Phụ huynh đã nắm thông tin, đồng ý với kế hoạch theo dõi.',
      },
    ];
    await MeetingScheduleModel.insertMany(meetingSchedules);

    console.log('Seeding BlogPost data...');
    const blogPosts = [
      {
        authorId: admin._id,
        title: '5 Lời khuyên để Giữ gìn Sức khỏe cho Học sinh',
        content:
          'Duy trì sức khỏe học sinh bao gồm dinh dưỡng hợp lý, tập thể dục và khám sức khỏe định kỳ...',
        publishedAt: new Date('2025-01-15T10:00:00Z'),
      },
      {
        authorId: admin._id,
        title: 'Tầm quan trọng của việc Tiêm chủng',
        content:
          'Tiêm chủng là biện pháp quan trọng để ngăn ngừa dịch bệnh trong môi trường học đường...',
        publishedAt: new Date('2025-02-20T12:00:00Z'),
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

seedDatabase();
