import moment from "moment-timezone"

/**
 * 
 * Aqui ficará as funções para lidar com as datas
 * Ela atualmente funciona da seguinte maneira, eu passo no arugmento a data no seguinte formato: YYYY-MM-DD HH-mm-ss e transformo ela no padrão ISO, pois é o mais comum para o banco de dados além de que o prisma é meio chato de tratar datas em outros formatos...
 * Nessa função eu passo o timezone para tirar -3h pois estamos no Brasil.
 * 
 */

export const convertToISO = (dateStr) => {
    return moment.tz(dateStr, "YYYY-MM-DD HH:mm:ss", "America/Sao_Paulo").format("YYYY-MM-DDTHH:mm:ss[Z]");
};

// Função para converter para GotoIfTime
export const convertToGotoIfTime = (date) => {
    if (!date) return "";

    const dt = new Date(date);
    if (isNaN(dt.getTime())) return "";

    const time = dt.toISOString().slice(11, 16); // HH:MM
    const dayOfMonth = dt.getUTCDate();
    const month = dt.getUTCMonth() + 1; // Meses começam do zero

    return `${time},*,${dayOfMonth},${month}`;
}