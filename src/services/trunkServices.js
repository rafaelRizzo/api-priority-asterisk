import { cache } from "../utils/cache.js";
import { generateUUID } from "../utils/handlers.js";
import { logger } from "../utils/logger.js";
import { PrismaClient } from '@prisma/client';
import { convertToISO } from './../utils/dateFunctions.js';

const prisma = new PrismaClient();

/**
 * 
 * Aqui ficará a função apra buscar os troncos do db do asterisk e formatar para o cache
 * 
*/

// Função para formatar a data
export const formatData = async (trunk_data) => {
    return trunk_data.map((trunk) => {
        return {
            id: generateUUID(),
            trunk: trunk.channelid,
            last_sync: convertToISO(new Date())
        };
    });
}

// Função responsável por buscar e formatar os dados dos troncos
export const fetchTrunks = async () => {
    const trunks = await prisma.trunks.findMany();
    logger.debug("Troncos localizados.");
    logger.debug("Formatando resultados...");

    const tunks_formated = await formatData(trunks)
    logger.debug("Resultados formatados.");

    // Descomente caso queira ver os dados retornados do db do asterisk.
    logger.debug(`Dados retornados do db do asterisk: ${JSON.stringify(tunks_formated, null, 2)}`);

    try {
        cache.set('trunks', tunks_formated);
        logger.info("Dados salvos no cache.");
        return tunks_formated;
    } catch (error) {
        logger.error(`Ocorreu um erro ao definir o cache ${error}`);
        return false;
    }
}
