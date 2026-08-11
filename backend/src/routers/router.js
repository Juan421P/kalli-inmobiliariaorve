import { Router } from 'express';
import admin from './admin.js';
import auth from './auth.js';
import client from './client.js';
import collaborator from './collaborator.js';
import offer from './offer.js';
import property from './property.js';
import resolveAddress from './resolve_address.js';
import appliance from './appliance.js';
import tag from './tag.js';
import appointment from './appointment.js';
import amenity from './amenity.js';
import scheduleAvailability from './schedule_availability.js'
import feature from './feature.js';

const router = Router();
router.use('/admin', admin);
router.use('/auth', auth);
router.use('/client', client);
router.use('/collaborator', collaborator);
router.use('/offer', offer);
router.use('/property', property);
router.use('/resolve-address', resolveAddress);
router.use('/possible-appliance', appliance);
router.use('/possible-tag', tag);
router.use('/appointment', appointment);
router.use('/possible-amenity', amenity)
router.use('/schedule-availability', scheduleAvailability)
router.use('/possible-feature', feature)
export default router;