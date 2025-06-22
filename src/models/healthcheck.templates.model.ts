import {
  CheckupItemDataType,
  CheckupItemUnit,
  HealthCheckTemplateType,
} from '@/enums/TemplateEnum';
import {
  ICheckupItem,
  IHealthCheckTemplate,
} from '@/interfaces/healthcheck.templates.interface';
import mongoose, { model, Schema, Types } from 'mongoose';

const HealthCheckTemplateSchema = new Schema<IHealthCheckTemplate>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  checkupItems: {
    type: [
      {
        itemId: {
          type: Types.UUID,
          required: true,
        },
        itemName: {
          type: String,
          required: true,
        },
        unit: {
          type: String,
          enum: Object.values(CheckupItemUnit),
          default: null,
        },
        dataType: {
          type: String,
          enum: Object.values(CheckupItemDataType),
          required: true,
        },
        guideline: {
          type: String,
          default: null,
        },
      },
    ],
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
