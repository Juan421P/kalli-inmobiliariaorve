// Generic version of the check first written for property PUT/DELETE.
// getResource(req) must return an object with a `collaborator` field
// (ObjectId or populated doc) — pass a bound service.getById.
export const requireAssignedCollaboratorOrAdmin = (getResource) => async (req, res, next) => {
    try {
        const resource = await getResource(req);
        const isAdmin = req.user.role === 'admin';
        const isAssignedCollaborator = req.user.role === 'collaborator'
            && resource.collaborator
            && String(resource.collaborator._id ?? resource.collaborator) === req.user.id;

        if (!isAdmin && !isAssignedCollaborator) {
            return res.status(403).json({ message: 'only the assigned collaborator or an admin can perform this action' });
        }
        req.resource = resource;
        next();
    } catch (err) {
        next(err);
    }
};