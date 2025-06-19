import { HealthProfileModel } from '@/models/health.profile.model';
import { VaccinationCampaignModel } from '@/models/vaccination.campaign.model';


class AdminVaccineSuggestionService {
  private campaigns = VaccinationCampaignModel;
  private healthProfiles = HealthProfileModel;


  public async getVaccineSuggestions(): Promise<string[]> {
    const campaignVaccineNames = await this.campaigns.distinct('vaccineName');

    const profileVaccineNamesResult = await this.healthProfiles.aggregate([
      { $unwind: '$vaccines' },
      { $group: { _id: '$vaccines.vaccineName' } }, 
      { $project: { _id: 0, name: '$_id' } }, 
    ]);
    const profileVaccineNames = profileVaccineNamesResult.map(item => item.name);
    const allNames = [...campaignVaccineNames, ...profileVaccineNames];
    const uniqueNames = [...new Set(allNames)];

    uniqueNames.sort();

    return uniqueNames;
  }
}

export default AdminVaccineSuggestionService;