package server;

import com.google.gson.Gson;
import model.*;
import persistence.KnowledgePersistence;

import java.io.*;
import java.net.InetSocketAddress;
import java.util.Map;
import com.sun.net.httpserver.*;

public class SimpleHttpServerRailway {
    private static String GRAPH_PATH = "/app/data/graph.json";
    
    public static void setGraphPath(String path) {
        GRAPH_PATH = path;
    }

    public static void start(KnowledgeGraph graph) throws IOException {
        start(graph, 8000); // default port
    }
    
    public static void start(KnowledgeGraph graph, int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        Gson gson = new Gson();

        /* ---------- REST: GET /graph ---------- */
        server.createContext("/graph", ex -> {
            String json = gson.toJson(graph.getAllNodes());
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(200, json.getBytes().length);
            try (OutputStream os = ex.getResponseBody()) { os.write(json.getBytes()); }
        });

        /* ---------- Health check endpoint ---------- */
        server.createContext("/health", ex -> {
            String response = "{\"status\":\"ok\",\"timestamp\":\"" + 
                java.time.Instant.now().toString() + "\",\"port\":" + port + "}";
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(200, response.getBytes().length);
            try (OutputStream os = ex.getResponseBody()) { os.write(response.getBytes()); }
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
                
                // Auto-save after adding node
                try {
                    KnowledgePersistence.saveToFile(graph, GRAPH_PATH);
                    System.out.println("[auto-save] Graph saved after adding node: " + node.getId());
                } catch (Exception e) {
                    System.err.println("[auto-save] Failed to save after adding node: " + e.getMessage());
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
                
                // Auto-save after reinforcement
                try {
                    KnowledgePersistence.saveToFile(graph, GRAPH_PATH);
                    System.out.println("[auto-save] Graph saved after reinforcement");
                } catch (Exception e) {
                    System.err.println("[auto-save] Failed to save after reinforcement: " + e.getMessage());
                }
                
                ex.sendResponseHeaders(200,-1);
            } catch (Exception e) {
                System.err.println("Error reinforcing connection: " + e.getMessage());
                ex.sendResponseHeaders(500, -1);
            }
        });

        /* ---------- REST: POST /decay ---------- */
        server.createContext("/decay", ex -> {
            graph.decayAllConnections(0.05f);  // 5% daily forgetting
            
            // Auto-save after decay
            try {
                KnowledgePersistence.saveToFile(graph, GRAPH_PATH);
                System.out.println("[auto-save] Graph saved after daily decay");
            } catch (Exception e) {
                System.err.println("[auto-save] Failed to save after decay: " + e.getMessage());
            }
            
            ex.sendResponseHeaders(200,-1);
        });

        /* ---------- REST: GET /save ---------- */
        server.createContext("/save", ex -> {
            try {
                KnowledgePersistence.saveToFile(graph, GRAPH_PATH);
                System.out.println("[manual-save] Graph saved to: " + GRAPH_PATH);
                ex.sendResponseHeaders(200,-1);
            } catch (Exception e) {
                System.err.println("[manual-save] Failed to save: " + e.getMessage());
                ex.sendResponseHeaders(500, -1);
            }
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
                    
                    // Auto-save after editing
                    try {
                        KnowledgePersistence.saveToFile(graph, GRAPH_PATH);
                        System.out.println("[auto-save] Graph saved after editing node: " + id);
                    } catch (Exception e) {
                        System.err.println("[auto-save] Failed to save after editing: " + e.getMessage());
                    }
                    
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
                
                // Auto-save after deletion
                try {
                    KnowledgePersistence.saveToFile(graph, GRAPH_PATH);
                    System.out.println("[auto-save] Graph saved after deleting node: " + id);
                } catch (Exception e) {
                    System.err.println("[auto-save] Failed to save after deletion: " + e.getMessage());
                }
                
                ex.sendResponseHeaders(200,-1);
            } catch (Exception e) {
                System.err.println("Error deleting node: " + e.getMessage());
                ex.sendResponseHeaders(500, -1);
            }
        });

        /* ---------- Static files (/, /index.html, /style.css, /script.js) ---------- */
        server.createContext("/", ex -> {
            String path = ex.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";
            File file = new File("web" + path);
            if (!file.exists()) { ex.sendResponseHeaders(404,-1); return; }

            String mime = path.endsWith(".js") ? "application/javascript" :
                          path.endsWith(".css") ? "text/css" : "text/html";

            byte[] bytes = java.nio.file.Files.readAllBytes(file.toPath());
            ex.getResponseHeaders().add("Content-Type", mime);
            ex.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
        });

        System.out.println("🌐  Rekno Server running →  http://localhost:" + port);
        System.out.println("📁  Data persistence →  " + GRAPH_PATH);
        server.start();
    }
}
