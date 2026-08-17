import express from 'express';
import controller from '../controllers/property.js';
import service from '../services/property.js';
import cloudinary from '../utils/cloudinary.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireRole } from '../middleware/auth/require_role.js';
import { requireAssignedCollaboratorOrAdmin } from '../middleware/auth/require_assigned_collaborator_or_admin.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { schemas } from '../schemas/property.js';

const property = express.Router();

const getProperty = (req) => service.getById(req.params.id);

property.route('/')
    // público porque ajá cualquiera puede ver las propiedades no pasa nada
    .get(controller.get)
    .post(
        requireAuth,
        requireRole('admin', 'collaborator'),
        cloudinary.array('pictures', 15),
        validatePayload({ body: schemas.create }),
        controller.post
    );

property.route('/public/:public_id')
    .get(
        validatePayload({ params: schemas.queryByPublicId }),
        controller.getByPublicId
    );

// Búsquedas públicas — no requieren estar loggeado, igual que el listado
// general. Declaradas antes de '/:id' para que Express no las confunda con
// un id de propiedad.
property.route('/nearby')
    .get(
        validatePayload({ query: schemas.nearby }),
        controller.getNearby
    );

property.route('/search/region')
    .get(
        validatePayload({ query: schemas.byRegion }),
        controller.getByRegion
    );

property.route('/:id')
    .get(
        validatePayload({ params: schemas.queryById }),
        controller.getById
    )
    .put(
        requireAuth,
        requireRole('admin', 'collaborator'),
        validatePayload({ params: schemas.queryById }),
        requireAssignedCollaboratorOrAdmin(getProperty),
        cloudinary.array('pictures', 15),
        validatePayload({ body: schemas.update }),
        controller.put
    )
    .delete(
        requireAuth,
        requireRole('admin', 'collaborator'),
        validatePayload({ params: schemas.queryById }),
        requireAssignedCollaboratorOrAdmin(getProperty),
        controller.delete
    );

property.route('/:id/view')
    .put(
        validatePayload({ params: schemas.queryById }),
        controller.incrementViews
    );

export default property;