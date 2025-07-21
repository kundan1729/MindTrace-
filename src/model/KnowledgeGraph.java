package model;
import java.util.*;

public class KnowledgeGraph {
    private Map<String, KnowledgeNode> nodes;

    public KnowledgeGraph() {
        this.nodes = new HashMap<>();
    }

    public void addNode(KnowledgeNode node) {
        nodes.put(node.getId(), node);
    }

    public void connectNodes(String fromId, String toId, int strength) {
        if (fromId.equals(toId)) {
            throw new IllegalArgumentException("Cannot connect a node to itself");
        }
        if (nodes.containsKey(fromId) && nodes.containsKey(toId)) {
            nodes.get(fromId).connectTo(toId, strength);
        } else {
            throw new IllegalArgumentException("One or both nodes not found: " + fromId + ", " + toId);
        }
    }

    public List<KnowledgeNode> getWeakConnections(int threshold) {
        List<KnowledgeNode> weakNodes = new ArrayList<>();
        for (KnowledgeNode node : nodes.values()) {
            for (int strength : node.getConnections().values()) {
                if (strength < threshold) {
                    weakNodes.add(node);
                    break;
                }
            }
        }
        return weakNodes;
    }

    public Map<String, KnowledgeNode> getAllNodes() {
        return nodes;
    }

    public void decayAllConnections(float decayRate) {
        for (KnowledgeNode node : nodes.values()) {
            Map<String, Integer> newConnections = new HashMap<>();
            for (Map.Entry<String, Integer> entry : node.getConnections().entrySet()) {
                int newStrength = Math.max(0, entry.getValue() - (int)(entry.getValue() * decayRate));
                newConnections.put(entry.getKey(), newStrength);
            }
            node.getConnections().clear();
            node.getConnections().putAll(newConnections);
        }
    }

    public void reinforceConnection(String fromId, String toId, int boost) {
        if (nodes.containsKey(fromId)) {
            Map<String, Integer> conns = nodes.get(fromId).getConnections();
            if (conns.containsKey(toId)) {
                conns.put(toId, Math.min(100, conns.get(toId) + boost));
            }
        }
    }
}

