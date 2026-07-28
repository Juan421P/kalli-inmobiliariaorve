import { z } from 'zod';
import { database } from './fields/index.js';
import { text, longText, coercedDate } from './fields/primitives.js';
import { qualification, currentAddress, proposedDates, appointmentStatus } from './fields/appointment.js';

export const schemas = {

    queryById: z.object({ id: database.id }).strict(),

    queryFilter: z.object({
        status: appointmentStatus.optional(),
    }).strict(),

    create: z.object({
        buyer: database.id.optional(),
        property: database.id,
        qualification,
        currentAddress,
        proposedDates,
        notes: longText().optional(),
        time: database.id,
    }).strict(),

    update: z.object({
        qualification: qualification.optional(),
        currentAddress: currentAddress.optional(),
        proposedDates: proposedDates.optional(),
        notes: longText().optional(),
    }).strict().refine(
        data => Object.keys(data).length > 0,
        { message: 'at least one field must be updated' }
    ),

    assign: z.object({
        collaborator: database.id,
    }).strict(),

    schedule: z.object({
        scheduledDate: coercedDate(),
    }).strict(),
};