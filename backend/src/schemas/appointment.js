import { z } from 'zod';
import { database } from './fields/index.js';
import { text, longText } from './fields/primitives.js';
import { qualification, currentAddress, proposedDates, time, appointmentStatus, coercedDate } from './fields/appointment.js';

export const schemas = {

    queryById: z.object({ id: database.id }).strict(),

    queryFilter: z.object({
        status: appointmentStatus.optional(),
    }).strict(),

    create: z.object({
        buyer: database.id.optional(),
        property: database.id,
        qualification,
        current_address: currentAddress,
        proposed_dates: proposedDates,
        notes: longText().optional(),
        time,
    }).strict(),

    update: z.object({
        qualification: qualification.optional(),
        current_address: currentAddress.optional(),
        proposed_dates: proposedDates.optional(),
        notes: longText().optional(),
    }).strict().refine(
        data => Object.keys(data).length > 0,
        { message: 'at least one field must be updated' }
    ),

    assign: z.object({
        collaborator: database.id,
    }).strict(),

    schedule: z.object({
        scheduled_date: coercedDate(),
    }).strict(),
};