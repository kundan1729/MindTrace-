package model;

import java.util.HashMap;
import java.util.Map;

public class KnowledgeNode {
    private String id;
    private String title;
    private String description;
    private Map<String, Integer> connections; // Node ID → strength (0–100)

    public KnowledgeNode(String id, String title, String description) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.connections = new HashMap<>();
    }

    // Getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }

    public Map<String, Integer> getConnections() {
        return connections;
    }
    
    public void setTitle(String t){ this.title = t; }
public void setDescription(String d){ this.description = d; }


    public void connectTo(String nodeId, int strength) {
        connections.put(nodeId, strength);
    }

    @Override
    public String toString() {
        return title + " (Connections: " + connections + ")";
    }
}

