import adminModel from '../models/admin.js';
import clientModel from '../models/client.js';
import collaboratorModel from '../models/collaborator.js';

const models = { admin: adminModel, client: clientModel, collaborator: collaboratorModel };
const ROLE_LABEL = { admin: 'administrador', client: 'cliente', collaborator: 'colaborador' };

// Un mismo correo puede, hoy, existir en más de una colección (email es único
// solo dentro de cada una, no entre las tres) -por ejemplo, alguien que es
// cliente y también fue invitado como colaborador-. Cuando el login de un rol
// no encuentra el correo, esto revisa si existe en alguna de las otras dos
// colecciones, para poder avisar específicamente "esa cuenta es de otro tipo"
// en vez de un genérico "credenciales inválidas" que no ayuda a nadie.
export const findEmailInOtherRole = async (email, role) => {
    const otherRoles = Object.keys(models).filter(r => r !== role);
    for (const otherRole of otherRoles) {
        const found = await models[otherRole].findOne({ email }).select('_id');
        if (found) return otherRole;
    }
    return null;
};

export const roleLabel = (role) => ROLE_LABEL[role] ?? role;
