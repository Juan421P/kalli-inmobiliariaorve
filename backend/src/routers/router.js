import { Router } from 'express';
import admin from './admin.js';
import auth from './auth.js';
import client from './client.js';
import collaborator from './collaborator.js';
import offer from './offer.js';
import property from './property.js';
import possibleAppliance from './possible_appliance.js';
import possibleTag from './possible_tag.js';
import appointment from './appointment.js';
import possibleAmenity from './possible_amenity.js';
import scheduleAvailability from './schedule_availability.js'

const router = Router();
router.use('/admin', admin);
router.use('/auth', auth);
router.use('/client', client);
router.use('/collaborator', collaborator);
router.use('/offer', offer);
router.use('/property', property);
router.use('/possible_appliance', possibleAppliance);
router.use('/possible_tag', possibleTag);
router.use('/appointment', appointment);
router.use('/possibleAmenity', possibleAmenity)
router.use('/scheduleAvailability', scheduleAvailability)
export default router;