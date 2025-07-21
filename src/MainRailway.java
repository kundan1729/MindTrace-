import model.KnowledgeGraph;
import persistence.KnowledgePersistence;
import server.SimpleHttpServerRailway;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;

public class MainRailway {
    private static final String DATA_DIR = "/app/data";
    private static final String GRAPH_FILE = DATA_DIR + "/graph.json";
    private static final String TEMPLATE_FILE = "/app/graph.json.template";
    
    public static void main(String[] args) {
        try {
            // Get port from environment variable (Railway sets this)
            String portStr = System.getenv("PORT");
            int port = 8000; // default fallback
            if (portStr != null && !portStr.isEmpty()) {
                try {
                    port = Integer.parseInt(portStr);
                } catch (NumberFormatException e) {
                    System.out.println("Invalid PORT environment variable, using default 8000");
                }
            }
            System.out.println("Server will start on port: " + port);
            
            // Ensure data directory exists
            File dataDir = new File(DATA_DIR);
            if (!dataDir.exists()) {
                dataDir.mkdirs();
                System.out.println("Created data directory: " + DATA_DIR);
            }
            
            // Initialize graph.json from template if it doesn't exist
            File graphFile = new File(GRAPH_FILE);
            if (!graphFile.exists()) {
                File templateFile = new File(TEMPLATE_FILE);
                if (templateFile.exists()) {
                    // Copy template file to persistent location
                    try (FileInputStream fis = new FileInputStream(templateFile);
                         FileOutputStream fos = new FileOutputStream(graphFile);
                         FileChannel srcChannel = fis.getChannel();
                         FileChannel destChannel = fos.getChannel()) {
                        destChannel.transferFrom(srcChannel, 0, srcChannel.size());
                        System.out.println("Initialized graph.json from template");
                    }
                } else {
                    System.out.println("No template found, starting with empty graph");
                }
            }
            
            // Load existing graph or start empty
            KnowledgeGraph graph;
            try {
                graph = KnowledgePersistence.loadFromFile(GRAPH_FILE);
                System.out.println("Loaded persistent graph.json from " + GRAPH_FILE);
            } catch (Exception e) {
                graph = new KnowledgeGraph();
                System.out.println("Starting with empty graph");
            }

            // Launch web server with persistent data path
            SimpleHttpServerRailway.setGraphPath(GRAPH_FILE);
            SimpleHttpServerRailway.start(graph, port);
            
            System.out.println("Rekno server started successfully on port " + port);
            System.out.println("Health check endpoint: http://localhost:" + port + "/");
            System.out.println("Persistent data location: " + GRAPH_FILE);

            // Make graph accessible inside lambda
            final KnowledgeGraph finalGraph = graph;
            
            java.util.concurrent.ScheduledExecutorService scheduler =
                java.util.concurrent.Executors.newSingleThreadScheduledExecutor();
            
            scheduler.scheduleAtFixedRate(() -> {
                finalGraph.decayAllConnections(0.05f);   // 5% decay
                System.out.println("[decay] connections weakened by 5%");
                
                // Auto-save after decay
                try {
                    KnowledgePersistence.saveToFile(finalGraph, GRAPH_FILE);
                    System.out.println("[auto-save] graph saved to persistent storage");
                } catch (Exception e) {
                    System.err.println("[auto-save] failed: " + e.getMessage());
                }
            }, 1, 1, java.util.concurrent.TimeUnit.HOURS);
            
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                try {
                    KnowledgePersistence.saveToFile(finalGraph, GRAPH_FILE);
                    System.out.println("[shutdown] graph saved to persistent storage");
                } catch (Exception e) {
                    System.err.println("[shutdown] save failed: " + e.getMessage());
                }
                scheduler.shutdown();
            }));
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
