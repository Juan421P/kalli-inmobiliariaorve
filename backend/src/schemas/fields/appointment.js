import { z } from 'zod';
import { geojson, string, text } from './primitives.js';
import { day, toMinutes } from './schedule_availability.js';

export const coercedDate = () => z.coerce.date();

export const fundsSource = z.enum(['own', 'loan', 'mixed']);
export const appointmentStatus = z.enum(['pending', 'assigned', 'scheduled', 'completed', 'cancelled']);

export const qualification = z.object({
    fundsSource,
    monthlyIncome: z.number().min(0),
    reason: z.string().trim().min(1).max(500),
});

export const currentAddress = z.object({
    location: geojson(),
    address: text(),
    reference: z.string().trim().min(1).max(255),
});

export const proposedDates = z.array(coercedDate()).min(1, 'debe proponer al menos una fecha');

const TIME_REGEX = /^(0?[1-9]|1[0-2]):[0-5]\d (AM|PM)$/i;
const timeString = string({ regex: TIME_REGEX });

export const time = z.object({
    startTime: timeString,
    endTime: timeString,
}).refine(
    data => toMinutes(data.startTime) < toMinutes(data.endTime),
    { path: ['endTime'], message: 'la hora de inicio debe ser anterior a la hora de fin' }
);

export { day, toMinutes };