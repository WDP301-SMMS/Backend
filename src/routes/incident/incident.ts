import express from 'express';
import { MedicalIncidentController } from '@/controllers/incident/incident.controller';
import { validateIncident } from '@/validators/incident/incident.validator';

const router = express.Router();

router.post('/', validateIncident, MedicalIncidentController.createIncident);
router.get('/', MedicalIncidentController.getAllIncidents);
router.get('/nurse', MedicalIncidentController.getNurseIncidents);
router.get('/parent', MedicalIncidentController.getParentIncidents);
router.get('/:id', MedicalIncidentController.getIncidentById);
router.patch(
  '/:id',
  validateIncident,
  MedicalIncidentController.updateIncident,
);

export default router;
