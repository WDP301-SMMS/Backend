import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

// --- IMPORT TẤT CẢ CÁC MODEL CỦA BẠN ---
// (Hãy chắc chắn rằng đường dẫn import là chính xác)
import UserModel from '../models/user.model';
import { StudentModel } from '../models/student.model';
import { Class } from '../models/class.model';
import { MedicalIncidentModel } from '../models/medical.incident.model';
import { MedicationRequestModel } from '../models/medication.request.model';
// Đã sửa: Import cả hai model từ file inventory
import {
  MedicalInventoryModel,
  InventoryDetailModel,
} from '../models/medical.inventory.model';
import { HealthCheckCampaign } from '../models/healthcheck.campaign.model';
import { HealthCheckResult } from '../models/healthcheck.result.model';
import { HealthCheckConsent } from '../models/healthcheck.consents.model';
// Giả định bạn có một model HealthCheckTemplate
// Nếu không, chúng ta sẽ tạo dữ liệu giả cho nó
let HealthCheckTemplate: any;
try {
  HealthCheckTemplate =
    require('../models/healthcheck.template.model').HealthCheckTemplate;
} catch (e) {
  // Bỏ qua nếu không có model này
}

// --- IMPORT CÁC ENUM ---
import { RoleEnum } from '../enums/RoleEnum';
import { ConsentStatus } from '../enums/ConsentsEnum';
import {
  CampaignStatus,
  ExecutionType,
} from '../enums/HealthCheckCampaignEnum';
import { ICheckupItem } from '@/interfaces/healthcheck.templates.interface';
// ... import các enum khác nếu cần

// Hàm helper để lấy một phần tử ngẫu nhiên từ mảng
const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Database connected!');

    // --- BƯỚC 1: XÓA DỮ LIỆU CŨ ---
    console.log('Cleaning old data...');
    await Promise.all([
      UserModel.deleteMany({}),
      StudentModel.deleteMany({}),
      Class.deleteMany({}),
      MedicalIncidentModel.deleteMany({}),
      MedicationRequestModel.deleteMany({}),
      MedicalInventoryModel.deleteMany({}),
      InventoryDetailModel.deleteMany({}), // Thêm lệnh xóa cho InventoryDetail
      HealthCheckCampaign.deleteMany({}),
      HealthCheckResult.deleteMany({}),
      HealthCheckConsent.deleteMany({}),
      HealthCheckTemplate
        ? HealthCheckTemplate.deleteMany({})
        : Promise.resolve(),
    ]);
    console.log('Old data cleaned!');

    // --- BƯỚC 2: TẠO DỮ LIỆU CƠ BẢN (Users, Classes, Students) ---
    console.log('Seeding core data...');

    // Tạo Users (Phụ huynh và Y tá)
    const users = [];
    for (let i = 0; i < 20; i++) {
      users.push({
        username: faker.internet.userName(),
        password: 'password123', // Trong thực tế cần được hash
        email: faker.internet.email(),
        role: i < 3 ? RoleEnum.Nurse : RoleEnum.Parent, // 3 y tá, 17 phụ huynh
        dob: faker.date.past({ years: 30 }),
        phone: faker.phone.number(),
        isActive: true,
      });
    }
    const createdUsers = await UserModel.insertMany(users);
    const parents = createdUsers.filter((u) => u.role === RoleEnum.Parent);
    const nurses = createdUsers.filter((u) => u.role === RoleEnum.Nurse);

    // Tạo Classes cho các khối 1, 2, 3
    const classes = [];
    for (const grade of [1, 2, 3]) {
      for (const name of ['A', 'B']) {
        classes.push({
          className: `${grade}${name}`,
          gradeLevel: grade,
          schoolYear: '2024-2025',
          totalStudents: 0,
          students: [],
        });
      }
    }
    const createdClasses = await Class.insertMany(classes);

    // Tạo Students và liên kết với Parents và Classes
    const students = [];
    for (let i = 0; i < 50; i++) {
      const randomClass = getRandomItem(createdClasses);
      const student = await StudentModel.create({
        parentId: getRandomItem(parents)._id,
        classId: randomClass._id,
        fullName: faker.person.fullName(),
        dateOfBirth: faker.date.past({ years: 8, refDate: '2016-01-01' }),
      });
      students.push(student);
      // Cập nhật lại lớp học
      randomClass.students.push(student._id);
      randomClass.totalStudents = randomClass.students.length;
      await randomClass.save();
    }
    console.log(
      `Seeded ${createdUsers.length} users, ${createdClasses.length} classes, ${students.length} students.`,
    );

    // --- BƯỚC 3: TẠO DỮ LIỆU CHO CÁC NGHIỆP VỤ ---
    console.log('Seeding operational data...');

    // Tạo 1 Health Check Template mẫu
    const template = {
      name: 'Mẫu khám tổng quát theo thông tư 13',
      checkupItems: [
        {
          itemId: new mongoose.Types.ObjectId(),
          itemName: 'Chiều cao',
          unit: 'cm',
          dataType: 'NUMBER',
        },
        {
          itemId: new mongoose.Types.ObjectId(),
          itemName: 'Cân nặng',
          unit: 'kg',
          dataType: 'NUMBER',
        },
        {
          itemId: new mongoose.Types.ObjectId(),
          itemName: 'Thị lực',
          unit: '/10',
          dataType: 'TEXT',
        },
        {
          itemId: new mongoose.Types.ObjectId(),
          itemName: 'BMI',
          dataType: 'NUMBER',
        },
        {
          itemId: new mongoose.Types.ObjectId(),
          itemName: 'Sâu răng',
          unit: 'cái',
          dataType: 'NUMBER',
        },
      ],
    };
    const createdTemplate = HealthCheckTemplate
      ? await HealthCheckTemplate.create(template)
      : template;

    // Tạo Health Check Campaigns
    const campaigns = await HealthCheckCampaign.insertMany([
      {
        name: 'Khám sức khỏe đầu năm 2023-2024',
        schoolYear: '2023-2024',
        startDate: new Date('2023-09-10'),
        endDate: new Date('2023-09-20'),
        templateId: createdTemplate.itemId
          ? createdTemplate._id
          : new mongoose.Types.ObjectId(),
        targetGradeLevels: [1, 2],
        executionType: ExecutionType.INTERNAL,
        status: CampaignStatus.COMPLETED,
        createdBy: getRandomItem(nurses)._id,
      },
      {
        name: 'Khám sức khỏe đầu năm 2024-2025',
        schoolYear: '2024-2025',
        startDate: new Date('2024-09-10'),
        endDate: new Date('2024-09-20'),
        templateId: createdTemplate.itemId
          ? createdTemplate._id
          : new mongoose.Types.ObjectId(),
        targetGradeLevels: [1, 2, 3],
        executionType: ExecutionType.INTERNAL,
        status: CampaignStatus.IN_PROGRESS,
        createdBy: getRandomItem(nurses)._id,
      },
    ]);
    const latestCampaign = campaigns.find((c) => c.schoolYear === '2024-2025')!;

    // Tạo Health Check Consents cho chiến dịch gần nhất
    const consents = [];
    const studentsForConsent = students.slice(0, 40); // Lấy 40 học sinh để tạo consent
    for (const student of studentsForConsent) {
      const status =
        Math.random() > 0.1 ? ConsentStatus.APPROVED : ConsentStatus.DECLINED; // 90% đồng ý
      consents.push({
        campaignId: latestCampaign._id,
        studentId: student._id, // GIẢ ĐỊNH QUAN TRỌNG: model của bạn đã sửa ref thành 'Student'
        parentId: student.parentId,
        status,
        reasonForDeclining:
          status === ConsentStatus.DECLINED ? 'Lý do gia đình' : null,
        confirmedAt: new Date(),
      });
    }
    await HealthCheckConsent.insertMany(consents);
    const approvedStudents = consents
      .filter((c) => c.status === ConsentStatus.APPROVED)
      .map((c) => c.studentId);

    // Tạo Health Check Results cho các học sinh đã đồng ý
    const results = [];
    const checkupItemIds = {
      height: createdTemplate.checkupItems.find(
        (item: ICheckupItem) => item.itemName === 'Chiều cao',
      )!.itemId,
      weight: createdTemplate.checkupItems.find(
        (item: ICheckupItem) => item.itemName === 'Cân nặng',
      )!.itemId,
      vision: createdTemplate.checkupItems.find(
        (item: ICheckupItem) => item.itemName === 'Thị lực',
      )!.itemId,
      bmi: createdTemplate.checkupItems.find(
        (item: ICheckupItem) => item.itemName === 'BMI',
      )!.itemId,
      dental: createdTemplate.checkupItems.find(
        (item: ICheckupItem) => item.itemName === 'Sâu răng',
      )!.itemId,
    };

    for (const studentId of approvedStudents) {
      const height = faker.number.int({ min: 110, max: 130 });
      const weight = faker.number.int({ min: 18, max: 30 });
      const bmi = parseFloat((weight / (height / 100) ** 2).toFixed(2));
      const isObese = bmi > 21;
      const hasBadVision = Math.random() > 0.7;
      const hasCavity = Math.random() > 0.5;

      results.push({
        campaignId: latestCampaign._id,
        studentId: studentId,
        checkupDate: faker.date.between({
          from: latestCampaign.startDate,
          to: latestCampaign.endDate,
        }),
        resultsData: [
          {
            itemId: checkupItemIds.height,
            itemName: 'Chiều cao',
            value: height,
            unit: 'cm',
          },
          {
            itemId: checkupItemIds.weight,
            itemName: 'Cân nặng',
            value: weight,
            unit: 'kg',
          },
          {
            itemId: checkupItemIds.vision,
            itemName: 'Thị lực',
            value: hasBadVision ? '7/10' : '10/10',
            unit: '/10',
            isAbnormal: hasBadVision,
          },
          {
            itemId: checkupItemIds.bmi,
            itemName: 'BMI',
            value: bmi,
            isAbnormal: isObese,
          },
          {
            itemId: checkupItemIds.dental,
            itemName: 'Sâu răng',
            value: hasCavity ? 1 : 0,
            unit: 'cái',
            isAbnormal: hasCavity,
          },
        ],
        overallConclusion:
          isObese || hasBadVision ? 'Cần theo dõi' : 'Bình thường',
        checkedBy: getRandomItem(nurses)._id,
      });
    }
    await HealthCheckResult.insertMany(results);

    // Tạo Medical Incidents
    for (let i = 0; i < 15; i++) {
      await MedicalIncidentModel.create({
        studentId: getRandomItem(students)._id,
        nurseId: getRandomItem(nurses)._id,
        incidentType: getRandomItem(['Sốt', 'Té ngã', 'Đau bụng']),
        description: faker.lorem.sentence(),
        severity: 'Nhẹ',
        status: 'Đã xử lý',
        actionsTaken: 'Cho uống thuốc, theo dõi',
        incidentTime: faker.date.past({ years: 1 }),
      });
    }

    // Tạo Medication Requests (1 số đang chờ)
    for (let i = 0; i < 5; i++) {
      await MedicationRequestModel.create({
        parentId: getRandomItem(parents)._id,
        startDate: new Date(),
        endDate: faker.date.future({ years: 0.1 }),
        prescriptionFile: faker.image.url(),
        status: i < 2 ? 'PENDING' : 'APPROVED',
      });
    }

    // ĐÃ SỬA LỖI: Tạo Medical Inventory theo đúng thứ tự
    // Bước 1: Tạo các InventoryDetail trước
    const inventoryDetails = await InventoryDetailModel.insertMany([
      { quantity: 5, expirationDate: faker.date.future({ years: 2 }) },
      { quantity: 20, expirationDate: faker.date.future({ years: 1 }) },
      { quantity: 12, expirationDate: faker.date.future({ years: 3 }) },
    ]);

    // Bước 2: Tạo MedicalInventory và liên kết với detailId tương ứng
    await MedicalInventoryModel.insertMany([
      {
        detailId: inventoryDetails[0]._id,
        itemName: 'Băng gạc',
        unit: 'Hộp',
        quantityTotal: 5,
        lowStockThreshold: 10,
        status: 'Active',
      },
      {
        detailId: inventoryDetails[1]._id,
        itemName: 'Thuốc hạ sốt',
        unit: 'Vỉ',
        quantityTotal: 20,
        lowStockThreshold: 15,
        status: 'Active',
      },
      {
        detailId: inventoryDetails[2]._id,
        itemName: 'Cồn 70 độ',
        unit: 'Chai',
        quantityTotal: 12,
        lowStockThreshold: 5,
        status: 'Active',
      },
    ]);

    console.log('Seeding operational data completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    console.log('Closing database connection.');
    await mongoose.connection.close();
  }
};

// Chạy script
seedDatabase();
