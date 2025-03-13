import { v7 } from "uuid";
import { logger } from "./logger.js";

/**
 * 
 * Aqui ficará a função de gerar um uuid, ele é extremamente rápido, ordenado e com baixa colisão, ele não é usado para identificar um tronco mas sim para identificar uma prioridade de um tronco, com ele você pode alterar uma prioridade já existente..
 * E demais funções de utilidade.
 * 
 */

export const generateUUID = () => v7();

const PRIORITY_MAX = 10;  // Prioridade máxima
const SHORT_TERM_WEIGHT = 4;  // Peso do fator curto prazo (15 min)
const MEDIUM_TERM_WEIGHT = 2;  // Peso do fator médio prazo (30 min)
const LONG_TERM_DIVISOR = 10;  // Redução do impacto do fator longo prazo (mês)

export const calculatePriority = (request_volume_data) => {
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

    logger.debug(`FILLED  : ${PRIORITY_MAX} - log2(1 + ${S} + ${M / 2} + ${L}) = ${priority} (PRIORITY_MAX - log2(1 + S + M/2 + L))`);
    logger.debug(`RESULT  : ${priority}`);

    return priority;
};