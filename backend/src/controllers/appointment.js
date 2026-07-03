import model from '../models/appointment.js';
import NotFoundError from '../errors/not_found.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const appointments = await model.find();
        return res.status(200).json({ appointments });
    }),

    getById: catchAsync(async (req, res) => {
        const appointment = await model.findById(req.params.id);
        if (!appointment) throw new NotFoundError('appointment not found');
        return res.status(200).json({ appointment });
    }),

    post: catchAsync(async (req, res) => {
        const { property, qualification, current_address, proposed_dates, notes, time } = req.body;

        if (!property) return res.status(400).json({ message: 'property is required' });
        if (!time) return res.status(400).json({ message: 'time is required' });
        if (!qualification?.funds_source) return res.status(400).json({ message: 'qualification.funds_source is required' });
        if (qualification?.monthly_income == null) return res.status(400).json({ message: 'qualification.monthly_income is required' });
        if (!qualification?.reason?.trim()) return res.status(400).json({ message: 'qualification.reason is required' });
        if (!current_address?.district) return res.status(400).json({ message: 'current_address.district is required' });
        if (!current_address?.reference?.trim()) return res.status(400).json({ message: 'current_address.reference is required' });
        // El cliente propone varias fechas; el colaborador asignado confirma una (scheduled_date)
        if (!Array.isArray(proposed_dates) || proposed_dates.length === 0) return res.status(400).json({ message: 'at least one proposed date is required' });

        const appointment = new model({
            // El comprador es quien hace la solicitud, no viene en el body
            buyer: req.user.id,
            property,
            qualification,
            current_address,
            proposed_dates,
            notes,
            time
        });
        await appointment.save();
        return res.status(201).json({ message: 'appointment created successfully', appointment });
    }),

    put: catchAsync(async (req, res) => {
        const { id } = req.params;
        const data = { ...req.body };

        const appointment = await model.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );
        if (!appointment) throw new NotFoundError('appointment not found');
        return res.status(200).json({ message: 'appointment updated successfully', appointment });
    }),

    delete: catchAsync(async (req, res) => {
        const appointment = await model.findByIdAndDelete(req.params.id);
        if (!appointment) throw new NotFoundError('appointment not found');
        return res.status(200).json({ message: 'appointment deleted successfully' });
    })

};

export default controller;
