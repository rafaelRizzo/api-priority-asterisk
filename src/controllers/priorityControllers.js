import { PriorityModel } from "../models/priorityModels.js";
import { cache } from "../utils/cache.js";
import { convertToISO } from "../utils/dateFunctions.js";
import { calculatePriority } from "../utils/handlers.js";
import { logger } from "../utils/logger.js";
import { convertToGotoIfTime } from '../utils/dateFunctions.js'; // TODO: VER DEPOIS SE PRECISA DESSA FUNÇÃO ACREDITO QUE ELA FOI REMOVIDA INDEVIDAMENTE E ERA PARA SER UTILIZADA PARA GERAR O GOTOIF TIME NA RESPOSTA DA API

const priorityModel = new PriorityModel();

/**
 * 
 * Aqui é o controller das prioridades.
 * 
*/

export class PriorityController {
    addPriority = async ({ trunk, priority, start_date, end_date, created_date }) => {
        const now = new Date();

        // Se não for passado start_date e end_date, definir valores padrão
        start_date = start_date ? convertToISO(start_date) : convertToISO(now);
        end_date = end_date ? convertToISO(end_date) : convertToISO(new Date(now.setFullYear(now.getFullYear() + 100)));

        // Obtendo a data atual com UTC-3 no formato ISO
        created_date = convertToISO(new Date());

        const priority_data = await priorityModel.addPriority({ trunk, priority, start_date, end_date, created_date });
        return priority_data;
    }

    getAllPriority = async () => {
        let priorities_data_cache = cache.get("priorities");

        if (priorities_data_cache) {
            logger.debug("Dados carregados do cache");
            return priorities_data_cache; // Retorna do cache se existir
        }

        logger.debug("Buscando dados do banco...");
        let priorities_data = await priorityModel.getAllPriority();

        // Salva os dados no cache para futuras requisições
        cache.set("priorities", priorities_data);

        return priorities_data;
    };

    getByTrunkPriority = async ({ trunk }) => {
        // Primeiro, tenta buscar no cache diretamente pela chave do tronco
        let priority_data_cache = cache.get(`priority_${trunk}`);

        if (priority_data_cache) {
            logger.debug(`Prioridade do cache encontrada para o tronco: ${trunk}`);
            return priority_data_cache;
        }

        logger.debug(`Buscando prioridade no banco para o tronco: ${trunk}`);
        const priority_data = await priorityModel.getByTrunkPriority({ trunk });

        // Se encontrar no banco, adiciona no cache diretamente com a chave do tronco
        cache.set(`priority_${trunk}`, priority_data); // Armazena o dado no cache com a chave do tronco
        logger.debug(`Prioridade do tronco ${trunk} adicionada ao cache.`);

        return priority_data;
    };

    deletePriority = async ({ trunk }) => {
        const priority_data = await priorityModel.deletePriority({ trunk });
        return priority_data;
    }

    getAutoPriority = async (request, reply) => {
        const { trunk } = request.params;
        const { noreg } = request.query; // geralmente para depuração no Postman
        const shouldRegisterRequests = noreg !== "true";

        try {
            if (shouldRegisterRequests) await priorityModel.registerRequest({ trunk });

            let priorities_data_cache = cache.get(`priority_${trunk}`);

            if (priorities_data_cache) {
                // encontrado no cache: retornar com prioridade manual
                logger.info(`Prioridade encontrada no cache para o tronco ${trunk}.`);
                logger.debug(`Prioridade encontrada no cache para o tronco ${trunk}: ${JSON.stringify(priorities_data_cache, null, 2)}.`);

                const formattedPriority = {
                    type: "manual", // tipo manual
                    priority: priorities_data_cache.priority,
                };

                return reply.code(200).send(formattedPriority);
            }

            // sem prioridade manual, calcular a prioridade automaticamente
            logger.debug(`Não há prioridade manual no cache para o tronco ${trunk}.`);
            const request_volume_data = await priorityModel.getRequestVolume({ trunk, days: 30 });
            const request_quantity = request_volume_data.length; // quantidade de requisições feitas no período
            const calculated_priority = calculatePriority(request_volume_data);

            return reply.code(200).send({
                type: "auto", // tipo automático
                priority: calculated_priority
            });

        } catch (error) {
            console.error("Erro ao obter prioridade automática:", error);
            return reply.status(500).send("Erro interno ao processar a solicitação");
        }
    };
}