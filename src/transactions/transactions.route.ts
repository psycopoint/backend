import { Hono } from "hono";

// ROUTES
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  getTransactions,
  updateTransaction,
} from "@src/transactions/transactions.controllers";

const app = new Hono();

// get all transactions
app.get("/", ...getTransactions);

// get transaction by id
app.get("/:transactionId", ...getTransaction);

//  create a transaction
app.post("/", ...createTransaction);

//  update transaction
app.patch("/:transactionId", ...updateTransaction);

// delete transaction
app.delete("/:transactionId", ...deleteTransaction);

export default app;
