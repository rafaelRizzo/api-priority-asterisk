export const trunksListIdSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                trunk: { type: 'string' },
                last_sync: { type: 'string', format: 'date-time' }
            }
        }
    }
};
