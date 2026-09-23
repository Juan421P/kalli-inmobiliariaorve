import { z } from 'zod';
import { string } from './primitives.js';

const time_regex = /^(0?[1-9]|1[0-2]):[0-5]\d (AM|PM)$/i;
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const toMinutes = (time) => {
    const [timePart, period] = time.toUpperCase().split(' ');
    const [h, m] = timePart.split(':').map(Number);
    const hours = period === 'PM' && h !== 12 ? h + 12 : (period === 'AM' && h === 12 ? 0 : h);
    return hours * 60 + m;
};

export const day = z.enum(days);

const timeString = string({ regex: time_regex });

const interval = z.object({
    startTime: timeString,
    endTime: timeString,
}).refine(
    data => toMinutes(data.startTime) < toMinutes(data.endTime),
    { path: ['endTime'], message: 'la hora de inicio debe ser anterior a la hora de fin' }
);

export const intervals = z.array(interval)
    .min(1, 'debe incluir al menos un intervalo de horario')
    .superRefine((list, ctx) => {
        const sorted = list
            .map((iv, index) => ({ ...iv, index, start: toMinutes(iv.startTime), end: toMinutes(iv.endTime) }))
            .sort((a, b) => a.start - b.start);

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].start < sorted[i - 1].end) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `el intervalo que inicia a las ${sorted[i].startTime} se traslapa con el que termina a las ${sorted[i - 1].endTime}`,
                    path: [sorted[i].index, 'startTime'],
                });
            }
        }
    });