import {
  CheckupItemDataType,
  HealthCheckTemplateType,
} from '@/enums/TemplateEnum';
import {
  ICheckupItem,
  IHealthCheckTemplate,
} from '@/interfaces/healthcheck.templates.interface';
import mongoose, { Schema, model } from 'mongoose';

const CheckupItemSchema = new Schema<ICheckupItem>({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    required: false,
    trim: true,
    default: null,
  },
  dataType: {
    type: String,
    required: true,
    enum: Object.values(CheckupItemDataType),
  },
  guideline: {
    type: String,
    required: false,
    trim: true,
  },
  options: {
    type: [String],
    required: function (this: { dataType: string }) {
      return this.dataType === CheckupItemDataType.SELECT;
    },
    default: undefined,
  },
});

const HealthCheckTemplateSchema = new Schema<IHealthCheckTemplate>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(HealthCheckTemplateType),
  },
  checkupItems: {
    type: [CheckupItemSchema],
    required: true,
    default: [],
  },
  isDefault: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export const HealthCheckTemplate = mongoose.model<IHealthCheckTemplate>(
  'HealthCheckTemplate',
  HealthCheckTemplateSchema,
);
export const CheckupItem = model<ICheckupItem>('CheckupItem', CheckupItemSchema);
