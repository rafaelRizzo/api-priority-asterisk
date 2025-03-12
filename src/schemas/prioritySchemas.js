export const priorityAddSchema = {
    body: {
        type: 'object',
        required: ['trunk', 'priority'],
        properties: {
            trunk: { type: 'string' },
            priority: { type: 'integer', minimum: 1, maximum: 10 },
            start_date: { type: 'string', pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$" },
            end_date: { type: 'string', pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$" }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                trunk: { type: 'string' },
                priority: { type: 'integer' },
                start_date: { type: 'string', format: 'date-time' },
                end_date: { type: 'string', format: 'date-time' },
                created_date: { type: 'string', format: 'date-time' }
            }
        }
    }
};

export const priorityByTrunkSchema = {
    params: {
        type: 'object',
        required: ['trunk'],
        properties: {
            trunk: { type: 'string' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                trunk: { type: 'string' },
                priority: { type: 'integer' },
                start_date: { type: 'string', format: 'date-time' },
                end_date: { type: 'string', format: 'date-time' },
                created_date: { type: 'string', format: 'date-time' }
            }
        }
    }
};

export const priorityDeleteSchema = {
    params: {
        type: 'object',
        required: ['trunk'],
        properties: {
            trunk: { type: 'string' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                trunk: { type: 'string' },
                priority: { type: 'integer' },
                start_date: { type: 'string', format: 'date-time' },
                end_date: { type: 'string', format: 'date-time' },
                created_date: { type: 'string', format: 'date-time' }
            }
        }
    }
};

export const priorityAutomaticSchema = {
    params: {
        type: 'object',
        required: ['trunk'],
        properties: {
            trunk: { type: 'string' }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                priority: { type: 'integer' },
                type: { type: 'string' },
            }
        }
    }
};

