import model from '../models/appointment.js';
import propertyModel from '../models/property.js';
import collaboratorModel from '../models/collaborator.js';
import scheduleAvailabilityModel from '../models/schedule_availability.js';
import { toMinutes } from '../schemas/fields/schedule_availability.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';
import ValidationError from '../errors/validation.js';

const populateOptions = [
    { path: 'buyer', select: 'name lastname email phone picture' },
    { path: 'property', select: 'title public_id pictures' },
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
            `no hay disponibilidad el día ${dayName} para el horario solicitado`, {
            code: 'TIME_NOT_AVAILABLE',
            field: 'time',
            day: dayName
        });
    }
}

const service = {

    // Un colaborador solo debe ver las citas que un admin le asignó a él, y un
    // cliente solo las suyas propias -no todas las que existen, eso es cosa
    // del staff-. Se aplica acá, en vez de en el controller, para que ninguna
    // otra ruta que reutilice este método se le olvide filtrar.
    async getAll(filter = {}, actor) {
        const scopedFilter = actor?.role === 'collaborator'
            ? { ...filter, collaborator: actor.id }
            : actor?.role === 'client'
                ? { ...filter, buyer: actor.id }
                : filter;
        return await model.find(scopedFilter).populate(populateOptions).sort({ createdAt: -1 });
    },

    async getById(id) {
        const appointment = await model.findById(id).populate(populateOptions);
        if (!appointment) throw new NotFoundError(
            'cita no encontrada', {
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
            'la propiedad no existe', { code: 'PROPERTY_NOT_FOUND', resource: 'property', id: property });

        await assertTimeIsAvailable(proposedDates, time);

        const appointment = await model.create({
            buyer: buyerId,
            property,
            ...(qualification && {
                qualification: {
                    funds_source: qualification.fundsSource,
                    monthly_income: qualification.monthlyIncome,
                    reason: qualification.reason,
                },
            }),
            ...(currentAddress && {
                current_address: {
                    location: currentAddress.location,
                    address: currentAddress.address,
                    reference: currentAddress.reference,
                },
            }),
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
            'cita no encontrada', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        if (!['pending', 'assigned'].includes(appointment.status)) throw new ConflictError(
            'la cita solo puede editarse antes de ser agendada', {
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
            'cita no encontrada', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        if (!['pending', 'assigned'].includes(appointment.status)) throw new ConflictError(
            'solo se puede asignar un colaborador antes de agendar la cita', {
            code: 'INVALID_STATUS_TRANSITION',
            resource: 'appointment',
            id,
            current_status: appointment.status,
            attempted: 'assigned'
        });

        const collaboratorExists = await collaboratorModel.exists({ _id: collaborator });
        if (!collaboratorExists) throw new NotFoundError(
            'colaborador no encontrado', {
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
            'cita no encontrada', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        if (appointment.status !== 'assigned') throw new ConflictError(
            'la cita debe tener un colaborador asignado antes de poder agendarse', {
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
            'la fecha agendada debe coincidir con una de las fechas propuestas', {
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
            'cita no encontrada', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        if (appointment.status !== 'scheduled') throw new ConflictError(
            'solo una cita agendada puede marcarse como completada', {
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
            'cita no encontrada', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        if (['completed', 'cancelled'].includes(appointment.status)) throw new ConflictError(
            'una cita completada o ya cancelada no puede cancelarse de nuevo', {
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
            'cita no encontrada', {
            code: 'APPOINTMENT_NOT_FOUND',
            resource: 'appointment',
            id
        });
        return { id, deleted: true };
    },
};
export default service;