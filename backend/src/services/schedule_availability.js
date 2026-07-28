import model from '../models/schedule_availability.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';

const service = {

    async getAll() {
        return await model.find();
    },

    async getById(id) {
        const schedule = await model.findById(id);
        if (!schedule) throw new NotFoundError(
            'schedule availability not found', {
            code: 'SCHEDULE_AVAILABILITY_NOT_FOUND',
            resource: 'schedule_availability',
            id
        });
        return schedule;
    },

    async create({ day, intervals }) {
        const exists = await model.findOne({ day });
        if (exists) throw new ConflictError(
            'a schedule for this day already exists', {
            code: 'SCHEDULE_DAY_ALREADY_EXISTS',
            field: 'day',
            value: day
        });

        return await model.create({
            day,
            intervals: intervals.map(iv => ({ start_time: iv.startTime, end_time: iv.endTime })),
        });
    },

    async update(id, { day, intervals }) {
        if (day !== undefined) {
            const exists = await model.findOne({ day, _id: { $ne: id } });
            if (exists) throw new ConflictError(
                'a schedule for this day already exists', {
                code: 'SCHEDULE_DAY_ALREADY_EXISTS',
                field: 'day',
                value: day
            });
        }

        const data = {};
        if (day !== undefined) data.day = day;
        if (intervals !== undefined) data.intervals = intervals.map(iv => ({ start_time: iv.startTime, end_time: iv.endTime }));

        const schedule = await model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!schedule) throw new NotFoundError(
            'schedule availability not found', {
            code: 'SCHEDULE_AVAILABILITY_NOT_FOUND',
            resource: 'schedule_availability',
            id
        });
        return schedule;
    },

    async delete(id) {
        const schedule = await model.findByIdAndDelete(id);
        if (!schedule) throw new NotFoundError(
            'schedule availability not found', {
            code: 'SCHEDULE_AVAILABILITY_NOT_FOUND',
            resource: 'schedule_availability',
            id
        });
        return { id, deleted: true };
    },
};
export default service;