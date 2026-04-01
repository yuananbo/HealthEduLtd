const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "MobireHab Backend API Documentation with Swagger",
      version: "0.1.0",
      description:
        "MOBIREHAB is a digital healthcare platform to improve accessibility and quality of rehabilitation services towards independent life. ",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "MOBIREHAB - Yuyun Francis",
        url: "https://mobirehab.rw/",
        email: "info@mobirehab.rw",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./backend/docs/*.js"],
};

export default swaggerOptions;
