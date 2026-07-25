import { motion, useReducedMotion } from "framer-motion";

type QuantityBadgeProps = {
  quantidade: number;
  categoryColor: string;
};

export function QuantityBadge({
  quantidade,
  categoryColor,
}: QuantityBadgeProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      animate={
        reduceMotion
          ? undefined
          : {
              scale: [1, 1.12, 1],
              boxShadow: [
                "0 0 0 0 rgba(255,255,255,0)",
                "0 0 12px 3px rgba(255,255,255,0.55)",
                "0 0 0 0 rgba(255,255,255,0)",
              ],
            }
      }
      transition={{
        repeat: Infinity,
        duration: 1.6,
        repeatDelay: 0.5,
        ease: "easeInOut",
      }}
      className="text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 tabular-nums"
      style={{
        backgroundColor: "#ffffff",
        color: categoryColor,
      }}
    >
      {quantidade}x
    </motion.span>
  );
}
