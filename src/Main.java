import model.KnowledgeGraph;
import persistence.KnowledgePersistence;
import server.SimpleHttpServer;

public class Main {
    public static void main(String[] args) {
        try {
            // Load existing graph or start empty
            KnowledgeGraph graph;
            try {
                graph = KnowledgePersistence.loadFromFile("graph.json");
                System.out.println("Loaded graph.json");
            } catch (Exception e) {
                graph = new KnowledgeGraph();
                System.out.println("Starting with empty graph");
            }

            // Launch web server
            SimpleHttpServer.start(graph);

            // make graph accessible inside lambda
            final KnowledgeGraph finalGraph = graph;
            
            java.util.concurrent.ScheduledExecutorService scheduler =
                java.util.concurrent.Executors.newSingleThreadScheduledExecutor();
            
            scheduler.scheduleAtFixedRate(() -> {
                finalGraph.decayAllConnections(0.05f);   // 5% daily decay
                System.out.println("[daily-decay] connections weakened by 5%");
            }, 24, 24, java.util.concurrent.TimeUnit.HOURS); // Run every 24 hours
            
            Runtime.getRuntime().addShutdownHook(new Thread(scheduler::shutdown));
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
