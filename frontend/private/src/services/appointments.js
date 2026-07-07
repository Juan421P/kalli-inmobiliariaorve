import Service from './service.js'

// placeholders para campos del esquema que referencian modelos que aún no existen
// en el backend ('district' y 'time'); el sitio público usa el mismo truco
const PLACEHOLDER_ID = '000000000000000000000000'

const buildPayload = ({ buyer, property, proposedDate, fundsSource, monthlyIncome, reason, addressReference, notes }) => ({
    buyer,
    property,
    proposed_dates: [new Date(proposedDate).toISOString()],
    qualification: {
        funds_source: fundsSource,
        monthly_income: Number(monthlyIncome),
        reason,
    },
    current_address: {
        district: PLACEHOLDER_ID,
        reference: addressReference,
    },
    notes,
    time: PLACEHOLDER_ID,
})

class AppointmentsService extends Service {
    constructor() {
        super('/appointment')
    }

    async getAll() {
        const response = await this.api.get(this.endpoint)
        return response.data
    }

    async create(formData) {
        const response = await this.api.post(this.endpoint, buildPayload(formData))
        return response.data
    }

    async update(id, formData) {
        const response = await this.api.put(`${this.endpoint}/${id}`, buildPayload(formData))
        return response.data
    }

    async updateStatus(id, status) {
        const response = await this.api.put(`${this.endpoint}/${id}`, { status })
        return response.data
    }
}

// listas reales (no simuladas) para los selectores del formulario de nueva cita;
// separadas de clientsService/propertiesService, que aún trabajan con datos de prueba
class AppointmentOptionsService extends Service {
    async listClients() {
        const response = await this.api.get('/client')
        return response.data.clients ?? []
    }

    async listProperties() {
        const response = await this.api.get('/property')
        return response.data.properties ?? []
    }
}

export const appointmentsService = new AppointmentsService()
export const appointmentOptionsService = new AppointmentOptionsService()
