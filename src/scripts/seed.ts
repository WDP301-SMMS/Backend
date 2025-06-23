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
import { StudentGender, StudentStatus } from '@/enums/StudentEnum';
import {
  CheckupItemDataType,
  CheckupItemUnit,
  HealthCheckTemplateType,
} from '@/enums/TemplateEnum';
import {
  MedicationRequestEnum,
  MedicationScheduleEnum,
} from '@/enums/MedicationEnum';
import { SlotEnum } from '@/enums/SlotEnum';

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
        username: 'Trần Đoàn A',
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
        username: 'Nguyễn Thị B',
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
        username: 'Nguyễn Ngọc C',
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
        username: 'Nguyễn Ngọc CAB',
        password:
          '$2b$10$Qu73RNaLyG95KDqb/AoDZevFrn54Mrx.lburY9ZO7WXrwyW5L0yfy',
        email: 'nurse2@example.com',
        role: RoleEnum.Nurse,
        dob: new Date('1975-01-03T00:00:00Z'),
        phone: '0123987000',
        isActive: true,
        authProvider: 'local',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
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
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
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
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];
    const createdUsers = await UserModel.insertMany(users);

    // Tạo dữ liệu Class
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
      createdAt: new Date('2024-08-01T00:00:00Z'),
      updatedAt: new Date('2024-08-01T00:00:00Z'),
    }));
    const createdClasses = await Class.insertMany(classes);

    //Mã GENERATE INVITED CODE
    function generateInviteCode(length = 6) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tránh ký tự dễ nhầm lẫn
      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    // Tạo dữ liệu Student
    console.log('Seeding Student data...');
    const studentsData = [
      {
        fullName: 'Nguyễn Văn A',
        dob: '2015-05-10',
        username: 'Trần Đoàn A',
        className: 'Lớp 1A',
        gender: StudentGender.MALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Trần Thị B',
        dob: '2015-06-15',
        username: 'Nguyễn Thị B',
        className: 'Lớp 1A',
        gender: StudentGender.FEMALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Lê Văn C',
        dob: '2015-07-20',
        username: 'Trần Đoàn A',
        className: 'Lớp 1A',
        gender: StudentGender.MALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Phạm Thị D',
        dob: '2014-08-25',
        username: 'Trần Đoàn A',
        className: 'Lớp 2B',
        gender: StudentGender.FEMALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Hoàng Văn E',
        dob: '2014-09-30',
        username: 'Nguyễn Thị B',
        className: 'Lớp 2B',
        gender: StudentGender.MALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Nguyễn Thị F',
        dob: '2013-10-05',
        username: 'Trần Đoàn A',
        className: 'Lớp 3C',
        gender: StudentGender.FEMALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Trần Văn G',
        dob: '2013-11-10',
        username: 'Trần Đoàn A',
        className: 'Lớp 3C',
        gender: StudentGender.MALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Lê Thị H',
        dob: '2012-12-15',
        username: 'Nguyễn Thị B',
        className: 'Lớp 4A',
        gender: StudentGender.FEMALE,
        status: StudentStatus.ACTIVE,
      },
      {
        fullName: 'Phạm Văn I',
        dob: '2015-01-20',
        username: 'Trần Đoàn A',
        className: 'Lớp 5B',
        gender: StudentGender.MALE,
        status: StudentStatus.ACTIVE,
      },
    ];

    const studentsToInsert = studentsData.map((s) => ({
      parentId: createdUsers.find((u) => u.username === s.username)!._id,
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
        name: 'Khám sức khỏe tổng quát',
        description: 'Khám sức khỏe định kỳ cho học sinh',
        type: HealthCheckTemplateType.GENERAL,
        checkupItems: [
          {
            itemId: 1,
            itemName: 'Chiều cao',
            unit: CheckupItemUnit.CM,
            dataType: CheckupItemDataType.NUMBER,
            guideline: 'Đo chiều cao khi đứng thẳng',
          },
          {
            itemId: 2,
            itemName: 'Cân nặng',
            unit: CheckupItemUnit.KG,
            dataType: CheckupItemDataType.NUMBER,
            guideline: 'Đo cân nặng bằng cân điện tử',
          },
          {
            itemId: 3,
            itemName: 'Nhịp tim',
            unit: CheckupItemUnit.BPM,
            dataType: CheckupItemDataType.NUMBER,
            guideline: 'Sử dụng máy đo nhịp tim',
          },
        ],
        isDefault: true,
      },
      {
        name: 'Khám thị lực',
        description: 'Kiểm tra thị lực cho học sinh',
        type: HealthCheckTemplateType.VISION,
        checkupItems: [
          {
            itemId: 1,
            itemName: 'Thị lực mắt trái',
            dataType: CheckupItemDataType.TEXT,
            guideline: 'Sử dụng bảng Snellen',
          },
          {
            itemId: 2,
            itemName: 'Thị lực mắt phải',
            dataType: CheckupItemDataType.TEXT,
            guideline: 'Sử dụng bảng Snellen',
          },
        ],
        isDefault: false,
      },
      {
        name: 'Khám nha khoa',
        description: 'Kiểm tra răng miệng định kỳ',
        type: HealthCheckTemplateType.DENTAL,
        checkupItems: [
          {
            itemId: 1,
            itemName: 'Sâu răng',
            dataType: CheckupItemDataType.BOOLEAN,
            guideline: 'Kiểm tra bằng mắt thường',
          },
          {
            itemId: 2,
            itemName: 'Tình trạng lợi',
            dataType: CheckupItemDataType.TEXT,
            guideline: 'Ghi chú nếu có dấu hiệu viêm',
          },
        ],
        isDefault: false,
      },
      {
        name: 'Khám tâm lý',
        description: 'Đánh giá tình trạng tâm lý học sinh',
        type: HealthCheckTemplateType.PSYCHOLOGICAL,
        checkupItems: [
          {
            itemId: 1,
            itemName: 'Tâm trạng chung',
            dataType: CheckupItemDataType.SELECT,
            guideline: 'Chọn từ danh sách: Vui vẻ, Bình thường, Buồn bã...',
          },
          {
            itemId: 2,
            itemName: 'Khả năng tập trung',
            dataType: CheckupItemDataType.TEXT,
            guideline: 'Quan sát trong lớp học hoặc qua bảng hỏi',
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
        name: 'Chiến dịch khám sức khỏe định kỳ 2024',
        schoolYear: '2024-2025',
        startDate: new Date('2024-10-01T00:00:00Z'), // Đổi từ scheduleDate -> startDate
        templateId: createdHealthCheckTemplates.find(
          (t) => t.name === 'Khám sức khỏe tổng quát',
        )!._id,
        participatingStaffs: ['Nguyễn Ngọc C', 'Nguyễn Ngọc CAB'],
        assignments: [
          {
            classId: createdClasses.find((c) => c.className === 'Lớp 1A')!._id,
            nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc C')!
              ._id,
          },
          {
            classId: createdClasses.find((c) => c.className === 'Lớp 2B')!._id,
            nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc CAB')!
              ._id,
          },
          {
            classId: createdClasses.find((c) => c.className === 'Lớp 3C')!._id,
            nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc C')!
              ._id,
          },
        ],
        status: CampaignStatus.DRAFT,
        createdBy: createdUsers.find((u) => u.username === 'Nguyễn Thị E')!._id,
      },
      {
        name: 'Chiến dịch khám thị lực đầu năm 2025',
        schoolYear: '2024-2025',
        startDate: new Date('2025-02-01T00:00:00Z'), // Đổi từ scheduleDate -> startDate
        templateId: createdHealthCheckTemplates.find(
          (t) => t.name === 'Khám thị lực',
        )!._id,
        participatingStaffs: ['Nguyễn Ngọc CAB'],
        assignments: [
          {
            classId: createdClasses.find((c) => c.className === 'Lớp 4A')!._id,
            nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc CAB')!
              ._id,
          },
          {
            classId: createdClasses.find((c) => c.className === 'Lớp 5B')!._id,
            nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc CAB')!
              ._id,
          },
        ],
        status: CampaignStatus.COMPLETED,
        createdBy: createdUsers.find((u) => u.username === 'Nguyễn Thị E')!._id,
      },
    ];
    const createdHealthCheckCampaigns =
      await HealthCheckCampaign.insertMany(healthCheckCampaigns);

    // Tạo dữ liệu HealthCheckConsent
    console.log('Seeding HealthCheckConsent data...');
    const healthCheckConsents = [
      {
        campaignId: createdHealthCheckCampaigns.find(
          (c) => c.name === 'Chiến dịch khám sức khỏe định kỳ 2024',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!
          ._id,
        classId: createdClasses.find((c) => c.className === 'Lớp 1A')!._id,
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc C')!._id,
        parentId: createdUsers.find((u) => u.username === 'Trần Đoàn A')!._id,
        status: ConsentStatus.APPROVED,
        confirmedAt: new Date('2024-09-20T00:00:00Z'),
      },
      {
        campaignId: createdHealthCheckCampaigns.find(
          (c) => c.name === 'Chiến dịch khám sức khỏe định kỳ 2024',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Trần Thị B')!
          ._id,
        classId: createdClasses.find((c) => c.className === 'Lớp 1A')!._id,
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc C')!._id,
        parentId: createdUsers.find((u) => u.username === 'Nguyễn Thị B')!._id,
        status: ConsentStatus.DECLINED,
        reasonForDeclining: 'Bận việc gia đình',
        confirmedAt: new Date('2024-09-21T00:00:00Z'),
      },
      {
        campaignId: createdHealthCheckCampaigns.find(
          (c) => c.name === 'Chiến dịch khám thị lực đầu năm 2025',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Thị F')!
          ._id,
        classId: createdClasses.find((c) => c.className === 'Lớp 3C')!._id,
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc C')!._id,
        parentId: createdUsers.find((u) => u.username === 'Trần Đoàn A')!._id,
        status: ConsentStatus.PENDING,
      },
    ];
    await HealthCheckConsent.insertMany(healthCheckConsents);

    // Tạo dữ liệu HealthCheckResult
    console.log('Seeding HealthCheckResult data...');
    const healthCheckResults = [
      {
        campaignId: createdHealthCheckCampaigns.find(
          (c) => c.name === 'Chiến dịch khám sức khỏe định kỳ 2024',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!
          ._id,
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc C')!._id,
        checkupDate: new Date('2024-10-05T00:00:00Z'),
        resultsData: [
          {
            itemName: 'Chiều cao',
            value: 145,
            unit: 'CM',
            isAbnormal: false,
            guideline: 'Đo chiều cao khi đứng thẳng',
          },
          {
            itemName: 'Cân nặng',
            value: 32,
            unit: 'KG',
            isAbnormal: false,
            guideline: 'Đo cân nặng bằng cân điện tử',
          },
        ],
        overallConclusion: 'Phát triển bình thường',
        recommendations: 'Tiếp tục theo dõi định kỳ',
      },
      {
        campaignId: createdHealthCheckCampaigns.find(
          (c) => c.name === 'Chiến dịch khám thị lực đầu năm 2025',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Thị F')!
          ._id,
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc C')!._id,
        checkupDate: new Date('2025-02-05T00:00:00Z'),
        resultsData: [
          {
            itemName: 'Thị lực mắt trái',
            value: '20/25',
            isAbnormal: true,
            guideline: 'Sử dụng bảng Snellen',
            notes: 'Cần khám chuyên khoa mắt',
          },
          {
            itemName: 'Thị lực mắt phải',
            value: '10/25',
            isAbnormal: true,
            guideline: 'Sử dụng bảng Snellen',
            notes: 'Cần khám chuyên khoa mắt',
          },
        ],
        overallConclusion: 'Có vấn đề thị lực',
        recommendations: 'Khám chuyên khoa mắt sớm',
      },
    ];
    await HealthCheckResult.insertMany(healthCheckResults);

    // Tạo dữ liệu HealthProfile
    console.log('Seeding HealthProfile data...');
    const healthProfiles = [
      {
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!
          ._id,
        allergies: 'Dị ứng đậu phộng',
        chronicConditions: 'Không có',
        visionStatus: 'Bình thường',
        hearingStatus: 'Bình thường',
        vaccines: [
          { vaccineName: 'MMR', doseNumber: 1 },
          { vaccineName: 'Viêm gan B', doseNumber: 2 },
        ],
      },
      {
        studentId: createdStudents.find((s) => s.fullName === 'Trần Thị B')!
          ._id,
        allergies: 'Không có',
        chronicConditions: 'Hen suyễn',
        visionStatus: 'Cần đeo kính',
        hearingStatus: 'Bình thường',
        vaccines: [{ vaccineName: 'MMR', doseNumber: 1 }],
      },
      {
        studentId: createdStudents.find((s) => s.fullName === 'Lê Văn C')!._id,
        allergies: 'Dị ứng bụi',
        chronicConditions: 'Không có',
        visionStatus: 'Bình thường',
        hearingStatus: 'Giảm thính lực nhẹ',
        vaccines: [{ vaccineName: 'Viêm gan B', doseNumber: 1 }],
      },
    ];
    await HealthProfileModel.insertMany(healthProfiles);

    // Tạo dữ liệu HealthDevelopmentTracker
    console.log('Seeding HealthDevelopmentTracker data...');
    const healthDevelopmentTrackers = [
      {
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!
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
        studentId: createdStudents.find((s) => s.fullName === 'Trần Thị B')!
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
        studentId: createdStudents.find((s) => s.fullName === 'Lê Văn C')!._id,
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
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc C')!._id,
        incidentId: null, // Sẽ cập nhật sau khi tạo MedicalIncident
        typeLog: 'USAGE',
        quantityChanged: -2,
        reason: 'Used for student treatment',
      },
      {
        inventoryId: createdMedicalInventories.find(
          (i) => i.itemName === 'Bandages',
        )!._id,
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc CAB')!
          ._id,
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
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!
          ._id,
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc C')!._id,
        incidentType: 'Injury',
        description: 'Minor cut on hand',
        severity: 'Low',
        status: 'Resolved',
        actionsTaken: 'Cleaned and bandaged',
        incidentTime: new Date('2024-10-10T10:00:00Z'),
      },
      {
        studentId: createdStudents.find((s) => s.fullName === 'Trần Thị B')!
          ._id,
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc CAB')!
          ._id,
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
        parentId: createdUsers.find((u) => u.username === 'Trần Đoàn A')!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!
          ._id,
        startDate: new Date('2024-10-01T00:00:00Z'),
        endDate: new Date('2024-12-31T00:00:00Z'),
        prescriptionFile: 'prescription_001.pdf',
        status: MedicationRequestEnum.In_progress,
      },
      {
        parentId: createdUsers.find((u) => u.username === 'Nguyễn Thị B')!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Trần Thị B')!
          ._id,
        startDate: new Date('2024-11-01T00:00:00Z'),
        endDate: new Date('2025-01-31T00:00:00Z'),
        prescriptionFile: 'prescription_002.pdf',
        status: MedicationRequestEnum.Pending,
      },
    ];
    const createdMedicationRequests =
      await MedicationRequestModel.insertMany(medicationRequests);

    // Tạo dữ liệu RequestItem
    console.log('Seeding RequestItem data...');
    const requestItems = [
      {
        medicationRequestId: createdMedicationRequests[0]._id,
        medicationName: 'Paracetamol',
        dosage: '500mg',
        instruction: 'Uống 2 lần mỗi ngày sau ăn',
      },
      {
        medicationRequestId: createdMedicationRequests[0]._id,
        medicationName: 'Vitamin C',
        dosage: '100mg',
        instruction: 'Uống 1 lần vào buổi sáng',
      },
      {
        medicationRequestId: createdMedicationRequests[1]._id,
        medicationName: 'Thuốc ho Prospan',
        dosage: '5ml',
        instruction: 'Uống 3 lần mỗi ngày',
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
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!
          ._id,
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc C')!._id,
        sessionSlots: SlotEnum.Morning,
        status: MedicationScheduleEnum.Not_taken,
        date: new Date('2024-10-02T00:00:00Z'),
      },
      {
        medicationRequestId: createdMedicationRequests.find(
          (r) => r.prescriptionFile === 'prescription_002.pdf',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Trần Thị B')!
          ._id,
        nurseId: createdUsers.find((u) => u.username === 'Nguyễn Ngọc CAB')!
          ._id,
        sessionSlots: SlotEnum.Evening,
        status: MedicationScheduleEnum.Done,
        date: new Date('2024-11-02T00:00:00Z'),
      },
    ];
    await MedicationScheduleModel.insertMany(medicationSchedules);

    // Tạo dữ liệu VaccinationCampaign
    console.log('Seeding VaccinationCampaign data...');
    const vaccinationCampaigns = [
      {
        name: 'Chiến dịch tiêm MMR năm 2024',
        vaccineName: 'MMR',
        doseNumber: 1,
        description: 'Tiêm chủng MMR cho học sinh các khối đầu cấp',
        destination: 'Trường học',
        schoolYear: '2024-2025',
        partnerId: createdHealthcareOrganizations.find(
          (n) => n.name === 'City Health Clinic',
        )!._id,
        targetGradeLevels: [1, 2, 3],
        status: CampaignStatus.DRAFT,
        startDate: new Date('2024-11-01T00:00:00Z'),
        endDate: new Date('2024-11-15T00:00:00Z'),
        createdBy: createdUsers.find((u) => u.username === 'Nguyễn Thị E')!._id,
        summary: {
          totalStudents: 0,
          totalConsents: 0,
          approved: 0,
          declined: 0,
          administered: 0,
          absent: 0,
        },
      },
      {
        name: 'Chiến dịch tiêm nhắc viêm gan B năm 2025',
        vaccineName: 'Viêm gan B',
        doseNumber: 2,
        description: 'Mũi tiêm nhắc lại phòng viêm gan B cho học sinh',
        destination: 'Trường học',
        schoolYear: '2024-2025',
        partnerId: createdHealthcareOrganizations.find(
          (n) => n.name === 'School Health Center',
        )!._id,
        targetGradeLevels: [1, 2, 3, 4, 5],
        status: CampaignStatus.DRAFT,
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: new Date('2025-01-15T00:00:00Z'),
        createdBy: createdUsers.find((u) => u.username === 'Nguyễn Thị E')!._id,
        summary: {
          totalStudents: 0,
          totalConsents: 0,
          approved: 0,
          declined: 0,
          administered: 0,
          absent: 0,
        },
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
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'Trần Đoàn A')!._id,
        status: ConsentStatus.APPROVED,
        confirmedAt: new Date('2024-10-22T00:00:00Z'),
        createdAt: new Date('2024-10-20T00:00:00Z'),
      },
      {
        campaignId: createdVaccinationCampaigns.find(
          (c) => c.vaccineName === 'MMR',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Trần Thị B')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'Nguyễn Thị B')!._id,
        status: ConsentStatus.PENDING,
        createdAt: new Date('2024-10-21T00:00:00Z'),
      },
      {
        campaignId: createdVaccinationCampaigns.find(
          (c) => c.vaccineName === 'Viêm gan B',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Lê Văn C')!._id,
        parentId: createdUsers.find((u) => u.username === 'Trần Đoàn A')!._id,
        status: ConsentStatus.DECLINED,
        reasonForDeclining: 'Học sinh đang điều trị bệnh khác',
        confirmedAt: new Date('2025-01-03T00:00:00Z'),
        createdAt: new Date('2025-01-01T00:00:00Z'),
      },
    ];
    const createdVaccinationConsents =
      await VaccinationConsentModel.insertMany(vaccinationConsents);

    // Tạo dữ liệu VaccinationRecord
    console.log('Seeding VaccinationRecord data...');
    const vaccinationRecords = [
      {
        consentId: createdVaccinationConsents.find(
          (c) =>
            c.status === ConsentStatus.APPROVED &&
            c.studentId.equals(
              createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!._id,
            ),
        )!._id,
        partnerId: createdHealthcareOrganizations.find(
          (o) => o.name === 'City Health Clinic',
        )!._id,
        administeredByStaffId: createdOrganizationStaff.find(
          (s) => s.fullName === 'Nurse Alice Brown',
        )!._id,
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!
          ._id,
        postVaccinationChecks: [
          {
            observedAt: new Date('2024-11-01T10:00:00Z'),
            temperatureLevel: 36.5,
            notes: 'No adverse reactions',
            isAbnormal: false,
            actionsTaken: '',
          },
        ],
        administeredAt: new Date('2024-11-01T09:00:00Z'),
        vaccineName: 'MMR',
        doseNumber: 1,
        createdAt: new Date('2024-11-01T00:00:00Z'),
        updatedAt: new Date('2024-11-01T00:00:00Z'),
      },
      // CHỈ tạo nếu đã được APPROVED
      ...(createdVaccinationConsents.some(
        (c) =>
          c.status === ConsentStatus.APPROVED &&
          c.studentId.equals(
            createdStudents.find((s) => s.fullName === 'Trần Thị B')!._id,
          ),
      )
        ? [
            {
              consentId: createdVaccinationConsents.find(
                (c) =>
                  c.status === ConsentStatus.APPROVED &&
                  c.studentId.equals(
                    createdStudents.find((s) => s.fullName === 'Trần Thị B')!
                      ._id,
                  ),
              )!._id,
              partnerId: createdHealthcareOrganizations.find(
                (o) => o.name === 'School Health Center',
              )!._id,
              administeredByStaffId: createdOrganizationStaff.find(
                (s) => s.fullName === 'Nurse Carol Green',
              )!._id,
              studentId: createdStudents.find(
                (s) => s.fullName === 'Trần Thị B',
              )!._id,
              postVaccinationChecks: [],
              administeredAt: new Date('2025-01-05T09:00:00Z'),
              vaccineName: 'Hepatitis B',
              doseNumber: 2,
              createdAt: new Date('2025-01-05T00:00:00Z'),
              updatedAt: new Date('2025-01-05T00:00:00Z'),
            },
          ]
        : []),
    ];

    await VaccinationRecordModel.insertMany(vaccinationRecords);

    // Tạo dữ liệu MeetingSchedule
    console.log('Seeding MeetingSchedule data...');
    const meetingSchedules = [
      {
        studentId: createdStudents.find((s) => s.fullName === 'Nguyễn Văn A')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'Trần Đoàn A')!._id,
        meetingTime: new Date('2024-10-20T10:00:00Z'),
        location: 'School Office',
        status: 'SCHEDULED',
        reasons: 'Discuss health check results',
        notes: 'Bring medical records',
        afterMeetingNotes: 'Agreed on follow-up',
      },
      {
        studentId: createdStudents.find((s) => s.fullName === 'Trần Thị B')!
          ._id,
        parentId: createdUsers.find((u) => u.username === 'Nguyễn Thị B')!._id,
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
        authorId: createdUsers.find((u) => u.username === 'Trần Văn D')!._id,
        title: 'Tips for Student Health',
        content:
          'Maintaining student health involves proper nutrition, exercise, and regular checkups...',
        publishedAt: new Date('2025-01-15T10:00:00Z'),
      },
      {
        authorId: createdUsers.find((u) => u.username === 'Trần Văn D')!._id,
        title: 'Importance of Vaccinations',
        content:
          'Vaccinations are critical for preventing diseases in school environments...',
        publishedAt: new Date('2025-02-20T12:00:00Z'),
      },
      {
        authorId: createdUsers.find((u) => u.username === 'Trần Văn D')!._id,
        title: 'Mental Health Awareness',
        content:
          'Supporting student mental health is essential for academic success...',
        publishedAt: new Date('2025-03-10T09:00:00Z'),
      },
      {
        authorId: createdUsers.find((u) => u.username === 'Trần Văn D')!._id,
        title: 'Exercise for Kids',
        content:
          'Encouraging physical activity helps improve focus and health...',
        publishedAt: new Date('2025-04-05T14:00:00Z'),
      },
      {
        authorId: createdUsers.find((u) => u.username === 'Nguyễn Thị E')!._id,
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
