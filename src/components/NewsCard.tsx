import { NewsItem } from "@/types/cricket";
import { motion } from "framer-motion";
import { Calendar, Newspaper } from "lucide-react";

export default function NewsCard({ item, index = 0 }: { item: NewsItem; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border border-border rounded-lg overflow-hidden card-hover"
    >
      {item.image ? (
        <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-secondary flex items-center justify-center">
          <Newspaper className="w-16 h-16 text-muted-foreground/20" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Calendar className="w-3 h-3" />
          {new Date(item.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground mb-2">{item.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
      </div>
    </motion.article>
  );
}
