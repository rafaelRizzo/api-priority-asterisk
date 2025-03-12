import { PrismaClient } from '@prisma/client';
import { logger } from "../utils/logger.js";
import { generateUUID } from "../utils/handlers.js"
import { cache } from '../utils/cache.js';

/**
 * 
 * Aqui ficará a função para manipular as prioridades, adicionar, atualizar, deletar, listar, etc.
 * 
*/

const prisma = new PrismaClient();

export class PriorityModel {
    addPriority = async ({ trunk, priority, start_date, end_date, created_date }) => {
        try {
            const existing_trunks = await prisma.trunks.findFirst({
                where: { channelid: trunk }
            });

            if (!existing_trunks) {
                throw new Error(`Tronco não encontrado.`);
            }

            logger.debug("Tronco localizado, continuando...");

            // Upsert: se existir, atualiza; se não, cria
            const add_priority_query = await prisma.priorities_api.upsert({
                where: { trunk: trunk },
                update: {
                    priority: priority,
                    start_date: start_date,
                    end_date: end_date,
                },
                create: {
                    id: generateUUID(),
                    trunk: trunk,
                    priority: priority,
                    start_date: start_date,
                    end_date: end_date,
                    created_date: created_date,
                }
            });

            logger.info(`Prioridade adicionada ou atualizada com sucesso.`);
            logger.debug(`Prioridade adicionada ou atualizada com sucesso: ${JSON.stringify(add_priority_query, null, 2)}.`);
            cache.del('priorities');
        } catch (error) {
            logger.error(`Ocorreu um erro ao buscar ou adicionar o tronco: ${error}.`);
            throw error;
        }
    };

    getAllPriority = async () => {
        let cached_priorities = cache.get('priorities');

        if (cached_priorities) {
            logger.debug("Prioridades recuperadas do cache.");
            return cached_priorities;
        }
        
        try {
            const get_all_priority_query = await prisma.priorities_api.findMany();

            logger.debug(`Prioridades localizadas: ${JSON.stringify(get_all_priority_query, null, 2)}.`);
            return get_all_priority_query;
        } catch (error) {
            logger.error(`Ocorreu um erro ao buscar ou adicionar o tronco: ${error}.`);
            throw error;
        }
    };

    getByTrunkPriority = async ({ trunk }) => {
        try {
            const get_priority_by_trunk_query = await prisma.priorities_api.findFirst({
                where: { trunk: trunk }
            });

            logger.debug(`Prioridades localizadas para o tronco ${trunk}: ${JSON.stringify(get_priority_by_trunk_query, null, 2)}.`);
            return get_priority_by_trunk_query;
        } catch (error) {
            logger.error(`Ocorreu um erro ao buscar ou adicionar o tronco: ${error}.`);
            throw error;
        }
    };

    deletePriority = async ({ trunk }) => {
        try {
            // Verifica se o tronco já existe no banco de dados
            const existing_trunk = await prisma.priorities_api.findFirst({
                where: { trunk: trunk },
            });

            if (existing_trunk) {
                const delete_priority_query = await prisma.priorities_api.delete({
                    where: { trunk: trunk }
                });

                logger.info(`Prioridade deletada com sucesso.`);
                logger.debug(`Prioridade deletada com sucesso: ${JSON.stringify(delete_priority_query, null, 2)}`);
                return true;
            } else {
                logger.info(`Prioridade não encontrada para o tronco: ${trunk}.`);
                throw new Error(`Prioridade não encontrada para o tronco.`);
            }
        } catch (error) {
            logger.error(`Ocorreu um erro ao buscar ou adicionar o tronco: ${error}.`);
            throw error;
        }
    }
}
