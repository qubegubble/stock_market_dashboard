import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Stock API',
            version: '1.0.0',
            description: 'API documentation for the Stock Market Dashboard',
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
        ],
        components: {
            schemas: {
                Stock: {
                    type: 'object',
                    properties: {
                        symbol: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        change: { type: 'number' },
                        changePercent: { type: 'number' },
                    },
                    example: {
                        symbol: 'AAPL',
                        name: 'Apple Inc.',
                        price: 150.0,
                        change: -2.0,
                        changePercent: -1.33,
                    },
                },
            },
        },
    },
    apis: ['./src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
