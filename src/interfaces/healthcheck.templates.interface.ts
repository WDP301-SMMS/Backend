import {
  CheckupItemDataType,
  CheckupItemUnit,
  HealthCheckTemplateType,
} from '@/enums/TemplateEnum';

export interface ICheckupItem {
  itemId: string;
  itemName: string;
  unit?: CheckupItemUnit;
  dataType: CheckupItemDataType;
  guideline?: string;
}

export interface IHealthCheckTemplate {
  name: string;
  description: string;
  checkupItems: ICheckupItem[];
  isDefault: boolean;
}
