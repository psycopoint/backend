import { Context } from "hono";

/**
 * Handles errors by responding with appropriate HTTP status codes and messages based on the error type.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {unknown} error - The error to handle, which can be any value but is expected to be an instance of `Error` in most cases.
 * @returns  A promise that resolves to the response object with the appropriate error message and status code.
 */
export const handleError = (c: Context, error: unknown) => {
  if (error instanceof Error) {
    switch (error.message) {
      case "Unauthorized":
        return c.text("Unauthorized", 401);

      case "Not authenticated":
        return c.text("Unauthorized", 401);

      case "Not found":
        return c.json({
          data: null,
          message: error.message,
        });

      case "Missing ID":
        return c.json({
          data: null,
          message: error.message,
        });

      case "Missing body":
        return c.json({
          data: null,
          message: error.message,
        });

      case "No data":
        return c.json({
          data: null,
          message: error.message,
        });

      case "REDIRECT_TO_PROFILE":
        return c.redirect("/users/@me");

      case "File size is too large":
        return c.json({
          data: null,
          message: error.message,
        });

      default:
        console.error("An error ocurred:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
  } else {
    console.error("An error ocurred:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};
