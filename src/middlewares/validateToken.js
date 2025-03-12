import { logger } from '../utils/logger.js';

export const validateToken = async (request, reply) => {
    logger.debug("Validando token...");

    const authHeader = request.headers.authorization;

    if (!authHeader) {
        return reply.status(401).send({ message: "Token não fornecido" });
    }

    if (!process.env.API_TOKEN) {
        logger.warn("Token não configurado no .env!");
        return reply.status(500).send({ message: "Token não configurado" });
    }

    // Verifica se o header segue o formato Bearer <token>
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
        return reply.status(401).send({ message: "Token inválido" });
    }

    // Compara o token enviado com o token configurado no .env
    if (token !== process.env.API_TOKEN) {
        return reply.status(401).send({ message: "Token inválido" });
    }

    logger.debug("Token válido, continuando...");
};
