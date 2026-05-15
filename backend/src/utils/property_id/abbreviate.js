const normalize = (value) => {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z\s]/g, '').trim().toUpperCase();
};
export const abbreviateDepartment = (value) => {
    const words = normalize(value).split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2);
    return words.map(word => word[0]).join('').slice(0, 2);
};
export const abbreviateRegion = (value) => {
    const words = normalize(value).split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 3);
    return words.map(word => word[0]).join('').slice(0, 3);
};