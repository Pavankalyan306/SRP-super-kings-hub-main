import { useData } from "@/context/DataContext";
import NewsCard from "@/components/NewsCard";
import { motion } from "framer-motion";

export default function News() {
  const { news } = useData();

  return (
    <div className="container py-10">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-heading text-4xl font-bold text-gradient-gold mb-8"
      >
        News & Updates
      </motion.h1>

      {news.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">No news yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((n, i) => (
            <NewsCard key={n.id} item={n} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
