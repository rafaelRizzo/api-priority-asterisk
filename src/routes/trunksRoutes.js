import { TrunksController } from "../controllers/trunksControllers.js";
import { logger } from './../utils/logger.js';
import { validateToken } from './../middlewares/validateToken.js';

const trunksController = new TrunksController();

/**
 * 
 * A aqui é onde é feito o mapeamento das rotas dos troncos com fastify para o controllers.
 * 
*/

export const trunksRoutes = async (fastify) => {
    fastify.get("/api/v1/trunks",{
        preHandler: validateToken
    }, async (request, reply) => {
        try {
            const trunks_data_cache = await trunksController.getTrunks();
            return reply.code(200).send({ trunks: trunks_data_cache });
        } catch (error) {
            return reply.code(500).send({ error: 'Erro ao buscar os troncos.' });
        }
    });
}
