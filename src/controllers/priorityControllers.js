import { PriorityModel } from "../models/priorityModels.js";
import { cache } from "../utils/cache.js";
import { convertToISO } from "../utils/dateFunctions.js";
import { convertToGotoIfTime } from '../utils/dateFunctions.js';
import { logger } from "../utils/logger.js";

const priorityModel = new PriorityModel();

/**
 * 
 * Aqui é o controller das prioridades.
 * 
*/

const PRIORITY_MAX = 10;  // Prioridade máxima
const SHORT_TERM_WEIGHT = 4;  // Peso do fator curto prazo (15 min)
const MEDIUM_TERM_WEIGHT = 2;  // Peso do fator médio prazo (30 min)
const LONG_TERM_DIVISOR = 10;  // Redução do impacto do fator longo prazo (mês)

const calculatePriority = (request_volume_data) => {
    const now = Date.now();
    const TIME_15_MIN = 15 * 60 * 1000;
    const TIME_30_MIN = 30 * 60 * 1000;
    const TIME_30_DAYS = 30 * 24 * 60 * 60 * 1000;

    const last15min = request_volume_data.filter(req => new Date(req.date).getTime() >= now - TIME_15_MIN).length;
    const last30min = request_volume_data.filter(req => new Date(req.date).getTime() >= now - TIME_30_MIN).length;
    const last30days = request_volume_data.filter(req => new Date(req.date).getTime() >= now - TIME_30_DAYS).length;

    const S = last15min * SHORT_TERM_WEIGHT;
    const M = last30min * MEDIUM_TERM_WEIGHT;
    const L = last30days / LONG_TERM_DIVISOR;

    let priority = PRIORITY_MAX - Math.min(PRIORITY_MAX, Math.floor(Math.log2(1 + S + M / 2 + L)));

    console.log(`FORMULA : PRIORITY_MAX - log2(1 + S + M/2 + L)`);
    console.log(`FILLED  : ${PRIORITY_MAX} - log2(1 + ${S} + ${M / 2} + ${L}) = ${priority}`);
    console.log(`RESULT  : ${priority}`);

    return priority;
};


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
        let priorities_data;

        if (!priorities_data_cache) {
            priorities_data = await priorityModel.getAllPriority();
        }

        return priorities_data;
    }

    getByTrunkPriority = async ({ trunk }) => {
        const priority_data = await priorityModel.getByTrunkPriority({ trunk });
        return priority_data;
    }

    deletePriority = async ({ trunk }) => {
        const priority_data = await priorityModel.deletePriority({ trunk });
        return priority_data;
    }

    getAutoPriority = async (request, reply) => {
        const { trunk } = request.params;
        const { noreg } = request.query; // usually for debug in postman
        const shouldRegisterRequests = noreg !== "true";

        try {
            if (shouldRegisterRequests) await priorityModel.registerRequest({trunk});

            let priorities_data_cache = cache.get(`priority_${trunk}`);

            if (priorities_data_cache) {
                // found cached data: return, because this is the manual priority
                logger.info(`Priority found in cache for trunk ${trunk}.`);
                logger.debug(`Priority found in cache for trunk ${trunk}: ${JSON.stringify(priorities_data_cache, null, 2)}.`);

                const formattedPriority = {
                    type: "manual",
                    priority: priorities_data_cache.priority,
                };

                return reply.code(200).send({ priorities: formattedPriority });
            }

            // there are no manual priorities, generate a priority based on the call volume
            logger.debug(`There are no cached priority for trunk ${trunk}.`);
            const request_volume_data = await priorityModel.getRequestVolume({ trunk, days: 30 });
            const request_quantity = request_volume_data.length; // qtd requests made in the above period
            const calculated_priority = calculatePriority(request_volume_data);

            return reply.code(200).send({ 
                type: "auto",
                priority: calculated_priority
            });


            
        } catch (error) {
            console.error("Erro ao obter prioridade automática:", error);
            return reply.status(500).send("Erro interno ao processar a solicitação");
        }
        return
    }
}