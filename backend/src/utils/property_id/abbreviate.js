// Limpia el texto para generar abreviaturas consistentes. Elimina acentos, caracteres especiales y lo convierte a mayúsculas.
const normalize = (value) => {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z\s]/g, '')
        .trim()
        .toUpperCase();
};

// Genera la abreviatura de un departamento. Si tiene una sola palabra toma las dos primeras letras. Si tiene varias, toma la inicial de cada una.
export const abbreviateDepartment = (value) => {
    const words = normalize(value).split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2);
    return words.map(word => word[0]).join('').slice(0, 2);
};

// Genera la abreviatura de municipios y distritos. Si tiene una sola palabra toma las tres primeras letras. Si tiene varias, toma la inicial de cada una.
export const abbreviateRegion = (value) => {
    const words = normalize(value).split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 3);
    return words.map(word => word[0]).join('').slice(0, 3);
};