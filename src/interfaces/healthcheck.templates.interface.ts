import { CheckupItemDataType, HealthCheckTemplateType } from "@/enums/TemplateEnum";


export interface ICheckupItem {
  itemName: string;
  unit?: string | null;
  dataType: CheckupItemDataType;
  guideline?: string;
  options?: string[];
}

export interface IHealthCheckTemplate {
  name: string;
  description: string;
  type: HealthCheckTemplateType;
  checkupItems: ICheckupItem[];
  isDefault: boolean;

}