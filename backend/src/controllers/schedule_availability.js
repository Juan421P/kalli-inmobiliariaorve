import model from '../models/schedule_availability.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';
import { catchAsync } from '../utils/catch_async.js';

const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const TIME_REGEX = /^(0?[1-9]|1[0-2]):[0-5]\d (AM|PM)$/i;

// Convierte "09:00 AM" / "02:30 PM" a minutos totales para poder comparar intervalos numéricamente
const toMinutes = (time) => {
    const [timePart, period] = time.toUpperCase().split(' ');
    const [h, m] = timePart.split(':').map(Number);
    // Las 12 AM son medianoche (0h) y las 12 PM son mediodía (12h)
    const hours = period === 'PM' && h !== 12 ? h + 12 : (period === 'AM' && h === 12 ? 0 : h);
    return hours * 60 + m;
};

const controller = {

    get: catchAsync(async (req, res) => {
        const schedules = await model.find();
        return res.status(200).json({ schedules });
    }),

    getById: catchAsync(async (req, res) => {
        const schedule = await model.findById(req.params.id);
        if (!schedule) throw new NotFoundError('schedule availability not found');
        return res.status(200).json({ schedule });
    }),

    post: catchAsync(async (req, res) => {
        const { day, intervals } = req.body;

        if (!day?.trim()) return res.status(400).json({ message: 'the day field is required' });
        if (!VALID_DAYS.includes(day.trim())) return res.status(400).json({ message: `invalid day, accepted values are: ${VALID_DAYS.join(', ')}` });
        if (!Array.isArray(intervals) || intervals.length === 0) return res.status(400).json({ message: 'you must include at least one time interval' });

        for (const interval of intervals) {
            if (!interval.start_time || !TIME_REGEX.test(interval.start_time))
                return res.status(400).json({ message: 'start time format is invalid, use hh:mm AM/PM (example: 09:00 AM)' });
            if (!interval.end_time || !TIME_REGEX.test(interval.end_time))
                return res.status(400).json({ message: 'end time format is invalid, use hh:mm AM/PM (example: 05:00 PM)' });
            if (toMinutes(interval.start_time) >= toMinutes(interval.end_time))
                return res.status(400).json({ message: 'start time must be earlier than end time' });
        }

        // El modelo tiene unique en day, pero validamos antes para devolver un error controlado
        const exists = await model.findOne({ day: day.trim() });
        if (exists) throw new ConflictError('a schedule for this day already exists');

        const schedule = new model({ day: day.trim(), intervals });
        await schedule.save();
        return res.status(201).json({ message: 'schedule availability created successfully', schedule });
    }),

    put: catchAsync(async (req, res) => {
        const { day, intervals } = req.body;

        if (day !== undefined) {
            if (!day?.trim()) return res.status(400).json({ message: 'the day field cannot be empty' });
            if (!VALID_DAYS.includes(day.trim())) return res.status(400).json({ message: `invalid day, accepted values are: ${VALID_DAYS.join(', ')}` });
        }

        if (intervals !== undefined) {
            if (!Array.isArray(intervals) || intervals.length === 0) return res.status(400).json({ message: 'you must include at least one time interval' });
            for (const interval of intervals) {
                if (!interval.start_time || !TIME_REGEX.test(interval.start_time))
                    return res.status(400).json({ message: 'start time format is invalid, use hh:mm AM/PM (example: 09:00 AM)' });
                if (!interval.end_time || !TIME_REGEX.test(interval.end_time))
                    return res.status(400).json({ message: 'end time format is invalid, use hh:mm AM/PM (example: 05:00 PM)' });
                if (toMinutes(interval.start_time) >= toMinutes(interval.end_time))
                    return res.status(400).json({ message: 'start time must be earlier than end time' });
            }
        }

        const schedule = await model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!schedule) throw new NotFoundError('schedule availability not found');
        return res.status(200).json({ message: 'schedule availability updated successfully', schedule });
    }),

    delete: catchAsync(async (req, res) => {
        const schedule = await model.findByIdAndDelete(req.params.id);
        if (!schedule) throw new NotFoundError('schedule availability not found');
        return res.status(200).json({ message: 'schedule availability deleted successfully' });
    })

};

export default controller;
