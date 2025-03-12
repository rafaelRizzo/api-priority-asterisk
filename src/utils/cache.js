import NodeCache from "node-cache"

/**
 * 
 * Aqui ficará a função do node-cache para o cacheamento dos dados dos troncos.
 * stdTTl -> tempo de expiração do cache
 * checkperiod -> tempo de verificação do cache
 * 
*/

export const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
