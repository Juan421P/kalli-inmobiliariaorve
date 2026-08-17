import model from '../models/appointment.js';
import propertyModel from '../models/property.js';
import collaboratorModel from '../models/collaborator.js';
import scheduleAvailabilityModel from '../models/schedule_availability.js';
import { toMinutes } from '../schemas/fields/schedule_availability.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';
import ValidationError from '../errors/validation.js';

const populateOptions = [
    { path: 'buyer', select: 'name lastname email picture' },
    { path: 'property', select: 'title public_id' },
    { path: 'collaborator', select: 'name lastname' },
];

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

async function assertTimeIsAvailable(proposedDates, time) {
    const start = toMinutes(time.startTime);
    const end = toMinutes(time.endTime);
    const impliedDays = [...new Set(proposedDates.map(d => weekdays[new Date(d).getDay()]))];

    const schedules = await scheduleAvailabilityModel.find({ day: { $in: impliedDays } });
    const byDay = Object.fromEntries(schedules.map(s => [s.day, s]));

    for (const dayName of impliedDays) {
        const schedule = byDay[dayName];
        const fits = schedule?.intervals.some(
            iv => toMinutes(iv.start_time) <= start && end <= toMinutes(iv.end_time)
        );
        if (!fits) throw new ValidationError(
            `no availability on ${dayName} for the requested time window`, {
            code: 'TIME_NOT_AVAILABLE',
            field: 'time',
            day: dayName
        });
    }
}

const service = {

    async getAll(filter = {}) {
        return await model.find(filter).populate(populateOptions).sort({ createdAt: -1 });
    },

    async getById(id) {
        const appointment = await model.findById(id).populate(populateOptions);
        if (!appointment) throw new NotFoundError(
            'appointment not found', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        return appointment;
    },

    async create({ actor, body }) {
        const {
            buyer, property, qualification,
            current_address: currentAddress,
            proposed_dates: proposedDates,
            notes, time
        } = body;

        const isStaff = actor.role === 'admin' || actor.role === 'collaborator';
        const buyerId = (buyer && isStaff) ? buyer : actor.id;

        const propertyExists = await propertyModel.exists({ _id: property });
        if (!propertyExists) throw new NotFoundError(
            'property not found', { code: 'PROPERTY_NOT_FOUND', resource: 'property', id: property });

        await assertTimeIsAvailable(proposedDates, time);

        const appointment = await model.create({
            buyer: buyerId,
            property,
            qualification: {
                funds_source: qualification.fundsSource,
                monthly_income: qualification.monthlyIncome,
                reason: qualification.reason,
            },
            current_address: {
                location: currentAddress.location,
                address: currentAddress.address,
                reference: currentAddress.reference,
            },
            proposed_dates: proposedDates,
            notes,
            time: { start_time: time.startTime, end_time: time.endTime },
        });
        return appointment;
    },

    async update(id, {
        qualification,
        current_address: currentAddress,
        proposed_dates: proposedDates,
        notes
    }) {
        const appointment = await model.findById(id);
        if (!appointment) throw new NotFoundError(
            'appointment not found', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        if (!['pending', 'assigned'].includes(appointment.status)) throw new ConflictError(
            'appointment can only be edited before it is scheduled', {
            code: 'APPOINTMENT_NOT_EDITABLE',
            resource: 'appointment',
            id,
            current_status: appointment.status
        });

        if (qualification) appointment.qualification = {
            funds_source: qualification.fundsSource,
            monthly_income: qualification.monthlyIncome,
            reason: qualification.reason,
        };
        if (currentAddress) appointment.current_address = {
            location: currentAddress.location,
            address: currentAddress.address,
            reference: currentAddress.reference,
        };
        if (proposedDates) appointment.proposed_dates = proposedDates;
        if (notes !== undefined) appointment.notes = notes;

        await appointment.save();
        return appointment;
    },

    async assign(id, { collaborator }) {
        const appointment = await model.findById(id);
        if (!appointment) throw new NotFoundError(
            'appointment not found', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        if (!['pending', 'assigned'].includes(appointment.status)) throw new ConflictError(
            'a collaborator can only be assigned before scheduling', {
            code: 'INVALID_STATUS_TRANSITION',
            resource: 'appointment',
            id,
            current_status: appointment.status,
            attempted: 'assigned'
        });

        const collaboratorExists = await collaboratorModel.exists({ _id: collaborator });
        if (!collaboratorExists) throw new NotFoundError(
            'collaborator not found', {
            code: 'COLLABORATOR_NOT_FOUND',
            resource: 'collaborator',
            id: collaborator
        });

        appointment.collaborator = collaborator;
        appointment.status = 'assigned';
        await appointment.save();
        return appointment;
    },

    async schedule(id, { scheduled_date: scheduledDate }) {     
          const appointment = await model.findById(id);
        if (!appointment) throw new NotFoundError(
            'appointment not found', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        if (appointment.status !== 'assigned') throw new ConflictError(
            'an appointment must be assigned before it can be scheduled', {
            code: 'INVALID_STATUS_TRANSITION',
            resource: 'appointment',
            id,
            current_status: appointment.status,
            attempted: 'scheduled'
        });

        const matchesProposed = appointment.proposed_dates.some(
            d => d.getTime() === new Date(scheduledDate).getTime()
        );
        if (!matchesProposed) throw new ValidationError(
            'scheduled date must match one of the proposed dates', {
            code: 'SCHEDULED_DATE_NOT_PROPOSED',
            field: 'scheduledDate'
        });

        appointment.scheduled_date = scheduledDate;
        appointment.status = 'scheduled';
        await appointment.save();
        return appointment;
    },

    async complete(id) {
        const appointment = await model.findById(id);
        if (!appointment) throw new NotFoundError(
            'appointment not found', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        if (appointment.status !== 'scheduled') throw new ConflictError(
            'only a scheduled appointment can be completed', {
            code: 'INVALID_STATUS_TRANSITION',
            resource: 'appointment',
            id,
            current_status: appointment.status,
            attempted: 'completed'
        });

        appointment.status = 'completed';
        await appointment.save();
        return appointment;
    },

    async cancel(id) {
        const appointment = await model.findById(id);
        if (!appointment) throw new NotFoundError(
            'appointment not found', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        if (['completed', 'cancelled'].includes(appointment.status)) throw new ConflictError(
            'a completed or already-cancelled appointment cannot be cancelled', {
            code: 'INVALID_STATUS_TRANSITION',
            resource: 'appointment',
            id,
            current_status: appointment.status,
            attempted: 'cancelled'
        });

        appointment.status = 'cancelled';
        await appointment.save();
        return appointment;
    },

    async delete(id) {
        const appointment = await model.findByIdAndDelete(id);
        if (!appointment) throw new NotFoundError(
            'appointment not found', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        return { id, deleted: true };
    },
};
export default service;