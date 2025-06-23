import { CheckupItemDataType, CheckupItemUnit } from '@/enums/TemplateEnum';

export interface ICheckupItem {
  itemId: Number;
  itemName: string;
  unit?: CheckupItemUnit;
  dataType: CheckupItemDataType;
  guideline?: string;
}

export interface IHealthCheckTemplate {
  name: string;
  description: string | null;
  checkupItems: ICheckupItem[];
  isDefault: boolean;
}
