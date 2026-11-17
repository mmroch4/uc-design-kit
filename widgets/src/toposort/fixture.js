/** Test inputs as text (see ../graph/fixture.js); the graph is always directed. */
import { input as graphInput } from "../graph/fixture.js";

export const input = (fixture) => graphInput(fixture && { ...fixture, directed: true }, "toposort");
