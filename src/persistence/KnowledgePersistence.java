package persistence;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import model.*;

import java.io.*;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

public class KnowledgePersistence {

    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public static void saveToFile(KnowledgeGraph graph, String filename) throws IOException {
        try (Writer writer = new FileWriter(filename)) {
            gson.toJson(graph.getAllNodes(), writer);
        }
    }

    public static KnowledgeGraph loadFromFile(String filename) throws IOException {
        try (Reader reader = new FileReader(filename)) {
            Type type = new TypeToken<Map<String, KnowledgeNode>>() {}.getType();
            Map<String, KnowledgeNode> nodes = gson.fromJson(reader, type);
            KnowledgeGraph graph = new KnowledgeGraph();
            for (KnowledgeNode node : nodes.values()) {
                graph.addNode(node);
            }
            return graph;
        }
    }
}
