import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import http from "node:http";

const server = new McpServer({ name: "Neo Game Studio", version: "0.1.0" });

server.tool(
  "neo_project_status",
  "Read the current status of a Neo Game Studio project.",
  { project: z.string().default("default").describe("Project name") },
  async ({ project }) => ({
    content: [{ type: "text", text: JSON.stringify({
      project,
      studio: "Neo Game Studio",
      status: "online",
      capabilities: ["project files","game data","build pipeline"]
    }) }]
  })
);

server.tool(
  "neo_game_command",
  "Send a structured development command to Neo Game Studio.",
  {
    command: z.string().describe("The requested game-development command"),
    project: z.string().default("default").describe("Project name")
  },
  async ({ command, project }) => ({
    content: [{ type: "text", text: JSON.stringify({
      accepted: true,
      project,
      command,
      message: "Command received by Neo Game Studio."
    }) }]
  })
);

const httpServer = http.createServer(async (req,res)=>{
  if(req.url !== "/mcp"){
    res.writeHead(200,{"content-type":"text/plain; charset=utf-8"});
    res.end("Neo Game Studio MCP bridge is online.");
    return;
  }
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close",()=>transport.close());
  await server.connect(transport);
  await transport.handleRequest(req,res);
});

const port = Number(process.env.PORT || 3000);
httpServer.listen(port,()=>console.log("Neo Game Studio MCP bridge listening on "+port));
