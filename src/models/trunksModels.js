
import { cache } from "../utils/cache.js";
import { logger } from "../utils/logger.js";

import { fetchTrunks } from "../services/trunkServices.js"
import  cron  from 'node-cron';

/**
 * 
 * Aqui ficará a lógica para manipular o banco de dados, que no caso é simplesmente um select sem limit, estou usando o prisma para facilitar e manter o código limpo, além de aprendizado.
 * 
 * 
*/

export class TrunksModel {
    getAll = async () => {
        logger.debug("Buscando troncos...");
        const trunksCache = cache.get("trunks");

        if (!trunksCache) {
            try {
                return await fetchTrunks();
            } catch (error) {
                logger.erro(`Ocorreu um erro ao buscar os troncos ${error}`)
            }
        } else {
            logger.info("Dados encontrados no cache.");
            return trunksCache;
        }
    }
}

cron.schedule('* * * * *', async () => await fetchTrunks());
