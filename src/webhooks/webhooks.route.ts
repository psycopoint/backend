import {
  appointmentConfirmation,
  appointmentReminder,
} from "@src/webhooks/weebhooks.controllers";

import { Hono } from "hono";

const app = new Hono();

// TWILLIO
app.post("/appointments/confirm", ...appointmentConfirmation);

app.post("/appointments/reminder", ...appointmentReminder);

export default app;
