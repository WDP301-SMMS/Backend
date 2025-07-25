import { HealthCheckResult } from '@/models/healthcheck.result.model';
import { StudentModel } from '@/models/student.model';
import { VaccinationRecordModel } from '@/models/vacination.record.model';
import { ollamaInitPrompt } from '@/prompt/prompt';
import { IUser } from '@/interfaces/user.interface';

class AIChatService {
  static async getStudentData(parentId: string) {
    if (!parentId) {
      throw new Error('Parent ID is required to retrieve student data');
    }
    try {
      const students = await StudentModel.find({ parentId: parentId })
        .populate('parentId', 'username email')
        .populate('classId');

      const healthCheck = await HealthCheckResult.find({
        studentId: { $in: students.map((student) => student._id) },
      })
        .populate('nurseId', 'username email')
        .populate(
          'campaignId',
          'name schoolYear startDate endDate actualStartDate completedDate',
        );

      const vaccinationRecords = await VaccinationRecordModel.find({
        studentId: { $in: students.map((student) => student._id) },
      });

      const studentFullProfiles = students.map((student) => {
        const healthChecks = healthCheck?.filter((h) =>
          h?.studentId?.equals(student._id),
        );
        const vaccinations = vaccinationRecords?.filter((v) =>
          v?.studentId?.equals(student._id),
        );
        return {
          ...student.toObject(),
          healthChecks,
          vaccinations,
        };
      });

      return studentFullProfiles;
    } catch (error) {
      console.error('Error in getStudentData:', error);
      throw new Error('Failed to retrieve student data');
    }
  }

  static initPrompt(user: IUser, student_health: string) {
    try {
      const initPrompt = ollamaInitPrompt
        .replace('{user}', JSON.stringify(user))
        .replace('{student_health}', student_health);

      return initPrompt;
    } catch (error) {
      console.error('Error in initPrompt:', error);
      throw new Error('Failed to initialize prompt');
    }
  }

  static clientChatPrompt(user_input: string) {
    try {
      return user_input;
    } catch (error) {
      console.error('Error in clientChatPrompt:', error);
      throw new Error('Failed to generate client chat prompt');
    }
  }

  static async handleAIResponse(response: string) {
    try {
      if (!response) {
        throw new Error('AI response is empty');
      }
      let formattedResponse = response.trim();

      if (response.includes('</think>')) {
        formattedResponse = response
          .replace(/<think>[\s\S]*?<\/think>/, '')
          .trim();
      }

      return formattedResponse || 'No response from AI';
    } catch (error) {
      console.error('Error in handleAIResponse:', error);
      throw new Error('Failed to handle AI response');
    }
  }
}

export default AIChatService;
