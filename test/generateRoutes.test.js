const assert = require("assert");
const { Router } = require("express");

const generateRoutes = require("../src/generateRoutes");

describe("Herbs2Rest - Generate Routes", () => {
  it("Should resolve and create a get all route", async () => {
    // Given
    const routes = new Router();

    const controllerList = [
      {
        name: "lists",
        getAll: {},
      },
    ];

    // When
    await generateRoutes(controllerList, routes);

    // Then
    const { stack } = routes;
    const firstRoute = stack[0].route;

    assert.deepStrictEqual(firstRoute.path, "/lists");
    assert.deepStrictEqual(firstRoute.stack[0].method, "get");
  }),
    it("Should resolve and create a get by id route", async () => {
      // Given
      const routes = new Router();

      const controllerList = [
        {
          name: "lists",
          getById: {},
        },
      ];

      // When
      await generateRoutes(controllerList, routes);

      // Then
      const { stack } = routes;
      const firstRoute = stack[0].route;

      assert.deepStrictEqual(firstRoute.path, "/lists/:id");
      assert.deepStrictEqual(firstRoute.stack[0].method, "get");
    }),
    it("Should resolve and create a post route", async () => {
      // Given
      const routes = new Router();

      const controllerList = [
        {
          name: "lists",
          post: {},
        },
      ];

      // When
      await generateRoutes(controllerList, routes);

      // Then
      const { stack } = routes;
      const firstRoute = stack[0].route;

      assert.deepStrictEqual(firstRoute.path, "/lists");
      assert.deepStrictEqual(firstRoute.stack[0].method, "post");
    }),
    it("Should resolve and create a put route", async () => {
      // Given
      const routes = new Router();

      const controllerList = [
        {
          name: "lists",
          put: {},
        },
      ];

      // When
      await generateRoutes(controllerList, routes);

      // Then
      const { stack } = routes;
      const firstRoute = stack[0].route;

      assert.deepStrictEqual(firstRoute.path, "/lists/:id");
      assert.deepStrictEqual(firstRoute.stack[0].method, "put");
    }),
    it("Should resolve and create a delete route", async () => {
      // Given
      const routes = new Router();

      const controllerList = [
        {
          name: "lists",
          delete: {},
        },
      ];

      // When
      await generateRoutes(controllerList, routes);

      // Then
      const { stack } = routes;
      const firstRoute = stack[0].route;

      assert.deepStrictEqual(firstRoute.path, "/lists/:id");
      assert.deepStrictEqual(firstRoute.stack[0].method, "delete");
    });

  it("Should throw a JavascriptError if controllersList is null", async () => {
    const routes = new Router();

    assert.rejects(async () => await generateRoutes(null, routes));
  });
});
