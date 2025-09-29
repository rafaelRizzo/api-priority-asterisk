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
    addPriority = async (request, reply) => {
        let { trunk, priority, start_date, end_date, force_exten } = request.body;

        const now = new Date();

        // Obtendo a data atual com UTC-3 no formato ISO
        const created_date = convertToISO(new Date());

        // Se não for passado start_date e end_date, definir valores padrão
        start_date = start_date ? convertToISO(start_date) : convertToISO(now);
        end_date = end_date ? convertToISO(end_date) : convertToISO(new Date(now.setFullYear(now.getFullYear() + 100)));

        try {
            // Permitir múltiplos troncos separados por vírgula
            const trunks = trunk.split(",").map(t => t.trim());

            for (const t of trunks) {
                await priorityModel.addPriority({
                    trunk: t,
                    priority,
                    start_date,
                    end_date,
                    created_date,
                    force_exten
                });
            }

            return reply.code(200).send({ content: "Prioridade adicionada com sucesso." });
        } catch (error) {
            // Aqui você retorna o erro com a mensagem adequada
            return reply.code(500).send({ error: error.message || 'Erro ao adicionar a prioridade.' });
        }
    }

    getAllPriority = async (request, reply) => {
        try {
            let priorities_data_cache = cache.get("priorities");

            if (priorities_data_cache) {
                logger.debug("Dados carregados do cache.");
            } else {
                logger.debug("Buscando dados do banco...");
                priorities_data_cache = await priorityModel.getAllPriority();
                cache.set("priorities", priorities_data_cache);
                logger.debug("Dados das prioridades armazenados no cache.");
            }

            return reply.code(200).send(priorities_data_cache);
        } catch (error) {
            logger.error(`Erro ao listar as prioridades: ${error.message}`);
            return reply.code(500).send({ error: 'Erro ao listar as prioridades.' });
        }
    };

    getByTrunkPriority = async (request, reply) => {
        const { trunk } = request.params;

        try {
            let priority_data_cache = cache.get(`priority_${trunk}`);

            if (priority_data_cache) {
                logger.debug(`Prioridade carregada do cache para o tronco: ${trunk}`);
            } else {
                logger.debug(`Buscando prioridade no banco para o tronco: ${trunk}`);
                priority_data_cache = await priorityModel.getByTrunkPriority({ trunk });

                if (priority_data_cache) {
                    cache.set(`priority_${trunk}`, priority_data_cache);
                    logger.debug(`Prioridade do tronco ${trunk} armazenada no cache.`);
                }
            }

            return reply.code(200).send(priority_data_cache);
        } catch (error) {
            logger.error(`Erro ao listar a prioridade do tronco ${trunk}: ${error.message}`);
            return reply.code(500).send({ error: 'Erro ao listar a prioridade do tronco.' });
        }
    };

    getByTrunkPriority = async (request, reply) => {
        const { trunk } = request.params;

        try {
            let priority_data_cache = cache.get(`priority_${trunk}`);

            if (priority_data_cache) {
                logger.debug(`Prioridade carregada do cache para o tronco: ${trunk}`);
            } else {
                logger.debug(`Buscando prioridade no banco para o tronco: ${trunk}`);
                priority_data_cache = await priorityModel.getByTrunkPriority({ trunk });

                if (priority_data_cache) {
                    cache.set(`priority_${trunk}`, priority_data_cache);
                    logger.debug(`Prioridade do tronco ${trunk} armazenada no cache.`);
                }
            }

            return reply.code(200).send({ priority: priority_data_cache });
        } catch (error) {
            logger.error(`Erro ao listar a prioridade do tronco ${trunk}: ${error.message}`);
            return reply.code(500).send({ error: 'Erro ao listar a prioridade do tronco.' });
        }
    };

    deletePriority = async (request, reply) => {
        // Pegando os dados passados no body da requisição
        const { trunk } = request.params;

        try {
            await priorityModel.deletePriority({ trunk });

            reply.code(200).send({ content: "Prioridade deletada com sucesso." });
        } catch (error) {
            return reply.code(500).send({ error: error.message || 'Erro ao adicionar a prioridade.' });
        }

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