package server;

import com.google.gson.Gson;
import model.*;
import persistence.KnowledgePersistence;

import java.io.*;
import java.net.InetSocketAddress;
import java.util.Map;
import com.sun.net.httpserver.*;

public class SimpleHttpServer {

    public static void start(KnowledgeGraph graph) throws IOException {
        // Get port from environment variable (Render sets this) or default to 8000
        String portStr = System.getenv("PORT");
        int port = 8000; // default fallback
        if (portStr != null && !portStr.isEmpty()) {
            try {
                port = Integer.parseInt(portStr);
            } catch (NumberFormatException e) {
                System.out.println("Invalid PORT environment variable, using default 8000");
            }
        }
        
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        Gson gson = new Gson();

        /* ---------- REST: GET /graph ---------- */
        server.createContext("/graph", ex -> {
            if ("HEAD".equals(ex.getRequestMethod())) {
                ex.getResponseHeaders().add("Content-Type", "application/json");
                ex.sendResponseHeaders(200, -1);
                return;
            }
            
            String json = gson.toJson(graph.getAllNodes());
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(200, json.getBytes().length);
            try (OutputStream os = ex.getResponseBody()) { os.write(json.getBytes()); }
        });

        /* ---------- REST: POST /addNode ---------- */
        server.createContext("/addNode", ex -> {
            if (!"POST".equals(ex.getRequestMethod())) {
                ex.sendResponseHeaders(405, -1);
                return;
            }
        
            try {
                Map<String, String> body = gson.fromJson(
                    new InputStreamReader(ex.getRequestBody()),
                    new com.google.gson.reflect.TypeToken<Map<String, String>>(){}.getType()
                );
                
                if (body == null || body.get("id") == null || body.get("title") == null) {
                    ex.sendResponseHeaders(400, -1);
                    return;
                }
        
                KnowledgeNode node = new KnowledgeNode(
                    body.get("id"),
                    body.get("title"),
                    body.getOrDefault("description", "")
                );
                graph.addNode(node);
            
                String parent = body.get("parentId");
                if (parent != null && !parent.isBlank() && !parent.equals(node.getId())) {
                    try {
                        int strength = Integer.parseInt(body.getOrDefault("strength", "100"));
                        strength = Math.max(0, Math.min(100, strength)); // Clamp to 0-100
                        graph.connectNodes(parent, node.getId(), strength);
                    } catch (IllegalArgumentException e) {
                        // Log error but don't fail the request
                        System.err.println("Connection error: " + e.getMessage());
                    }
                }
            
                ex.sendResponseHeaders(200, -1);
            } catch (Exception e) {
                System.err.println("Error adding node: " + e.getMessage());
                ex.sendResponseHeaders(500, -1);
            }
        });
        
        /* ---------- REST: POST /reinforce?id=X&target=Y ---------- */
        server.createContext("/reinforce", ex -> {
            try {
                String query = ex.getRequestURI().getQuery();
                if (query == null) {
                    ex.sendResponseHeaders(400, -1);
                    return;
                }
                
                String[] params = query.split("&");
                String id=null, tgt=null;
                for (String p : params) {
                    String[] kv = p.split("=");
                    if (kv.length == 2) {
                        if ("id".equals(kv[0]))      id  = kv[1];
                        if ("target".equals(kv[0]))  tgt = kv[1];
                    }
                }
                
                if (id == null || tgt == null) {
                    ex.sendResponseHeaders(400, -1);
                    return;
                }
                
                graph.reinforceConnection(id, tgt, 20);
                ex.sendResponseHeaders(200,-1);
            } catch (Exception e) {
                System.err.println("Error reinforcing connection: " + e.getMessage());
                ex.sendResponseHeaders(500, -1);
            }
        });

        /* ---------- REST: POST /decay ---------- */
        server.createContext("/decay", ex -> {
            graph.decayAllConnections(0.05f);  // 5 % forgetting
            ex.sendResponseHeaders(200,-1);
        });

        /* ---------- REST: GET /save ---------- */
        server.createContext("/save", ex -> {
            KnowledgePersistence.saveToFile(graph, "graph.json");
            ex.sendResponseHeaders(200,-1);
        });

        /* ---------- Health check endpoint ---------- */
        server.createContext("/health", ex -> {
            if ("HEAD".equals(ex.getRequestMethod())) {
                ex.sendResponseHeaders(200, -1);
                return;
            }
            String response = "{\"status\":\"ok\",\"port\":" + port + "}";
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(200, response.getBytes().length);
            try (OutputStream os = ex.getResponseBody()) { os.write(response.getBytes()); }
        });

        /* ---------- Static files (/, /index.html, /style.css, /script.js) ---------- */
        server.createContext("/", ex -> {
            String path = ex.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";
            File file = new File("web" + path);
            if (!file.exists()) { ex.sendResponseHeaders(404,-1); return; }

            String mime = path.endsWith(".js") ? "application/javascript" :
                          path.endsWith(".css") ? "text/css" : "text/html";

            ex.getResponseHeaders().add("Content-Type", mime);
            
            if ("HEAD".equals(ex.getRequestMethod())) {
                ex.sendResponseHeaders(200, -1);
                return;
            }

            byte[] bytes = java.nio.file.Files.readAllBytes(file.toPath());
            ex.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
        });
        /* ---------- REST: POST /editNode  {id,title,description} ---------- */
server.createContext("/editNode", ex -> {
    if (!"POST".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(405,-1); return; }

    try {
        Map<String,String> body = gson.fromJson(
                new InputStreamReader(ex.getRequestBody()),
                new com.google.gson.reflect.TypeToken<Map<String,String>>(){}.getType());

        if (body == null || body.get("id") == null) {
            ex.sendResponseHeaders(400, -1);
            return;
        }

        String id    = body.get("id");
        String title = body.getOrDefault("title", "");
        String desc  = body.getOrDefault("description", "");

        KnowledgeNode n = graph.getAllNodes().get(id);
        if (n != null) {
            if (!title.isBlank()) n.setTitle(title);
            n.setDescription(desc);                         // allow empty
            ex.sendResponseHeaders(200,-1);
        } else {
            ex.sendResponseHeaders(404,-1);
        }
    } catch (Exception e) {
        System.err.println("Error editing node: " + e.getMessage());
        ex.sendResponseHeaders(500, -1);
    }
});

/* ---------- REST: DELETE /deleteNode?id=X ---------- */
server.createContext("/deleteNode", ex -> {
    if (!"DELETE".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(405,-1); return; }

    try {
        String query = ex.getRequestURI().getQuery();
        if (query == null || !query.startsWith("id=")) {
            ex.sendResponseHeaders(400, -1);
            return;
        }
        
        String id = query.split("=")[1];
        if (graph.getAllNodes().remove(id) == null) { 
            ex.sendResponseHeaders(404,-1); 
            return; 
        }

        // remove incoming edges pointing to this node
        graph.getAllNodes().values().forEach(node -> node.getConnections().remove(id));
        ex.sendResponseHeaders(200,-1);
    } catch (Exception e) {
        System.err.println("Error deleting node: " + e.getMessage());
        ex.sendResponseHeaders(500, -1);
    }
});


        System.out.println("🌐  Server running →  http://localhost:" + port);
        server.start();
    }
}
