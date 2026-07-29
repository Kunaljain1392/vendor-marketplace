// import swaggerJsdoc from "swagger-jsdoc";
// import swaggerUi from "swagger-ui-express";
// import YAML from "yamljs";

// export const swaggerDocument = YAML.load("./src/docs/openapi.yaml");

// export { swaggerUi };

// export const swaggerSpec = swaggerJsdoc({
//   definition: {
//     openapi: "3.0.3",
//     info: {
//       title: "Vendor Marketplace Auth Service",
//       version: "1.0.0",
//       description: "Authentication Service API Documentation",
//     },

//     servers: [
//       {
//         url: "http://localhost:3000",
//       },
//     ],

//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//     },
//   },

//   apis: [
//     "./src/routes/*.ts",
//     "./src/controllers/*.ts",
//   ],
// });

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "node:path";

const swaggerDocument = YAML.load(
  path.join(process.cwd(), "src/docs/openapi.yaml")
);

export { swaggerUi, swaggerDocument };