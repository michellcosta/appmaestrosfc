import { httpRouter } from "convex/server";
import { auth } from "../auth";

const http = httpRouter();

// Adicionar as rotas de autenticação do Convex Auth
auth.addHttpRoutes(http);

export default http;
