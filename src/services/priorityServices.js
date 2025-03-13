import { PrismaClient } from '@prisma/client';
import { cache } from "../utils/cache.js";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

export const mapTrunksToCache = async () => {
    // Limpa todo o cache antes de adicionar os novos dados
    cache.flushAll();

    try {
        const priorities = await prisma.priorities_api.findMany();

        if (!priorities || priorities.length === 0) {
            logger.debug("Nenhuma prioridade encontrada no banco.");
            return;
        }

        logger.debug(`Prioridades localizadas: ${JSON.stringify(priorities, null, 2)}.`);

        priorities.forEach(priority => {
            cache.set(`priority_${priority.trunk}`, priority);
        });

        logger.debug("Mapeamento de troncos realizado com sucesso.");
    } catch (error) {
        logger.error(`Erro ao mapear os troncos: ${error.message}`, { stack: error.stack });
    } finally {
        await prisma.$disconnect(); // Fecha a conexão com o Prisma
    }
};
